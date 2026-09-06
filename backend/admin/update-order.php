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

if (
    !in_array(
        $_SERVER['REQUEST_METHOD'],
        ['POST', 'PATCH'],
        true
    )
) {
    respond(
        false,
        'Only POST or PATCH requests are allowed.',
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

    $input = json_decode(
        file_get_contents('php://input'),
        true
    );

    if (!is_array($input)) {
        respond(
            false,
            'Invalid request data.',
            [],
            400
        );
    }

    $orderId = (int)(
        $input['order_id'] ?? 0
    );

    $newStatus = strtolower(
        trim(
            (string)($input['status'] ?? '')
        )
    );

    $adminNote = trim(
        (string)($input['admin_note'] ?? '')
    );

    if ($orderId <= 0) {
        respond(
            false,
            'Invalid order ID.',
            [],
            422
        );
    }

    $allowedStatuses = [
        'pending',
        'accepted',
        'declined',
        'processing',
        'confirmed',
        'ready',
        'on_the_way',
        'completed',
        'cancelled'
    ];

    if (
        !in_array(
            $newStatus,
            $allowedStatuses,
            true
        )
    ) {
        respond(
            false,
            'Invalid order status.',
            [],
            422
        );
    }

    $pdo = getDatabaseConnection();

    $findOrder = $pdo->prepare(
        'SELECT
            id,
            order_number,
            customer_id,
            status
         FROM customer_orders
         WHERE id = :id
         LIMIT 1'
    );

    $findOrder->execute([
        'id' => $orderId
    ]);

    $order = $findOrder->fetch();

    if (!$order) {
        respond(
            false,
            'Order not found.',
            [],
            404
        );
    }

    $oldStatus = strtolower(
        (string)$order['status']
    );

    if ($oldStatus === $newStatus) {
        respond(
            true,
            'Order status is already up to date.',
            [
                'order_id' => $orderId,
                'status' => $newStatus
            ]
        );
    }

    $pdo->beginTransaction();

    $acceptedAt = null;
    $declinedAt = null;
    $completedAt = null;

    if ($newStatus === 'accepted') {
        $acceptedAt = date(
            'Y-m-d H:i:s'
        );
    }

    if ($newStatus === 'declined') {
        $declinedAt = date(
            'Y-m-d H:i:s'
        );
    }

    if ($newStatus === 'completed') {
        $completedAt = date(
            'Y-m-d H:i:s'
        );
    }

    $update = $pdo->prepare(
        'UPDATE customer_orders
         SET
            status = :status,
            assigned_admin_id = :assigned_admin_id,
            admin_note = :admin_note,

            accepted_at =
                CASE
                    WHEN :accepted_at IS NOT NULL
                    THEN :accepted_at_value
                    ELSE accepted_at
                END,

            declined_at =
                CASE
                    WHEN :declined_at IS NOT NULL
                    THEN :declined_at_value
                    ELSE declined_at
                END,

            completed_at =
                CASE
                    WHEN :completed_at IS NOT NULL
                    THEN :completed_at_value
                    ELSE completed_at
                END,

            updated_at = NOW()

         WHERE id = :id'
    );

    $update->execute([
        'status' => $newStatus,
        'assigned_admin_id' => $admin['id'],
        'admin_note' =>
            $adminNote !== ''
                ? $adminNote
                : null,

        'accepted_at' => $acceptedAt,
        'accepted_at_value' => $acceptedAt,

        'declined_at' => $declinedAt,
        'declined_at_value' => $declinedAt,

        'completed_at' => $completedAt,
        'completed_at_value' => $completedAt,

        'id' => $orderId
    ]);

    $history = $pdo->prepare(
        'INSERT INTO order_status_history
        (
            order_id,
            old_status,
            new_status,
            changed_by,
            note,
            created_at
        )
        VALUES
        (
            :order_id,
            :old_status,
            :new_status,
            :changed_by,
            :note,
            NOW()
        )'
    );

    $history->execute([
        'order_id' => $orderId,
        'old_status' => $oldStatus,
        'new_status' => $newStatus,
        'changed_by' => $admin['id'],
        'note' =>
            $adminNote !== ''
                ? $adminNote
                : 'Order status updated by administrator.'
    ]);

    $notification = $pdo->prepare(
        'INSERT INTO admin_notifications
        (
            user_id,
            type,
            title,
            message,
            reference_type,
            reference_id,
            is_read,
            created_at
        )
        VALUES
        (
            :user_id,
            :type,
            :title,
            :message,
            :reference_type,
            :reference_id,
            0,
            NOW()
        )'
    );

    $notification->execute([
        'user_id' => $order['customer_id'],
        'type' => 'order_status',
        'title' => 'Order Status Updated',
        'message' =>
            'Order ' .
            $order['order_number'] .
            ' is now ' .
            str_replace(
                '_',
                ' ',
                $newStatus
            ) .
            '.',
        'reference_type' => 'order',
        'reference_id' => $orderId
    ]);

    $pdo->commit();

    respond(
        true,
        'Order status updated successfully.',
        [
            'order' => [
                'id' => $orderId,
                'order_number' =>
                    $order['order_number'],
                'old_status' =>
                    $oldStatus,
                'status' =>
                    $newStatus,
                'updated_by' => [
                    'id' => $admin['id'],
                    'name' =>
                        $admin['full_name']
                ]
            ]
        ]
    );
} catch (Throwable $e) {
    if (
        isset($pdo) &&
        $pdo instanceof PDO &&
        $pdo->inTransaction()
    ) {
        $pdo->rollBack();
    }

    error_log(
        'Update order error: ' .
        $e->getMessage()
    );

    respond(
        false,
        'Order status could not be updated.',
        [],
        500
    );
}