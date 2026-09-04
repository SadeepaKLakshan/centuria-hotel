<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/EmailService.php';

function respond(
    bool $success,
    string $message,
    array $extra = [],
    int $statusCode = 200
): never {
    http_response_code($statusCode);

    echo json_encode(
        array_merge(
            [
                'success' => $success,
                'message' => $message
            ],
            $extra
        ),
        JSON_UNESCAPED_SLASHES
    );

    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(
        false,
        'Only POST requests are allowed.',
        [],
        405
    );
}

try {
    $input = json_decode(
        file_get_contents('php://input'),
        true
    );

    if (!is_array($input)) {
        respond(
            false,
            'Invalid request data.',
            [],
            400
        );
    }

    $email = strtolower(
        trim((string)($input['email'] ?? ''))
    );

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(
            false,
            'Please enter a valid email address.',
            [],
            422
        );
    }

    $pdo = getDatabaseConnection();

    $findUser = $pdo->prepare(
        'SELECT
            id,
            full_name,
            email,
            is_verified,
            account_status
         FROM users
         WHERE email = :email
         LIMIT 1'
    );

    $findUser->execute([
        'email' => $email
    ]);

    $user = $findUser->fetch();

    if (!$user) {
        respond(
            false,
            'No Centuria account was found with this email address.',
            [],
            404
        );
    }

    if ((int)$user['is_verified'] !== 1) {
        respond(
            false,
            'This email address has not been verified.',
            [],
            403
        );
    }

    if ($user['account_status'] !== 'active') {
        respond(
            false,
            'This account is currently unavailable.',
            [],
            403
        );
    }

    $config = require __DIR__ . '/../config/config.php';

    $expirySeconds = (int)(
        $config['app']['otp_expiry_seconds']
        ?? 120
    );

    $otp = (string)random_int(
        100000,
        999999
    );

    $otpHash = password_hash(
        $otp,
        PASSWORD_DEFAULT
    );

    $expiresAt = (new DateTimeImmutable())
        ->modify("+{$expirySeconds} seconds")
        ->format('Y-m-d H:i:s');

    $pdo->beginTransaction();

    $deleteOld = $pdo->prepare(
        'DELETE FROM password_reset_otps
         WHERE identifier = :identifier'
    );

    $deleteOld->execute([
        'identifier' => $email
    ]);

    $insertOtp = $pdo->prepare(
        'INSERT INTO password_reset_otps
        (
            user_id,
            identifier,
            channel,
            otp_hash,
            expires_at,
            attempts,
            is_verified,
            reset_token_hash,
            reset_token_expires_at
        )
        VALUES
        (
            :user_id,
            :identifier,
            :channel,
            :otp_hash,
            :expires_at,
            0,
            0,
            NULL,
            NULL
        )'
    );

    $insertOtp->execute([
        'user_id' => $user['id'],
        'identifier' => $email,
        'channel' => 'email',
        'otp_hash' => $otpHash,
        'expires_at' => $expiresAt
    ]);

    $pdo->commit();

    try {
        $emailService = new EmailService();

        $emailSent = $emailService->sendOtp(
            $user['email'],
            $user['full_name'],
            $otp,
            'password_reset'
        );
    } catch (Throwable $emailError) {
        error_log(
            'Password reset email error: ' .
            $emailError->getMessage()
        );

        $emailSent = false;
    }

    if (!$emailSent) {
        $deleteFailedOtp = $pdo->prepare(
            'DELETE FROM password_reset_otps
             WHERE identifier = :identifier'
        );

        $deleteFailedOtp->execute([
            'identifier' => $email
        ]);

        respond(
            false,
            'Password reset email could not be sent. Please try again.',
            [],
            500
        );
    }

    respond(
        true,
        'A 6-digit password reset code has been sent to your email.',
        [
            'email' => $email,
            'expires_in' => $expirySeconds
        ]
    );
} catch (Throwable $e) {
    if (
        isset($pdo) &&
        $pdo instanceof PDO &&
        $pdo->inTransaction()
    ) {
        $pdo->rollBack();
    }

    error_log(
        'Forgot password error: ' .
        $e->getMessage()
    );

    respond(
        false,
        'Password reset request could not be completed.',
        [],
        500
    );
}