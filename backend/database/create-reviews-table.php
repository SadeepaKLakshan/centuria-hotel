<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

header(
    'Content-Type: application/json; charset=utf-8'
);

try {
    $pdo =
        getDatabaseConnection();

    $sql = "
        CREATE TABLE IF NOT EXISTS reviews (
            id INT UNSIGNED
                NOT NULL
                AUTO_INCREMENT,

            user_id INT UNSIGNED
                NOT NULL,

            rating TINYINT UNSIGNED
                NOT NULL,

            review_text TEXT
                NOT NULL,

            status ENUM(
                'published',
                'hidden'
            )
                NOT NULL
                DEFAULT 'published',

            created_at TIMESTAMP
                NOT NULL
                DEFAULT CURRENT_TIMESTAMP,

            updated_at TIMESTAMP
                NOT NULL
                DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,

            PRIMARY KEY (id),

            UNIQUE KEY
                unique_customer_review
                (user_id),

            KEY
                idx_reviews_status
                (status),

            KEY
                idx_reviews_created_at
                (created_at),

            CONSTRAINT
                fk_reviews_user
                FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE,

            CONSTRAINT
                chk_reviews_rating
                CHECK (
                    rating >= 1
                    AND rating <= 5
                )
        )
        ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
        COLLATE=utf8mb4_unicode_ci
    ";

    $pdo->exec($sql);

    echo json_encode([
        'success' => true,
        'message' =>
            'Reviews table created successfully.'
    ]);
} catch (Throwable $error) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' =>
            'Unable to create reviews table.',
        'error' =>
            $error->getMessage()
    ]);
}