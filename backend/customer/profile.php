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
        trim(
            (string)($input['email'] ?? '')
        )
    );

    if (
        $email === '' ||
        !filter_var(
            $email,
            FILTER_VALIDATE_EMAIL
        )
    ) {
        respond(
            false,
            'A valid email address is required.',
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
            phone,
            country,
            role,
            profile_image,
            account_status,
            last_login_at
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
            'Customer account was not found.',
            [],
            404
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

    $profileImage = '';

    if (
        !empty($user['profile_image'])
    ) {
        if (
            str_starts_with(
                (string)$user['profile_image'],
                'http://'
            ) ||
            str_starts_with(
                (string)$user['profile_image'],
                'https://'
            )
        ) {
            $profileImage =
                (string)$user['profile_image'];
        } else {
            $profileImage =
                'http://localhost/centuria-hotel/backend/' .
                ltrim(
                    (string)$user['profile_image'],
                    '/'
                );
        }
    }

    respond(
        true,
        'Customer profile loaded successfully.',
        [
            'user' => [
                'id' =>
                    (int)$user['id'],

                'full_name' =>
                    (string)$user['full_name'],

                'email' =>
                    (string)$user['email'],

                'phone' =>
                    (string)($user['phone'] ?? ''),

                'country' =>
                    (string)($user['country'] ?? 'Sri Lanka'),

                'role' =>
                    strtolower(
                        (string)$user['role']
                    ),

                'profile_image' =>
                    $profileImage,

                'account_status' =>
                    (string)$user['account_status'],

                'last_login_at' =>
                    $user['last_login_at']
            ]
        ]
    );
} catch (Throwable $e) {
    error_log(
        'Customer profile error: ' .
        $e->getMessage()
    );

    respond(
        false,
        'Customer profile could not be loaded.',
        [],
        500
    );
}