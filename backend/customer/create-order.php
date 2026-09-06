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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(
        false,
        'Only POST requests are allowed.',
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

    $orderType = strtolower(
        trim((string)($input['order_type'] ?? ''))
    );

    $title = trim(
        (string)($input['title'] ?? '')
    );

    $description = trim(
        (string)($input['description'] ?? '')
    );

    $customerNote = trim(
        (string)($input['customer_note'] ?? '')
    );

    $requestedDate = trim(
        (string)($input['requested_date'] ?? '')
    );

    $requestedTime = trim(
        (string)($input['requested_time'] ?? '')
    );

    $currency = strtoupper(
        trim((string)($input['currency'] ?? 'LKR'))
    );

    $items = $input['items'] ?? [];

    $allowedTypes = [
        'room',
        'food',
        'spa',
        'tour',
        'transport',
        'service',
        'other'
    ];

    if (!in_array($orderType, $allowedTypes, true)) {
        respond(
            false,
            'Invalid order type.',
            [],
            422
        );
    }

    if ($title === '') {
        respond(
            false,
            'Order title is required.',
            [],
            422
        );
    }

    if (!is_array($items) || count($items) === 0) {
        respond(
            false,
            'At least one order item is required.',
            [],
            422
        );
    }

    $pdo = getDatabaseConnection();

    $pdo->beginTransaction();

    $orderNumber =
        'CEN-' .
        date('Ymd') .
        '-' .
        strtoupper(
            bin2hex(
                random_bytes(3)
            )
        );

    $totalAmount = 0.0;

    foreach ($items as $item) {
        $quantity = max(
            1,
            (int)($item['quantity'] ?? 1)
        );

        $unitPrice = max(
            0,
            (float)($item['unit_price'] ?? 0)
        );

        $totalAmount +=
            $quantity * $unitPrice;
    }

    $insertOrder = $pdo->prepare(
        'INSERT INTO customer_orders
        (
            order_number,
            customer_id,
            order_type,
            title,
            description,
            total_amount,
            currency,
            status,
            payment_status,
            customer_note,
            requested_date,
            requested_time,
            created_at,
            updated_at
        )
        VALUES
        (
            :order_number,
            :customer_id,
            :order_type,
            :title,
            :description,
            :total_amount,
            :currency,
            :status,
            :payment_status,
            :customer_note,
            :requested_date,
            :requested_time,
            NOW(),
            NOW()
        )'
    );

    $insertOrder->execute([
        'order_number' => $orderNumber,
        'customer_id' => $user['id'],
        'order_type' => $orderType,
        'title' => $title,
        'description' =>
            $description !== ''
                ? $description
                : null,
        'total_amount' => $totalAmount,
        'currency' => $currency,
        'status' => 'pending',
        'payment_status' => 'unpaid',
        'customer_note' =>
            $customerNote !== ''
                ? $customerNote
                : null,
        'requested_date' =>
            $requestedDate !== ''
                ? $requestedDate
                : null,
        'requested_time' =>
            $requestedTime !== ''
                ? $requestedTime
                : null
    ]);

    $orderId = (int)$pdo->lastInsertId();

    $insertItem = $pdo->prepare(
        'INSERT INTO order_items
        (
            order_id,
            item_name,
            item_description,
            quantity,
            unit_price,
            subtotal,
            created_at
        )
        VALUES
        (
            :order_id,
            :item_name,
            :item_description,
            :quantity,
            :unit_price,
            :subtotal,
            NOW()
        )'
    );

    foreach ($items as $item) {
        $itemName = trim(
            (string)($item['item_name'] ?? '')
        );

        if ($itemName === '') {
            throw new RuntimeException(
                'Each order item requires a name.'
            );
        }

        $itemDescription = trim(
            (string)($item['item_description'] ?? '')
        );

        $quantity = max(
            1,
            (int)($item['quantity'] ?? 1)
        );

        $unitPrice = max(
            0,
            (float)($item['unit_price'] ?? 0)
        );

        $subtotal =
            $quantity * $unitPrice;

        $insertItem->execute([
            'order_id' => $orderId,
            'item_name' => $itemName,
            'item_description' =>
                $itemDescription !== ''
                    ? $itemDescription
                    : null,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'subtotal' => $subtotal
        ]);
    }

    $insertHistory = $pdo->prepare(
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
            NULL,
            :new_status,
            :changed_by,
            :note,
            NOW()
        )'
    );

    $insertHistory->execute([
        'order_id' => $orderId,
        'new_status' => 'pending',
        'changed_by' => $user['id'],
        'note' => 'Order created by customer.'
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
            NULL,
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
        'type' => 'new_order',
        'title' => 'New Customer Order',
        'message' =>
            $user['full_name'] .
            ' created order ' .
            $orderNumber . '.',
        'reference_type' => 'order',
        'reference_id' => $orderId
    ]);

    $pdo->commit();

    respond(
        true,
        'Order created successfully.',
        [
            'order' => [
                'id' => $orderId,
                'order_number' => $orderNumber,
                'status' => 'pending',
                'total_amount' => $totalAmount,
                'currency' => $currency
            ]
        ],
        201
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
        'Create order error: ' .
        $e->getMessage()
    );

    respond(
        false,
        'Order could not be created.',
        [],
        500
    );
}