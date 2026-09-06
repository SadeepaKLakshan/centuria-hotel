<?php

declare(strict_types=1);

class EmailService
{
    private array $resendConfig;
    private array $appConfig;

    public function __construct()
    {
        $config = require __DIR__ . '/../config/config.php';

        $this->resendConfig = $config['resend'];
        $this->appConfig = $config['app'];
    }

    public function sendOtp(
        string $email,
        string $otp,
        string $purpose = 'registration'
    ): bool {
        $apiKey = $this->resendConfig['api_key'];

        if ($apiKey === '') {
            error_log('RESEND_API_KEY is missing.');

            return false;
        }

        $fromEmail = $this->resendConfig['from_email'];
        $fromName = $this->resendConfig['from_name'];

        $subject = $purpose === 'password_reset'
            ? 'Centuria Lake Resort Password Reset OTP'
            : 'Centuria Lake Resort Registration OTP';

        $title = $purpose === 'password_reset'
            ? 'Password Reset Verification'
            : 'Registration Verification';

        $description = $purpose === 'password_reset'
            ? 'Use the verification code below to continue resetting your password.'
            : 'Use the verification code below to complete your registration.';

        $expirySeconds = (int) $this->appConfig['otp_expiry_seconds'];
        $expiryMinutes = max(1, (int) ceil($expirySeconds / 60));

        $html = $this->buildOtpEmail(
            $title,
            $description,
            $otp,
            $expiryMinutes
        );

        $payload = [
            'from' => sprintf(
                '%s <%s>',
                $fromName,
                $fromEmail
            ),
            'to' => [$email],
            'subject' => $subject,
            'html' => $html
        ];

        $ch = curl_init(
            'https://api.resend.com/emails'
        );

        if ($ch === false) {
            error_log(
                'Unable to initialize cURL.'
            );

            return false;
        }

        curl_setopt_array(
            $ch,
            [
                CURLOPT_POST => true,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => [
                    'Authorization: Bearer ' . $apiKey,
                    'Content-Type: application/json'
                ],
                CURLOPT_POSTFIELDS => json_encode(
                    $payload,
                    JSON_UNESCAPED_SLASHES
                ),
                CURLOPT_CONNECTTIMEOUT => 10,
                CURLOPT_TIMEOUT => 20
            ]
        );

        $response = curl_exec($ch);
        $curlError = curl_error($ch);
        $statusCode = (int) curl_getinfo(
            $ch,
            CURLINFO_HTTP_CODE
        );

        curl_close($ch);

        if ($response === false) {
            error_log(
                'Resend request failed: ' .
                $curlError
            );

            return false;
        }

        if (
            $statusCode < 200 ||
            $statusCode >= 300
        ) {
            error_log(
                'Resend API error. HTTP ' .
                $statusCode .
                ': ' .
                $response
            );

            return false;
        }

        return true;
    }

    private function buildOtpEmail(
        string $title,
        string $description,
        string $otp,
        int $expiryMinutes
    ): string {
        $appName = htmlspecialchars(
            $this->appConfig['name'],
            ENT_QUOTES,
            'UTF-8'
        );

        $safeTitle = htmlspecialchars(
            $title,
            ENT_QUOTES,
            'UTF-8'
        );

        $safeDescription = htmlspecialchars(
            $description,
            ENT_QUOTES,
            'UTF-8'
        );

        $safeOtp = htmlspecialchars(
            $otp,
            ENT_QUOTES,
            'UTF-8'
        );

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >
    <title>{$safeTitle}</title>
</head>
<body style="
    margin:0;
    padding:0;
    background:#f6f3ee;
    font-family:Arial, Helvetica, sans-serif;
">
    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        role="presentation"
        style="
            width:100%;
            background:#f6f3ee;
            padding:40px 15px;
        "
    >
        <tr>
            <td align="center">
                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="
                        max-width:600px;
                        background:#ffffff;
                        border-radius:20px;
                        overflow:hidden;
                        box-shadow:
                            0 12px 35px
                            rgba(0,0,0,0.08);
                    "
                >
                    <tr>
                        <td
                            style="
                                background:#15120f;
                                padding:32px;
                                text-align:center;
                            "
                        >
                            <div
                                style="
                                    font-size:24px;
                                    font-weight:700;
                                    color:#e7b85d;
                                "
                            >
                                {$appName}
                            </div>

                            <div
                                style="
                                    margin-top:8px;
                                    font-size:13px;
                                    color:#cfc7bb;
                                "
                            >
                                Secure Email Verification
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td
                            style="
                                padding:38px 34px;
                                text-align:center;
                            "
                        >
                            <h1
                                style="
                                    margin:0 0 16px;
                                    font-size:25px;
                                    color:#241f1a;
                                "
                            >
                                {$safeTitle}
                            </h1>

                            <p
                                style="
                                    margin:0 auto;
                                    max-width:470px;
                                    color:#625b53;
                                    font-size:15px;
                                    line-height:1.7;
                                "
                            >
                                {$safeDescription}
                            </p>

                            <div
                                style="
                                    margin:32px auto;
                                    display:inline-block;
                                    padding:18px 32px;
                                    border-radius:14px;
                                    background:#fff8e9;
                                    border:1px solid #edca83;
                                    color:#c27b13;
                                    font-size:34px;
                                    font-weight:800;
                                    letter-spacing:9px;
                                "
                            >
                                {$safeOtp}
                            </div>

                            <p
                                style="
                                    margin:0;
                                    color:#6c645c;
                                    font-size:14px;
                                "
                            >
                                This code expires in
                                <strong>
                                    {$expiryMinutes} minute(s)
                                </strong>.
                            </p>

                            <p
                                style="
                                    margin:26px 0 0;
                                    color:#91887f;
                                    font-size:12px;
                                    line-height:1.6;
                                "
                            >
                                If you did not request this code,
                                you can safely ignore this email.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td
                            style="
                                padding:20px;
                                text-align:center;
                                background:#faf8f5;
                                color:#9a9188;
                                font-size:11px;
                            "
                        >
                            © {$appName}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;
    }
}