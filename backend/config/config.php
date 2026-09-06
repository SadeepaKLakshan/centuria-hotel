<?php

declare(strict_types=1);

return [
    'app' => [
        'name' => 'Centuria Lake Resort',
        'otp_expiry_seconds' => 120,
        'reset_token_expiry_seconds' => 600
    ],

    'resend' => [
        'api_key' =>
            getenv('RESEND_API_KEY') ?: '',

        'from_email' =>
            getenv('RESEND_FROM_EMAIL') ?: 'onboarding@resend.dev',

        'from_name' =>
            getenv('RESEND_FROM_NAME') ?: 'Centuria Lake Resort'
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