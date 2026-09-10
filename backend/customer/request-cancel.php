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

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.'
    ]);

    exit;
}

function cancelDatabase(): PDO
{
    global $pdo;

    if (isset($pdo) && $pdo instanceof PDO) {
        return $pdo;
    }

    if (function_exists('getDatabaseConnection')) {
        $database = getDatabaseConnection();

        if ($database instanceof PDO) {
            return $database;
        }
    }

    throw new RuntimeException(
        'Database connection is unavailable.'
    );
}

function cancelColumns(PDO $pdo, string $table): array
{
    $statement = $pdo->query(
        "SHOW COLUMNS FROM `{$table}`"
    );

    $result = [];

    foreach (
        $statement->fetchAll(PDO::FETCH_ASSOC)
        as $column
    ) {
        $result[$column['Field']] = $column;
    }

    return $result;
}

function cancelTableExists(
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

    return (int)$statement->fetchColumn() > 0;
}

function ensureCancellationSchema(PDO $pdo): void
{
    $columns = cancelColumns(
        $pdo,
        'customer_orders'
    );

    if (
        isset($columns['status']) &&
        str_starts_with(
            strtolower(
                (string)$columns['status']['Type']
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

    $columns = cancelColumns(
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
            'DATETIME NULL'
    ];

    foreach (
        $required as
        $column => $definition
    ) {
        if (!isset($columns[$column])) {
            $pdo->exec(
                "ALTER TABLE customer_orders
                 ADD COLUMN `{$column}`
                 {$definition}"
            );
        }
    }
}

function decodeCancelDetails(
    array $order
): array {
    $fields = [
        'details',
        'details_json',
        'order_details',
        'booking_details',
        'metadata',
        'extra_data'
    ];

    foreach ($fields as $field) {
        if (!array_key_exists($field, $order)) {
            continue;
        }

        if (is_array($order[$field])) {
            return $order[$field];
        }

        if (
            is_string($order[$field]) &&
            trim($order[$field]) !== ''
        ) {
            $decoded = json_decode(
                $order[$field],
                true
            );

            if (is_array($decoded)) {
                return $decoded;
            }
        }
    }

    return [];
}

function cancellationBelongsToUser(
    array $order,
    array $user
): bool {
    $userId = (int)($user['id'] ?? 0);

    $userEmail = strtolower(
        trim(
            (string)($user['email'] ?? '')
        )
    );

    $details = decodeCancelDetails(
        $order
    );

    $ids = [
        $order['user_id'] ?? null,
        $order['customer_id'] ?? null,
        $order['customer_user_id'] ?? null,
        $details['user_id'] ?? null,
        $details['customer_id'] ?? null
    ];

    foreach ($ids as $id) {
        if (
            $userId > 0 &&
            (int)$id > 0 &&
            (int)$id === $userId
        ) {
            return true;
        }
    }

    $emails = [
        $order['customer_email'] ?? null,
        $order['email'] ?? null,
        $details['customer_email'] ?? null,
        $details['email'] ?? null
    ];

    foreach ($emails as $email) {
        $candidate = strtolower(
            trim(
                (string)$email
            )
        );

        if (
            $userEmail !== '' &&
            $candidate !== '' &&
            $candidate === $userEmail
        ) {
            return true;
        }
    }

    return false;
}

function addCancellationHistory(
    PDO $pdo,
    int $orderId,
    string $status,
    string $note
): void {
    if (
        !cancelTableExists(
            $pdo,
            'order_status_history'
        )
    ) {
        return;
    }

    try {
        $columns = cancelColumns(
            $pdo,
            'order_status_history'
        );

        $fields = [];
        $placeholders = [];
        $values = [];

        if (isset($columns['order_id'])) {
            $fields[] = '`order_id`';
            $placeholders[] = ':order_id';
            $values['order_id'] = $orderId;
        }

        if (isset($columns['status'])) {
            $fields[] = '`status`';
            $placeholders[] = ':status';
            $values['status'] = $status;
        }

        if (isset($columns['note'])) {
            $fields[] = '`note`';
            $placeholders[] = ':note';
            $values['note'] = $note;
        } elseif (isset($columns['message'])) {
            $fields[] = '`message`';
            $placeholders[] = ':note';
            $values['note'] = $note;
        }

        if (isset($columns['created_at'])) {
            $fields[] = '`created_at`';
            $placeholders[] = 'NOW()';
        }

        if (
            !in_array(
                '`order_id`',
                $fields,
                true
            ) ||
            !in_array(
                '`status`',
                $fields,
                true
            )
        ) {
            return;
        }

        $sql =
            'INSERT INTO order_status_history (' .
            implode(', ', $fields) .
            ') VALUES (' .
            implode(', ', $placeholders) .
            ')';

        $statement = $pdo->prepare($sql);
        $statement->execute($values);

    } catch (Throwable $error) {
    }
}

function createCancellationNotification(
    PDO $pdo,
    int $orderId,
    string $orderNumber,
    string $customerName,
    string $reason
): void {
    if (
        !cancelTableExists(
            $pdo,
            'admin_notifications'
        )
    ) {
        return;
    }

    try {
        $columns = cancelColumns(
            $pdo,
            'admin_notifications'
        );

        $fields = [];
        $placeholders = [];
        $values = [];

        if (isset($columns['order_id'])) {
            $fields[] = '`order_id`';
            $placeholders[] = ':order_id';
            $values['order_id'] = $orderId;
        }

        if (isset($columns['title'])) {
            $fields[] = '`title`';
            $placeholders[] = ':title';

            $values['title'] =
                'Cancellation Request';
        }

        if (isset($columns['message'])) {
            $fields[] = '`message`';
            $placeholders[] = ':message';

            $values['message'] =
                $customerName .
                ' requested cancellation for ' .
                $orderNumber .
                '. Reason: ' .
                $reason;
        }

        if (isset($columns['is_read'])) {
            $fields[] = '`is_read`';
            $placeholders[] = ':is_read';
            $values['is_read'] = 0;
        }

        if (isset($columns['created_at'])) {
            $fields[] = '`created_at`';
            $placeholders[] = 'NOW()';
        }

        if (empty($fields)) {
            return;
        }

        $statement = $pdo->prepare(
            'INSERT INTO admin_notifications (' .
            implode(', ', $fields) .
            ') VALUES (' .
            implode(', ', $placeholders) .
            ')'
        );

        $statement->execute(
            $values
        );

    } catch (Throwable $error) {
    }
}

try {
    $user = requireCustomer();

    $pdo = cancelDatabase();

    $pdo->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

    ensureCancellationSchema(
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

    $reason = trim(
        (string)(
            $input['reason'] ??
            ''
        )
    );

    if ($orderId <= 0) {
        http_response_code(422);

        echo json_encode([
            'success' => false,
            'message' => 'Invalid order.'
        ]);

        exit;
    }

    if (
        mb_strlen($reason) < 3
    ) {
        http_response_code(422);

        echo json_encode([
            'success' => false,
            'message' =>
                'Please enter a cancellation reason.'
        ]);

        exit;
    }

    if (
        mb_strlen($reason) > 500
    ) {
        http_response_code(422);

        echo json_encode([
            'success' => false,
            'message' =>
                'Cancellation reason is too long.'
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

    if (
        !cancellationBelongsToUser(
            $order,
            $user
        )
    ) {
        http_response_code(403);

        echo json_encode([
            'success' => false,
            'message' =>
                'You cannot cancel this order.'
        ]);

        exit;
    }

    $currentStatus = strtolower(
        trim(
            (string)(
                $order['status'] ??
                'pending'
            )
        )
    );

    if (
        $currentStatus ===
        'cancel_requested'
    ) {
        http_response_code(409);

        echo json_encode([
            'success' => false,
            'message' =>
                'A cancellation request has already been sent.'
        ]);

        exit;
    }

    $allowedStatuses = [
        'pending',
        'accepted',
        'confirmed'
    ];

    if (
        !in_array(
            $currentStatus,
            $allowedStatuses,
            true
        )
    ) {
        http_response_code(409);

        echo json_encode([
            'success' => false,
            'message' =>
                'This order can no longer be cancelled.'
        ]);

        exit;
    }

    $pdo->beginTransaction();

    $update = $pdo->prepare(
        "UPDATE customer_orders
         SET
            status = :status,
            status_updated_at = NOW(),
            cancel_previous_status = :previous_status,
            cancel_reason = :reason,
            cancel_requested_at = NOW()
         WHERE id = :id"
    );

    $update->execute([
        'status' =>
            'cancel_requested',

        'previous_status' =>
            $currentStatus,

        'reason' =>
            $reason,

        'id' =>
            $orderId
    ]);

    addCancellationHistory(
        $pdo,
        $orderId,
        'cancel_requested',
        'Customer requested cancellation. Reason: ' .
        $reason
    );

    createCancellationNotification(
        $pdo,
        $orderId,
        (string)(
            $order['order_number'] ??
            '#' . $orderId
        ),
        (string)(
            $user['full_name'] ??
            $order['customer_name'] ??
            'Customer'
        ),
        $reason
    );

    $pdo->commit();

    echo json_encode(
        [
            'success' => true,

            'message' =>
                'Cancellation request sent successfully.',

            'order_id' =>
                $orderId,

            'status' =>
                'cancel_requested'
        ],
        JSON_UNESCAPED_SLASHES |
        JSON_UNESCAPED_UNICODE
    );

} catch (Throwable $error) {
    if (
        isset($pdo) &&
        $pdo instanceof PDO &&
        $pdo->inTransaction()
    ) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode(
        [
            'success' => false,

            'message' =>
                'Unable to send the cancellation request.',

            'error' =>
                $error->getMessage()
        ],
        JSON_UNESCAPED_SLASHES |
        JSON_UNESCAPED_UNICODE
    );
}