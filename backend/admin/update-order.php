<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/auth-middleware.php';

applyCors();

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (
    !in_array(
        $_SERVER['REQUEST_METHOD'] ?? '',
        ['PATCH', 'POST'],
        true
    )
) {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.'
    ]);

    exit;
}

function updateOrderDatabase(): PDO
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
        'Database connection is unavailable.'
    );
}

function updateOrderColumns(
    PDO $pdo,
    string $table
): array {
    $statement = $pdo->query(
        "SHOW COLUMNS FROM `{$table}`"
    );

    $columns = [];

    foreach (
        $statement->fetchAll(
            PDO::FETCH_ASSOC
        ) as $column
    ) {
        $columns[
            $column['Field']
        ] = $column;
    }

    return $columns;
}

function updateOrderTableExists(
    PDO $pdo,
    string $table
): bool {
    $statement = $pdo->prepare(
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

function ensureUpdateOrderSchema(
    PDO $pdo
): void {
    $columns =
        updateOrderColumns(
            $pdo,
            'customer_orders'
        );

    if (
        isset(
            $columns['status']
        ) &&
        str_starts_with(
            strtolower(
                (string)$columns[
                    'status'
                ]['Type']
            ),
            'enum('
        )
    ) {
        $pdo->exec(
            "ALTER TABLE customer_orders
             MODIFY COLUMN status
             VARCHAR(40)
             NOT NULL
             DEFAULT 'pending'"
        );
    }

    $columns =
        updateOrderColumns(
            $pdo,
            'customer_orders'
        );

    $required = [
        'status_updated_at' =>
            'DATETIME NULL',

        'cancel_previous_status' =>
            'VARCHAR(40) NULL',

        'cancel_reason' =>
            'VARCHAR(500) NULL',

        'cancel_requested_at' =>
            'DATETIME NULL',

        'decline_reason' =>
            'VARCHAR(500) NULL'
    ];

    foreach (
        $required as
        $column => $definition
    ) {
        if (
            !isset(
                $columns[$column]
            )
        ) {
            $pdo->exec(
                "ALTER TABLE customer_orders
                 ADD COLUMN `{$column}`
                 {$definition}"
            );
        }
    }
}

function adminOrderType(
    array $order
): string {
    $value = strtolower(
        trim(
            (string)(
                $order['service_type'] ??
                $order['order_type'] ??
                ''
            )
        )
    );

    if (
        str_contains(
            $value,
            'food'
        ) ||
        str_contains(
            $value,
            'dining'
        ) ||
        str_contains(
            $value,
            'restaurant'
        )
    ) {
        return 'food';
    }

    if (
        str_contains(
            $value,
            'room'
        )
    ) {
        return 'room';
    }

    if (
        str_contains(
            $value,
            'tour'
        )
    ) {
        return 'tour';
    }

    if (
        str_contains(
            $value,
            'spa'
        ) ||
        str_contains(
            $value,
            'massage'
        )
    ) {
        return 'spa';
    }

    return 'service';
}

function addAdminStatusHistory(
    PDO $pdo,
    int $orderId,
    string $status,
    string $note
): void {
    if (
        !updateOrderTableExists(
            $pdo,
            'order_status_history'
        )
    ) {
        return;
    }

    try {
        $columns =
            updateOrderColumns(
                $pdo,
                'order_status_history'
            );

        if (
            !isset(
                $columns['order_id']
            ) ||
            !isset(
                $columns['status']
            )
        ) {
            return;
        }

        $fields = [
            '`order_id`',
            '`status`'
        ];

        $values = [
            ':order_id',
            ':status'
        ];

        $params = [
            'order_id' =>
                $orderId,

            'status' =>
                $status
        ];

        if (
            isset(
                $columns['note']
            )
        ) {
            $fields[] =
                '`note`';

            $values[] =
                ':note';

            $params['note'] =
                $note;
        }

        if (
            isset(
                $columns['created_at']
            )
        ) {
            $fields[] =
                '`created_at`';

            $values[] =
                'NOW()';
        }

        $statement = $pdo->prepare(
            'INSERT INTO order_status_history (' .
            implode(
                ', ',
                $fields
            ) .
            ') VALUES (' .
            implode(
                ', ',
                $values
            ) .
            ')'
        );

        $statement->execute(
            $params
        );

    } catch (Throwable $error) {
    }
}

try {
    $admin = requireAdmin();

    $pdo =
        updateOrderDatabase();

    $pdo->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

    ensureUpdateOrderSchema(
        $pdo
    );

    $input = json_decode(
        file_get_contents(
            'php://input'
        ),
        true
    );

    if (!is_array($input)) {
        $input = [];
    }

    $orderId = (int)(
        $input['order_id'] ??
        0
    );

    $status = strtolower(
        trim(
            (string)(
                $input['status'] ??
                ''
            )
        )
    );

    $declineReason = trim(
        (string)(
            $input['decline_reason'] ??
            ''
        )
    );

    if (
        $orderId <= 0 ||
        $status === ''
    ) {
        http_response_code(422);

        echo json_encode([
            'success' => false,
            'message' =>
                'Order ID and status are required.'
        ]);

        exit;
    }

    $statement = $pdo->prepare(
        'SELECT *
         FROM customer_orders
         WHERE id = :id
         LIMIT 1'
    );

    $statement->execute([
        'id' => $orderId
    ]);

    $order = $statement->fetch(
        PDO::FETCH_ASSOC
    );

    if (!$order) {
        http_response_code(404);

        echo json_encode([
            'success' => false,
            'message' => 'Order not found.'
        ]);

        exit;
    }

    $type =
        adminOrderType(
            $order
        );

    $common = [
        'pending',
        'accepted',
        'confirmed',
        'cancel_requested',
        'declined',
        'cancelled'
    ];

    if ($type === 'food') {
        $allowed = array_merge(
            $common,
            [
                'preparing',
                'ready_to_deliver',
                'delivered'
            ]
        );
    } else {
        $allowed = array_merge(
            $common,
            [
                'processing',
                'active',
                'completed',
                'used'
            ]
        );
    }

    if (
        !in_array(
            $status,
            $allowed,
            true
        )
    ) {
        http_response_code(422);

        echo json_encode([
            'success' => false,
            'message' =>
                'This status is not valid for this service.'
        ]);

        exit;
    }

    if (
        $status ===
            'declined' &&
        $declineReason === ''
    ) {
        http_response_code(422);

        echo json_encode([
            'success' => false,
            'message' =>
                'Please enter a decline reason.'
        ]);

        exit;
    }

    $oldStatus = strtolower(
        trim(
            (string)(
                $order['status'] ??
                'pending'
            )
        )
    );

    $assignments = [
        '`status` = :status',
        '`status_updated_at` = NOW()'
    ];

    $params = [
        'status' =>
            $status,

        'id' =>
            $orderId
    ];

    if (
        $status ===
        'declined'
    ) {
        $assignments[] =
            '`decline_reason` = :decline_reason';

        $params[
            'decline_reason'
        ] =
            $declineReason;
    }

    if (
        $oldStatus ===
        'cancel_requested'
    ) {
        if (
            $status !==
            'cancelled'
        ) {
            $assignments[] =
                '`cancel_previous_status` = NULL';

            $assignments[] =
                '`cancel_reason` = NULL';

            $assignments[] =
                '`cancel_requested_at` = NULL';
        }
    }

    $sql =
        'UPDATE customer_orders SET ' .
        implode(
            ', ',
            $assignments
        ) .
        ' WHERE id = :id';

    $update =
        $pdo->prepare(
            $sql
        );

    $update->execute(
        $params
    );

    if (
        $oldStatus ===
            'cancel_requested' &&
        $status ===
            'cancelled'
    ) {
        $note =
            'Administrator approved the cancellation request.';
    } elseif (
        $oldStatus ===
            'cancel_requested' &&
        $status !==
            'cancelled'
    ) {
        $note =
            'Administrator rejected the cancellation request and restored the booking.';
    } else {
        $note =
            'Administrator changed order status from ' .
            $oldStatus .
            ' to ' .
            $status .
            '.';
    }

    addAdminStatusHistory(
        $pdo,
        $orderId,
        $status,
        $note
    );

    $fresh = $pdo->prepare(
        'SELECT *
         FROM customer_orders
         WHERE id = :id
         LIMIT 1'
    );

    $fresh->execute([
        'id' => $orderId
    ]);

    echo json_encode(
        [
            'success' => true,

            'message' =>
                'Order status updated successfully.',

            'order' =>
                $fresh->fetch(
                    PDO::FETCH_ASSOC
                )
        ],
        JSON_UNESCAPED_SLASHES |
        JSON_UNESCAPED_UNICODE
    );

} catch (Throwable $error) {
    http_response_code(500);

    echo json_encode(
        [
            'success' => false,

            'message' =>
                'Unable to update the order.',

            'error' =>
                $error->getMessage()
        ],
        JSON_UNESCAPED_SLASHES |
        JSON_UNESCAPED_UNICODE
    );
}