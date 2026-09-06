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

    $fullName = trim((string)($input['full_name'] ?? ''));
    $email = strtolower(trim((string)($input['email'] ?? '')));
    $password = (string)($input['password'] ?? '');
    $country = trim((string)($input['country'] ?? 'Sri Lanka'));
    $role = strtolower(trim((string)($input['role'] ?? 'customer')));
    $roleKeyword = trim((string)($input['role_keyword'] ?? ''));

    if ($fullName === '') {
        respond(
            false,
            'Full name is required.',
            [],
            422
        );
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(
            false,
            'Please enter a valid email address.',
            [],
            422
        );
    }

    if (strlen($password) < 8) {
        respond(
            false,
            'Password must contain at least 8 characters.',
            [],
            422
        );
    }

    $allowedRoles = [
        'customer',
        'staff',
        'manager',
        'admin'
    ];

    if (!in_array($role, $allowedRoles, true)) {
        respond(
            false,
            'Invalid account role.',
            [],
            422
        );
    }

    $config = require __DIR__ . '/../config/config.php';

    if ($role !== 'customer') {
        $expectedKeyword =
            $config['role_keywords'][$role] ?? null;

        if (
            !$expectedKeyword ||
            !hash_equals(
                (string)$expectedKeyword,
                $roleKeyword
            )
        ) {
            respond(
                false,
                'Invalid role keyword.',
                [],
                403
            );
        }
    }

    $pdo = getDatabaseConnection();

    $checkUser = $pdo->prepare(
        'SELECT id
         FROM users
         WHERE email = :email
         LIMIT 1'
    );

    $checkUser->execute([
        'email' => $email
    ]);

    if ($checkUser->fetch()) {
        respond(
            false,
            'An account already exists with this email address.',
            [],
            409
        );
    }

    $otp = (string) random_int(
        100000,
        999999
    );

    $otpHash = password_hash(
        $otp,
        PASSWORD_DEFAULT
    );

    $passwordHash = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    $expirySeconds =
        (int)($config['app']['otp_expiry_seconds'] ?? 120);

    $expiresAt = (new DateTimeImmutable())
        ->modify("+{$expirySeconds} seconds")
        ->format('Y-m-d H:i:s');

    $pdo->beginTransaction();

    $deleteOld = $pdo->prepare(
        'DELETE FROM registration_otps
         WHERE identifier = :identifier'
    );

    $deleteOld->execute([
        'identifier' => $email
    ]);

    $insertOtp = $pdo->prepare(
        'INSERT INTO registration_otps
        (
            identifier,
            channel,
            otp_hash,
            full_name,
            email,
            country,
            password_hash,
            role,
            expires_at,
            attempts,
            is_verified
        )
        VALUES
        (
            :identifier,
            :channel,
            :otp_hash,
            :full_name,
            :email,
            :country,
            :password_hash,
            :role,
            :expires_at,
            0,
            0
        )'
    );

    $insertOtp->execute([
        'identifier' => $email,
        'channel' => 'email',
        'otp_hash' => $otpHash,
        'full_name' => $fullName,
        'email' => $email,
        'country' => $country,
        'password_hash' => $passwordHash,
        'role' => $role,
        'expires_at' => $expiresAt
    ]);

    $pdo->commit();

    try {
        $emailService = new EmailService();

        $emailSent = $emailService->sendOtp(
            $email,
            $otp,
            'registration'
        );
    } catch (Throwable $emailError) {
        error_log(
            'Registration OTP email error: ' .
            $emailError->getMessage()
        );

        $emailSent = false;
    }

    if (!$emailSent) {
        $deleteFailedOtp = $pdo->prepare(
            'DELETE FROM registration_otps
             WHERE identifier = :identifier'
        );

        $deleteFailedOtp->execute([
            'identifier' => $email
        ]);

        respond(
            false,
            'OTP email could not be sent. Please try again.',
            [],
            500
        );
    }

    respond(
        true,
        'Verification code sent to your email.',
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
        'Register request error: ' .
        $e->getMessage()
    );

    respond(
        false,
        'Registration request failed.',
        [],
        500
    );
}