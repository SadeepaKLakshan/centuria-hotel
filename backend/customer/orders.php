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
} else {
    $origin =
        $_SERVER[
            'HTTP_ORIGIN'
        ] ?? '*';

    header(
        'Access-Control-Allow-Origin: ' .
        $origin
    );

    header(
        'Access-Control-Allow-Headers: Content-Type, Authorization'
    );

    header(
        'Access-Control-Allow-Methods: GET, OPTIONS'
    );

    header(
        'Vary: Origin'
    );
}

header(
    'Content-Type: application/json; charset=utf-8'
);

if (
    ($_SERVER[
        'REQUEST_METHOD'
    ] ?? 'GET') ===
    'OPTIONS'
) {
    http_response_code(204);
    exit;
}

if (
    ($_SERVER[
        'REQUEST_METHOD'
    ] ?? '') !==
    'GET'
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


function ordersDatabase(): PDO
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


function ordersTableExists(
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


function ordersColumns(
    PDO $database,
    string $table
): array {
    $statement =
        $database->query(
            "SHOW COLUMNS
             FROM `{$table}`"
        );

    $rows =
        $statement->fetchAll(
            PDO::FETCH_ASSOC
        );

    $columns = [];

    foreach (
        $rows
        as $row
    ) {
        if (
            isset(
                $row['Field']
            )
        ) {
            $columns[] =
                (string)$row[
                    'Field'
                ];
        }
    }

    return $columns;
}


function hasOrdersColumn(
    array $columns,
    string $column
): bool {
    return in_array(
        $column,
        $columns,
        true
    );
}


function decodeOrderDetails(
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

    foreach (
        $fields
        as $field
    ) {
        if (
            !isset(
                $order[$field]
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
            !is_string(
                $order[$field]
            )
        ) {
            continue;
        }

        $decoded =
            json_decode(
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

    return [];
}


function mergeOrderDetails(
    array $order,
    array $details
): array {
    foreach (
        $details
        as $key => $value
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


function customerOwnsOrder(
    array $order,
    array $details,
    array $user
): bool {
    $userId =
        (int)(
            $user['id'] ??
            0
        );

    $email =
        strtolower(
            trim(
                (string)(
                    $user['email'] ??
                    ''
                )
            )
        );

    $ids = [
        $order['user_id'] ??
            null,

        $order['customer_id'] ??
            null,

        $details['user_id'] ??
            null,

        $details['customer_id'] ??
            null
    ];

    foreach (
        $ids
        as $candidate
    ) {
        if (
            $userId > 0 &&
            (int)$candidate ===
                $userId
        ) {
            return true;
        }
    }

    $emails = [
        $order[
            'customer_email'
        ] ?? null,

        $order[
            'email'
        ] ?? null,

        $details[
            'customer_email'
        ] ?? null,

        $details[
            'email'
        ] ?? null
    ];

    foreach (
        $emails
        as $candidate
    ) {
        $candidate =
            strtolower(
                trim(
                    (string)$candidate
                )
            );

        if (
            $email !== '' &&
            $candidate !== '' &&
            $email ===
                $candidate
        ) {
            return true;
        }
    }

    return false;
}


function shouldHideCustomerOrder(
    array $order
): bool {
    $status =
        strtolower(
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
        $order[
            'status_updated_at'
        ] ??
        $order[
            'updated_at'
        ] ??
        $order[
            'created_at'
        ] ??
        null;

    if (
        !$source
    ) {
        return false;
    }

    $timestamp =
        strtotime(
            (string)$source
        );

    if (
        $timestamp === false
    ) {
        return false;
    }

    return (
        $timestamp <=
        time() - 86400
    );
}


function loadOrderHistory(
    PDO $database,
    int $orderId
): array {
    if (
        !ordersTableExists(
            $database,
            'order_status_history'
        )
    ) {
        return [];
    }

    $columns =
        ordersColumns(
            $database,
            'order_status_history'
        );

    if (
        !hasOrdersColumn(
            $columns,
            'order_id'
        )
    ) {
        return [];
    }

    $orderBy =
        hasOrdersColumn(
            $columns,
            'created_at'
        )
            ? 'created_at ASC'
            : 'id ASC';

    $statement =
        $database->prepare(
            "SELECT *
             FROM order_status_history
             WHERE order_id = :order_id
             ORDER BY {$orderBy}"
        );

    $statement->execute([
        'order_id' =>
            $orderId
    ]);

    return $statement->fetchAll(
        PDO::FETCH_ASSOC
    );
}


function prepareCustomerOrder(
    PDO $database,
    array $order
): array {
    $details =
        decodeOrderDetails(
            $order
        );

    $order =
        mergeOrderDetails(
            $order,
            $details
        );

    $order['status'] =
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

    $order['title'] =
        $order['title'] ??
        $details['title'] ??
        $details['name'] ??
        'Centuria Booking';

    $order['image'] =
        $order['image'] ??
        $details['image'] ??
        $details['image_url'] ??
        $details['imageUrl'] ??
        '';

    $order[
        'service_type'
    ] =
        $order[
            'service_type'
        ] ??
        $details[
            'service_type'
        ] ??
        $details['type'] ??
        $order[
            'order_type'
        ] ??
        'service';

    $order[
        'total_amount'
    ] =
        $order[
            'total_amount'
        ] ??
        $order['amount'] ??
        $details[
            'total_amount'
        ] ??
        $details['total'] ??
        0;

    $order['currency'] =
        $order[
            'currency'
        ] ??
        'LKR';

    $order[
        'booking_date'
    ] =
        $order[
            'booking_date'
        ] ??
        $details[
            'booking_date'
        ] ??
        $details['date'] ??
        '';

    $order[
        'booking_time'
    ] =
        $order[
            'booking_time'
        ] ??
        $details[
            'booking_time'
        ] ??
        $details['time'] ??
        '';

    $order['duration'] =
        $order[
            'duration'
        ] ??
        $details[
            'duration'
        ] ??
        '';

    $order['guest_type'] =
        $order[
            'guest_type'
        ] ??
        $details[
            'guest_type'
        ] ??
        $details[
            'guestType'
        ] ??
        '';

    $order['portion'] =
        $order[
            'portion'
        ] ??
        $details[
            'portion'
        ] ??
        '';

    $order['spice'] =
        $order[
            'spice'
        ] ??
        $details[
            'spice'
        ] ??
        '';

    $order['transport'] =
        $order[
            'transport'
        ] ??
        $details[
            'transport'
        ] ??
        '';

    $order['details'] =
        $details;

    $order['history'] =
        loadOrderHistory(
            $database,
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

    $database =
        ordersDatabase();

    $database->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

    $columns =
        ordersColumns(
            $database,
            'customer_orders'
        );

    $conditions = [];
    $parameters = [];

    if (
        hasOrdersColumn(
            $columns,
            'user_id'
        )
    ) {
        $conditions[] =
            'user_id = :user_id';

        $parameters[
            'user_id'
        ] =
            (int)$user['id'];
    }

    if (
        hasOrdersColumn(
            $columns,
            'customer_id'
        )
    ) {
        $conditions[] =
            'customer_id = :customer_id';

        $parameters[
            'customer_id'
        ] =
            (int)$user['id'];
    }

    if (
        hasOrdersColumn(
            $columns,
            'customer_email'
        ) &&
        !empty(
            $user['email']
        )
    ) {
        $conditions[] =
            'LOWER(customer_email) = LOWER(:customer_email)';

        $parameters[
            'customer_email'
        ] =
            (string)$user[
                'email'
            ];
    }

    $sortColumn =
        hasOrdersColumn(
            $columns,
            'created_at'
        )
            ? 'created_at'
            : 'id';

    $orders = [];

    if (
        !empty(
            $conditions
        )
    ) {
        $sql =
            'SELECT *
             FROM customer_orders
             WHERE ' .
            implode(
                ' OR ',
                $conditions
            ) .
            " ORDER BY {$sortColumn} DESC";

        $statement =
            $database->prepare(
                $sql
            );

        $statement->execute(
            $parameters
        );

        $orders =
            $statement->fetchAll(
                PDO::FETCH_ASSOC
            );
    } else {
        $statement =
            $database->query(
                "SELECT *
                 FROM customer_orders
                 ORDER BY {$sortColumn} DESC
                 LIMIT 500"
            );

        $orders =
            $statement->fetchAll(
                PDO::FETCH_ASSOC
            );
    }

    $result = [];

    foreach (
        $orders
        as $order
    ) {
        $details =
            decodeOrderDetails(
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
                $database,
                $order
            );

        if (
            shouldHideCustomerOrder(
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
                count(
                    $result
                ),
            'orders' =>
                $result
        ],
        JSON_UNESCAPED_SLASHES |
        JSON_UNESCAPED_UNICODE
    );

} catch (
    Throwable $error
) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' =>
            'Unable to load customer orders.',
        'error' =>
            $error->getMessage()
    ]);
}