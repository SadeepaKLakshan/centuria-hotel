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

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.'
    ]);

    exit;
}

function customerOrdersDatabase(): PDO
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

function customerOrderColumns(
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

function customerOrderTableExists(
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

function decodeCustomerOrderDetails(
    array $order
): array {
    $possibleFields = [
        'details',
        'details_json',
        'order_details',
        'booking_details',
        'metadata',
        'extra_data'
    ];

    foreach (
        $possibleFields as $field
    ) {
        if (
            !array_key_exists(
                $field,
                $order
            )
        ) {
            continue;
        }

        if (
            is_array(
                $order[$field]
            )
        ) {
            return $order[$field];
        }

        if (
            is_string(
                $order[$field]
            ) &&
            trim(
                $order[$field]
            ) !== ''
        ) {
            $decoded = json_decode(
                $order[$field],
                true
            );

            if (
                is_array(
                    $decoded
                )
            ) {
                return $decoded;
            }
        }
    }

    return [];
}

function mergeCustomerOrderDetails(
    array $order,
    array $details
): array {
    foreach (
        $details as
        $key => $value
    ) {
        if (
            !array_key_exists(
                $key,
                $order
            ) ||
            $order[$key] ===
                null ||
            $order[$key] ===
                ''
        ) {
            $order[$key] =
                $value;
        }
    }

    return $order;
}

function customerOrderSpaImage(
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

    return (
        $images[$title] ??
        ''
    );
}

function normalizeCustomerOrderType(
    array $order
): string {
    $value = strtolower(
        trim(
            (string)(
                $order['service_type'] ??
                $order['order_type'] ??
                $order['type'] ??
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
        ) ||
        str_contains(
            $value,
            'travel'
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
        ) ||
        str_contains(
            $value,
            'wellness'
        )
    ) {
        return 'spa';
    }

    return 'service';
}

function resolveCustomerOrderImage(
    array $order,
    array $details
): string {
    $type =
        normalizeCustomerOrderType(
            $order
        );

    $title = trim(
        (string)(
            $order['title'] ??
            $details['title'] ??
            $details['name'] ??
            ''
        )
    );

    if (
        $type === 'spa' ||
        customerOrderSpaImage(
            $title
        ) !== ''
    ) {
        $spaImage =
            customerOrderSpaImage(
                $title
            );

        if (
            $spaImage !== ''
        ) {
            return $spaImage;
        }
    }

    $possibleImages = [
        $order['image'] ??
            null,

        $order['image_url'] ??
            null,

        $order['imageUrl'] ??
            null,

        $order['service_image'] ??
            null,

        $order['item_image'] ??
            null,

        $details['image'] ??
            null,

        $details['image_url'] ??
            null,

        $details['imageUrl'] ??
            null,

        $details['thumbnail'] ??
            null,

        $details['fallback'] ??
            null
    ];

    foreach (
        $possibleImages as $image
    ) {
        $image = trim(
            (string)$image
        );

        if ($image !== '') {
            return $image;
        }
    }

    return '';
}

function customerOwnsOrder(
    array $order,
    array $details,
    array $user
): bool {
    $userId = (int)(
        $user['id'] ??
        0
    );

    $userEmail = strtolower(
        trim(
            (string)(
                $user['email'] ??
                ''
            )
        )
    );

    $possibleIds = [
        $order['user_id'] ??
            null,

        $order['customer_id'] ??
            null,

        $order['customer_user_id'] ??
            null,

        $details['user_id'] ??
            null,

        $details['customer_id'] ??
            null
    ];

    foreach (
        $possibleIds as $id
    ) {
        if (
            $userId > 0 &&
            (int)$id > 0 &&
            (int)$id ===
                $userId
        ) {
            return true;
        }
    }

    $possibleEmails = [
        $order['customer_email'] ??
            null,

        $order['email'] ??
            null,

        $details['customer_email'] ??
            null,

        $details['email'] ??
            null
    ];

    foreach (
        $possibleEmails as $email
    ) {
        $email = strtolower(
            trim(
                (string)$email
            )
        );

        if (
            $userEmail !== '' &&
            $email !== '' &&
            $email ===
                $userEmail
        ) {
            return true;
        }
    }

    return false;
}

function customerOrderShouldHide(
    array $order
): bool {
    $status = strtolower(
        trim(
            (string)(
                $order['status'] ??
                'pending'
            )
        )
    );

    if (
        $status ===
        'cancelled'
    ) {
        return true;
    }

    if (
        !in_array(
            $status,
            [
                'delivered',
                'used'
            ],
            true
        )
    ) {
        return false;
    }

    $source =
        $order['status_updated_at'] ??
        $order['updated_at'] ??
        $order['created_at'] ??
        null;

    if (!$source) {
        return false;
    }

    $timestamp = strtotime(
        (string)$source
    );

    if (
        $timestamp === false
    ) {
        return false;
    }

    return (
        time() -
        $timestamp >=
        86400
    );
}

function loadCustomerOrderHistory(
    PDO $pdo,
    int $orderId
): array {
    if (
        $orderId <= 0 ||
        !customerOrderTableExists(
            $pdo,
            'order_status_history'
        )
    ) {
        return [];
    }

    try {
        $columns =
            customerOrderColumns(
                $pdo,
                'order_status_history'
            );

        if (
            !isset(
                $columns['order_id']
            )
        ) {
            return [];
        }

        $sort =
            isset(
                $columns['created_at']
            )
                ? '`created_at` ASC'
                : (
                    isset(
                        $columns['id']
                    )
                        ? '`id` ASC'
                        : '`order_id` ASC'
                );

        $statement = $pdo->prepare(
            "SELECT *
             FROM order_status_history
             WHERE order_id = :order_id
             ORDER BY {$sort}"
        );

        $statement->execute([
            'order_id' =>
                $orderId
        ]);

        return $statement->fetchAll(
            PDO::FETCH_ASSOC
        );

    } catch (Throwable $error) {
        return [];
    }
}

function prepareCustomerOrder(
    PDO $pdo,
    array $order
): array {
    $details =
        decodeCustomerOrderDetails(
            $order
        );

    $order =
        mergeCustomerOrderDetails(
            $order,
            $details
        );

    $order['status'] =
        strtolower(
            trim(
                (string)(
                    $order['status'] ??
                    'pending'
                )
            )
        );

    $order['title'] =
        trim(
            (string)(
                $order['title'] ??
                $details['title'] ??
                $details['name'] ??
                'Centuria Booking'
            )
        );

    $order['service_type'] =
        $order['service_type'] ??
        $details['service_type'] ??
        $details['type'] ??
        $order['order_type'] ??
        'service';

    $order['order_type'] =
        $order['order_type'] ??
        $details['type'] ??
        $order['service_type'];

    $order['image'] =
        resolveCustomerOrderImage(
            $order,
            $details
        );

    $order['total_amount'] =
        $order['total_amount'] ??
        $order['amount'] ??
        $details['total_amount'] ??
        $details['total'] ??
        0;

    $order['currency'] =
        $order['currency'] ??
        'LKR';

    $order['booking_date'] =
        $order['booking_date'] ??
        $details['booking_date'] ??
        $details['date'] ??
        '';

    $order['booking_time'] =
        $order['booking_time'] ??
        $details['booking_time'] ??
        $details['time'] ??
        '';

    $order['guest_type'] =
        $order['guest_type'] ??
        $details['guest_type'] ??
        $details['guestType'] ??
        '';

    $order['duration'] =
        $order['duration'] ??
        $details['duration'] ??
        '';

    $order['portion'] =
        $order['portion'] ??
        $details['portion'] ??
        '';

    $order['spice'] =
        $order['spice'] ??
        $details['spice'] ??
        '';

    $order['transport'] =
        $order['transport'] ??
        $details['transport'] ??
        '';

    $order['quantity'] =
        $order['quantity'] ??
        $details['quantity'] ??
        $details['sessions'] ??
        1;

    $order['details'] =
        $details;

    $order['history'] =
        loadCustomerOrderHistory(
            $pdo,
            (int)(
                $order['id'] ??
                0
            )
        );

    return $order;
}

try {
    $user =
        requireCustomer();

    $pdo =
        customerOrdersDatabase();

    $pdo->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

    if (
        !customerOrderTableExists(
            $pdo,
            'customer_orders'
        )
    ) {
        throw new RuntimeException(
            'customer_orders table does not exist.'
        );
    }

    $columns =
        customerOrderColumns(
            $pdo,
            'customer_orders'
        );

    $conditions = [];
    $params = [];

    if (
        isset(
            $columns['user_id']
        )
    ) {
        $conditions[] =
            '`user_id` = :user_id';

        $params['user_id'] =
            (int)$user['id'];
    }

    if (
        isset(
            $columns['customer_id']
        )
    ) {
        $conditions[] =
            '`customer_id` = :customer_id';

        $params['customer_id'] =
            (int)$user['id'];
    }

    if (
        isset(
            $columns[
                'customer_user_id'
            ]
        )
    ) {
        $conditions[] =
            '`customer_user_id` = :customer_user_id';

        $params[
            'customer_user_id'
        ] =
            (int)$user['id'];
    }

    if (
        isset(
            $columns['customer_email']
        ) &&
        !empty(
            $user['email']
        )
    ) {
        $conditions[] =
            'LOWER(`customer_email`) = LOWER(:customer_email)';

        $params['customer_email'] =
            (string)$user['email'];
    }

    if (
        isset(
            $columns['email']
        ) &&
        !empty(
            $user['email']
        )
    ) {
        $conditions[] =
            'LOWER(`email`) = LOWER(:email)';

        $params['email'] =
            (string)$user['email'];
    }

    $orderBy =
        isset(
            $columns['created_at']
        )
            ? '`created_at` DESC'
            : '`id` DESC';

    if (
        !empty(
            $conditions
        )
    ) {
        $statement = $pdo->prepare(
            'SELECT *
             FROM customer_orders
             WHERE ' .
            implode(
                ' OR ',
                $conditions
            ) .
            ' ORDER BY ' .
            $orderBy
        );

        $statement->execute(
            $params
        );

        $orders =
            $statement->fetchAll(
                PDO::FETCH_ASSOC
            );
    } else {
        $statement = $pdo->query(
            'SELECT *
             FROM customer_orders
             ORDER BY ' .
            $orderBy .
            ' LIMIT 500'
        );

        $orders =
            $statement->fetchAll(
                PDO::FETCH_ASSOC
            );
    }

    $result = [];

    foreach (
        $orders as $order
    ) {
        $details =
            decodeCustomerOrderDetails(
                $order
            );

        if (
            !customerOwnsOrder(
                $order,
                $details,
                $user
            )
        ) {
            continue;
        }

        $prepared =
            prepareCustomerOrder(
                $pdo,
                $order
            );

        if (
            customerOrderShouldHide(
                $prepared
            )
        ) {
            continue;
        }

        $result[] =
            $prepared;
    }

    echo json_encode(
        [
            'success' => true,

            'count' =>
                count($result),

            'orders' =>
                $result
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
                'Unable to load customer orders.',

            'error' =>
                $error->getMessage()
        ],
        JSON_UNESCAPED_SLASHES |
        JSON_UNESCAPED_UNICODE
    );
}