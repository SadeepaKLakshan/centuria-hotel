<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/auth-middleware.php';

applyCors();

header(
    'Content-Type: application/json; charset=utf-8'
);

function orderResponse(
    int $status,
    array $payload
): never {
    http_response_code($status);

    echo json_encode(
        $payload,
        JSON_UNESCAPED_SLASHES
    );

    exit;
}

try {
    if (
        ($_SERVER['REQUEST_METHOD'] ?? '') !==
        'GET'
    ) {
        orderResponse(
            405,
            [
                'success' => false,
                'message' =>
                    'Method not allowed.'
            ]
        );
    }

    $customer =
        requireCustomer();

    $pdo =
        getDatabaseConnection();

    $statement =
        $pdo->prepare(
            'SELECT
                co.id,
                co.order_number,
                co.order_type,
                co.title,
                co.description,
                co.status,
                co.total_amount,
                co.currency,
                co.decline_reason,
                co.assigned_admin_id,
                co.created_at,
                co.updated_at,
                co.accepted_at,
                co.confirmed_at,
                co.completed_at,
                u.full_name AS assigned_admin_name
             FROM customer_orders co
             LEFT JOIN users u
                ON u.id =
                    co.assigned_admin_id
             WHERE co.user_id = :user_id
             ORDER BY
                co.created_at DESC,
                co.id DESC'
        );

    $statement->execute([
        'user_id' =>
            (int)$customer['id']
    ]);

    $orders =
        $statement->fetchAll(
            PDO::FETCH_ASSOC
        );

    $result = [];

    foreach (
        $orders as $order
    ) {
        $historyStatement =
            $pdo->prepare(
                'SELECT
                    id,
                    status,
                    note,
                    created_at
                 FROM order_status_history
                 WHERE order_id = :order_id
                 ORDER BY
                    created_at ASC,
                    id ASC'
            );

        $historyStatement->execute([
            'order_id' =>
                (int)$order['id']
        ]);

        $history =
            $historyStatement->fetchAll(
                PDO::FETCH_ASSOC
            );

        $itemsStatement =
            $pdo->prepare(
                'SELECT
                    id,
                    item_name,
                    quantity,
                    unit_price,
                    subtotal
                 FROM order_items
                 WHERE order_id = :order_id
                 ORDER BY id ASC'
            );

        $itemsStatement->execute([
            'order_id' =>
                (int)$order['id']
        ]);

        $items =
            $itemsStatement->fetchAll(
                PDO::FETCH_ASSOC
            );

        $result[] = [
            'id' =>
                (int)$order['id'],

            'order_number' =>
                $order[
                    'order_number'
                ] ?? null,

            'order_type' =>
                $order[
                    'order_type'
                ] ?? '',

            'title' =>
                $order[
                    'title'
                ] ?? '',

            'description' =>
                $order[
                    'description'
                ] ?? '',

            'status' =>
                strtolower(
                    (string)(
                        $order[
                            'status'
                        ] ?? 'pending'
                    )
                ),

            'total_amount' =>
                (float)(
                    $order[
                        'total_amount'
                    ] ?? 0
                ),

            'currency' =>
                $order[
                    'currency'
                ] ?? 'LKR',

            'decline_reason' =>
                $order[
                    'decline_reason'
                ] ?? null,

            'assigned_admin_id' =>
                $order[
                    'assigned_admin_id'
                ] !== null
                    ? (int)$order[
                        'assigned_admin_id'
                    ]
                    : null,

            'assigned_admin_name' =>
                $order[
                    'assigned_admin_name'
                ] ?? null,

            'created_at' =>
                $order[
                    'created_at'
                ] ?? null,

            'updated_at' =>
                $order[
                    'updated_at'
                ] ?? null,

            'accepted_at' =>
                $order[
                    'accepted_at'
                ] ?? null,

            'confirmed_at' =>
                $order[
                    'confirmed_at'
                ] ?? null,

            'completed_at' =>
                $order[
                    'completed_at'
                ] ?? null,

            'items' =>
                $items,

            'history' =>
                $history
        ];
    }

    orderResponse(
        200,
        [
            'success' => true,

            'total' =>
                count($result),

            'orders' =>
                $result
        ]
    );
} catch (Throwable $error) {
    error_log(
        'Customer orders error: ' .
        $error->getMessage()
    );

    orderResponse(
        500,
        [
            'success' => false,

            'message' =>
                'Unable to load customer orders.',

            'error' =>
                $error->getMessage()
        ]
    );
}