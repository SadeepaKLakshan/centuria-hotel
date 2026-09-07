<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/auth-middleware.php';

applyCors();

header('Content-Type: application/json; charset=utf-8');

function orderResponse(
    int $status,
    array $payload
): never {
    http_response_code($status);

    echo json_encode(
        $payload,
        JSON_UNESCAPED_SLASHES |
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

function getJsonInput(): array
{
    $raw =
        file_get_contents(
            'php://input'
        );

    if (
        $raw === false ||
        trim($raw) === ''
    ) {
        return [];
    }

    $decoded =
        json_decode(
            $raw,
            true
        );

    if (
        !is_array(
            $decoded
        )
    ) {
        orderResponse(
            400,
            [
                'success' => false,
                'message' =>
                    'Invalid JSON request.'
            ]
        );
    }

    return $decoded;
}

function tableExists(
    PDO $pdo,
    string $table
): bool {
    $statement =
        $pdo->prepare(
            'SELECT COUNT(*)
             FROM information_schema.tables
             WHERE table_schema = DATABASE()
             AND table_name = :table_name'
        );

    $statement->execute([
        'table_name' =>
            $table
    ]);

    return (
        (int)$statement->fetchColumn() >
        0
    );
}

function getTableColumns(
    PDO $pdo,
    string $table
): array {
    $statement =
        $pdo->query(
            "SHOW COLUMNS FROM `$table`"
        );

    $columns = [];

    while (
        $row =
            $statement->fetch(
                PDO::FETCH_ASSOC
            )
    ) {
        $columns[
            $row['Field']
        ] = $row;
    }

    return $columns;
}

function firstExistingColumn(
    array $columns,
    array $candidates
): ?string {
    foreach (
        $candidates
        as $candidate
    ) {
        if (
            isset(
                $columns[
                    $candidate
                ]
            )
        ) {
            return $candidate;
        }
    }

    return null;
}

function setColumnValue(
    array &$values,
    array $columns,
    array $candidates,
    mixed $value
): void {
    $column =
        firstExistingColumn(
            $columns,
            $candidates
        );

    if (
        $column !== null
    ) {
        $values[
            $column
        ] = $value;
    }
}

function getEnumFirstValue(
    string $type
): ?string {
    if (
        !preg_match(
            "/^enum\\((.*)\\)$/i",
            $type,
            $matches
        )
    ) {
        return null;
    }

    if (
        !preg_match_all(
            "/'([^']*)'/",
            $matches[1],
            $values
        )
    ) {
        return null;
    }

    return $values[1][0] ??
        null;
}

function getRequiredFallback(
    string $column,
    array $definition
): mixed {
    $type =
        strtolower(
            (string)(
                $definition[
                    'Type'
                ] ??
                ''
            )
        );

    $columnLower =
        strtolower(
            $column
        );

    if (
        str_contains(
            $columnLower,
            'status'
        )
    ) {
        if (
            str_contains(
                $columnLower,
                'payment'
            )
        ) {
            return 'pending';
        }

        return 'pending';
    }

    if (
        str_contains(
            $columnLower,
            'currency'
        )
    ) {
        return 'LKR';
    }

    if (
        str_contains(
            $columnLower,
            'email'
        )
    ) {
        return '';
    }

    if (
        str_contains(
            $columnLower,
            'phone'
        )
    ) {
        return '';
    }

    if (
        str_contains(
            $columnLower,
            'name'
        ) ||
        str_contains(
            $columnLower,
            'title'
        )
    ) {
        return 'Centuria Booking';
    }

    if (
        str_contains(
            $columnLower,
            'description'
        ) ||
        str_contains(
            $columnLower,
            'notes'
        ) ||
        str_contains(
            $columnLower,
            'detail'
        )
    ) {
        return '';
    }

    if (
        str_contains(
            $columnLower,
            'date'
        )
    ) {
        return date(
            'Y-m-d'
        );
    }

    if (
        str_contains(
            $columnLower,
            'time'
        )
    ) {
        return date(
            'H:i:s'
        );
    }

    if (
        str_contains(
            $type,
            'datetime'
        ) ||
        str_contains(
            $type,
            'timestamp'
        )
    ) {
        return date(
            'Y-m-d H:i:s'
        );
    }

    if (
        preg_match(
            '/^(tinyint|smallint|mediumint|int|bigint)/',
            $type
        )
    ) {
        return 0;
    }

    if (
        preg_match(
            '/^(decimal|float|double)/',
            $type
        )
    ) {
        return 0;
    }

    if (
        str_starts_with(
            $type,
            'enum('
        )
    ) {
        return
            getEnumFirstValue(
                $type
            ) ??
            '';
    }

    return '';
}

function completeRequiredColumns(
    array $columns,
    array $values
): array {
    foreach (
        $columns
        as $name =>
            $definition
    ) {
        if (
            array_key_exists(
                $name,
                $values
            )
        ) {
            continue;
        }

        $extra =
            strtolower(
                (string)(
                    $definition[
                        'Extra'
                    ] ??
                    ''
                )
            );

        if (
            str_contains(
                $extra,
                'auto_increment'
            )
        ) {
            continue;
        }

        if (
            in_array(
                $name,
                [
                    'created_at',
                    'updated_at'
                ],
                true
            )
        ) {
            continue;
        }

        $nullable =
            strtoupper(
                (string)(
                    $definition[
                        'Null'
                    ] ??
                    'YES'
                )
            ) ===
            'YES';

        $defaultExists =
            array_key_exists(
                'Default',
                $definition
            ) &&
            $definition[
                'Default'
            ] !==
            null;

        if (
            !$nullable &&
            !$defaultExists
        ) {
            $values[
                $name
            ] =
                getRequiredFallback(
                    $name,
                    $definition
                );
        }
    }

    return $values;
}

function generateOrderNumber(): string
{
    return sprintf(
        'CENT-%s-%04d',
        date(
            'YmdHis'
        ),
        random_int(
            1000,
            9999
        )
    );
}

function normalizeOrderType(
    string $value
): string {
    $value =
        strtolower(
            trim(
                $value
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
        )
    ) {
        return 'dining';
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
        )
    ) {
        return 'spa';
    }

    return
        $value !== ''
            ? $value
            : 'service';
}

function insertDynamicRow(
    PDO $pdo,
    string $table,
    array $values
): int {
    if (
        count(
            $values
        ) === 0
    ) {
        throw new RuntimeException(
            'No insertable values were found.'
        );
    }

    $columnNames =
        array_keys(
            $values
        );

    $quotedColumns =
        array_map(
            static fn(
                string $column
            ): string =>
                "`{$column}`",
            $columnNames
        );

    $placeholders =
        array_map(
            static fn(
                string $column
            ): string =>
                ':' .
                $column,
            $columnNames
        );

    $sql =
        "INSERT INTO `$table` (" .
        implode(
            ', ',
            $quotedColumns
        ) .
        ') VALUES (' .
        implode(
            ', ',
            $placeholders
        ) .
        ')';

    $statement =
        $pdo->prepare(
            $sql
        );

    $statement->execute(
        $values
    );

    return
        (int)$pdo->lastInsertId();
}

try {
    if (
        $_SERVER[
            'REQUEST_METHOD'
        ] !==
        'POST'
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

    $input =
        getJsonInput();

    if (
        !tableExists(
            $pdo,
            'customer_orders'
        )
    ) {
        orderResponse(
            500,
            [
                'success' => false,
                'message' =>
                    'The customer_orders table does not exist.',
                'error' =>
                    'Missing customer_orders table.'
            ]
        );
    }

    $orderType =
        normalizeOrderType(
            (string)(
                $input[
                    'order_type'
                ] ??
                $input[
                    'service_type'
                ] ??
                $input[
                    'type'
                ] ??
                'service'
            )
        );

    $title =
        trim(
            (string)(
                $input[
                    'title'
                ] ??
                $input[
                    'name'
                ] ??
                $input[
                    'service_name'
                ] ??
                'Centuria Booking'
            )
        );

    if (
        $title === ''
    ) {
        $title =
            'Centuria Booking';
    }

    $description =
        trim(
            (string)(
                $input[
                    'description'
                ] ??
                $input[
                    'notes'
                ] ??
                ''
            )
        );

    $amount =
        (float)(
            $input[
                'total_amount'
            ] ??
            $input[
                'amount'
            ] ??
            $input[
                'total'
            ] ??
            0
        );

    if (
        !is_finite(
            $amount
        ) ||
        $amount <= 0
    ) {
        orderResponse(
            422,
            [
                'success' => false,
                'message' =>
                    'A valid booking amount is required.',
                'error' =>
                    'Invalid total_amount.'
            ]
        );
    }

    $currency =
        strtoupper(
            trim(
                (string)(
                    $input[
                        'currency'
                    ] ??
                    'LKR'
                )
            )
        );

    if (
        $currency === ''
    ) {
        $currency =
            'LKR';
    }

    $paymentMethod =
        trim(
            (string)(
                $input[
                    'payment_method'
                ] ??
                'Card'
            )
        );

    $paymentReference =
        trim(
            (string)(
                $input[
                    'payment_reference'
                ] ??
                ''
            )
        );

    if (
        $paymentReference ===
        ''
    ) {
        $paymentReference =
            'PAY-' .
            date(
                'YmdHis'
            ) .
            '-' .
            random_int(
                100000,
                999999
            );
    }

    $paymentLast4 =
        preg_replace(
            '/[^0-9]/',
            '',
            (string)(
                $input[
                    'payment_last4'
                ] ??
                ''
            )
        );

    $paymentLast4 =
        substr(
            $paymentLast4,
            -4
        );

    $details =
        $input[
            'details'
        ] ??
        [];

    if (
        !is_array(
            $details
        )
    ) {
        $details = [];
    }

    $detailsJson =
        json_encode(
            $details,
            JSON_UNESCAPED_SLASHES |
            JSON_UNESCAPED_UNICODE
        );

    if (
        $detailsJson ===
        false
    ) {
        $detailsJson =
            '{}';
    }

    $customerStatement =
        $pdo->prepare(
            'SELECT
                id,
                full_name,
                email,
                phone,
                country_code,
                country
             FROM users
             WHERE id = :id
             LIMIT 1'
        );

    $customerStatement->execute([
        'id' =>
            (int)$customer[
                'id'
            ]
    ]);

    $customerRow =
        $customerStatement->fetch(
            PDO::FETCH_ASSOC
        );

    if (
        !$customerRow
    ) {
        orderResponse(
            404,
            [
                'success' => false,
                'message' =>
                    'Customer account was not found.',
                'error' =>
                    'Authenticated user does not exist.'
            ]
        );
    }

    $orderNumber =
        generateOrderNumber();

    $columns =
        getTableColumns(
            $pdo,
            'customer_orders'
        );

    $values = [];

    setColumnValue(
        $values,
        $columns,
        [
            'user_id',
            'customer_id'
        ],
        (int)$customerRow[
            'id'
        ]
    );

    setColumnValue(
        $values,
        $columns,
        [
            'order_number',
            'booking_number',
            'reference_number'
        ],
        $orderNumber
    );

    setColumnValue(
        $values,
        $columns,
        [
            'customer_name',
            'full_name',
            'name'
        ],
        (string)(
            $customerRow[
                'full_name'
            ] ??
            'Customer'
        )
    );

    setColumnValue(
        $values,
        $columns,
        [
            'customer_email',
            'email'
        ],
        (string)(
            $customerRow[
                'email'
            ] ??
            ''
        )
    );

    setColumnValue(
        $values,
        $columns,
        [
            'customer_phone',
            'phone'
        ],
        (string)(
            $customerRow[
                'phone'
            ] ??
            ''
        )
    );

    setColumnValue(
        $values,
        $columns,
        [
            'country'
        ],
        (string)(
            $customerRow[
                'country'
            ] ??
            'Sri Lanka'
        )
    );

    setColumnValue(
        $values,
        $columns,
        [
            'order_type',
            'service_type',
            'type'
        ],
        $orderType
    );

    setColumnValue(
        $values,
        $columns,
        [
            'title',
            'order_title',
            'service_name',
            'item_name'
        ],
        $title
    );

    setColumnValue(
        $values,
        $columns,
        [
            'description',
            'notes',
            'special_request'
        ],
        $description
    );

    setColumnValue(
        $values,
        $columns,
        [
            'total_amount',
            'amount',
            'total'
        ],
        $amount
    );

    setColumnValue(
        $values,
        $columns,
        [
            'currency'
        ],
        $currency
    );

    setColumnValue(
        $values,
        $columns,
        [
            'status',
            'order_status',
            'booking_status'
        ],
        'pending'
    );

    setColumnValue(
        $values,
        $columns,
        [
            'payment_status'
        ],
        'pending'
    );

    setColumnValue(
        $values,
        $columns,
        [
            'payment_method'
        ],
        $paymentMethod
    );

    setColumnValue(
        $values,
        $columns,
        [
            'payment_reference',
            'transaction_reference'
        ],
        $paymentReference
    );

    setColumnValue(
        $values,
        $columns,
        [
            'payment_last4',
            'card_last4'
        ],
        $paymentLast4
    );

    setColumnValue(
        $values,
        $columns,
        [
            'details_json',
            'details',
            'metadata',
            'order_details'
        ],
        $detailsJson
    );

    $bookingDate =
        trim(
            (string)(
                $details[
                    'date'
                ] ??
                $details[
                    'bookingDate'
                ] ??
                $details[
                    'booking_date'
                ] ??
                ''
            )
        );

    $bookingTime =
        trim(
            (string)(
                $details[
                    'time'
                ] ??
                $details[
                    'bookingTime'
                ] ??
                $details[
                    'booking_time'
                ] ??
                ''
            )
        );

    setColumnValue(
        $values,
        $columns,
        [
            'booking_date',
            'service_date'
        ],
        $bookingDate !== ''
            ? $bookingDate
            : date(
                'Y-m-d'
            )
    );

    setColumnValue(
        $values,
        $columns,
        [
            'booking_time',
            'service_time'
        ],
        $bookingTime !== ''
            ? $bookingTime
            : date(
                'H:i:s'
            )
    );

    setColumnValue(
        $values,
        $columns,
        [
            'quantity',
            'sessions',
            'guests'
        ],
        max(
            1,
            (int)(
                $details[
                    'quantity'
                ] ??
                $details[
                    'sessions'
                ] ??
                1
            )
        )
    );

    $values =
        completeRequiredColumns(
            $columns,
            $values
        );

    $pdo->beginTransaction();

    $orderId =
        insertDynamicRow(
            $pdo,
            'customer_orders',
            $values
        );

    if (
        $orderId <= 0
    ) {
        throw new RuntimeException(
            'The order ID was not generated.'
        );
    }

    if (
        tableExists(
            $pdo,
            'order_status_history'
        )
    ) {
        try {
            $historyColumns =
                getTableColumns(
                    $pdo,
                    'order_status_history'
                );

            $historyValues = [];

            setColumnValue(
                $historyValues,
                $historyColumns,
                [
                    'order_id',
                    'customer_order_id'
                ],
                $orderId
            );

            setColumnValue(
                $historyValues,
                $historyColumns,
                [
                    'status',
                    'new_status'
                ],
                'pending'
            );

            setColumnValue(
                $historyValues,
                $historyColumns,
                [
                    'previous_status',
                    'old_status'
                ],
                null
            );

            setColumnValue(
                $historyValues,
                $historyColumns,
                [
                    'changed_by',
                    'user_id',
                    'customer_id'
                ],
                (int)$customerRow[
                    'id'
                ]
            );

            setColumnValue(
                $historyValues,
                $historyColumns,
                [
                    'note',
                    'notes',
                    'description'
                ],
                'Booking submitted by customer.'
            );

            $historyValues =
                completeRequiredColumns(
                    $historyColumns,
                    $historyValues
                );

            if (
                count(
                    $historyValues
                ) >
                0
            ) {
                insertDynamicRow(
                    $pdo,
                    'order_status_history',
                    $historyValues
                );
            }
        } catch (
            Throwable $historyError
        ) {
        }
    }

    if (
        tableExists(
            $pdo,
            'admin_notifications'
        )
    ) {
        try {
            $notificationColumns =
                getTableColumns(
                    $pdo,
                    'admin_notifications'
                );

            $notificationValues = [];

            setColumnValue(
                $notificationValues,
                $notificationColumns,
                [
                    'user_id',
                    'customer_id'
                ],
                (int)$customerRow[
                    'id'
                ]
            );

            setColumnValue(
                $notificationValues,
                $notificationColumns,
                [
                    'order_id',
                    'customer_order_id'
                ],
                $orderId
            );

            setColumnValue(
                $notificationValues,
                $notificationColumns,
                [
                    'title',
                    'subject'
                ],
                'New Customer Booking'
            );

            setColumnValue(
                $notificationValues,
                $notificationColumns,
                [
                    'message',
                    'body',
                    'description'
                ],
                sprintf(
                    '%s submitted a %s booking for %s.',
                    (string)(
                        $customerRow[
                            'full_name'
                        ] ??
                        'Customer'
                    ),
                    $orderType,
                    $title
                )
            );

            setColumnValue(
                $notificationValues,
                $notificationColumns,
                [
                    'type',
                    'notification_type'
                ],
                'order'
            );

            setColumnValue(
                $notificationValues,
                $notificationColumns,
                [
                    'is_read',
                    'read_status'
                ],
                0
            );

            $notificationValues =
                completeRequiredColumns(
                    $notificationColumns,
                    $notificationValues
                );

            if (
                count(
                    $notificationValues
                ) >
                0
            ) {
                insertDynamicRow(
                    $pdo,
                    'admin_notifications',
                    $notificationValues
                );
            }
        } catch (
            Throwable $notificationError
        ) {
        }
    }

    $pdo->commit();

    $order = [
        'id' =>
            $orderId,

        'order_number' =>
            $orderNumber,

        'user_id' =>
            (int)$customerRow[
                'id'
            ],

        'customer_name' =>
            $customerRow[
                'full_name'
            ],

        'customer_email' =>
            $customerRow[
                'email'
            ],

        'order_type' =>
            $orderType,

        'service_type' =>
            $orderType,

        'title' =>
            $title,

        'description' =>
            $description,

        'total_amount' =>
            $amount,

        'currency' =>
            $currency,

        'status' =>
            'pending',

        'payment_status' =>
            'pending',

        'payment_method' =>
            $paymentMethod,

        'payment_reference' =>
            $paymentReference,

        'payment_last4' =>
            $paymentLast4,

        'created_at' =>
            date(
                'Y-m-d H:i:s'
            )
    ];

    orderResponse(
        201,
        [
            'success' =>
                true,

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
        ]
    );
} catch (
    Throwable $error
) {
    if (
        isset(
            $pdo
        ) &&
        $pdo instanceof PDO &&
        $pdo->inTransaction()
    ) {
        $pdo->rollBack();
    }

    orderResponse(
        500,
        [
            'success' =>
                false,

            'message' =>
                'Unable to create the booking.',

            'error' =>
                $error->getMessage()
        ]
    );
}