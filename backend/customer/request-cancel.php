<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

$corsFile =
    __DIR__ .
    '/../config/cors.php';

if (
    file_exists(
        $corsFile
    )
) {
    require_once $corsFile;
}

if (
    function_exists(
        'applyCors'
    )
) {
    applyCors();
}

header(
    'Content-Type: application/json; charset=utf-8'
);

if (
    ($_SERVER[
        'REQUEST_METHOD'
    ] ?? '') ===
    'OPTIONS'
) {
    http_response_code(204);
    exit;
}

if (
    ($_SERVER[
        'REQUEST_METHOD'
    ] ?? '') !==
    'POST'
) {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' =>
            'Method not allowed.'
    ]);

    exit;
}

require_once
    __DIR__ .
    '/../auth/auth-middleware.php';


function cancelDatabase(): PDO
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


function cancelTableExists(
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
        (int)$statement->fetchColumn() >
        0
    );
}


function addCancelHistory(
    PDO $database,
    int $orderId,
    string $status,
    string $note
): void {
    if (
        !cancelTableExists(
            $database,
            'order_status_history'
        )
    ) {
        return;
    }

    try {
        $statement =
            $database->prepare(
                'INSERT INTO order_status_history
                 (
                     order_id,
                     status,
                     note,
                     created_at
                 )
                 VALUES
                 (
                     :order_id,
                     :status,
                     :note,
                     NOW()
                 )'
            );

        $statement->execute([
            'order_id' =>
                $orderId,

            'status' =>
                $status,

            'note' =>
                $note
        ]);

    } catch (
        Throwable
    ) {
    }
}


function addCancelNotification(
    PDO $database,
    int $orderId,
    string $message
): void {
    if (
        !cancelTableExists(
            $database,
            'admin_notifications'
        )
    ) {
        return;
    }

    try {
        $statement =
            $database->prepare(
                'INSERT INTO admin_notifications
                 (
                     order_id,
                     title,
                     message,
                     created_at
                 )
                 VALUES
                 (
                     :order_id,
                     :title,
                     :message,
                     NOW()
                 )'
            );

        $statement->execute([
            'order_id' =>
                $orderId,

            'title' =>
                'Cancellation Request',

            'message' =>
                $message
        ]);

    } catch (
        Throwable
    ) {
    }
}


try {
    $user =
        requireCustomer();

    $database =
        cancelDatabase();

    $database->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

    $input =
        json_decode(
            file_get_contents(
                'php://input'
            ),
            true
        );

    if (
        !is_array(
            $input
        )
    ) {
        $input = [];
    }

    $orderId =
        (int)(
            $input[
                'order_id'
            ] ?? 0
        );

    $reason =
        trim(
            (string)(
                $input[
                    'reason'
                ] ?? ''
            )
        );

    if (
        $orderId <= 0
    ) {
        throw new RuntimeException(
            'Invalid order.'
        );
    }

    if (
        strlen(
            $reason
        ) < 3
    ) {
        throw new RuntimeException(
            'Please provide a cancellation reason.'
        );
    }

    $statement =
        $database->prepare(
            'SELECT *
             FROM customer_orders
             WHERE id = :id
             LIMIT 1'
        );

    $statement->execute([
        'id' =>
            $orderId
    ]);

    $order =
        $statement->fetch(
            PDO::FETCH_ASSOC
        );

    if (!$order) {
        http_response_code(404);

        throw new RuntimeException(
            'Order not found.'
        );
    }

    $belongsToUser =
        (
            isset(
                $order[
                    'user_id'
                ]
            ) &&
            (int)$order[
                'user_id'
            ] ===
            (int)$user['id']
        ) ||
        (
            isset(
                $order[
                    'customer_id'
                ]
            ) &&
            (int)$order[
                'customer_id'
            ] ===
            (int)$user['id']
        ) ||
        (
            !empty(
                $user['email']
            ) &&
            !empty(
                $order[
                    'customer_email'
                ]
            ) &&
            strtolower(
                (string)$order[
                    'customer_email'
                ]
            ) ===
            strtolower(
                (string)$user[
                    'email'
                ]
            )
        );

    if (
        !$belongsToUser
    ) {
        http_response_code(403);

        throw new RuntimeException(
            'You cannot cancel this order.'
        );
    }

    $currentStatus =
        strtolower(
            trim(
                (string)(
                    $order[
                        'status'
                    ] ??
                    'pending'
                )
            )
        );

    $allowed = [
        'pending',
        'accepted',
        'confirmed'
    ];

    if (
        !in_array(
            $currentStatus,
            $allowed,
            true
        )
    ) {
        throw new RuntimeException(
            'This order can no longer be cancelled.'
        );
    }

    $update =
        $database->prepare(
            'UPDATE customer_orders
             SET
                 status =
                     :status,
                 status_updated_at =
                     NOW(),
                 cancel_previous_status =
                     :previous_status,
                 cancel_reason =
                     :cancel_reason,
                 cancel_requested_at =
                     NOW()
             WHERE id =
                 :id'
        );

    $update->execute([
        'status' =>
            'cancel_requested',

        'previous_status' =>
            $currentStatus,

        'cancel_reason' =>
            $reason,

        'id' =>
            $orderId
    ]);

    addCancelHistory(
        $database,
        $orderId,
        'cancel_requested',
        'Customer requested cancellation: ' .
        $reason
    );

    addCancelNotification(
        $database,
        $orderId,
        'Customer requested cancellation for order #' .
        $orderId .
        '. Reason: ' .
        $reason
    );

    echo json_encode([
        'success' => true,
        'message' =>
            'Cancellation request sent to the administrator.',
        'status' =>
            'cancel_requested'
    ]);

} catch (
    Throwable $error
) {
    if (
        http_response_code() <
        400
    ) {
        http_response_code(400);
    }

    echo json_encode([
        'success' => false,
        'message' =>
            $error->getMessage()
    ]);
}