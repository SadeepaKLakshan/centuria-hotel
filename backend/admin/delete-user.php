<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/auth-middleware.php';

applyCors();
header('Content-Type: application/json; charset=utf-8');

function deleteResponse(int $status, array $payload): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

try {
    if (!in_array($_SERVER['REQUEST_METHOD'], ['DELETE', 'POST'], true)) {
        deleteResponse(405, ['success' => false, 'message' => 'Method not allowed.']);
    }

    $authUser = authenticateUser();
    requireRole($authUser, ['admin']);

    $input = json_decode(file_get_contents('php://input'), true);
    $userId = (int) ($input['user_id'] ?? 0);

    if ($userId <= 0) {
        deleteResponse(422, ['success' => false, 'message' => 'A valid user ID is required.']);
    }
    if ($userId === (int) $authUser['id']) {
        deleteResponse(403, ['success' => false, 'message' => 'You cannot delete your own logged-in account.']);
    }

    $statement = $pdo->prepare('SELECT id, email, role FROM users WHERE id = :id LIMIT 1');
    $statement->execute(['id' => $userId]);
    $target = $statement->fetch(PDO::FETCH_ASSOC);
    if (!$target) {
        deleteResponse(404, ['success' => false, 'message' => 'Account not found.']);
    }

    $pdo->beginTransaction();

    $tables = [
        ['api_tokens', 'user_id'],
        ['registration_otps', 'user_id'],
        ['password_reset_otps', 'user_id'],
        ['otp_logs', 'user_id'],
        ['login_logs', 'user_id'],
        ['admin_notifications', 'user_id']
    ];

    foreach ($tables as [$table, $column]) {
        try {
            $check = $pdo->prepare("SHOW COLUMNS FROM `$table` LIKE :column_name");
            $check->execute(['column_name' => $column]);
            if ($check->fetch(PDO::FETCH_ASSOC)) {
                $delete = $pdo->prepare("DELETE FROM `$table` WHERE `$column` = :user_id");
                $delete->execute(['user_id' => $userId]);
            }
        } catch (Throwable $ignored) {
        }
    }

    $deleteUser = $pdo->prepare('DELETE FROM users WHERE id = :id LIMIT 1');
    $deleteUser->execute(['id' => $userId]);

    if ($deleteUser->rowCount() !== 1) {
        throw new RuntimeException('Account deletion failed.');
    }

    $pdo->commit();

    deleteResponse(200, [
        'success' => true,
        'message' => 'Account permanently deleted. The email address can be registered again.'
    ]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    deleteResponse(500, [
        'success' => false,
        'message' => 'Unable to delete this account. Existing related records may still reference it.'
    ]);
}
