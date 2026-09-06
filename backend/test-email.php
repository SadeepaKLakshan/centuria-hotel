<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/services/EmailService.php';

$email = $_GET['email'] ?? '';

if ($email === '') {
    echo json_encode(
        [
            'success' => false,
            'message' =>
                'Add ?email=your@email.com to the URL.'
        ],
        JSON_PRETTY_PRINT
    );

    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(
        [
            'success' => false,
            'message' =>
                'Invalid email address.'
        ],
        JSON_PRETTY_PRINT
    );

    exit;
}

$otp = (string) random_int(
    100000,
    999999
);

$emailService = new EmailService();

$sent = $emailService->sendOtp(
    $email,
    $otp,
    'registration'
);

if (!$sent) {
    http_response_code(500);

    echo json_encode(
        [
            'success' => false,
            'message' =>
                'Email could not be sent. Check Railway logs.'
        ],
        JSON_PRETTY_PRINT
    );

    exit;
}

echo json_encode(
    [
        'success' => true,
        'message' =>
            'Test OTP email sent successfully.',
        'email' => $email
    ],
    JSON_PRETTY_PRINT
);