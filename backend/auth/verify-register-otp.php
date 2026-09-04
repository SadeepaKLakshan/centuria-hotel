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
            'Please enter the complete 6-digit verification code.',
            [],
            422
        );
    }

    $pdo = getDatabaseConnection();

    $findOtp = $pdo->prepare(
        'SELECT
            id,
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
         FROM registration_otps
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
            'No verification request was found for this email.',
            [],
            404
        );
    }

    if ((int)$record['is_verified'] === 1) {
        respond(
            false,
            'This verification code has already been used.',
            [],
            409
        );
    }

    if (strtotime($record['expires_at']) < time()) {
        respond(
            false,
            'The verification code has expired. Please request a new code.',
            [],
            410
        );
    }

    $attempts = (int)$record['attempts'];

    if ($attempts >= 5) {
        respond(
            false,
            'Too many incorrect attempts. Please request a new verification code.',
            [],
            429
        );
    }

    if (!password_verify($otp, $record['otp_hash'])) {
        $increaseAttempts = $pdo->prepare(
            'UPDATE registration_otps
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
            'Incorrect verification code.',
            [
                'remaining_attempts' => $remainingAttempts
            ],
            422
        );
    }

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

    $pdo->beginTransaction();

    $createUser = $pdo->prepare(
        'INSERT INTO users
        (
            full_name,
            email,
            country,
            password_hash,
            role,
            is_verified,
            account_status,
            email_verified_at
        )
        VALUES
        (
            :full_name,
            :email,
            :country,
            :password_hash,
            :role,
            1,
            :account_status,
            NOW()
        )'
    );

    $createUser->execute([
        'full_name' => $record['full_name'],
        'email' => $record['email'],
        'country' => $record['country'],
        'password_hash' => $record['password_hash'],
        'role' => $record['role'],
        'account_status' => 'active'
    ]);

    $userId = (int)$pdo->lastInsertId();

    $markVerified = $pdo->prepare(
        'UPDATE registration_otps
         SET is_verified = 1
         WHERE id = :id'
    );

    $markVerified->execute([
        'id' => $record['id']
    ]);

    $pdo->commit();

    respond(
        true,
        'Email verified and account created successfully.',
        [
            'user' => [
                'id' => $userId,
                'full_name' => $record['full_name'],
                'email' => $record['email'],
                'country' => $record['country'],
                'role' => $record['role']
            ]
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
        'Register OTP verification error: ' .
        $e->getMessage()
    );

    respond(
        false,
        'Account verification failed.',
        [],
        500
    );
}