<?php

declare(strict_types=1);

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . '/../vendor/autoload.php';

class EmailService
{
    private array $smtpConfig;
    private array $appConfig;

    public function __construct()
    {
        $config = require __DIR__ . '/../config/config.php';

        if (
            !isset($config['smtp']) ||
            !is_array($config['smtp'])
        ) {
            throw new RuntimeException(
                'SMTP configuration is missing.'
            );
        }

        $this->smtpConfig = $config['smtp'];
        $this->appConfig = $config['app'] ?? [];
    }

    public function sendOtp(
        string $email,
        string $name,
        string $otp,
        string $purpose = 'register'
    ): bool {
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();

            $mail->Host =
                (string)$this->smtpConfig['host'];

            $mail->SMTPAuth = true;

            $mail->Username =
                (string)$this->smtpConfig['username'];

            $mail->Password =
                (string)$this->smtpConfig['password'];

            $mail->Port =
                (int)$this->smtpConfig['port'];

            $encryption = strtolower(
                (string)(
                    $this->smtpConfig['encryption']
                    ?? 'tls'
                )
            );

            if ($encryption === 'tls') {
                $mail->SMTPSecure =
                    PHPMailer::ENCRYPTION_STARTTLS;
            } else {
                $mail->SMTPSecure =
                    PHPMailer::ENCRYPTION_SMTPS;
            }

            $mail->CharSet = 'UTF-8';

            $mail->setFrom(
                (string)$this->smtpConfig['from_email'],
                (string)$this->smtpConfig['from_name']
            );

            $mail->addAddress(
                $email,
                $name
            );

            $mail->isHTML(true);

            $content = $this->getEmailContent(
                $purpose
            );

            $safeName = htmlspecialchars(
                $name !== '' ? $name : 'Guest',
                ENT_QUOTES,
                'UTF-8'
            );

            $safeOtp = htmlspecialchars(
                $otp,
                ENT_QUOTES,
                'UTF-8'
            );

            $safeTitle = htmlspecialchars(
                $content['title'],
                ENT_QUOTES,
                'UTF-8'
            );

            $safeSubtitle = htmlspecialchars(
                $content['subtitle'],
                ENT_QUOTES,
                'UTF-8'
            );

            $safeDescription = htmlspecialchars(
                $content['description'],
                ENT_QUOTES,
                'UTF-8'
            );

            $expirySeconds = (int)(
                $this->appConfig['otp_expiry_seconds']
                ?? 120
            );

            $expiryMinutes = max(
                1,
                (int)ceil($expirySeconds / 60)
            );

            $mail->Subject =
                $content['subject'];

            $mail->Body = <<<HTML
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

<body
    style="
        margin:0;
        padding:0;
        background:#f4f5f7;
        font-family:Arial,Helvetica,sans-serif;
    "
>

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    role="presentation"
    style="
        width:100%;
        background:#f4f5f7;
        padding:35px 15px;
    "
>
    <tr>
        <td align="center">

            <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                role="presentation"
                style="
                    width:100%;
                    max-width:600px;
                    background:#ffffff;
                    border-radius:22px;
                    overflow:hidden;
                    box-shadow:0 18px 50px rgba(0,0,0,0.10);
                "
            >

                <tr>
                    <td
                        align="center"
                        style="
                            padding:35px 25px 32px;
                            background:#ff6500;
                        "
                    >

                        <div
                            style="
                                width:68px;
                                height:68px;
                                line-height:68px;
                                margin:0 auto 14px;
                                border-radius:50%;
                                background:#ffffff;
                                color:#ff6500;
                                font-size:34px;
                                font-weight:900;
                                text-align:center;
                            "
                        >
                            C
                        </div>

                        <div
                            style="
                                color:#ffffff;
                                font-size:25px;
                                font-weight:900;
                                letter-spacing:3px;
                            "
                        >
                            CENTURIA
                        </div>

                        <div
                            style="
                                margin-top:6px;
                                color:#fff2e9;
                                font-size:10px;
                                font-weight:700;
                                letter-spacing:5px;
                            "
                        >
                            LAKE RESORT
                        </div>

                    </td>
                </tr>

                <tr>
                    <td
                        style="
                            padding:38px 40px 15px;
                        "
                    >

                        <div
                            style="
                                margin-bottom:10px;
                                color:#ff6500;
                                font-size:11px;
                                font-weight:800;
                                letter-spacing:2px;
                                text-transform:uppercase;
                            "
                        >
                            {$safeSubtitle}
                        </div>

                        <h1
                            style="
                                margin:0 0 20px;
                                color:#171b24;
                                font-size:28px;
                                line-height:1.25;
                            "
                        >
                            {$safeTitle}
                        </h1>

                        <p
                            style="
                                margin:0 0 14px;
                                color:#555e6d;
                                font-size:15px;
                                line-height:1.8;
                            "
                        >
                            Hello {$safeName},
                        </p>

                        <p
                            style="
                                margin:0;
                                color:#555e6d;
                                font-size:15px;
                                line-height:1.8;
                            "
                        >
                            {$safeDescription}
                        </p>

                    </td>
                </tr>

                <tr>
                    <td
                        style="
                            padding:22px 40px;
                        "
                    >

                        <div
                            style="
                                padding:28px 18px;
                                border:1px solid #ffd2b5;
                                border-radius:18px;
                                background:#fff7f2;
                                text-align:center;
                            "
                        >

                            <div
                                style="
                                    margin-bottom:14px;
                                    color:#8a8f98;
                                    font-size:11px;
                                    font-weight:800;
                                    letter-spacing:2px;
                                    text-transform:uppercase;
                                "
                            >
                                Your 6-Digit Verification Code
                            </div>

                            <div
                                style="
                                    color:#ff5a00;
                                    font-size:40px;
                                    font-weight:900;
                                    letter-spacing:10px;
                                    line-height:1.2;
                                "
                            >
                                {$safeOtp}
                            </div>

                            <div
                                style="
                                    margin-top:16px;
                                    color:#8f949d;
                                    font-size:12px;
                                "
                            >
                                This code expires in approximately
                                {$expiryMinutes} minute(s).
                            </div>

                        </div>

                    </td>
                </tr>

                <tr>
                    <td
                        style="
                            padding:5px 40px 38px;
                        "
                    >

                        <div
                            style="
                                padding:16px;
                                border-radius:13px;
                                background:#f6f7f9;
                                color:#707784;
                                font-size:12px;
                                line-height:1.7;
                            "
                        >
                            For your security, never share this
                            verification code with another person.
                            Centuria Lake Resort will never ask you
                            to send this code by email or message.
                        </div>

                        <p
                            style="
                                margin:22px 0 0;
                                color:#999fa8;
                                font-size:11px;
                                line-height:1.7;
                                text-align:center;
                            "
                        >
                            If you did not request this code,
                            you can safely ignore this email.
                        </p>

                    </td>
                </tr>

                <tr>
                    <td
                        align="center"
                        style="
                            padding:23px 20px;
                            background:#171d27;
                        "
                    >

                        <div
                            style="
                                color:#ffffff;
                                font-size:13px;
                                font-weight:700;
                            "
                        >
                            Centuria Lake Resort
                        </div>

                        <div
                            style="
                                margin-top:5px;
                                color:#9da5b1;
                                font-size:10px;
                                letter-spacing:1px;
                            "
                        >
                            Your Luxury Escape Awaits
                        </div>

                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>
HTML;

            $mail->AltBody =
                "Centuria Lake Resort\n\n" .
                "Hello {$name},\n\n" .
                $content['plain_description'] .
                "\n\nVerification code: {$otp}\n\n" .
                "This code expires in approximately " .
                "{$expiryMinutes} minute(s).\n\n" .
                "Never share this verification code with anyone.";

            $mail->send();

            return true;

        } catch (Exception $exception) {
            error_log(
                'Centuria PHPMailer error: ' .
                $mail->ErrorInfo
            );

            return false;

        } catch (Throwable $exception) {
            error_log(
                'Centuria EmailService error: ' .
                $exception->getMessage()
            );

            return false;
        }
    }

    private function getEmailContent(
        string $purpose
    ): array {
        if ($purpose === 'password_reset') {
            return [
                'subject' =>
                    'Centuria Lake Resort - Password Reset Code',

                'title' =>
                    'Reset Your Password',

                'subtitle' =>
                    'Password Reset Verification',

                'description' =>
                    'We received a request to reset your Centuria Lake Resort account password. Enter the verification code below to continue securely.',

                'plain_description' =>
                    'We received a request to reset your Centuria Lake Resort account password.'
            ];
        }

        return [
            'subject' =>
                'Centuria Lake Resort - Verify Your Email',

            'title' =>
                'Verify Your Email',

            'subtitle' =>
                'Welcome to Centuria Lake Resort',

            'description' =>
                'Thank you for creating your Centuria Lake Resort account. Enter the verification code below to complete your registration.',

            'plain_description' =>
                'Use this verification code to complete your Centuria Lake Resort account registration.'
        ];
    }
}