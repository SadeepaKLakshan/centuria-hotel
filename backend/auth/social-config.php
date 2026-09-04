<?php

declare(strict_types=1);

return [
    'frontend_url' => 'http://localhost:5173',

    'google' => [
        'enabled' => true,

        'client_id' => 'YOUR_GOOGLE_CLIENT_ID',

        'client_secret' => 'YOUR_GOOGLE_CLIENT_SECRET',

        'redirect_uri' =>
            'http://localhost/centuria-hotel/backend/auth/social-callback.php?provider=google',

        'authorize_url' =>
            'https://accounts.google.com/o/oauth2/v2/auth',

        'token_url' =>
            'https://oauth2.googleapis.com/token',

        'userinfo_url' =>
            'https://openidconnect.googleapis.com/v1/userinfo',

        'scope' =>
            'openid email profile'
    ],

    'facebook' => [
        'enabled' => false,

        'client_id' => 'YOUR_FACEBOOK_APP_ID',

        'client_secret' => 'YOUR_FACEBOOK_APP_SECRET',

        'redirect_uri' =>
            'http://localhost/centuria-hotel/backend/auth/social-callback.php?provider=facebook',

        'authorize_url' =>
            'https://www.facebook.com/v23.0/dialog/oauth',

        'token_url' =>
            'https://graph.facebook.com/v23.0/oauth/access_token',

        'userinfo_url' =>
            'https://graph.facebook.com/me',

        'scope' =>
            'email,public_profile'
    ],

    'apple' => [
        'enabled' => false,

        'client_id' =>
            'YOUR_APPLE_SERVICE_ID',

        'team_id' =>
            'YOUR_APPLE_TEAM_ID',

        'key_id' =>
            'YOUR_APPLE_KEY_ID',

        'private_key_path' =>
            __DIR__ . '/../keys/AuthKey.p8',

        'redirect_uri' =>
            'https://YOUR_DOMAIN.com/centuria-hotel/backend/auth/social-callback.php?provider=apple',

        'authorize_url' =>
            'https://appleid.apple.com/auth/authorize',

        'token_url' =>
            'https://appleid.apple.com/auth/token',

        'scope' =>
            'name email'
    ],

    'tiktok' => [
        'enabled' => false,

        'client_id' =>
            'YOUR_TIKTOK_CLIENT_KEY',

        'client_secret' =>
            'YOUR_TIKTOK_CLIENT_SECRET',

        'redirect_uri' =>
            'https://YOUR_DOMAIN.com/centuria-hotel/backend/auth/social-callback.php?provider=tiktok',

        'authorize_url' =>
            'https://www.tiktok.com/v2/auth/authorize/',

        'token_url' =>
            'https://open.tiktokapis.com/v2/oauth/token/',

        'userinfo_url' =>
            'https://open.tiktokapis.com/v2/user/info/',

        'scope' =>
            'user.info.basic'
    ]
];