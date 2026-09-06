<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDatabaseConnection();

    $statement = $pdo->query(
        "SHOW COLUMNS FROM users"
    );

    $columns = $statement->fetchAll();

    echo json_encode(
        [
            'success' => true,
            'columns' => $columns
        ],
        JSON_PRETTY_PRINT |
        JSON_UNESCAPED_SLASHES
    );
} catch (Throwable $e) {
    http_response_code(500);

    echo json_encode(
        [
            'success' => false,
            'message' =>
                'Unable to inspect users table.',
            'error' =>
                $e->getMessage()
        ],
        JSON_PRETTY_PRINT |
        JSON_UNESCAPED_SLASHES
    );
}