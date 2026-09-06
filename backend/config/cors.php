<?php

declare(strict_types=1);

function applyCors(): void
{
    $allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://fanciful-dieffenbachia-547197.netlify.app',
        'https://subtle-dolphin-0f6b7f.netlify.app'
    ];

    $origin = trim(
        (string) ($_SERVER['HTTP_ORIGIN'] ?? '')
    );

    if (
        $origin !== '' &&
        in_array(
            $origin,
            $allowedOrigins,
            true
        )
    ) {
        header(
            'Access-Control-Allow-Origin: ' .
            $origin
        );
    }

    header('Vary: Origin');

    header(
        'Access-Control-Allow-Methods: ' .
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );

    header(
        'Access-Control-Allow-Headers: ' .
        'Content-Type, Authorization, Accept, X-Requested-With'
    );

    header(
        'Access-Control-Expose-Headers: ' .
        'Content-Type'
    );

    header(
        'Access-Control-Max-Age: 86400'
    );

    if (
        ($_SERVER['REQUEST_METHOD'] ?? '') ===
        'OPTIONS'
    ) {
        http_response_code(204);
        exit;
    }
}