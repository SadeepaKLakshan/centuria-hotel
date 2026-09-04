<?php

declare(strict_types=1);

session_start();

header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');

$config = require __DIR__ . '/social-config.php';

function failRedirect(
    string $message,
    string $frontendUrl,
    string $mode
): never {
    $safeMode = $mode === 'register'
        ? 'register'
        : 'login';

    $url =
        rtrim($frontendUrl, '/') .
        '/portal?mode=' .
        rawurlencode($safeMode) .
        '&social_error=' .
        rawurlencode($message);

    header('Location: ' . $url);
    exit;
}

$provider = strtolower(
    trim((string)($_GET['provider'] ?? ''))
);

$mode = strtolower(
    trim((string)($_GET['mode'] ?? 'login'))
);

if (!in_array($mode, ['login', 'register'], true)) {
    $mode = 'login';
}

$allowedProviders = [
    'google',
    'facebook',
    'apple',
    'tiktok'
];

if (!in_array($provider, $allowedProviders, true)) {
    failRedirect(
        'Invalid social login provider.',
        $config['frontend_url'],
        $mode
    );
}

if (
    !isset($config[$provider]) ||
    !is_array($config[$provider])
) {
    failRedirect(
        'Social login provider is not configured.',
        $config['frontend_url'],
        $mode
    );
}

$providerConfig = $config[$provider];

if (empty($providerConfig['enabled'])) {
    failRedirect(
        ucfirst($provider) .
        ' login is not configured yet.',
        $config['frontend_url'],
        $mode
    );
}

$state = bin2hex(random_bytes(32));

$_SESSION['centuria_oauth_state'] =
    $state;

$_SESSION['centuria_oauth_provider'] =
    $provider;

$_SESSION['centuria_oauth_mode'] =
    $mode;

$_SESSION['centuria_oauth_created_at'] =
    time();

if ($provider === 'google') {
    $params = [
        'client_id' =>
            $providerConfig['client_id'],

        'redirect_uri' =>
            $providerConfig['redirect_uri'],

        'response_type' =>
            'code',

        'scope' =>
            $providerConfig['scope'],

        'state' =>
            $state,

        'access_type' =>
            'offline',

        'include_granted_scopes' =>
            'true',

        'prompt' =>
            'select_account'
    ];

    $authorizationUrl =
        $providerConfig['authorize_url'] .
        '?' .
        http_build_query(
            $params,
            '',
            '&',
            PHP_QUERY_RFC3986
        );

    header(
        'Location: ' .
        $authorizationUrl
    );

    exit;
}

if ($provider === 'facebook') {
    $params = [
        'client_id' =>
            $providerConfig['client_id'],

        'redirect_uri' =>
            $providerConfig['redirect_uri'],

        'response_type' =>
            'code',

        'scope' =>
            $providerConfig['scope'],

        'state' =>
            $state
    ];

    $authorizationUrl =
        $providerConfig['authorize_url'] .
        '?' .
        http_build_query(
            $params,
            '',
            '&',
            PHP_QUERY_RFC3986
        );

    header(
        'Location: ' .
        $authorizationUrl
    );

    exit;
}

if ($provider === 'apple') {
    $params = [
        'client_id' =>
            $providerConfig['client_id'],

        'redirect_uri' =>
            $providerConfig['redirect_uri'],

        'response_type' =>
            'code',

        'response_mode' =>
            'form_post',

        'scope' =>
            $providerConfig['scope'],

        'state' =>
            $state
    ];

    $authorizationUrl =
        $providerConfig['authorize_url'] .
        '?' .
        http_build_query(
            $params,
            '',
            '&',
            PHP_QUERY_RFC3986
        );

    header(
        'Location: ' .
        $authorizationUrl
    );

    exit;
}

if ($provider === 'tiktok') {
    $params = [
        'client_key' =>
            $providerConfig['client_id'],

        'response_type' =>
            'code',

        'scope' =>
            $providerConfig['scope'],

        'redirect_uri' =>
            $providerConfig['redirect_uri'],

        'state' =>
            $state
    ];

    $authorizationUrl =
        $providerConfig['authorize_url'] .
        '?' .
        http_build_query(
            $params,
            '',
            '&',
            PHP_QUERY_RFC3986
        );

    header(
        'Location: ' .
        $authorizationUrl
    );

    exit;
}

failRedirect(
    'Unable to start social login.',
    $config['frontend_url'],
    $mode
);