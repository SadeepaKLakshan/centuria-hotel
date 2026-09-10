<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

function workflowDatabase(): PDO
{
    global $pdo;

    if (
        isset($pdo) &&
        $pdo instanceof PDO
    ) {
        return $pdo;
    }

    if (
        function_exists(
            'getDatabaseConnection'
        )
    ) {
        $database =
            getDatabaseConnection();

        if (
            $database instanceof PDO
        ) {
            return $database;
        }
    }

    throw new RuntimeException(
        'Database connection unavailable.'
    );
}

function tableExists(
    PDO $database,
    string $table
): bool {
    $statement =
        $database->prepare(
            'SELECT COUNT(*)
             FROM information_schema.tables
             WHERE table_schema = DATABASE()
             AND table_name = :table'
        );

    $statement->execute([
        'table' => $table
    ]);

    return (
        (int)$statement->fetchColumn() > 0
    );
}

function columnExists(
    PDO $database,
    string $table,
    string $column
): bool {
    $statement =
        $database->prepare(
            'SELECT COUNT(*)
             FROM information_schema.columns
             WHERE table_schema = DATABASE()
             AND table_name = :table
             AND column_name = :column'
        );

    $statement->execute([
        'table' => $table,
        'column' => $column
    ]);

    return (
        (int)$statement->fetchColumn() > 0
    );
}

try {
    $database =
        workflowDatabase();

    $database->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

    if (
        !tableExists(
            $database,
            'customer_orders'
        )
    ) {
        throw new RuntimeException(
            'customer_orders table does not exist.'
        );
    }

    $database->exec(
        "ALTER TABLE customer_orders
         MODIFY COLUMN status
         VARCHAR(40)
         NOT NULL
         DEFAULT 'pending'"
    );

    $columns = [
        'status_updated_at' =>
            'DATETIME NULL DEFAULT CURRENT_TIMESTAMP',

        'cancel_previous_status' =>
            'VARCHAR(40) NULL',

        'cancel_reason' =>
            'VARCHAR(500) NULL',

        'cancel_requested_at' =>
            'DATETIME NULL'
    ];

    foreach (
        $columns
        as $column => $definition
    ) {
        if (
            !columnExists(
                $database,
                'customer_orders',
                $column
            )
        ) {
            $database->exec(
                "ALTER TABLE customer_orders
                 ADD COLUMN `{$column}`
                 {$definition}"
            );
        }
    }

    if (
        columnExists(
            $database,
            'customer_orders',
            'updated_at'
        )
    ) {
        $database->exec(
            "UPDATE customer_orders
             SET status_updated_at =
             COALESCE(
                 status_updated_at,
                 updated_at,
                 NOW()
             )"
        );
    } elseif (
        columnExists(
            $database,
            'customer_orders',
            'created_at'
        )
    ) {
        $database->exec(
            "UPDATE customer_orders
             SET status_updated_at =
             COALESCE(
                 status_updated_at,
                 created_at,
                 NOW()
             )"
        );
    }

    if (
        tableExists(
            $database,
            'order_status_history'
        ) &&
        columnExists(
            $database,
            'order_status_history',
            'status'
        )
    ) {
        $database->exec(
            "ALTER TABLE order_status_history
             MODIFY COLUMN status
             VARCHAR(40)
             NOT NULL"
        );
    }

    echo json_encode([
        'success' => true,
        'message' =>
            'Order workflow database upgrade completed.'
    ]);

} catch (
    Throwable $error
) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' =>
            'Order workflow upgrade failed.',
        'error' =>
            $error->getMessage()
    ]);
}