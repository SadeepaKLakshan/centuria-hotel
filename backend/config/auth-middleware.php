<?php

declare(strict_types=1);

require_once __DIR__ . '/database.php';

function getBearerToken(): ?string
{
    $authorization = '';

    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authorization = trim(
            (string) $_SERVER['HTTP_AUTHORIZATION']
        );
    } elseif (function_exists('getallheaders')) {
        $headers = getallheaders();

        if (isset($headers['Authorization'])) {
            $authorization = trim(
                (string) $headers['Authorization']
            );
        } elseif (isset($headers['authorization'])) {
            $authorization = trim(
                (string) $headers['authorization']
            );
        }
    }

    if (
        !preg_match(
            '/^Bearer\s+(.+)$/i',
            $authorization,
            $matches
        )
    ) {
        return null;
    }

    return trim($matches[1]);
}

function authRespond(
    string $message,
    int $statusCode = 401
): never {
    http_response_code($statusCode);

    echo json_encode(
        [
            'success' => false,
            'message' => $message
        ],
        JSON_UNESCAPED_SLASHES
    );

    exit;
}

function authenticateUser(): array
{
    $token = getBearerToken();

    if ($token === null || $token === '') {
        authRespond(
            'Authentication token is required.',
            401
        );
    }

    if (strlen($token) !== 64) {
        authRespond(
            'Invalid authentication token.',
            401
        );
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
        authRespond(
            'Invalid or expired authentication session.',
            401
        );
    }

    if (
        strtotime(
            (string) $user['expires_at']
        ) < time()
    ) {
        $deleteToken = $pdo->prepare(
            'DELETE FROM api_tokens
             WHERE id = :id'
        );

        $deleteToken->execute([
            'id' => $user['token_id']
        ]);

        authRespond(
            'Your session has expired. Please log in again.',
            401
        );
    }

    if ((int) $user['is_verified'] !== 1) {
        authRespond(
            'Your account is not verified.',
            403
        );
    }

    if ($user['account_status'] !== 'active') {
        authRespond(
            'Your account is currently unavailable.',
            403
        );
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
        'id' => (int) $user['user_id'],
        'full_name' => $user['full_name'],
        'email' => $user['email'],
        'country' => $user['country'],
        'role' => strtolower(
            (string) $user['role']
        ),
        'profile_image' => $user['profile_image']
    ];
}

function requireRole(
    array $user,
    array $allowedRoles
): void {
    $role = strtolower(
        (string) ($user['role'] ?? '')
    );

    if (
        !in_array(
            $role,
            $allowedRoles,
            true
        )
    ) {
        authRespond(
            'You do not have permission to access this resource.',
            403
        );
    }
}