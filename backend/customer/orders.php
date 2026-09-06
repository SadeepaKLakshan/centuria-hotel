<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth-middleware.php';

applyCors();

function respond(
    bool $success,
    string $message,
    array $extra = [],
    int $statusCode = 200
): never {
    http_response_code($statusCode);

    echo json_encode(
        array_merge(
            [
                'success' => $success,
                'message' => $message
            ],
            $extra
        ),
        JSON_UNESCAPED_SLASHES
    );

    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respond(
        false,
        'Only GET requests are allowed.',
        [],
        405
    );
}

try {
    $user = authenticateUser();

    requireRole(
        $user,
        ['customer']
    );

    $pdo = getDatabaseConnection();

    $statement = $pdo->prepare(
        'SELECT
            id,
            order_number,
            order_type,
            title,
            description,
            total_amount,
            currency,
            status,
            payment_status,
            customer_note,
            admin_note,
            requested_date,
            requested_time,
            accepted_at,
            declined_at,
            completed_at,
            created_at,
            updated_at
         FROM customer_orders
         WHERE customer_id = :customer_id
         ORDER BY created_at DESC'
    );

    $statement->execute([
        'customer_id' => $user['id']
    ]);

    $orders = $statement->fetchAll();

    respond(
        true,
        'Orders loaded successfully.',
        [
            'orders' => $orders
        ]
    );
} catch (Throwable $e) {
    error_log(
        'Customer orders error: ' .
        $e->getMessage()
    );

    respond(
        false,
        'Orders could not be loaded.',
        [],
        500
    );
}