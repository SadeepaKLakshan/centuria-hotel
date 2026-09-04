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
    $email = strtolower(
        trim(
            (string)($_POST['email'] ?? '')
        )
    );

    $fullName = trim(
        (string)($_POST['full_name'] ?? '')
    );

    $phone = trim(
        (string)($_POST['phone'] ?? '')
    );

    $country = trim(
        (string)($_POST['country'] ?? '')
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

    if ($fullName === '') {
        respond(
            false,
            'Full name is required.',
            [],
            422
        );
    }

    if ($country === '') {
        $country = 'Sri Lanka';
    }

    $pdo = getDatabaseConnection();

    $findUser = $pdo->prepare(
        'SELECT
            id,
            profile_image,
            account_status
         FROM users
         WHERE email = :email
         LIMIT 1'
    );

    $findUser->execute([
        'email' => $email
    ]);

    $user = $findUser->fetch();

    if (!$user) {
        respond(
            false,
            'Customer account was not found.',
            [],
            404
        );
    }

    if (
        $user['account_status'] !==
        'active'
    ) {
        respond(
            false,
            'This account is currently unavailable.',
            [],
            403
        );
    }

    $profileImagePath =
        (string)($user['profile_image'] ?? '');

    if (
        isset($_FILES['profile_image']) &&
        $_FILES['profile_image']['error'] !==
            UPLOAD_ERR_NO_FILE
    ) {
        $file =
            $_FILES['profile_image'];

        if (
            $file['error'] !==
            UPLOAD_ERR_OK
        ) {
            respond(
                false,
                'Profile image upload failed.',
                [],
                422
            );
        }

        $maxSize =
            5 * 1024 * 1024;

        if (
            (int)$file['size'] >
            $maxSize
        ) {
            respond(
                false,
                'Profile image must be smaller than 5 MB.',
                [],
                422
            );
        }

        $finfo =
            new finfo(
                FILEINFO_MIME_TYPE
            );

        $mimeType =
            $finfo->file(
                $file['tmp_name']
            );

        $allowedTypes = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp'
        ];

        if (
            !isset(
                $allowedTypes[$mimeType]
            )
        ) {
            respond(
                false,
                'Only JPG, PNG and WEBP images are allowed.',
                [],
                422
            );
        }

        $extension =
            $allowedTypes[$mimeType];

        $uploadDirectory =
            __DIR__ .
            '/../uploads/profiles';

        if (
            !is_dir(
                $uploadDirectory
            )
        ) {
            if (
                !mkdir(
                    $uploadDirectory,
                    0775,
                    true
                ) &&
                !is_dir(
                    $uploadDirectory
                )
            ) {
                throw new RuntimeException(
                    'Unable to create profile upload directory.'
                );
            }
        }

        $fileName =
            'profile_' .
            (int)$user['id'] .
            '_' .
            time() .
            '_' .
            bin2hex(
                random_bytes(4)
            ) .
            '.' .
            $extension;

        $destination =
            $uploadDirectory .
            '/' .
            $fileName;

        if (
            !move_uploaded_file(
                $file['tmp_name'],
                $destination
            )
        ) {
            throw new RuntimeException(
                'Unable to save profile image.'
            );
        }

        if (
            $profileImagePath !== '' &&
            !str_starts_with(
                $profileImagePath,
                'http://'
            ) &&
            !str_starts_with(
                $profileImagePath,
                'https://'
            )
        ) {
            $oldImage =
                __DIR__ .
                '/../' .
                ltrim(
                    $profileImagePath,
                    '/'
                );

            if (
                is_file($oldImage)
            ) {
                @unlink($oldImage);
            }
        }

        $profileImagePath =
            'uploads/profiles/' .
            $fileName;
    }

    $update = $pdo->prepare(
        'UPDATE users
         SET
            full_name = :full_name,
            phone = :phone,
            country = :country,
            profile_image = :profile_image
         WHERE id = :id'
    );

    $update->execute([
        'full_name' =>
            $fullName,

        'phone' =>
            $phone !== ''
                ? $phone
                : null,

        'country' =>
            $country,

        'profile_image' =>
            $profileImagePath !== ''
                ? $profileImagePath
                : null,

        'id' =>
            $user['id']
    ]);

    $publicImage = '';

    if ($profileImagePath !== '') {
        if (
            str_starts_with(
                $profileImagePath,
                'http://'
            ) ||
            str_starts_with(
                $profileImagePath,
                'https://'
            )
        ) {
            $publicImage =
                $profileImagePath;
        } else {
            $publicImage =
                'http://localhost/centuria-hotel/backend/' .
                ltrim(
                    $profileImagePath,
                    '/'
                );
        }
    }

    respond(
        true,
        'Profile updated successfully.',
        [
            'user' => [
                'id' =>
                    (int)$user['id'],

                'full_name' =>
                    $fullName,

                'email' =>
                    $email,

                'phone' =>
                    $phone,

                'country' =>
                    $country,

                'profile_image' =>
                    $publicImage
            ]
        ]
    );
} catch (Throwable $e) {
    error_log(
        'Customer update profile error: ' .
        $e->getMessage()
    );

    respond(
        false,
        'Profile could not be updated.',
        [],
        500
    );
}