<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/auth-middleware.php';

applyCors();

header(
    'Content-Type: application/json; charset=utf-8'
);

function reviewResponse(
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

function loadReviews(
    PDO $pdo,
    int $currentUserId
): array {
    $statement = $pdo->prepare(
        'SELECT
            r.id,
            r.user_id,
            r.rating,
            r.review_text,
            r.status,
            r.created_at,
            r.updated_at,
            u.full_name,
            u.profile_image,
            u.country
         FROM reviews r
         INNER JOIN users u
            ON u.id = r.user_id
         WHERE
            r.status = "published"
            AND u.role = "customer"
            AND u.account_status = "active"
            AND u.is_verified = 1
         ORDER BY
            r.updated_at DESC,
            r.id DESC'
    );

    $statement->execute();

    $rows = $statement->fetchAll(
        PDO::FETCH_ASSOC
    );

    $reviews = [];

    foreach ($rows as $row) {
        $reviews[] = [
            'id' =>
                (int)$row['id'],

            'user_id' =>
                (int)$row['user_id'],

            'name' =>
                (string)$row['full_name'],

            'profile_image' =>
                $row['profile_image'] ?? '',

            'country' =>
                $row['country'] ?? 'Sri Lanka',

            'rating' =>
                (int)$row['rating'],

            'review_text' =>
                (string)$row['review_text'],

            'status' =>
                (string)$row['status'],

            'is_mine' =>
                (int)$row['user_id'] ===
                $currentUserId,

            'created_at' =>
                $row['created_at'] ?? null,

            'updated_at' =>
                $row['updated_at'] ?? null
        ];
    }

    return $reviews;
}

try {
    $customer =
        requireCustomer();

    $pdo =
        getDatabaseConnection();

    $method =
        strtoupper(
            (string)(
                $_SERVER[
                    'REQUEST_METHOD'
                ] ?? ''
            )
        );

    if ($method === 'GET') {
        $reviews =
            loadReviews(
                $pdo,
                (int)$customer['id']
            );

        $myReview = null;

        foreach ($reviews as $review) {
            if ($review['is_mine']) {
                $myReview = $review;
                break;
            }
        }

        reviewResponse(
            200,
            [
                'success' => true,

                'total' =>
                    count($reviews),

                'reviews' =>
                    $reviews,

                'my_review' =>
                    $myReview
            ]
        );
    }

    if (
        !in_array(
            $method,
            [
                'POST',
                'PUT',
                'PATCH'
            ],
            true
        )
    ) {
        reviewResponse(
            405,
            [
                'success' => false,
                'message' =>
                    'Method not allowed.'
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

    if (!is_array($input)) {
        $input = [];
    }

    $rating =
        (int)(
            $input['rating'] ?? 0
        );

    $reviewText =
        trim(
            (string)(
                $input[
                    'review_text'
                ] ?? ''
            )
        );

    if (
        $rating < 1 ||
        $rating > 5
    ) {
        reviewResponse(
            422,
            [
                'success' => false,
                'message' =>
                    'Rating must be between 1 and 5.'
            ]
        );
    }

    if ($reviewText === '') {
        reviewResponse(
            422,
            [
                'success' => false,
                'message' =>
                    'Please write your review.'
            ]
        );
    }

    if (
        mb_strlen(
            $reviewText
        ) < 3
    ) {
        reviewResponse(
            422,
            [
                'success' => false,
                'message' =>
                    'Review is too short.'
            ]
        );
    }

    if (
        mb_strlen(
            $reviewText
        ) > 2000
    ) {
        reviewResponse(
            422,
            [
                'success' => false,
                'message' =>
                    'Review must be less than 2000 characters.'
            ]
        );
    }

    $statement =
        $pdo->prepare(
            'INSERT INTO reviews (
                user_id,
                rating,
                review_text,
                status
             )
             VALUES (
                :user_id,
                :rating,
                :review_text,
                "published"
             )
             ON DUPLICATE KEY UPDATE
                rating =
                    VALUES(rating),
                review_text =
                    VALUES(review_text),
                status =
                    "published",
                updated_at =
                    CURRENT_TIMESTAMP'
        );

    $statement->execute([
        'user_id' =>
            (int)$customer['id'],

        'rating' =>
            $rating,

        'review_text' =>
            $reviewText
    ]);

    $reviewStatement =
        $pdo->prepare(
            'SELECT
                r.id,
                r.user_id,
                r.rating,
                r.review_text,
                r.status,
                r.created_at,
                r.updated_at,
                u.full_name,
                u.profile_image,
                u.country
             FROM reviews r
             INNER JOIN users u
                ON u.id = r.user_id
             WHERE r.user_id = :user_id
             LIMIT 1'
        );

    $reviewStatement->execute([
        'user_id' =>
            (int)$customer['id']
    ]);

    $savedReview =
        $reviewStatement->fetch(
            PDO::FETCH_ASSOC
        );

    reviewResponse(
        200,
        [
            'success' => true,

            'message' =>
                'Your review has been saved successfully.',

            'review' => [
                'id' =>
                    (int)$savedReview['id'],

                'user_id' =>
                    (int)$savedReview['user_id'],

                'name' =>
                    (string)$savedReview['full_name'],

                'profile_image' =>
                    $savedReview[
                        'profile_image'
                    ] ?? '',

                'country' =>
                    $savedReview[
                        'country'
                    ] ?? 'Sri Lanka',

                'rating' =>
                    (int)$savedReview['rating'],

                'review_text' =>
                    (string)$savedReview[
                        'review_text'
                    ],

                'status' =>
                    (string)$savedReview['status'],

                'is_mine' =>
                    true,

                'created_at' =>
                    $savedReview[
                        'created_at'
                    ] ?? null,

                'updated_at' =>
                    $savedReview[
                        'updated_at'
                    ] ?? null
            ]
        ]
    );
} catch (Throwable $error) {
    error_log(
        'Customer reviews error: ' .
        $error->getMessage()
    );

    reviewResponse(
        500,
        [
            'success' => false,

            'message' =>
                'Unable to process reviews.',

            'error' =>
                $error->getMessage()
        ]
    );
}