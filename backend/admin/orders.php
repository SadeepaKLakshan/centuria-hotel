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
    $admin = authenticateUser();

    requireRole(
        $admin,
        [
            'admin',
            'manager'
        ]
    );

    $status = strtolower(
        trim(
            (string)($_GET['status'] ?? '')
        )
    );

    $pdo = getDatabaseConnection();

    $sql =
        'SELECT
            o.id,
            o.order_number,
            o.order_type,
            o.title,
            o.description,
            o.total_amount,
            o.currency,
            o.status,
            o.payment_status,
            o.customer_note,
            o.admin_note,
            o.requested_date,
            o.requested_time,
            o.accepted_at,
            o.declined_at,
            o.completed_at,
            o.created_at,
            o.updated_at,

            u.id AS customer_id,
            u.full_name AS customer_name,
            u.email AS customer_email,
            u.phone AS customer_phone,

            a.id AS assigned_admin_id,
            a.full_name AS assigned_admin_name

         FROM customer_orders o

         INNER JOIN users u
            ON u.id = o.customer_id

         LEFT JOIN users a
            ON a.id = o.assigned_admin_id';

    $params = [];

    if ($status !== '') {
        $sql .=
            ' WHERE o.status = :status';

        $params['status'] = $status;
    }

    $sql .=
        ' ORDER BY o.created_at DESC';

    $statement = $pdo->prepare(
        $sql
    );

    $statement->execute(
        $params
    );

    $orders = $statement->fetchAll();

    respond(
        true,
        'Admin orders loaded successfully.',
        [
            'orders' => $orders
        ]
    );
} catch (Throwable $e) {
    error_log(
        'Admin orders error: ' .
        $e->getMessage()
    );

    respond(
        false,
        'Orders could not be loaded.',
        [],
        500
    );
}