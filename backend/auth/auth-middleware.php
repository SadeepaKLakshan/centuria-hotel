<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

function getAuthorizationHeader(): string
{
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return trim(
            (string)$_SERVER['HTTP_AUTHORIZATION']
        );
    }

    if (function_exists('getallheaders')) {
        $headers = getallheaders();

        if (isset($headers['Authorization'])) {
            return trim(
                (string)$headers['Authorization']
            );
        }

        if (isset($headers['authorization'])) {
            return trim(
                (string)$headers['authorization']
            );
        }
    }

    return '';
}

function requireAuthenticatedUser(): array
{
    $authorization =
        getAuthorizationHeader();

    if (
        !preg_match(
            '/^Bearer\s+(.+)$/i',
            $authorization,
            $matches
        )
    ) {
        http_response_code(401);

        echo json_encode([
            'success' => false,
            'message' =>
                'Authentication is required.'
        ]);

        exit;
    }

    $token = trim($matches[1]);

    if ($token === '') {
        http_response_code(401);

        echo json_encode([
            'success' => false,
            'message' =>
                'Invalid authentication token.'
        ]);

        exit;
    }

    $tokenHash = hash(
        'sha256',
        $token
    );

    $pdo = getDatabaseConnection();

    $statement = $pdo->prepare(
        'SELECT
            t.id AS token_id,
            t.user_id,
            t.expires_at,
            u.full_name,
            u.email,
            u.country,
            u.role,
            u.is_verified,
            u.account_status,
            u.profile_image
         FROM api_tokens t
         INNER JOIN users u
            ON u.id = t.user_id
         WHERE t.token_hash = :token_hash
         LIMIT 1'
    );

    $statement->execute([
        'token_hash' => $tokenHash
    ]);

    $user = $statement->fetch();

    if (!$user) {
        http_response_code(401);

        echo json_encode([
            'success' => false,
            'message' =>
                'Invalid authentication token.'
        ]);

        exit;
    }

    if (
        strtotime(
            (string)$user['expires_at']
        ) <= time()
    ) {
        $deleteToken = $pdo->prepare(
            'DELETE FROM api_tokens
             WHERE id = :id'
        );

        $deleteToken->execute([
            'id' => $user['token_id']
        ]);

        http_response_code(401);

        echo json_encode([
            'success' => false,
            'message' =>
                'Your session has expired. Please log in again.'
        ]);

        exit;
    }

    if ((int)$user['is_verified'] !== 1) {
        http_response_code(403);

        echo json_encode([
            'success' => false,
            'message' =>
                'Your account is not verified.'
        ]);

        exit;
    }

    if ($user['account_status'] !== 'active') {
        http_response_code(403);

        echo json_encode([
            'success' => false,
            'message' =>
                'Your account is currently unavailable.'
        ]);

        exit;
    }

    $updateToken = $pdo->prepare(
        'UPDATE api_tokens
         SET last_used_at = NOW()
         WHERE id = :id'
    );

    $updateToken->execute([
        'id' => $user['token_id']
    ]);

    return [
        'id' => (int)$user['user_id'],
        'full_name' => $user['full_name'],
        'email' => $user['email'],
        'country' => $user['country'],
        'role' => strtolower(
            (string)$user['role']
        ),
        'profile_image' =>
            $user['profile_image']
    ];
}

function requireAdmin(): array
{
    $user =
        requireAuthenticatedUser();

    if (
        !in_array(
            $user['role'],
            [
                'admin',
                'manager'
            ],
            true
        )
    ) {
        http_response_code(403);

        echo json_encode([
            'success' => false,
            'message' =>
                'Administrator access is required.'
        ]);

        exit;
    }

    return $user;
}

function requireCustomer(): array
{
    $user =
        requireAuthenticatedUser();

    if ($user['role'] !== 'customer') {
        http_response_code(403);

        echo json_encode([
            'success' => false,
            'message' =>
                'Customer access is required.'
        ]);

        exit;
    }

    return $user;
}