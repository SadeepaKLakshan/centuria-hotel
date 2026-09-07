<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/auth-middleware.php';

applyCors();

header('Content-Type: application/json; charset=utf-8');

if (
    ($_SERVER['REQUEST_METHOD'] ?? '')
    !== 'GET'
) {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' =>
            'Method not allowed.'
    ]);

    exit;
}

try {
    $authUser =
        requireRole([
            'admin'
        ]);

    $pdo =
        getDatabaseConnection();

    $statement =
        $pdo->query(
            'SELECT
                id,
                full_name,
                email,
                country,
                role,
                is_verified,
                account_status,
                profile_image,
                email_verified_at,
                last_login_at,
                created_at
             FROM users
             ORDER BY
                FIELD(
                    role,
                    "admin",
                    "manager",
                    "staff",
                    "customer"
                ),
                created_at DESC,
                id DESC'
        );

    $users =
        $statement->fetchAll(
            PDO::FETCH_ASSOC
        );

    foreach (
        $users as &$user
    ) {
        $user['id'] =
            (int)$user['id'];

        $user['is_verified'] =
            (int)$user[
                'is_verified'
            ];

        $user['role'] =
            strtolower(
                (string)$user['role']
            );
    }

    unset($user);

    echo json_encode([
        'success' => true,

        'current_user_id' =>
            (int)$authUser['id'],

        'users' =>
            $users
    ]);
} catch (Throwable $e) {
    error_log(
        'Admin users error: ' .
        $e->getMessage()
    );

    if (
        http_response_code() <
        400
    ) {
        http_response_code(500);
    }

    echo json_encode([
        'success' => false,
        'message' =>
            'Unable to load user accounts.'
    ]);
}