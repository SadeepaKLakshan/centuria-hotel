<?php

declare(strict_types=1);

return [
    'app' => [
        'name' => 'Centuria Lake Resort',
        'otp_expiry_seconds' => 120,
        'reset_token_expiry_seconds' => 600
    ],

    'gmail' => [
        'client_id' =>
            getenv('GMAIL_CLIENT_ID') ?: '',

        'client_secret' =>
            getenv('GMAIL_CLIENT_SECRET') ?: '',

        'refresh_token' =>
            getenv('GMAIL_REFRESH_TOKEN') ?: '',

        'from_email' =>
            getenv('GMAIL_FROM_EMAIL') ?: '',

        'from_name' =>
            getenv('GMAIL_FROM_NAME') ?: 'Centuria Lake Resort'
    ],

    'role_keywords' => [
        'admin' =>
            getenv('ADMIN_KEYWORD') ?: 'Admin123',

        'manager' =>
            getenv('MANAGER_KEYWORD') ?: 'Manager123',

        'staff' =>
            getenv('STAFF_KEYWORD') ?: 'Staff123'
    ]
];