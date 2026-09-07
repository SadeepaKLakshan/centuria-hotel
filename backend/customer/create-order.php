<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/auth-middleware.php';

applyCors();

header(
    'Content-Type: application/json; charset=utf-8'
);


function orderResponse(
    int $status,
    array $payload
): never {
    http_response_code(
        $status
    );

    echo json_encode(
        $payload,
        JSON_UNESCAPED_SLASHES |
        JSON_UNESCAPED_UNICODE
    );

    exit;
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
             AND table_name = :table'
        );

    $statement->execute([
        'table' =>
            $table
    ]);

    return (
        (int)$statement->fetchColumn() >
        0
    );
}


function tableColumns(
    PDO $pdo,
    string $table
): array {
    $statement =
        $pdo->query(
            "SHOW COLUMNS FROM `{$table}`"
        );

    $columns = [];

    foreach (
        $statement->fetchAll(
            PDO::FETCH_ASSOC
        ) as $column
    ) {
        $columns[
            $column[
                'Field'
            ]
        ] =
            $column;
    }

    return $columns;
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
        ) ||
        str_contains(
            $value,
            'restaurant'
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

    return $value !== ''
        ? $value
        : 'service';
}


if (
    $_SERVER[
        'REQUEST_METHOD'
    ] !==
    'POST'
) {
    orderResponse(
        405,
        [
            'success' =>
                false,

            'message' =>
                'Method not allowed.'
        ]
    );
}


try {
    $customer =
        requireCustomer();

    $pdo =
        getDatabaseConnection();


    if (
        !tableExists(
            $pdo,
            'customer_orders'
        )
    ) {
        orderResponse(
            500,
            [
                'success' =>
                    false,

                'message' =>
                    'Customer orders table is not available.'
            ]
        );
    }


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
        orderResponse(
            400,
            [
                'success' =>
                    false,

                'message' =>
                    'Invalid JSON body.'
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
                ''
            )
        );


    $title =
        trim(
            (string)(
                $input[
                    'title'
                ] ??
                'Centuria Booking'
            )
        );


    $description =
        trim(
            (string)(
                $input[
                    'description'
                ] ??
                ''
            )
        );


    $totalAmount =
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


    $paymentLast4 =
        preg_replace(
            '/\D/',
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


    if (
        $title === ''
    ) {
        orderResponse(
            422,
            [
                'success' =>
                    false,

                'message' =>
                    'Booking title is required.'
            ]
        );
    }


    if (
        $totalAmount <=
        0
    ) {
        orderResponse(
            422,
            [
                'success' =>
                    false,

                'message' =>
                    'A valid booking amount is required.'
            ]
        );
    }


    $profileStatement =
        $pdo->prepare(
            'SELECT
                id,
                full_name,
                email,
                phone
             FROM users
             WHERE id = :id
             LIMIT 1'
        );


    $profileStatement->execute([
        'id' =>
            (int)$customer[
                'id'
            ]
    ]);


    $profile =
        $profileStatement->fetch(
            PDO::FETCH_ASSOC
        ) ?: [];


    $orderNumber =
        strtoupper(
            substr(
                $orderType,
                0,
                4
            )
        ) .
        '-' .
        date(
            'YmdHis'
        ) .
        '-' .
        random_int(
            100,
            999
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


    $details[
        'payment'
    ] = array_merge(
        is_array(
            $details[
                'payment'
            ] ??
            null
        )
            ? $details[
                  'payment'
              ]
            : [],
        [
            'method' =>
                $paymentMethod,

            'reference' =>
                $paymentReference,

            'last4' =>
                $paymentLast4
        ]
    );


    $detailsJson =
        json_encode(
            $details,
            JSON_UNESCAPED_SLASHES |
            JSON_UNESCAPED_UNICODE
        );


    $columns =
        tableColumns(
            $pdo,
            'customer_orders'
        );


    $values = [];


    $addValue =
        function (
            string $column,
            mixed $value
        ) use (
            &$values,
            $columns
        ): void {
            if (
                isset(
                    $columns[
                        $column
                    ]
                )
            ) {
                $values[
                    $column
                ] =
                    $value;
            }
        };


    $userId =
        (int)$customer[
            'id'
        ];


    $addValue(
        'user_id',
        $userId
    );

    $addValue(
        'customer_id',
        $userId
    );

    $addValue(
        'order_number',
        $orderNumber
    );

    $addValue(
        'order_type',
        $orderType
    );

    $addValue(
        'service_type',
        $orderType
    );

    $addValue(
        'type',
        $orderType
    );

    $addValue(
        'title',
        $title
    );

    $addValue(
        'order_title',
        $title
    );

    $addValue(
        'description',
        $description
    );

    $addValue(
        'notes',
        $description
    );

    $addValue(
        'special_request',
        $description
    );

    $addValue(
        'total_amount',
        $totalAmount
    );

    $addValue(
        'amount',
        $totalAmount
    );

    $addValue(
        'total',
        $totalAmount
    );

    $addValue(
        'currency',
        $currency
    );

    $addValue(
        'status',
        'pending'
    );

    $addValue(
        'payment_method',
        $paymentMethod
    );

    $addValue(
        'payment_reference',
        $paymentReference
    );

    $addValue(
        'payment_last4',
        $paymentLast4
    );

    $addValue(
        'customer_name',
        $profile[
            'full_name'
        ] ??
        $customer[
            'full_name'
        ] ??
        'Customer'
    );

    $addValue(
        'customer_email',
        $profile[
            'email'
        ] ??
        $customer[
            'email'
        ] ??
        ''
    );

    $addValue(
        'customer_phone',
        $profile[
            'phone'
        ] ??
        ''
    );

    $addValue(
        'details_json',
        $detailsJson
    );

    $addValue(
        'metadata',
        $detailsJson
    );

    $addValue(
        'meta_json',
        $detailsJson
    );


    if (
        isset(
            $columns[
                'payment_status'
            ]
        )
    ) {
        $type =
            strtolower(
                (string)$columns[
                    'payment_status'
                ][
                    'Type'
                ]
            );


        if (
            str_contains(
                $type,
                "'paid'"
            )
        ) {
            $values[
                'payment_status'
            ] =
                'paid';
        } elseif (
            str_contains(
                $type,
                "'completed'"
            )
        ) {
            $values[
                'payment_status'
            ] =
                'completed';
        } elseif (
            str_contains(
                $type,
                "'pending'"
            )
        ) {
            $values[
                'payment_status'
            ] =
                'pending';
        }
    }


    if (
        !isset(
            $values[
                'user_id'
            ]
        ) &&
        !isset(
            $values[
                'customer_id'
            ]
        )
    ) {
        orderResponse(
            500,
            [
                'success' =>
                    false,

                'message' =>
                    'The orders table does not contain a customer reference column.'
            ]
        );
    }


    if (
        empty(
            $values
        )
    ) {
        orderResponse(
            500,
            [
                'success' =>
                    false,

                'message' =>
                    'No compatible order columns were found.'
            ]
        );
    }


    $pdo->beginTransaction();


    $insertColumns =
        array_keys(
            $values
        );


    $placeholders =
        array_map(
            static fn (
                string $column
            ): string =>
                ':' .
                $column,
            $insertColumns
        );


    $sql =
        'INSERT INTO customer_orders (' .
        implode(
            ', ',
            array_map(
                static fn (
                    string $column
                ): string =>
                    "`{$column}`",
                $insertColumns
            )
        ) .
        ') VALUES (' .
        implode(
            ', ',
            $placeholders
        ) .
        ')';


    $insert =
        $pdo->prepare(
            $sql
        );


    $insert->execute(
        $values
    );


    $orderId =
        (int)$pdo->lastInsertId();


    if (
        tableExists(
            $pdo,
            'order_status_history'
        )
    ) {
        $historyColumns =
            tableColumns(
                $pdo,
                'order_status_history'
            );


        $historyValues =
            [];


        if (
            isset(
                $historyColumns[
                    'order_id'
                ]
            )
        ) {
            $historyValues[
                'order_id'
            ] =
                $orderId;
        }


        if (
            isset(
                $historyColumns[
                    'status'
                ]
            )
        ) {
            $historyValues[
                'status'
            ] =
                'pending';
        }


        if (
            isset(
                $historyColumns[
                    'note'
                ]
            )
        ) {
            $historyValues[
                'note'
            ] =
                'Payment submitted. Waiting for admin confirmation.';
        }


        if (
            isset(
                $historyColumns[
                    'notes'
                ]
            )
        ) {
            $historyValues[
                'notes'
            ] =
                'Payment submitted. Waiting for admin confirmation.';
        }


        if (
            $historyValues
        ) {
            $historyFields =
                array_keys(
                    $historyValues
                );


            $historySql =
                'INSERT INTO order_status_history (' .
                implode(
                    ', ',
                    array_map(
                        static fn (
                            string $column
                        ): string =>
                            "`{$column}`",
                        $historyFields
                    )
                ) .
                ') VALUES (' .
                implode(
                    ', ',
                    array_map(
                        static fn (
                            string $column
                        ): string =>
                            ':' .
                            $column,
                        $historyFields
                    )
                ) .
                ')';


            $historyInsert =
                $pdo->prepare(
                    $historySql
                );


            $historyInsert->execute(
                $historyValues
            );
        }
    }


    $pdo->commit();


    $select =
        $pdo->prepare(
            'SELECT *
             FROM customer_orders
             WHERE id = :id
             LIMIT 1'
        );


    $select->execute([
        'id' =>
            $orderId
    ]);


    $order =
        $select->fetch(
            PDO::FETCH_ASSOC
        ) ?: [
            'id' =>
                $orderId,

            'order_number' =>
                $orderNumber,

            'status' =>
                'pending'
        ];


    orderResponse(
        201,
        [
            'success' =>
                true,

            'message' =>
                'Payment submitted and booking created successfully.',

            'order_id' =>
                $orderId,

            'order_number' =>
                $order[
                    'order_number'
                ] ??
                $orderNumber,

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