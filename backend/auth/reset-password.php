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

    $resetToken = trim(
        (string)($input['reset_token'] ?? '')
    );

    $newPassword = (string)(
        $input['new_password'] ?? ''
    );

    $confirmPassword = (string)(
        $input['confirm_password'] ?? ''
    );

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(
            false,
            'Please enter a valid email address.',
            [],
            422
        );
    }

    if ($resetToken === '') {
        respond(
            false,
            'The password reset session is invalid.',
            [],
            422
        );
    }

    if (strlen($resetToken) !== 64) {
        respond(
            false,
            'The password reset token is invalid.',
            [],
            422
        );
    }

    if (strlen($newPassword) < 8) {
        respond(
            false,
            'New password must contain at least 8 characters.',
            [],
            422
        );
    }

    if (!preg_match('/[A-Z]/', $newPassword)) {
        respond(
            false,
            'New password must contain at least one uppercase letter.',
            [],
            422
        );
    }

    if (!preg_match('/[a-z]/', $newPassword)) {
        respond(
            false,
            'New password must contain at least one lowercase letter.',
            [],
            422
        );
    }

    if (!preg_match('/[0-9]/', $newPassword)) {
        respond(
            false,
            'New password must contain at least one number.',
            [],
            422
        );
    }

    if ($newPassword !== $confirmPassword) {
        respond(
            false,
            'New password and confirm password do not match.',
            [],
            422
        );
    }

    $pdo = getDatabaseConnection();

    $findReset = $pdo->prepare(
        'SELECT
            id,
            user_id,
            identifier,
            is_verified,
            reset_token_hash,
            reset_token_expires_at
         FROM password_reset_otps
         WHERE identifier = :identifier
           AND is_verified = 1
         ORDER BY id DESC
         LIMIT 1'
    );

    $findReset->execute([
        'identifier' => $email
    ]);

    $resetRecord = $findReset->fetch();

    if (!$resetRecord) {
        respond(
            false,
            'No verified password reset request was found.',
            [],
            404
        );
    }

    if (
        empty($resetRecord['reset_token_hash']) ||
        empty($resetRecord['reset_token_expires_at'])
    ) {
        respond(
            false,
            'The password reset session is invalid.',
            [],
            401
        );
    }

    if (
        strtotime(
            $resetRecord['reset_token_expires_at']
        ) < time()
    ) {
        respond(
            false,
            'The password reset session has expired. Please start again.',
            [],
            410
        );
    }

    $providedTokenHash = hash(
        'sha256',
        $resetToken
    );

    if (
        !hash_equals(
            (string)$resetRecord['reset_token_hash'],
            $providedTokenHash
        )
    ) {
        respond(
            false,
            'The password reset token is invalid.',
            [],
            401
        );
    }

    $findUser = $pdo->prepare(
        'SELECT
            id,
            email,
            password_hash,
            is_verified,
            account_status
         FROM users
         WHERE id = :user_id
           AND email = :email
         LIMIT 1'
    );

    $findUser->execute([
        'user_id' => $resetRecord['user_id'],
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

    if (
        password_verify(
            $newPassword,
            $user['password_hash']
        )
    ) {
        respond(
            false,
            'Your new password must be different from your current password.',
            [],
            422
        );
    }

    $newPasswordHash = password_hash(
        $newPassword,
        PASSWORD_DEFAULT
    );

    if ($newPasswordHash === false) {
        throw new RuntimeException(
            'Password hashing failed.'
        );
    }

    $pdo->beginTransaction();

    $updatePassword = $pdo->prepare(
        'UPDATE users
         SET password_hash = :password_hash
         WHERE id = :id'
    );

    $updatePassword->execute([
        'password_hash' => $newPasswordHash,
        'id' => $user['id']
    ]);

    $deleteResetRequests = $pdo->prepare(
        'DELETE FROM password_reset_otps
         WHERE user_id = :user_id'
    );

    $deleteResetRequests->execute([
        'user_id' => $user['id']
    ]);

    $pdo->commit();

    respond(
        true,
        'Your password has been changed successfully. You can now log in with your new password.',
        [
            'email' => $email
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
        'Reset password error: ' .
        $e->getMessage()
    );

    respond(
        false,
        'Your password could not be changed.',
        [],
        500
    );
}