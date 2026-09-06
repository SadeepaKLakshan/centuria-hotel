<?php

declare(strict_types=1);

function applyCors(): void
{
    $allowedOrigins = [
        'http://localhost:5173',
        'https://subtle-dolphin-0f6b7f.netlify.app'
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowedOrigins, true)) {
        header(
            'Access-Control-Allow-Origin: ' .
            $origin
        );
    }

    header('Vary: Origin');

    header(
        'Access-Control-Allow-Headers: ' .
        'Content-Type, Authorization'
    );

    header(
        'Access-Control-Allow-Methods: ' .
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );

    header(
        'Content-Type: application/json; charset=utf-8'
    );

    if (
        ($_SERVER['REQUEST_METHOD'] ?? '')
        === 'OPTIONS'
    ) {
        http_response_code(204);
        exit;
    }
}