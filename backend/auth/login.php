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

    $password = (string)($input['password'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
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

    if (!$user) {
        respond(
            false,
            'Incorrect email or password.',
            [],
            401
        );
    }

    if (!password_verify($password, $user['password_hash'])) {
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
                'status' => 'failed',
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null
            ]);
        } catch (Throwable $ignored) {
        }

        respond(
            false,
            'Incorrect email or password.',
            [],
            401
        );
    }

    if ((int)$user['is_verified'] !== 1) {
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
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null
        ]);
    } catch (Throwable $ignored) {
    }

    $role = strtolower((string)$user['role']);

    $redirect = match ($role) {
        'admin' => '/admin-dashboard',
        'manager' => '/manager-dashboard',
        'staff' => '/staff-dashboard',
        default => '/customer-dashboard'
    };

    respond(
        true,
        'Login successful.',
        [
            'user' => [
                'id' => (int)$user['id'],
                'full_name' => $user['full_name'],
                'email' => $user['email'],
                'country' => $user['country'],
                'role' => $role,
                'profile_image' => $user['profile_image']
            ],
            'redirect' => $redirect
        ]
    );
} catch (Throwable $e) {
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