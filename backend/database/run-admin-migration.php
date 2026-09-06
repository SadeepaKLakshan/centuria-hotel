<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

$providedKey = trim(
    (string)($_GET['key'] ?? '')
);

$expectedKey = getenv(
    'MIGRATION_KEY'
);

if (
    $expectedKey === false ||
    $expectedKey === ''
) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' =>
            'MIGRATION_KEY is not configured.'
    ]);

    exit;
}

if (
    $providedKey === '' ||
    !hash_equals(
        $expectedKey,
        $providedKey
    )
) {
    http_response_code(403);

    echo json_encode([
        'success' => false,
        'message' =>
            'Invalid migration key.'
    ]);

    exit;
}

$sqlFile =
    __DIR__ . '/admin_system.sql';

if (!file_exists($sqlFile)) {
    http_response_code(404);

    echo json_encode([
        'success' => false,
        'message' =>
            'admin_system.sql was not found.'
    ]);

    exit;
}

$sql = file_get_contents(
    $sqlFile
);

if (
    $sql === false ||
    trim($sql) === ''
) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' =>
            'Migration SQL is empty.'
    ]);

    exit;
}

try {
    $pdo = getDatabaseConnection();

    $statements = preg_split(
        '/;\s*(?:\r?\n|$)/',
        $sql
    );

    if (!is_array($statements)) {
        throw new RuntimeException(
            'Unable to read migration statements.'
        );
    }

    $executed = 0;

    foreach ($statements as $statement) {
        $statement = trim(
            $statement
        );

        if ($statement === '') {
            continue;
        }

        $pdo->exec(
            $statement
        );

        $executed++;
    }

    echo json_encode(
        [
            'success' => true,
            'message' =>
                'Admin system database migration completed successfully.',
            'executed_statements' =>
                $executed
        ],
        JSON_PRETTY_PRINT |
        JSON_UNESCAPED_SLASHES
    );
} catch (Throwable $e) {
    error_log(
        'Admin migration error: ' .
        $e->getMessage()
    );

    http_response_code(500);

    echo json_encode(
        [
            'success' => false,
            'message' =>
                'Database migration failed.',
            'error' =>
                $e->getMessage()
        ],
        JSON_PRETTY_PRINT |
        JSON_UNESCAPED_SLASHES
    );
}