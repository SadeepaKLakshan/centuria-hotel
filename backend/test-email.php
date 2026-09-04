<?php

declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . '/vendor/autoload.php';

$config = require __DIR__ . '/config/config.php';

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();

    $mail->Host = $config['smtp']['host'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp']['username'];
    $mail->Password = $config['smtp']['password'];
    $mail->Port = (int)$config['smtp']['port'];

    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;

    $mail->CharSet = 'UTF-8';

    $mail->SMTPDebug = 2;

    $mail->Debugoutput = function ($message, $level) {
        echo "SMTP {$level}: {$message}\n";
    };

    $mail->setFrom(
        $config['smtp']['from_email'],
        $config['smtp']['from_name']
    );

    $mail->addAddress(
        $config['smtp']['username'],
        'Centuria Test'
    );

    $otp = (string)random_int(100000, 999999);

    $mail->isHTML(true);

    $mail->Subject = 'Centuria SMTP Test';

    $mail->Body = "
        <h2>Centuria Lake Resort</h2>
        <p>Your test OTP is:</p>
        <h1>{$otp}</h1>
    ";

    $mail->AltBody = "Centuria Test OTP: {$otp}";

    $mail->send();

    echo "\nSUCCESS: Email sent successfully.\n";

} catch (Exception $e) {
    echo "\nPHPMailer ERROR:\n";
    echo $mail->ErrorInfo . "\n";

} catch (Throwable $e) {
    echo "\nPHP ERROR:\n";
    echo $e->getMessage() . "\n";
}