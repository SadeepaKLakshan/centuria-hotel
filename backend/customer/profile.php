<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/auth-middleware.php';

applyCors();

header(
    'Content-Type: application/json; charset=utf-8'
);

function profileResponse(
    int $status,
    array $payload
): never {
    http_response_code($status);

    echo json_encode(
        $payload,
        JSON_UNESCAPED_SLASHES
    );

    exit;
}

function getCustomerProfile(
    PDO $pdo,
    int $userId
): array {
    $statement = $pdo->prepare(
        'SELECT
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
            'Customer account was not found.'
        );
    }

    return [
        'id' =>
            (int)$user['id'],

        'full_name' =>
            (string)$user['full_name'],

        'email' =>
            (string)$user['email'],

        'phone' =>
            $user['phone'] ?? '',

        'country_code' =>
            $user['country_code'] ?? '',

        'country' =>
            $user['country'] ?? 'Sri Lanka',

        'role' =>
            strtolower(
                (string)$user['role']
            ),

        'is_verified' =>
            (int)$user['is_verified'],

        'account_status' =>
            (string)$user['account_status'],

        'profile_image' =>
            $user['profile_image'] ?? '',

        'email_verified_at' =>
            $user['email_verified_at'] ?? null,

        'phone_verified_at' =>
            $user['phone_verified_at'] ?? null,

        'last_login_at' =>
            $user['last_login_at'] ?? null,

        'created_at' =>
            $user['created_at'] ?? null,

        'updated_at' =>
            $user['updated_at'] ?? null
    ];
}

try {
    $customer =
        requireCustomer();

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
        profileResponse(
            200,
            [
                'success' => true,

                'user' =>
                    getCustomerProfile(
                        $pdo,
                        (int)$customer['id']
                    )
            ]
        );
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
        profileResponse(
            405,
            [
                'success' => false,
                'message' =>
                    'Method not allowed.'
            ]
        );
    }

    $input =
        json_decode(
            file_get_contents(
                'php://input'
            ),
            true
        );

    if (!is_array($input)) {
        $input = [];
    }

    $fullName =
        trim(
            (string)(
                $input[
                    'full_name'
                ] ?? ''
            )
        );

    $phone =
        trim(
            (string)(
                $input[
                    'phone'
                ] ?? ''
            )
        );

    $country =
        trim(
            (string)(
                $input[
                    'country'
                ] ?? ''
            )
        );

    $countryCode =
        trim(
            (string)(
                $input[
                    'country_code'
                ] ?? ''
            )
        );

    $profileImage =
        trim(
            (string)(
                $input[
                    'profile_image'
                ] ?? ''
            )
        );

    if (
        $fullName === '' ||
        mb_strlen(
            $fullName
        ) > 150
    ) {
        profileResponse(
            422,
            [
                'success' => false,
                'message' =>
                    'Please enter a valid full name.'
            ]
        );
    }

    if (
        mb_strlen(
            $phone
        ) > 40
    ) {
        profileResponse(
            422,
            [
                'success' => false,
                'message' =>
                    'Phone number is too long.'
            ]
        );
    }

    if (
        mb_strlen(
            $country
        ) > 100
    ) {
        profileResponse(
            422,
            [
                'success' => false,
                'message' =>
                    'Country value is too long.'
            ]
        );
    }

    if (
        mb_strlen(
            $countryCode
        ) > 10
    ) {
        profileResponse(
            422,
            [
                'success' => false,
                'message' =>
                    'Country code is too long.'
            ]
        );
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
        profileResponse(
            422,
            [
                'success' => false,
                'message' =>
                    'Invalid profile image.'
            ]
        );
    }

    if (
        strlen(
            $profileImage
        ) > 2500000
    ) {
        profileResponse(
            413,
            [
                'success' => false,
                'message' =>
                    'Profile image is too large.'
            ]
        );
    }

    $statement =
        $pdo->prepare(
            'UPDATE users
             SET
                full_name =
                    :full_name,
                phone =
                    :phone,
                country_code =
                    :country_code,
                country =
                    :country,
                profile_image =
                    :profile_image
             WHERE id = :id'
        );

    $statement->execute([
        'full_name' =>
            $fullName,

        'phone' =>
            $phone !== ''
                ? $phone
                : null,

        'country_code' =>
            $countryCode !== ''
                ? $countryCode
                : null,

        'country' =>
            $country !== ''
                ? $country
                : 'Sri Lanka',

        'profile_image' =>
            $profileImage !== ''
                ? $profileImage
                : null,

        'id' =>
            (int)$customer['id']
    ]);

    $updatedUser =
        getCustomerProfile(
            $pdo,
            (int)$customer['id']
        );

    profileResponse(
        200,
        [
            'success' => true,

            'message' =>
                'Customer profile saved successfully.',

            'user' =>
                $updatedUser
        ]
    );
} catch (Throwable $error) {
    error_log(
        'Customer profile error: ' .
        $error->getMessage()
    );

    profileResponse(
        500,
        [
            'success' => false,
            'message' =>
                'Unable to update customer profile.',
            'error' =>
                $error->getMessage()
        ]
    );
}