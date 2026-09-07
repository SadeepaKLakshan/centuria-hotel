<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/auth-middleware.php';

applyCors();

header(
    'Content-Type: application/json; charset=utf-8'
);

if (
    ($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET'
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
        requireAdmin();

    $pdo =
        getDatabaseConnection();

    $sql = "
        SELECT
            id,
            full_name,
            email,
            phone,
            country_code,
            country,
            role,
            is_verified,
            account_status,
            profile_image,
            email_verified_at,
            phone_verified_at,
            last_login_at,
            created_at,
            updated_at
        FROM users
        ORDER BY
            CASE role
                WHEN 'admin' THEN 1
                WHEN 'manager' THEN 2
                WHEN 'staff' THEN 3
                WHEN 'customer' THEN 4
                ELSE 5
            END,
            created_at DESC,
            id DESC
    ";

    $statement =
        $pdo->prepare($sql);

    $statement->execute();

    $users =
        $statement->fetchAll(
            PDO::FETCH_ASSOC
        );

    $formattedUsers = [];

    foreach ($users as $user) {
        $formattedUsers[] = [
            'id' =>
                (int)$user['id'],

            'full_name' =>
                (string)(
                    $user['full_name'] ??
                    ''
                ),

            'email' =>
                (string)(
                    $user['email'] ??
                    ''
                ),

            'phone' =>
                $user['phone'] ??
                null,

            'country_code' =>
                $user['country_code'] ??
                null,

            'country' =>
                $user['country'] ??
                null,

            'role' =>
                strtolower(
                    (string)(
                        $user['role'] ??
                        'customer'
                    )
                ),

            'is_verified' =>
                (int)(
                    $user[
                        'is_verified'
                    ] ?? 0
                ),

            'account_status' =>
                (string)(
                    $user[
                        'account_status'
                    ] ??
                    'active'
                ),

            'profile_image' =>
                $user[
                    'profile_image'
                ] ??
                null,

            'email_verified_at' =>
                $user[
                    'email_verified_at'
                ] ??
                null,

            'phone_verified_at' =>
                $user[
                    'phone_verified_at'
                ] ??
                null,

            'last_login_at' =>
                $user[
                    'last_login_at'
                ] ??
                null,

            'created_at' =>
                $user[
                    'created_at'
                ] ??
                null,

            'updated_at' =>
                $user[
                    'updated_at'
                ] ??
                null
        ];
    }

    echo json_encode([
        'success' => true,

        'current_user_id' =>
            (int)$authUser['id'],

        'total' =>
            count(
                $formattedUsers
            ),

        'users' =>
            $formattedUsers
    ]);
} catch (Throwable $e) {
    error_log(
        'Admin users endpoint error: ' .
        $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        'success' => false,

        'message' =>
            'Unable to load user accounts.',

        'error' =>
            $e->getMessage()
    ]);
}