<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/auth-middleware.php';

applyCors();

header('Content-Type: application/json; charset=utf-8');

if (
    ($_SERVER['REQUEST_METHOD'] ?? '')
    !== 'DELETE'
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

    $userId =
        (int)(
            $payload[
                'user_id'
            ] ?? 0
        );

    if ($userId <= 0) {
        http_response_code(422);

        echo json_encode([
            'success' => false,
            'message' =>
                'A valid user ID is required.'
        ]);

        exit;
    }

    if (
        $userId ===
        (int)$authUser['id']
    ) {
        http_response_code(422);

        echo json_encode([
            'success' => false,
            'message' =>
                'You cannot delete the account currently in use.'
        ]);

        exit;
    }

    $pdo =
        getDatabaseConnection();

    $findUser =
        $pdo->prepare(
            'SELECT
                id,
                full_name,
                email,
                role
             FROM users
             WHERE id = :id
             LIMIT 1'
        );

    $findUser->execute([
        'id' => $userId
    ]);

    $targetUser =
        $findUser->fetch(
            PDO::FETCH_ASSOC
        );

    if (!$targetUser) {
        http_response_code(404);

        echo json_encode([
            'success' => false,
            'message' =>
                'The selected account does not exist.'
        ]);

        exit;
    }

    $pdo->beginTransaction();

    $deleteTokens =
        $pdo->prepare(
            'DELETE FROM api_tokens
             WHERE user_id = :id'
        );

    $deleteTokens->execute([
        'id' => $userId
    ]);

    $deleteUser =
        $pdo->prepare(
            'DELETE FROM users
             WHERE id = :id'
        );

    $deleteUser->execute([
        'id' => $userId
    ]);

    if (
        $deleteUser->rowCount()
        !== 1
    ) {
        throw new RuntimeException(
            'Unable to delete account.'
        );
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,

        'message' =>
            'Account permanently deleted. The email can now be registered again.',

        'deleted_user' => [
            'id' =>
                (int)$targetUser['id'],

            'full_name' =>
                $targetUser['full_name'],

            'email' =>
                $targetUser['email'],

            'role' =>
                $targetUser['role']
        ]
    ]);
} catch (Throwable $e) {
    if (
        isset($pdo) &&
        $pdo instanceof PDO &&
        $pdo->inTransaction()
    ) {
        $pdo->rollBack();
    }

    error_log(
        'Delete user error: ' .
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
            'Unable to permanently delete this account.'
    ]);
}