<?php

declare(strict_types=1);

session_start();

require_once __DIR__ . '/../config/database.php';

$config = require __DIR__ . '/social-config.php';

function frontendRedirect(
    string $frontendUrl,
    array $params
): never {
    $url =
        rtrim($frontendUrl, '/') .
        '/portal?' .
        http_build_query(
            $params,
            '',
            '&',
            PHP_QUERY_RFC3986
        );

    header('Location: ' . $url);
    exit;
}

function requestToken(
    string $url,
    array $data
): array {
    $curl = curl_init($url);

    if ($curl === false) {
        throw new RuntimeException(
            'Unable to initialize OAuth request.'
        );
    }

    curl_setopt_array(
        $curl,
        [
            CURLOPT_POST => true,

            CURLOPT_POSTFIELDS =>
                http_build_query(
                    $data,
                    '',
                    '&',
                    PHP_QUERY_RFC3986
                ),

            CURLOPT_RETURNTRANSFER =>
                true,

            CURLOPT_HTTPHEADER => [
                'Content-Type: application/x-www-form-urlencoded',
                'Accept: application/json'
            ],

            CURLOPT_TIMEOUT =>
                20
        ]
    );

    $response =
        curl_exec($curl);

    if ($response === false) {
        $error =
            curl_error($curl);

        curl_close($curl);

        throw new RuntimeException(
            'OAuth token request failed: ' .
            $error
        );
    }

    $statusCode =
        curl_getinfo(
            $curl,
            CURLINFO_HTTP_CODE
        );

    curl_close($curl);

    $decoded =
        json_decode(
            $response,
            true
        );

    if (!is_array($decoded)) {
        throw new RuntimeException(
            'OAuth provider returned an invalid token response.'
        );
    }

    if (
        $statusCode < 200 ||
        $statusCode >= 300
    ) {
        $providerMessage =
            $decoded['error_description'] ??
            $decoded['error']['message'] ??
            $decoded['error'] ??
            'OAuth token request was rejected.';

        if (is_array($providerMessage)) {
            $providerMessage =
                'OAuth token request was rejected.';
        }

        throw new RuntimeException(
            (string)$providerMessage
        );
    }

    return $decoded;
}

function requestJson(
    string $url,
    string $accessToken
): array {
    $curl = curl_init($url);

    if ($curl === false) {
        throw new RuntimeException(
            'Unable to initialize profile request.'
        );
    }

    curl_setopt_array(
        $curl,
        [
            CURLOPT_RETURNTRANSFER =>
                true,

            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' .
                    $accessToken,

                'Accept: application/json'
            ],

            CURLOPT_TIMEOUT =>
                20
        ]
    );

    $response =
        curl_exec($curl);

    if ($response === false) {
        $error =
            curl_error($curl);

        curl_close($curl);

        throw new RuntimeException(
            'OAuth profile request failed: ' .
            $error
        );
    }

    $statusCode =
        curl_getinfo(
            $curl,
            CURLINFO_HTTP_CODE
        );

    curl_close($curl);

    $decoded =
        json_decode(
            $response,
            true
        );

    if (!is_array($decoded)) {
        throw new RuntimeException(
            'OAuth provider returned an invalid profile response.'
        );
    }

    if (
        $statusCode < 200 ||
        $statusCode >= 300
    ) {
        throw new RuntimeException(
            'Unable to load your social account profile.'
        );
    }

    return $decoded;
}

function createOrUpdateGoogleUser(
    PDO $pdo,
    array $profile
): array {
    $email =
        strtolower(
            trim(
                (string)(
                    $profile['email'] ??
                    ''
                )
            )
        );

    $name =
        trim(
            (string)(
                $profile['name'] ??
                'Google User'
            )
        );

    $picture =
        trim(
            (string)(
                $profile['picture'] ??
                ''
            )
        );

    $emailVerified =
        filter_var(
            $profile['email_verified'] ??
                false,
            FILTER_VALIDATE_BOOLEAN
        );

    if (
        $email === '' ||
        !filter_var(
            $email,
            FILTER_VALIDATE_EMAIL
        )
    ) {
        throw new RuntimeException(
            'Google did not provide a valid email address.'
        );
    }

    if (!$emailVerified) {
        throw new RuntimeException(
            'Your Google email address is not verified.'
        );
    }

    $findUser =
        $pdo->prepare(
            'SELECT
                id,
                full_name,
                email,
                country,
                role,
                profile_image,
                is_verified,
                account_status
             FROM users
             WHERE email = :email
             LIMIT 1'
        );

    $findUser->execute([
        'email' => $email
    ]);

    $existingUser =
        $findUser->fetch();

    if ($existingUser) {
        if (
            $existingUser['account_status'] !==
            'active'
        ) {
            throw new RuntimeException(
                'This Centuria account is currently unavailable.'
            );
        }

        $updateUser =
            $pdo->prepare(
                'UPDATE users
                 SET
                    is_verified = 1,
                    email_verified_at =
                        COALESCE(
                            email_verified_at,
                            NOW()
                        ),
                    last_login_at = NOW()
                 WHERE id = :id'
            );

        $updateUser->execute([
            'id' =>
                $existingUser['id']
        ]);

        return [
            'id' =>
                (int)$existingUser['id'],

            'full_name' =>
                $existingUser['full_name'],

            'email' =>
                $email,

            'country' =>
                $existingUser['country'],

            'role' =>
                strtolower(
                    (string)$existingUser['role']
                ),

            'profile_image' =>
                $existingUser['profile_image'] ?: $picture
        ];
    }

    $passwordHash =
        password_hash(
            bin2hex(random_bytes(32)),
            PASSWORD_DEFAULT
        );

    if ($passwordHash === false) {
        throw new RuntimeException(
            'Unable to secure the new account.'
        );
    }

    $insertUser =
        $pdo->prepare(
            'INSERT INTO users
            (
                full_name,
                email,
                country,
                password_hash,
                role,
                is_verified,
                account_status,
                profile_image,
                email_verified_at,
                last_login_at
            )
            VALUES
            (
                :full_name,
                :email,
                :country,
                :password_hash,
                :role,
                1,
                :account_status,
                :profile_image,
                NOW(),
                NOW()
            )'
        );

    $insertUser->execute([
        'full_name' =>
            $name,

        'email' =>
            $email,

        'country' =>
            'Sri Lanka',

        'password_hash' =>
            $passwordHash,

        'role' =>
            'customer',

        'account_status' =>
            'active',

        'profile_image' =>
            $picture !== ''
                ? $picture
                : null
    ]);

    return [
        'id' =>
            (int)$pdo->lastInsertId(),

        'full_name' =>
            $name,

        'email' =>
            $email,

        'country' =>
            'Sri Lanka',

        'role' =>
            'customer',

        'profile_image' =>
            $picture
    ];
}

$oauthMode =
    strtolower(
        (string)(
            $_SESSION[
                'centuria_oauth_mode'
            ] ??
            'login'
        )
    );

if (
    !in_array(
        $oauthMode,
        ['login', 'register'],
        true
    )
) {
    $oauthMode = 'login';
}

try {
    $provider =
        strtolower(
            trim(
                (string)(
                    $_GET['provider'] ??
                    $_POST['provider'] ??
                    ''
                )
            )
        );

    if ($provider === '') {
        $provider =
            (string)(
                $_SESSION[
                    'centuria_oauth_provider'
                ] ??
                ''
            );
    }

    if (
        !isset($config[$provider]) ||
        !is_array(
            $config[$provider]
        )
    ) {
        throw new RuntimeException(
            'Invalid social login provider.'
        );
    }

    $providerConfig =
        $config[$provider];

    if (
        empty(
            $providerConfig[
                'enabled'
            ]
        )
    ) {
        throw new RuntimeException(
            ucfirst($provider) .
            ' login is not enabled.'
        );
    }

    $error =
        trim(
            (string)(
                $_GET['error'] ??
                $_POST['error'] ??
                ''
            )
        );

    if ($error !== '') {
        $errorDescription =
            trim(
                (string)(
                    $_GET[
                        'error_description'
                    ] ??
                    $_POST[
                        'error_description'
                    ] ??
                    ''
                )
            );

        throw new RuntimeException(
            $errorDescription !== ''
                ? $errorDescription
                : 'Social login was cancelled or denied.'
        );
    }

    $state =
        trim(
            (string)(
                $_GET['state'] ??
                $_POST['state'] ??
                ''
            )
        );

    $sessionState =
        (string)(
            $_SESSION[
                'centuria_oauth_state'
            ] ??
            ''
        );

    if (
        $state === '' ||
        $sessionState === '' ||
        !hash_equals(
            $sessionState,
            $state
        )
    ) {
        throw new RuntimeException(
            'OAuth security validation failed.'
        );
    }

    $createdAt =
        (int)(
            $_SESSION[
                'centuria_oauth_created_at'
            ] ??
            0
        );

    if (
        $createdAt <= 0 ||
        time() - $createdAt > 600
    ) {
        throw new RuntimeException(
            'The social login request has expired. Please try again.'
        );
    }

    $code =
        trim(
            (string)(
                $_GET['code'] ??
                $_POST['code'] ??
                ''
            )
        );

    if ($code === '') {
        throw new RuntimeException(
            'The social login authorization code is missing.'
        );
    }

    if ($provider !== 'google') {
        throw new RuntimeException(
            ucfirst($provider) .
            ' backend connection is not configured yet.'
        );
    }

    $tokenResponse =
        requestToken(
            $providerConfig[
                'token_url'
            ],
            [
                'client_id' =>
                    $providerConfig[
                        'client_id'
                    ],

                'client_secret' =>
                    $providerConfig[
                        'client_secret'
                    ],

                'code' =>
                    $code,

                'grant_type' =>
                    'authorization_code',

                'redirect_uri' =>
                    $providerConfig[
                        'redirect_uri'
                    ]
            ]
        );

    $accessToken =
        trim(
            (string)(
                $tokenResponse[
                    'access_token'
                ] ??
                ''
            )
        );

    if ($accessToken === '') {
        throw new RuntimeException(
            'Google did not return an access token.'
        );
    }

    $profile =
        requestJson(
            $providerConfig[
                'userinfo_url'
            ],
            $accessToken
        );

    $pdo =
        getDatabaseConnection();

    $pdo->beginTransaction();

    $user =
        createOrUpdateGoogleUser(
            $pdo,
            $profile
        );

    $pdo->commit();

    $role =
        strtolower(
            (string)$user['role']
        );

    $redirect =
        match ($role) {
            'admin' =>
                '/admin-dashboard',

            'manager' =>
                '/manager-dashboard',

            'staff' =>
                '/staff-dashboard',

            default =>
                '/customer-dashboard'
        };

    $payload = [
        'id' =>
            $user['id'],

        'full_name' =>
            $user['full_name'],

        'email' =>
            $user['email'],

        'country' =>
            $user['country'],

        'role' =>
            $role,

        'profile_image' =>
            $user['profile_image'],

        'redirect' =>
            $redirect
    ];

    $encoded =
        base64_encode(
            json_encode(
                $payload,
                JSON_UNESCAPED_SLASHES
            )
        );

    unset(
        $_SESSION[
            'centuria_oauth_state'
        ],
        $_SESSION[
            'centuria_oauth_provider'
        ],
        $_SESSION[
            'centuria_oauth_mode'
        ],
        $_SESSION[
            'centuria_oauth_created_at'
        ]
    );

    frontendRedirect(
        $config['frontend_url'],
        [
            'mode' =>
                $oauthMode,

            'social_success' =>
                '1',

            'social_data' =>
                $encoded
        ]
    );
} catch (Throwable $e) {
    if (
        isset($pdo) &&
        $pdo instanceof PDO &&
        $pdo->inTransaction()
    ) {
        $pdo->rollBack();
    }

    error_log(
        'Social OAuth callback error: ' .
        $e->getMessage()
    );

    unset(
        $_SESSION[
            'centuria_oauth_state'
        ],
        $_SESSION[
            'centuria_oauth_provider'
        ],
        $_SESSION[
            'centuria_oauth_mode'
        ],
        $_SESSION[
            'centuria_oauth_created_at'
        ]
    );

    frontendRedirect(
        $config['frontend_url'],
        [
            'mode' =>
                $oauthMode,

            'social_error' =>
                $e->getMessage()
        ]
    );
}