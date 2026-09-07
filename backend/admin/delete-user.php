<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/auth-middleware.php';

applyCors();

header(
    'Content-Type: application/json; charset=utf-8'
);

function deleteResponse(
    int $status,
    array $payload
): never {
    http_response_code($status);

    echo json_encode(
        $payload,
        JSON_UNESCAPED_SLASHES
    );

    exit;
}

function tableExists(
    PDO $pdo,
    string $table
): bool {
    $statement = $pdo->prepare(
        'SELECT COUNT(*)
         FROM information_schema.TABLES
         WHERE
            TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = :table'
    );

    $statement->execute([
        'table' => $table
    ]);

    return
        (int)$statement->fetchColumn() > 0;
}

function columnExists(
    PDO $pdo,
    string $table,
    string $column
): bool {
    $statement = $pdo->prepare(
        'SELECT COUNT(*)
         FROM information_schema.COLUMNS
         WHERE
            TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = :table
            AND COLUMN_NAME = :column'
    );

    $statement->execute([
        'table' => $table,
        'column' => $column
    ]);

    return
        (int)$statement->fetchColumn() > 0;
}

function deleteByColumn(
    PDO $pdo,
    string $table,
    string $column,
    int|string $value
): void {
    if (
        !tableExists(
            $pdo,
            $table
        ) ||
        !columnExists(
            $pdo,
            $table,
            $column
        )
    ) {
        return;
    }

    $sql =
        'DELETE FROM `' .
        str_replace(
            '`',
            '',
            $table
        ) .
        '` WHERE `' .
        str_replace(
            '`',
            '',
            $column
        ) .
        '` = :value';

    $statement =
        $pdo->prepare($sql);

    $statement->execute([
        'value' => $value
    ]);
}

function setNullByColumn(
    PDO $pdo,
    string $table,
    string $column,
    int $userId
): void {
    if (
        !tableExists(
            $pdo,
            $table
        ) ||
        !columnExists(
            $pdo,
            $table,
            $column
        )
    ) {
        return;
    }

    try {
        $sql =
            'UPDATE `' .
            str_replace(
                '`',
                '',
                $table
            ) .
            '` SET `' .
            str_replace(
                '`',
                '',
                $column
            ) .
            '` = NULL
             WHERE `' .
            str_replace(
                '`',
                '',
                $column
            ) .
            '` = :id';

        $statement =
            $pdo->prepare($sql);

        $statement->execute([
            'id' => $userId
        ]);
    } catch (Throwable $ignored) {
    }
}

$method =
    strtoupper(
        (string)(
            $_SERVER[
                'REQUEST_METHOD'
            ] ?? ''
        )
    );

if (
    !in_array(
        $method,
        [
            'DELETE',
            'POST'
        ],
        true
    )
) {
    deleteResponse(
        405,
        [
            'success' => false,
            'message' =>
                'Method not allowed.'
        ]
    );
}

try {
    $authUser =
        requireAdmin();

    $pdo =
        getDatabaseConnection();

    $input =
        json_decode(
            file_get_contents(
                'php://input'
            ),
            true
        );

    if (!is_array($input)) {
        $input = [];
    }

    $userId =
        (int)(
            $input[
                'user_id'
            ] ?? 0
        );

    if ($userId <= 0) {
        deleteResponse(
            422,
            [
                'success' => false,
                'message' =>
                    'A valid user ID is required.'
            ]
        );
    }

    if (
        $userId ===
        (int)$authUser['id']
    ) {
        deleteResponse(
            403,
            [
                'success' => false,
                'message' =>
                    'You cannot delete your own logged-in account.'
            ]
        );
    }

    $findUser =
        $pdo->prepare(
            'SELECT
                id,
                full_name,
                email,
                role
             FROM users
             WHERE id = :id
             LIMIT 1'
        );

    $findUser->execute([
        'id' => $userId
    ]);

    $targetUser =
        $findUser->fetch(
            PDO::FETCH_ASSOC
        );

    if (!$targetUser) {
        deleteResponse(
            404,
            [
                'success' => false,
                'message' =>
                    'Account not found.'
            ]
        );
    }

    $email =
        (string)(
            $targetUser[
                'email'
            ] ?? ''
        );

    $pdo->beginTransaction();

    if (
        tableExists(
            $pdo,
            'conversations'
        ) &&
        columnExists(
            $pdo,
            'conversations',
            'customer_id'
        )
    ) {
        if (
            tableExists(
                $pdo,
                'messages'
            ) &&
            columnExists(
                $pdo,
                'messages',
                'conversation_id'
            )
        ) {
            $deleteMessages =
                $pdo->prepare(
                    'DELETE FROM messages
                     WHERE conversation_id IN
                     (
                        SELECT id
                        FROM conversations
                        WHERE customer_id = :user_id
                     )'
                );

            $deleteMessages->execute([
                'user_id' =>
                    $userId
            ]);
        }

        deleteByColumn(
            $pdo,
            'conversations',
            'customer_id',
            $userId
        );
    }

    deleteByColumn(
        $pdo,
        'messages',
        'sender_user_id',
        $userId
    );

    setNullByColumn(
        $pdo,
        'conversations',
        'assigned_admin_id',
        $userId
    );

    if (
        tableExists(
            $pdo,
            'customer_orders'
        ) &&
        columnExists(
            $pdo,
            'customer_orders',
            'user_id'
        )
    ) {
        if (
            tableExists(
                $pdo,
                'order_status_history'
            ) &&
            columnExists(
                $pdo,
                'order_status_history',
                'order_id'
            )
        ) {
            $deleteHistory =
                $pdo->prepare(
                    'DELETE FROM order_status_history
                     WHERE order_id IN
                     (
                        SELECT id
                        FROM customer_orders
                        WHERE user_id = :user_id
                     )'
                );

            $deleteHistory->execute([
                'user_id' =>
                    $userId
            ]);
        }

        if (
            tableExists(
                $pdo,
                'order_items'
            ) &&
            columnExists(
                $pdo,
                'order_items',
                'order_id'
            )
        ) {
            $deleteItems =
                $pdo->prepare(
                    'DELETE FROM order_items
                     WHERE order_id IN
                     (
                        SELECT id
                        FROM customer_orders
                        WHERE user_id = :user_id
                     )'
                );

            $deleteItems->execute([
                'user_id' =>
                    $userId
            ]);
        }

        deleteByColumn(
            $pdo,
            'customer_orders',
            'user_id',
            $userId
        );
    }

    setNullByColumn(
        $pdo,
        'customer_orders',
        'assigned_admin_id',
        $userId
    );

    setNullByColumn(
        $pdo,
        'order_status_history',
        'changed_by_user_id',
        $userId
    );

    setNullByColumn(
        $pdo,
        'order_status_history',
        'admin_id',
        $userId
    );

    deleteByColumn(
        $pdo,
        'api_tokens',
        'user_id',
        $userId
    );

    deleteByColumn(
        $pdo,
        'login_logs',
        'user_id',
        $userId
    );

    deleteByColumn(
        $pdo,
        'otp_logs',
        'user_id',
        $userId
    );

    deleteByColumn(
        $pdo,
        'registration_otps',
        'user_id',
        $userId
    );

    deleteByColumn(
        $pdo,
        'password_reset_otps',
        'user_id',
        $userId
    );

    deleteByColumn(
        $pdo,
        'admin_notifications',
        'user_id',
        $userId
    );

    if ($email !== '') {
        deleteByColumn(
            $pdo,
            'registration_otps',
            'email',
            $email
        );

        deleteByColumn(
            $pdo,
            'password_reset_otps',
            'email',
            $email
        );

        deleteByColumn(
            $pdo,
            'password_resets',
            'email',
            $email
        );

        deleteByColumn(
            $pdo,
            'otp_logs',
            'email',
            $email
        );
    }

    $foreignKeys =
        $pdo->prepare(
            'SELECT
                TABLE_NAME,
                COLUMN_NAME
             FROM information_schema.KEY_COLUMN_USAGE
             WHERE
                REFERENCED_TABLE_SCHEMA =
                    DATABASE()
                AND REFERENCED_TABLE_NAME =
                    "users"
                AND REFERENCED_COLUMN_NAME =
                    "id"'
        );

    $foreignKeys->execute();

    $references =
        $foreignKeys->fetchAll(
            PDO::FETCH_ASSOC
        );

    foreach (
        $references as $reference
    ) {
        $table =
            (string)$reference[
                'TABLE_NAME'
            ];

        $column =
            (string)$reference[
                'COLUMN_NAME'
            ];

        if ($table === 'users') {
            continue;
        }

        try {
            $nullableCheck =
                $pdo->prepare(
                    'SELECT IS_NULLABLE
                     FROM information_schema.COLUMNS
                     WHERE
                        TABLE_SCHEMA =
                            DATABASE()
                        AND TABLE_NAME =
                            :table
                        AND COLUMN_NAME =
                            :column
                     LIMIT 1'
                );

            $nullableCheck->execute([
                'table' =>
                    $table,
                'column' =>
                    $column
            ]);

            $nullable =
                strtoupper(
                    (string)
                    $nullableCheck->fetchColumn()
                ) === 'YES';

            if ($nullable) {
                setNullByColumn(
                    $pdo,
                    $table,
                    $column,
                    $userId
                );
            } else {
                deleteByColumn(
                    $pdo,
                    $table,
                    $column,
                    $userId
                );
            }
        } catch (Throwable $ignored) {
        }
    }

    $deleteUser =
        $pdo->prepare(
            'DELETE FROM users
             WHERE id = :id
             LIMIT 1'
        );

    $deleteUser->execute([
        'id' => $userId
    ]);

    if (
        $deleteUser->rowCount()
        !== 1
    ) {
        throw new RuntimeException(
            'Account deletion failed.'
        );
    }

    $pdo->commit();

    deleteResponse(
        200,
        [
            'success' => true,

            'message' =>
                'Account permanently deleted. The email address can now be registered again.',

            'deleted_user' => [
                'id' =>
                    $userId,

                'full_name' =>
                    $targetUser[
                        'full_name'
                    ] ?? '',

                'email' =>
                    $email,

                'role' =>
                    $targetUser[
                        'role'
                    ] ?? ''
            ]
        ]
    );
} catch (Throwable $error) {
    if (
        isset($pdo) &&
        $pdo instanceof PDO &&
        $pdo->inTransaction()
    ) {
        $pdo->rollBack();
    }

    error_log(
        'Permanent account delete error: ' .
        $error->getMessage()
    );

    deleteResponse(
        500,
        [
            'success' => false,

            'message' =>
                'Unable to permanently delete this account.',

            'error' =>
                $error->getMessage()
        ]
    );
}