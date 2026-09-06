<?php

declare(strict_types=1);

return [
    'frontend_url' =>
        getenv('FRONTEND_URL')
        ?: 'https://subtle-dolphin-0f6b7f.netlify.app',

    'google' => [
        'enabled' => true,

        'client_id' =>
            getenv('GOOGLE_SOCIAL_CLIENT_ID')
            ?: getenv('GMAIL_CLIENT_ID')
            ?: '',

        'client_secret' =>
            getenv('GOOGLE_SOCIAL_CLIENT_SECRET')
            ?: getenv('GMAIL_CLIENT_SECRET')
            ?: '',

        'redirect_uri' =>
            'https://centuria-hotel-production.up.railway.app/auth/social-callback.php?provider=google',

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

        'client_id' =>
            getenv('FACEBOOK_APP_ID') ?: '',

        'client_secret' =>
            getenv('FACEBOOK_APP_SECRET') ?: '',

        'redirect_uri' =>
            'https://centuria-hotel-production.up.railway.app/auth/social-callback.php?provider=facebook',

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
            getenv('APPLE_SERVICE_ID') ?: '',

        'team_id' =>
            getenv('APPLE_TEAM_ID') ?: '',

        'key_id' =>
            getenv('APPLE_KEY_ID') ?: '',

        'private_key_path' =>
            __DIR__ . '/../keys/AuthKey.p8',

        'redirect_uri' =>
            'https://centuria-hotel-production.up.railway.app/auth/social-callback.php?provider=apple',

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
            getenv('TIKTOK_CLIENT_KEY') ?: '',

        'client_secret' =>
            getenv('TIKTOK_CLIENT_SECRET') ?: '',

        'redirect_uri' =>
            'https://centuria-hotel-production.up.railway.app/auth/social-callback.php?provider=tiktok',

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