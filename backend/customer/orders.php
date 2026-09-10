<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

$corsFile = __DIR__ . '/../config/cors.php';

if (file_exists($corsFile)) {
    require_once $corsFile;
}

if (function_exists('applyCors')) {
    applyCors();
} else {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';

    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
}

header('Content-Type: application/json; charset=utf-8');

if (
    ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS'
) {
    http_response_code(204);
    exit;
}

if (
    ($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET'
) {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.'
    ]);

    exit;
}

require_once __DIR__ . '/../auth/auth-middleware.php';


function getOrdersDatabase(): PDO
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
        $connection =
            getDatabaseConnection();

        if (
            $connection instanceof PDO
        ) {
            return $connection;
        }
    }

    throw new RuntimeException(
        'Database connection is unavailable.'
    );
}


function getTableColumns(
    PDO $database,
    string $table
): array {
    $statement =
        $database->query(
            "SHOW COLUMNS FROM `{$table}`"
        );

    $rows =
        $statement->fetchAll(
            PDO::FETCH_ASSOC
        );

    $columns = [];

    foreach ($rows as $row) {
        if (
            isset($row['Field'])
        ) {
            $columns[] =
                (string)$row['Field'];
        }
    }

    return $columns;
}


function hasColumn(
    array $columns,
    string $column
): bool {
    return in_array(
        $column,
        $columns,
        true
    );
}


function safeColumn(
    string $column
): string {
    if (
        !preg_match(
            '/^[A-Za-z0-9_]+$/',
            $column
        )
    ) {
        throw new RuntimeException(
            'Invalid database column.'
        );
    }

    return "`{$column}`";
}


function decodeJsonValue(
    mixed $value
): array {
    if (
        is_array($value)
    ) {
        return $value;
    }

    if (
        !is_string($value) ||
        trim($value) === ''
    ) {
        return [];
    }

    $decoded =
        json_decode(
            $value,
            true
        );

    return is_array($decoded)
        ? $decoded
        : [];
}


function getOrderDetails(
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
        $possibleFields
        as $field
    ) {
        if (
            !array_key_exists(
                $field,
                $order
            )
        ) {
            continue;
        }

        $decoded =
            decodeJsonValue(
                $order[$field]
            );

        if (
            !empty($decoded)
        ) {
            return $decoded;
        }
    }

    return [];
}


function cleanEmail(
    mixed $value
): string {
    return strtolower(
        trim(
            (string)$value
        )
    );
}


function cleanId(
    mixed $value
): int {
    if (
        $value === null ||
        $value === ''
    ) {
        return 0;
    }

    return (int)$value;
}


function orderBelongsToCustomer(
    array $order,
    array $details,
    array $user
): bool {
    $userId =
        cleanId(
            $user['id'] ?? 0
        );

    $userEmail =
        cleanEmail(
            $user['email'] ?? ''
        );

    $idCandidates = [
        $order['user_id'] ?? null,
        $order['customer_id'] ?? null,
        $order['customer_user_id'] ?? null,

        $details['user_id'] ?? null,
        $details['customer_id'] ?? null,
        $details['customer_user_id'] ?? null
    ];

    foreach (
        $idCandidates
        as $candidate
    ) {
        $candidateId =
            cleanId(
                $candidate
            );

        if (
            $userId > 0 &&
            $candidateId > 0 &&
            $candidateId ===
                $userId
        ) {
            return true;
        }
    }

    $emailCandidates = [
        $order['customer_email'] ?? null,
        $order['email'] ?? null,

        $details['customer_email'] ?? null,
        $details['email'] ?? null,

        $details['customerEmail'] ?? null
    ];

    foreach (
        $emailCandidates
        as $candidate
    ) {
        $candidateEmail =
            cleanEmail(
                $candidate
            );

        if (
            $userEmail !== '' &&
            $candidateEmail !== '' &&
            $candidateEmail ===
                $userEmail
        ) {
            return true;
        }
    }

    return false;
}


function mergeDetailsIntoOrder(
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
            $order[$key] === null ||
            $order[$key] === ''
        ) {
            $order[$key] =
                $value;
        }
    }

    return $order;
}


function normalizeCustomerOrder(
    array $order
): array {
    $details =
        getOrderDetails(
            $order
        );

    $order =
        mergeDetailsIntoOrder(
            $order,
            $details
        );

    $actualStatus =
        strtolower(
            trim(
                (string)(
                    $order['status'] ??
                    'pending'
                )
            )
        );

    $order['admin_status'] =
        $actualStatus;

    if (
        $actualStatus ===
        'accepted'
    ) {
        $order['status'] =
            'confirmed';
    } else {
        $order['status'] =
            $actualStatus !== ''
                ? $actualStatus
                : 'pending';
    }

    if (
        empty(
            $order['title']
        )
    ) {
        $order['title'] =
            $details['title'] ??
            $details['name'] ??
            'Centuria Booking';
    }

    if (
        empty(
            $order['description']
        )
    ) {
        $order['description'] =
            $details['description'] ??
            '';
    }

    if (
        empty(
            $order['order_type']
        )
    ) {
        $order['order_type'] =
            $details['order_type'] ??
            $details['service_type'] ??
            $details['type'] ??
            'service';
    }

    if (
        empty(
            $order['service_type']
        )
    ) {
        $order['service_type'] =
            $details['service_type'] ??
            $details['type'] ??
            $order['order_type'];
    }

    if (
        !isset(
            $order['total_amount']
        ) ||
        $order['total_amount'] ===
            null ||
        $order['total_amount'] ===
            ''
    ) {
        $order['total_amount'] =
            $order['amount'] ??
            $details['total_amount'] ??
            $details['total'] ??
            0;
    }

    if (
        empty(
            $order['currency']
        )
    ) {
        $order['currency'] =
            'LKR';
    }

    if (
        empty(
            $order['image']
        )
    ) {
        $order['image'] =
            $details['image'] ??
            $details['image_url'] ??
            $details['imageUrl'] ??
            '';
    }

    if (
        empty(
            $order['guest_type']
        )
    ) {
        $order['guest_type'] =
            $details['guest_type'] ??
            $details['guestType'] ??
            '';
    }

    if (
        empty(
            $order['duration']
        )
    ) {
        $order['duration'] =
            $details['duration'] ??
            '';
    }

    if (
        empty(
            $order['booking_date']
        )
    ) {
        $order['booking_date'] =
            $details['booking_date'] ??
            $details['date'] ??
            '';
    }

    if (
        empty(
            $order['booking_time']
        )
    ) {
        $order['booking_time'] =
            $details['booking_time'] ??
            $details['time'] ??
            '';
    }

    if (
        empty(
            $order['portion']
        )
    ) {
        $order['portion'] =
            $details['portion'] ??
            '';
    }

    if (
        empty(
            $order['spice']
        )
    ) {
        $order['spice'] =
            $details['spice'] ??
            '';
    }

    if (
        empty(
            $order['transport']
        )
    ) {
        $order['transport'] =
            $details['transport'] ??
            '';
    }

    if (
        empty(
            $order['quantity']
        )
    ) {
        $order['quantity'] =
            $details['quantity'] ??
            $details['sessions'] ??
            1;
    }

    $order['details'] =
        $details;

    return $order;
}


function getOrderSortColumn(
    array $columns
): string {
    $preferred = [
        'created_at',
        'createdAt',
        'id'
    ];

    foreach (
        $preferred
        as $column
    ) {
        if (
            hasColumn(
                $columns,
                $column
            )
        ) {
            return $column;
        }
    }

    return '';
}


try {
    $user =
        requireCustomer();

    $database =
        getOrdersDatabase();

    $database->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

    $columns =
        getTableColumns(
            $database,
            'customer_orders'
        );

    if (
        empty($columns)
    ) {
        throw new RuntimeException(
            'Customer orders table is unavailable.'
        );
    }

    $conditions = [];
    $parameters = [];

    $customerId =
        (int)(
            $user['id'] ??
            0
        );

    $customerEmail =
        strtolower(
            trim(
                (string)(
                    $user['email'] ??
                    ''
                )
            )
        );

    $idColumns = [
        'user_id',
        'customer_id',
        'customer_user_id'
    ];

    $idIndex = 0;

    foreach (
        $idColumns
        as $column
    ) {
        if (
            !hasColumn(
                $columns,
                $column
            ) ||
            $customerId <= 0
        ) {
            continue;
        }

        $placeholder =
            ':customer_id_' .
            $idIndex;

        $conditions[] =
            safeColumn(
                $column
            ) .
            " = {$placeholder}";

        $parameters[
            $placeholder
        ] = $customerId;

        $idIndex++;
    }

    $emailColumns = [
        'customer_email',
        'email'
    ];

    $emailIndex = 0;

    foreach (
        $emailColumns
        as $column
    ) {
        if (
            !hasColumn(
                $columns,
                $column
            ) ||
            $customerEmail === ''
        ) {
            continue;
        }

        $placeholder =
            ':customer_email_' .
            $emailIndex;

        $conditions[] =
            'LOWER(' .
            safeColumn(
                $column
            ) .
            ") = LOWER({$placeholder})";

        $parameters[
            $placeholder
        ] = $customerEmail;

        $emailIndex++;
    }

    $sortColumn =
        getOrderSortColumn(
            $columns
        );

    $orderBy =
        $sortColumn !== ''
            ? ' ORDER BY ' .
                safeColumn(
                    $sortColumn
                ) .
                ' DESC'
            : '';

    $orders = [];

    if (
        !empty(
            $conditions
        )
    ) {
        $sql =
            'SELECT * FROM `customer_orders` WHERE ' .
            implode(
                ' OR ',
                $conditions
            ) .
            $orderBy;

        $statement =
            $database->prepare(
                $sql
            );

        foreach (
            $parameters
            as $placeholder =>
                $value
        ) {
            if (
                str_contains(
                    $placeholder,
                    'customer_id'
                )
            ) {
                $statement->bindValue(
                    $placeholder,
                    (int)$value,
                    PDO::PARAM_INT
                );
            } else {
                $statement->bindValue(
                    $placeholder,
                    (string)$value,
                    PDO::PARAM_STR
                );
            }
        }

        $statement->execute();

        $orders =
            $statement->fetchAll(
                PDO::FETCH_ASSOC
            );
    }

    if (
        empty($orders)
    ) {
        $fallbackSql =
            'SELECT * FROM `customer_orders`' .
            $orderBy .
            ' LIMIT 500';

        $fallbackStatement =
            $database->query(
                $fallbackSql
            );

        $fallbackOrders =
            $fallbackStatement->fetchAll(
                PDO::FETCH_ASSOC
            );

        foreach (
            $fallbackOrders
            as $candidate
        ) {
            $details =
                getOrderDetails(
                    $candidate
                );

            if (
                orderBelongsToCustomer(
                    $candidate,
                    $details,
                    $user
                )
            ) {
                $orders[] =
                    $candidate;
            }
        }
    }

    $result = [];

    foreach (
        $orders
        as $order
    ) {
        $details =
            getOrderDetails(
                $order
            );

        if (
            !orderBelongsToCustomer(
                $order,
                $details,
                $user
            )
        ) {
            continue;
        }

        $result[] =
            normalizeCustomerOrder(
                $order
            );
    }

    echo json_encode(
        [
            'success' => true,
            'count' => count(
                $result
            ),
            'orders' => $result
        ],
        JSON_UNESCAPED_SLASHES |
        JSON_UNESCAPED_UNICODE
    );

} catch (
    Throwable $error
) {
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