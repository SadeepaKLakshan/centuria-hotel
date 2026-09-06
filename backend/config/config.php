<?php

declare(strict_types=1);

return [
    'app' => [
        'name' => 'Centuria Lake Resort',
        'otp_expiry_seconds' => 120,
        'reset_token_expiry_seconds' => 600
    ],

    'smtp' => [
        'host' =>
            getenv('SMTP_HOST') ?: 'smtp.gmail.com',

        'port' =>
            (int)(getenv('SMTP_PORT') ?: 587),

        'username' =>
            getenv('SMTP_USERNAME') ?: '',

        'password' =>
            getenv('SMTP_PASSWORD') ?: '',

        'encryption' =>
            'tls',

        'from_email' =>
            getenv('SMTP_FROM_EMAIL') ?: '',

        'from_name' =>
            getenv('SMTP_FROM_NAME')
            ?: 'Centuria Lake Resort'
    ],

    'role_keywords' => [
        'admin' =>
            getenv('ADMIN_KEYWORD')
            ?: 'Admin123',

        'manager' =>
            getenv('MANAGER_KEYWORD')
            ?: 'Manager123',

        'staff' =>
            getenv('STAFF_KEYWORD')
            ?: 'Staff123'
    ]
];