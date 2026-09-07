<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $pdo = getDatabaseConnection();

    $pdo->exec(
        'ALTER TABLE users
         MODIFY COLUMN profile_image MEDIUMTEXT NULL'
    );

    $statement = $pdo->query(
        "SHOW COLUMNS FROM users
         LIKE 'profile_image'"
    );

    $column = $statement->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'message' => 'Profile image column updated successfully.',
        'column' => $column
    ]);
} catch (Throwable $e) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}