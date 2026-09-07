<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/auth-middleware.php';

applyCors();
header('Content-Type: application/json; charset=utf-8');

function profileResponse(int $status, array $payload): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function profileColumns(PDO $pdo): array
{
    $statement = $pdo->query('SHOW COLUMNS FROM users');
    $columns = [];
    foreach ($statement->fetchAll(PDO::FETCH_ASSOC) as $column) {
        $columns[$column['Field']] = true;
    }
    return $columns;
}

function profileSelect(PDO $pdo, int $userId, array $columns): array
{
    $wanted = [
        'id', 'full_name', 'name', 'email', 'phone', 'country', 'role',
        'profile_image', 'is_verified', 'is_active', 'created_at', 'updated_at',
        'last_login_at'
    ];
    $selected = array_values(array_filter($wanted, fn ($name) => isset($columns[$name])));
    if (!$selected) {
        profileResponse(500, ['success' => false, 'message' => 'Users table has no readable profile columns.']);
    }
    $sql = 'SELECT ' . implode(', ', array_map(fn ($name) => "`$name`", $selected)) . ' FROM users WHERE id = :id LIMIT 1';
    $statement = $pdo->prepare($sql);
    $statement->execute(['id' => $userId]);
    $user = $statement->fetch(PDO::FETCH_ASSOC);
    if (!$user) {
        profileResponse(404, ['success' => false, 'message' => 'User account not found.']);
    }
    return $user;
}

try {
    $authUser = authenticateUser();
    requireRole($authUser, ['admin', 'manager']);
    $columns = profileColumns($pdo);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        profileResponse(200, ['success' => true, 'user' => profileSelect($pdo, (int) $authUser['id'], $columns)]);
    }

    if (!in_array($_SERVER['REQUEST_METHOD'], ['PATCH', 'POST'], true)) {
        profileResponse(405, ['success' => false, 'message' => 'Method not allowed.']);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        profileResponse(400, ['success' => false, 'message' => 'Invalid JSON body.']);
    }

    $updates = [];
    $params = ['id' => (int) $authUser['id']];

    if (isset($columns['full_name']) && array_key_exists('full_name', $input)) {
        $fullName = trim((string) $input['full_name']);
        if ($fullName === '' || mb_strlen($fullName) > 120) {
            profileResponse(422, ['success' => false, 'message' => 'Please enter a valid full name.']);
        }
        $updates[] = '`full_name` = :full_name';
        $params['full_name'] = $fullName;
    } elseif (isset($columns['name']) && array_key_exists('full_name', $input)) {
        $fullName = trim((string) $input['full_name']);
        if ($fullName === '' || mb_strlen($fullName) > 120) {
            profileResponse(422, ['success' => false, 'message' => 'Please enter a valid full name.']);
        }
        $updates[] = '`name` = :full_name';
        $params['full_name'] = $fullName;
    }

    if (isset($columns['country']) && array_key_exists('country', $input)) {
        $country = trim((string) $input['country']);
        if (mb_strlen($country) > 100) {
            profileResponse(422, ['success' => false, 'message' => 'Country is too long.']);
        }
        $updates[] = '`country` = :country';
        $params['country'] = $country;
    }

    if (isset($columns['profile_image']) && array_key_exists('profile_image', $input)) {
        $image = trim((string) $input['profile_image']);
        if ($image !== '' && !preg_match('#^data:image/(jpeg|jpg|png|webp|gif);base64,#i', $image)) {
            profileResponse(422, ['success' => false, 'message' => 'Invalid profile image format.']);
        }
        if (strlen($image) > 2800000) {
            profileResponse(413, ['success' => false, 'message' => 'Profile image is too large.']);
        }
        $updates[] = '`profile_image` = :profile_image';
        $params['profile_image'] = $image === '' ? null : $image;
    }

    if (!$updates) {
        profileResponse(422, ['success' => false, 'message' => 'No profile changes were provided.']);
    }

    if (isset($columns['updated_at'])) {
        $updates[] = '`updated_at` = NOW()';
    }

    $statement = $pdo->prepare('UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = :id LIMIT 1');
    $statement->execute($params);

    profileResponse(200, [
        'success' => true,
        'message' => 'Profile updated successfully.',
        'user' => profileSelect($pdo, (int) $authUser['id'], $columns)
    ]);
} catch (Throwable $error) {
    profileResponse(500, ['success' => false, 'message' => 'Unable to process the profile request.']);
}
