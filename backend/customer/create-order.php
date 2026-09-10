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

function createOrderDatabase(): PDO
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

function createOrderColumns(
    PDO $pdo,
    string $table
): array {
    $statement = $pdo->query(
        "SHOW COLUMNS FROM `{$table}`"
    );

    $columns = [];

    foreach (
        $statement->fetchAll(PDO::FETCH_ASSOC)
        as $column
    ) {
        $columns[$column['Field']] = $column;
    }

    return $columns;
}

function createOrderTableExists(
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

function ensureOrderSchema(PDO $pdo): void
{
    $columns = createOrderColumns(
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

    $columns = createOrderColumns(
        $pdo,
        'customer_orders'
    );

    $required = [
        'image' =>
            'VARCHAR(2048) NULL',

        'details_json' =>
            'LONGTEXT NULL',

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

function normalizeOrderTypeValue(
    string $value
): string {
    $value = strtolower(
        trim($value)
    );

    if (
        str_contains($value, 'food') ||
        str_contains($value, 'dining') ||
        str_contains($value, 'restaurant')
    ) {
        return 'food';
    }

    if (
        str_contains($value, 'room') ||
        str_contains($value, 'stay')
    ) {
        return 'room';
    }

    if (
        str_contains($value, 'tour') ||
        str_contains($value, 'travel') ||
        str_contains($value, 'transport')
    ) {
        return 'tour';
    }

    if (
        str_contains($value, 'spa') ||
        str_contains($value, 'massage') ||
        str_contains($value, 'wellness')
    ) {
        return 'spa';
    }

    return 'food';
}

function spaImageFromTitle(
    string $title
): string {
    $title = strtolower(
        trim($title)
    );

    $images = [
        'aromatherapy massage' =>
            '/spa/spa-aroma-massage.jpg',

        'herbal wellness therapy' =>
            '/spa/spa-herbal-therapy.jpg',

        'luxury facial ritual' =>
            '/spa/spa-facial-ritual.jpg',

        'hot stone therapy' =>
            '/spa/spa-hot-stone.jpg',

        'centuria signature spa' =>
            '/spa/spa-signature-wellness.jpg',

        'couple serenity retreat' =>
            '/spa/spa-couple-serenity-retreat.jpg',

        'luxury body renewal package' =>
            '/spa/spa-luxury-body-renewal-package.jpg',

        'royal wellness escape' =>
            '/spa/spa-royal-wellness-escape.jpg'
    ];

    return $images[$title] ?? '';
}

function resolveStoredOrderImage(
    string $type,
    string $title,
    string $image
): string {
    if ($type === 'spa') {
        $spaImage = spaImageFromTitle(
            $title
        );

        if ($spaImage !== '') {
            return $spaImage;
        }
    }

    return trim($image);
}

function generateOrderNumber(): string
{
    return
        'CENT-' .
        date('YmdHis') .
        '-' .
        strtoupper(
            substr(
                bin2hex(
                    random_bytes(4)
                ),
                0,
                6
            )
        );
}

function addCreateOrderValue(
    array &$fields,
    array &$placeholders,
    array &$params,
    array $columns,
    string $column,
    mixed $value
): void {
    if (!isset($columns[$column])) {
        return;
    }

    $parameter =
        'p_' .
        preg_replace(
            '/[^A-Za-z0-9_]/',
            '_',
            $column
        );

    $fields[] =
        "`{$column}`";

    $placeholders[] =
        ':' . $parameter;

    $params[$parameter] =
        $value;
}

function addOrderHistory(
    PDO $pdo,
    int $orderId
): void {
    if (
        !createOrderTableExists(
            $pdo,
            'order_status_history'
        )
    ) {
        return;
    }

    try {
        $columns = createOrderColumns(
            $pdo,
            'order_status_history'
        );

        if (
            !isset($columns['order_id']) ||
            !isset($columns['status'])
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
                'pending'
        ];

        if (isset($columns['note'])) {
            $fields[] = '`note`';
            $values[] = ':note';

            $params['note'] =
                'Customer created the booking.';
        }

        if (isset($columns['created_at'])) {
            $fields[] = '`created_at`';
            $values[] = 'NOW()';
        }

        $statement = $pdo->prepare(
            'INSERT INTO order_status_history (' .
            implode(', ', $fields) .
            ') VALUES (' .
            implode(', ', $values) .
            ')'
        );

        $statement->execute(
            $params
        );

    } catch (Throwable $error) {
    }
}

try {
    $user = requireCustomer();

    $pdo = createOrderDatabase();

    $pdo->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

    if (
        !createOrderTableExists(
            $pdo,
            'customer_orders'
        )
    ) {
        throw new RuntimeException(
            'customer_orders table does not exist.'
        );
    }

    ensureOrderSchema(
        $pdo
    );

    $columns = createOrderColumns(
        $pdo,
        'customer_orders'
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

    $details =
        isset($input['details']) &&
        is_array($input['details'])
            ? $input['details']
            : [];

    $type = normalizeOrderTypeValue(
        (string)(
            $input['order_type'] ??
            $input['service_type'] ??
            $details['type'] ??
            $details['service_type'] ??
            ''
        )
    );

    $serviceType = strtolower(
        trim(
            (string)(
                $input['service_type'] ??
                $details['service_type'] ??
                $type
            )
        )
    );

    $title = trim(
        (string)(
            $input['title'] ??
            $details['title'] ??
            $details['name'] ??
            'Centuria Booking'
        )
    );

    $description = trim(
        (string)(
            $input['description'] ??
            $details['description'] ??
            ''
        )
    );

    $amount = (float)(
        $input['total_amount'] ??
        $input['amount'] ??
        $details['total_amount'] ??
        $details['total'] ??
        0
    );

    if ($amount <= 0) {
        http_response_code(422);

        echo json_encode([
            'success' => false,
            'message' =>
                'The order amount is invalid.'
        ]);

        exit;
    }

    $incomingImage = trim(
        (string)(
            $input['image'] ??
            $details['image'] ??
            $details['image_url'] ??
            $details['imageUrl'] ??
            ''
        )
    );

    $image = resolveStoredOrderImage(
        $type,
        $title,
        $incomingImage
    );

    $orderNumber =
        generateOrderNumber();

    $details['type'] =
        $type;

    $details['service_type'] =
        $serviceType;

    $details['title'] =
        $title;

    $details['name'] =
        $title;

    $details['description'] =
        $description;

    $details['image'] =
        $image;

    $details['total'] =
        $amount;

    $details['total_amount'] =
        $amount;

    $detailsJson = json_encode(
        $details,
        JSON_UNESCAPED_SLASHES |
        JSON_UNESCAPED_UNICODE
    );

    if ($detailsJson === false) {
        throw new RuntimeException(
            'Unable to encode order details.'
        );
    }

    $fields = [];
    $placeholders = [];
    $params = [];

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'user_id',
        (int)$user['id']
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'customer_id',
        (int)$user['id']
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'customer_user_id',
        (int)$user['id']
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'order_number',
        $orderNumber
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'customer_name',
        (string)(
            $user['full_name'] ??
            'Customer'
        )
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'customer_email',
        (string)(
            $user['email'] ??
            ''
        )
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'email',
        (string)(
            $user['email'] ??
            ''
        )
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'customer_phone',
        (string)(
            $user['phone'] ??
            ''
        )
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'order_type',
        $type
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'service_type',
        $serviceType
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'title',
        $title
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'description',
        $description
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'total_amount',
        $amount
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'amount',
        $amount
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'currency',
        (string)(
            $input['currency'] ??
            'LKR'
        )
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'status',
        'pending'
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'payment_status',
        (string)(
            $input['payment_status'] ??
            'pending'
        )
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'payment_method',
        (string)(
            $input['payment_method'] ??
            ''
        )
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'payment_reference',
        (string)(
            $input['payment_reference'] ??
            ''
        )
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'payment_last4',
        (string)(
            $input['payment_last4'] ??
            ''
        )
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'image',
        $image
    );

    addCreateOrderValue(
        $fields,
        $placeholders,
        $params,
        $columns,
        'details_json',
        $detailsJson
    );

    if (
        isset($columns['details'])
    ) {
        addCreateOrderValue(
            $fields,
            $placeholders,
            $params,
            $columns,
            'details',
            $detailsJson
        );
    }

    if (
        isset(
            $columns['booking_date']
        )
    ) {
        addCreateOrderValue(
            $fields,
            $placeholders,
            $params,
            $columns,
            'booking_date',
            $details['booking_date'] ??
            $details['date'] ??
            null
        );
    }

    if (
        isset(
            $columns['booking_time']
        )
    ) {
        addCreateOrderValue(
            $fields,
            $placeholders,
            $params,
            $columns,
            'booking_time',
            $details['booking_time'] ??
            $details['time'] ??
            null
        );
    }

    if (
        isset(
            $columns['quantity']
        )
    ) {
        addCreateOrderValue(
            $fields,
            $placeholders,
            $params,
            $columns,
            'quantity',
            max(
                1,
                (int)(
                    $details['quantity'] ??
                    $details['sessions'] ??
                    1
                )
            )
        );
    }

    if (
        isset(
            $columns['status_updated_at']
        )
    ) {
        $fields[] =
            '`status_updated_at`';

        $placeholders[] =
            'NOW()';
    }

    if (
        isset(
            $columns['created_at']
        )
    ) {
        $fields[] =
            '`created_at`';

        $placeholders[] =
            'NOW()';
    }

    if (
        isset(
            $columns['updated_at']
        )
    ) {
        $fields[] =
            '`updated_at`';

        $placeholders[] =
            'NOW()';
    }

    if (empty($fields)) {
        throw new RuntimeException(
            'No writable order columns were found.'
        );
    }

    $sql =
        'INSERT INTO customer_orders (' .
        implode(', ', $fields) .
        ') VALUES (' .
        implode(', ', $placeholders) .
        ')';

    $pdo->beginTransaction();

    $statement = $pdo->prepare(
        $sql
    );

    $statement->execute(
        $params
    );

    $orderId =
        (int)$pdo->lastInsertId();

    addOrderHistory(
        $pdo,
        $orderId
    );

    $pdo->commit();

    $result = $pdo->prepare(
        'SELECT *
         FROM customer_orders
         WHERE id = :id
         LIMIT 1'
    );

    $result->execute([
        'id' => $orderId
    ]);

    $order = $result->fetch(
        PDO::FETCH_ASSOC
    );

    if ($order) {
        $order['details'] =
            $details;

        $order['image'] =
            $image;
    }

    echo json_encode(
        [
            'success' => true,

            'message' =>
                'Booking created successfully.',

            'order_id' =>
                $orderId,

            'order_number' =>
                $orderNumber,

            'status' =>
                'pending',

            'order' =>
                $order
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
                'Unable to create the booking.',

            'error' =>
                $error->getMessage()
        ],
        JSON_UNESCAPED_SLASHES |
        JSON_UNESCAPED_UNICODE
    );
}