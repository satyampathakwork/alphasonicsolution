<?php
/**
 * Alphasonic Solution - Mailer Configuration Template
 * 
 * Copy this file to 'config.php' and enter your SMTP credentials.
 */

$toEmail = 'contact@alphasonicsolution.com';
$toName  = 'Alphasonic Solution Team';
$ccEmail = 'anil.personal.me@gmail.com';

$smtpConfig = [
    'enabled'    => true,
    'host'       => 'smtp.gmail.com',
    'port'       => 465,
    'secure'     => 'ssl',
    'username'   => 'your-email@gmail.com',
    'password'   => 'your-16-char-app-password',
    'from_email' => 'your-email@gmail.com',
    'from_name'  => 'Alphasonic Solution Intake'
];
