<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/auth-middleware.php';

applyCors();

header('Content-Type: application/json; charset=utf-8');

function getAdminProfile(
    PDO $pdo,
    int $userId
): array {
    $statement = $pdo->prepare(
        'SELECT
            id,
            full_name,
            email,
            country,
            role,
            profile_image,
            is_verified,
            account_status,
            created_at,
            last_login_at
         FROM users
         WHERE id = :id
         LIMIT 1'
    );

    $statement->execute([
        'id' => $userId
    ]);

    $user = $statement->fetch(
        PDO::FETCH_ASSOC
    );

    if (!$user) {
        throw new RuntimeException(
            'Admin account was not found.'
        );
    }

    $user['id'] =
        (int)$user['id'];

    $user['is_verified'] =
        (int)$user['is_verified'];

    $user['role'] =
        strtolower(
            (string)$user['role']
        );

    return $user;
}

try {
    $authUser = requireRole([
        'admin'
    ]);

    $pdo =
        getDatabaseConnection();

    $method =
        strtoupper(
            (string)(
                $_SERVER[
                    'REQUEST_METHOD'
                ] ?? ''
            )
        );

    if ($method === 'GET') {
        echo json_encode([
            'success' => true,
            'user' =>
                getAdminProfile(
                    $pdo,
                    (int)$authUser['id']
                )
        ]);

        exit;
    }

    if (
        !in_array(
            $method,
            [
                'PUT',
                'PATCH'
            ],
            true
        )
    ) {
        http_response_code(405);

        echo json_encode([
            'success' => false,
            'message' =>
                'Method not allowed.'
        ]);

        exit;
    }

    $payload =
        json_decode(
            file_get_contents(
                'php://input'
            ),
            true
        );

    if (!is_array($payload)) {
        $payload = [];
    }

    $fullName =
        trim(
            (string)(
                $payload[
                    'full_name'
                ] ?? ''
            )
        );

    $country =
        trim(
            (string)(
                $payload[
                    'country'
                ] ?? ''
            )
        );

    $profileImage =
        trim(
            (string)(
                $payload[
                    'profile_image'
                ] ?? ''
            )
        );

    if (
        $fullName === '' ||
        mb_strlen(
            $fullName
        ) > 120
    ) {
        http_response_code(422);

        echo json_encode([
            'success' => false,
            'message' =>
                'Please enter a valid full name.'
        ]);

        exit;
    }

    if (
        mb_strlen(
            $country
        ) > 120
    ) {
        http_response_code(422);

        echo json_encode([
            'success' => false,
            'message' =>
                'Country value is too long.'
        ]);

        exit;
    }

    if (
        $profileImage !== '' &&
        !str_starts_with(
            $profileImage,
            'data:image/'
        ) &&
        !filter_var(
            $profileImage,
            FILTER_VALIDATE_URL
        )
    ) {
        http_response_code(422);

        echo json_encode([
            'success' => false,
            'message' =>
                'Invalid profile image.'
        ]);

        exit;
    }

    if (
        strlen(
            $profileImage
        ) > 2500000
    ) {
        http_response_code(413);

        echo json_encode([
            'success' => false,
            'message' =>
                'Profile image is too large.'
        ]);

        exit;
    }

    $statement =
        $pdo->prepare(
            'UPDATE users
             SET
                full_name =
                    :full_name,
                country =
                    :country,
                profile_image =
                    :profile_image
             WHERE id = :id'
        );

    $statement->execute([
        'full_name' =>
            $fullName,

        'country' =>
            $country !== ''
                ? $country
                : null,

        'profile_image' =>
            $profileImage !== ''
                ? $profileImage
                : null,

        'id' =>
            (int)$authUser['id']
    ]);

    $updatedUser =
        getAdminProfile(
            $pdo,
            (int)$authUser['id']
        );

    echo json_encode([
        'success' => true,
        'message' =>
            'Profile saved successfully.',
        'user' =>
            $updatedUser
    ]);
} catch (Throwable $e) {
    error_log(
        'Admin profile error: ' .
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
            'Unable to update admin profile.'
    ]);
}