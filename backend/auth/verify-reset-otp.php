<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$allowedOrigins = [
    'http://localhost:5173',
    'https://fanciful-dieffenbachia-547197.netlify.app',
    'https://subtle-dolphin-0f6b7f.netlify.app'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}

header('Vary: Origin');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/database.php';

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

    $otp = trim(
        (string)($input['otp'] ?? '')
    );

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(
            false,
            'Please enter a valid email address.',
            [],
            422
        );
    }

    if (!preg_match('/^[0-9]{6}$/', $otp)) {
        respond(
            false,
            'Please enter the complete 6-digit reset code.',
            [],
            422
        );
    }

    $pdo = getDatabaseConnection();

    $findOtp = $pdo->prepare(
        'SELECT
            id,
            user_id,
            identifier,
            channel,
            otp_hash,
            expires_at,
            attempts,
            is_verified,
            reset_token_hash,
            reset_token_expires_at
         FROM password_reset_otps
         WHERE identifier = :identifier
           AND channel = :channel
         ORDER BY id DESC
         LIMIT 1'
    );

    $findOtp->execute([
        'identifier' => $email,
        'channel' => 'email'
    ]);

    $record = $findOtp->fetch();

    if (!$record) {
        respond(
            false,
            'No password reset request was found for this email.',
            [],
            404
        );
    }

    if ((int)$record['is_verified'] === 1) {
        respond(
            false,
            'This reset code has already been verified.',
            [],
            409
        );
    }

    if (strtotime($record['expires_at']) < time()) {
        respond(
            false,
            'The reset code has expired. Please request a new code.',
            [],
            410
        );
    }

    $attempts = (int)$record['attempts'];

    if ($attempts >= 5) {
        respond(
            false,
            'Too many incorrect attempts. Please request a new reset code.',
            [],
            429
        );
    }

    if (!password_verify($otp, $record['otp_hash'])) {
        $increaseAttempts = $pdo->prepare(
            'UPDATE password_reset_otps
             SET attempts = attempts + 1
             WHERE id = :id'
        );

        $increaseAttempts->execute([
            'id' => $record['id']
        ]);

        $remainingAttempts = max(
            0,
            4 - $attempts
        );

        respond(
            false,
            'Incorrect password reset code.',
            [
                'remaining_attempts' => $remainingAttempts
            ],
            422
        );
    }

    $findUser = $pdo->prepare(
        'SELECT
            id,
            full_name,
            email,
            is_verified,
            account_status
         FROM users
         WHERE id = :user_id
           AND email = :email
         LIMIT 1'
    );

    $findUser->execute([
        'user_id' => $record['user_id'],
        'email' => $email
    ]);

    $user = $findUser->fetch();

    if (!$user) {
        respond(
            false,
            'The account connected to this reset request was not found.',
            [],
            404
        );
    }

    if ((int)$user['is_verified'] !== 1) {
        respond(
            false,
            'This account is not verified.',
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

    $tokenExpirySeconds = (int)(
        $config['app']['reset_token_expiry_seconds']
        ?? 600
    );

    $resetToken = bin2hex(
        random_bytes(32)
    );

    $resetTokenHash = hash(
        'sha256',
        $resetToken
    );

    $resetTokenExpiresAt = (
        new DateTimeImmutable()
    )
        ->modify("+{$tokenExpirySeconds} seconds")
        ->format('Y-m-d H:i:s');

    $updateOtp = $pdo->prepare(
        'UPDATE password_reset_otps
         SET
            is_verified = 1,
            reset_token_hash = :reset_token_hash,
            reset_token_expires_at = :reset_token_expires_at
         WHERE id = :id'
    );

    $updateOtp->execute([
        'reset_token_hash' => $resetTokenHash,
        'reset_token_expires_at' => $resetTokenExpiresAt,
        'id' => $record['id']
    ]);

    respond(
        true,
        'Reset code verified successfully.',
        [
            'email' => $email,
            'reset_token' => $resetToken,
            'token_expires_in' => $tokenExpirySeconds
        ]
    );
} catch (Throwable $e) {
    error_log(
        'Reset OTP verification error: ' .
        $e->getMessage()
    );

    respond(
        false,
        'Password reset verification could not be completed.',
        [],
        500
    );
}