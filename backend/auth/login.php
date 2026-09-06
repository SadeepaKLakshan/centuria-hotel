<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

applyCors();

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

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
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
        trim(
            (string) ($input['email'] ?? '')
        )
    );

    $password = (string) (
        $input['password'] ?? ''
    );

    if (
        !filter_var(
            $email,
            FILTER_VALIDATE_EMAIL
        )
    ) {
        respond(
            false,
            'Please enter a valid email address.',
            [],
            422
        );
    }

    if ($password === '') {
        respond(
            false,
            'Password is required.',
            [],
            422
        );
    }

    $pdo = getDatabaseConnection();

    $statement = $pdo->prepare(
        'SELECT
            id,
            full_name,
            email,
            country,
            password_hash,
            role,
            is_verified,
            account_status,
            profile_image
         FROM users
         WHERE email = :email
         LIMIT 1'
    );

    $statement->execute([
        'email' => $email
    ]);

    $user = $statement->fetch();

    if (
        !$user ||
        !password_verify(
            $password,
            $user['password_hash']
        )
    ) {
        if ($user) {
            try {
                $log = $pdo->prepare(
                    'INSERT INTO login_logs
                    (
                        user_id,
                        email,
                        status,
                        ip_address,
                        created_at
                    )
                    VALUES
                    (
                        :user_id,
                        :email,
                        :status,
                        :ip_address,
                        NOW()
                    )'
                );

                $log->execute([
                    'user_id' => $user['id'],
                    'email' => $email,
                    'status' => 'failed',
                    'ip_address' =>
                        $_SERVER['REMOTE_ADDR'] ?? null
                ]);
            } catch (Throwable $ignored) {
            }
        }

        respond(
            false,
            'Incorrect email or password.',
            [],
            401
        );
    }

    if ((int) $user['is_verified'] !== 1) {
        respond(
            false,
            'Please verify your email before logging in.',
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

    $role = strtolower(
        (string) $user['role']
    );

    $allowedRoles = [
        'customer',
        'staff',
        'manager',
        'admin'
    ];

    if (
        !in_array(
            $role,
            $allowedRoles,
            true
        )
    ) {
        respond(
            false,
            'Invalid account role.',
            [],
            403
        );
    }

    $token = bin2hex(
        random_bytes(32)
    );

    $tokenHash = hash(
        'sha256',
        $token
    );

    $expiresAt = (
        new DateTimeImmutable()
    )
        ->modify('+7 days')
        ->format('Y-m-d H:i:s');

    $pdo->beginTransaction();

    $deleteExpiredTokens = $pdo->prepare(
        'DELETE FROM api_tokens
         WHERE user_id = :user_id
           AND expires_at < NOW()'
    );

    $deleteExpiredTokens->execute([
        'user_id' => $user['id']
    ]);

    $insertToken = $pdo->prepare(
        'INSERT INTO api_tokens
        (
            user_id,
            token_hash,
            expires_at,
            created_at,
            last_used_at
        )
        VALUES
        (
            :user_id,
            :token_hash,
            :expires_at,
            NOW(),
            NOW()
        )'
    );

    $insertToken->execute([
        'user_id' => $user['id'],
        'token_hash' => $tokenHash,
        'expires_at' => $expiresAt
    ]);

    $updateLogin = $pdo->prepare(
        'UPDATE users
         SET last_login_at = NOW()
         WHERE id = :id'
    );

    $updateLogin->execute([
        'id' => $user['id']
    ]);

    try {
        $log = $pdo->prepare(
            'INSERT INTO login_logs
            (
                user_id,
                email,
                status,
                ip_address,
                created_at
            )
            VALUES
            (
                :user_id,
                :email,
                :status,
                :ip_address,
                NOW()
            )'
        );

        $log->execute([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'status' => 'success',
            'ip_address' =>
                $_SERVER['REMOTE_ADDR'] ?? null
        ]);
    } catch (Throwable $ignored) {
    }

    $pdo->commit();

    $redirect = match ($role) {
        'admin' =>
            '/admin-dashboard',

        'manager' =>
            '/manager-dashboard',

        'staff' =>
            '/staff-dashboard',

        default =>
            '/customer-dashboard'
    };

    respond(
        true,
        'Login successful.',
        [
            'token' => $token,
            'token_type' => 'Bearer',
            'expires_at' => $expiresAt,

            'user' => [
                'id' => (int) $user['id'],
                'full_name' =>
                    $user['full_name'],
                'email' =>
                    $user['email'],
                'country' =>
                    $user['country'],
                'role' =>
                    $role,
                'profile_image' =>
                    $user['profile_image']
            ],

            'redirect' => $redirect
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
        'Login error: ' .
        $e->getMessage()
    );

    respond(
        false,
        'Login could not be completed.',
        [],
        500
    );
}