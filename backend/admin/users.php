<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/auth-middleware.php';

applyCors();
header('Content-Type: application/json; charset=utf-8');

function usersResponse(int $status, array $payload): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        usersResponse(405, ['success' => false, 'message' => 'Method not allowed.']);
    }

    $authUser = authenticateUser();
    requireRole($authUser, ['admin', 'manager']);

    $columnRows = $pdo->query('SHOW COLUMNS FROM users')->fetchAll(PDO::FETCH_ASSOC);
    $available = [];
    foreach ($columnRows as $column) {
        $available[$column['Field']] = true;
    }

    $wanted = [
        'id', 'full_name', 'name', 'email', 'phone', 'country', 'role',
        'profile_image', 'is_verified', 'is_active', 'created_at', 'updated_at',
        'last_login_at'
    ];
    $selected = array_values(array_filter($wanted, fn ($name) => isset($available[$name])));

    $sql = 'SELECT ' . implode(', ', array_map(fn ($name) => "`$name`", $selected)) . ' FROM users';
    if (isset($available['created_at'])) {
        $sql .= ' ORDER BY created_at DESC';
    } else {
        $sql .= ' ORDER BY id DESC';
    }

    $users = $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);

    usersResponse(200, [
        'success' => true,
        'count' => count($users),
        'users' => $users
    ]);
} catch (Throwable $error) {
    usersResponse(500, ['success' => false, 'message' => 'Unable to load user accounts.']);
}
