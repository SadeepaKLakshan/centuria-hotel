<?php

declare(strict_types=1);

return [
    'app' => [
        'name' => 'Centuria Lake Resort',
        'otp_expiry_seconds' => 120,
        'reset_token_expiry_seconds' => 600
    ],

    'smtp' => [
        'host' => 'smtp.gmail.com',
        'port' => 587,
        'username' => 'centuriahotelsl@gmail.com',
        'password' => 'ysjt geyq mowr kbup',
        'encryption' => 'tls',
        'from_email' => 'centuriahotelsl@gmail.com',
        'from_name' => 'Centuria Lake Resort'
    ],

    'role_keywords' => [
        'admin' => 'Admin123',
        'manager' => 'Manager123',
        'staff' => 'Staff123'
    ]
];