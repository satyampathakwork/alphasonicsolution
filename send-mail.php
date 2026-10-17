<?php
/**
 * Alphasonic Solution - Contact & Blueprint Intake Mailer
 * 
 * Securely processes incoming client inquiries and dispatches
 * detailed notifications to anil.personal.me@gmail.com
 * 
 * Supports both:
 * 1. Direct Authenticated SMTP (Gmail, cPanel, Webmail, Brevo)
 * 2. Native PHP mail() for live web hosting (cPanel, Hostinger, Nginx/Apache)
 */

// Set JSON headers for API/AJAX requests
header('X-Content-Type-Options: nosniff');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'success' => false,
        'message' => 'Method Not Allowed. Please submit the form via POST.'
    ]);
    exit;
}

// -------------------------------------------------------------
// 1. RECIPIENT & SMTP CONFIGURATION
// -------------------------------------------------------------
$toEmail = 'contact@alphasonicsolution.com';
$toName  = 'Alphasonic Solution Team';
$ccEmail = 'anil.personal.me@gmail.com';

$smtpConfig = [
    'enabled'    => true,
    'host'       => 'smtp.gmail.com',
    'port'       => 465,
    'secure'     => 'ssl',
    'username'   => 'anil.all.db.backup@gmail.com',
    'password'   => '',
    'from_email' => 'anil.all.db.backup@gmail.com',
    'from_name'  => 'Alphasonic Solution Intake'
];

// Load local private credentials if available (protected by .gitignore)
if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
}

// -------------------------------------------------------------
// 3. ANTI-SPAM HONEYPOT CHECK
// -------------------------------------------------------------
// If the hidden field has been filled, it's an automated bot
if (!empty($_POST['_gotcha'])) {
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for your submission!'
    ]);
    exit;
}

// -------------------------------------------------------------
// 4. SANITIZATION & EXTRACTION
// -------------------------------------------------------------
function cleanInput($data) {
    if (is_array($data)) return '';
    $data = trim($data);
    $data = stripslashes($data);
    return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
}

// Strip newline characters to prevent email header injection
function sanitizeHeader($str) {
    return preg_replace('/[\r\n]+/', ' ', trim($str));
}

$bizName        = cleanInput($_POST['biz_name'] ?? '');
$contactPerson  = cleanInput($_POST['contact_person'] ?? '');
$rawEmail       = trim($_POST['email'] ?? '');
$phone          = cleanInput($_POST['phone'] ?? 'Not provided');
$primaryGoalKey = cleanInput($_POST['primary_goal'] ?? '');
$notes          = cleanInput($_POST['notes'] ?? 'None provided');

// Validate email
if (empty($rawEmail) || !filter_var($rawEmail, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'success' => false,
        'message' => 'Please provide a valid work email address.'
    ]);
    exit;
}

$email = filter_var($rawEmail, FILTER_SANITIZE_EMAIL);

// Validate required fields
if (empty($bizName) || empty($contactPerson)) {
    http_response_code(400);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'success' => false,
        'message' => 'Please complete all required fields (Business Name, Your Name, Email).'
    ]);
    exit;
}

// Map goal key to friendly label
$goalLabels = [
    'website'    => 'Launch or Redesign a High-Converting Website / Store',
    'local'      => 'Get to #1 on Google Maps & Local Search (Local SEO)',
    'automation' => 'Automate Bookings, WhatsApp Alerts & Invoices',
    'ads'        => 'Run Profitable Meta / Google Ad Campaigns',
    'custom'     => 'Custom Web App, Client Portal or Dashboard',
    'full'       => 'Complete Digital Overhaul & Strategic Advisory'
];
$goalText = $goalLabels[$primaryGoalKey] ?? ($primaryGoalKey ?: 'General Strategic Inquiry');

// Clean phone for WhatsApp quick link
$cleanPhoneDigits = preg_replace('/[^0-9]/', '', $phone);
$whatsappUrl = !empty($cleanPhoneDigits) ? 'https://wa.me/' . $cleanPhoneDigits : '';

// -------------------------------------------------------------
// 5. METADATA
// -------------------------------------------------------------
$clientIp   = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
$timestamp  = date('D, d M Y H:i:s T');

// -------------------------------------------------------------
// 6. EMAIL COMPOSITION (SIMPLE CLEAN TEXT FOR INBOX DELIVERABILITY)
// -------------------------------------------------------------
$subject = sanitizeHeader("New Inquiry: {$contactPerson} - {$bizName}");

// Clean Plain Text Body (Zero spam triggers, maximum deliverability)
$textBody = "Hi Alphasonic Team,\n\n"
          . "You have received a new consultation inquiry from Alphasonic Solution website:\n\n"
          . "==================================================\n"
          . "CLIENT INQUIRY DETAILS\n"
          . "==================================================\n"
          . "Business Name:  {$bizName}\n"
          . "Contact Person: {$contactPerson}\n"
          . "Email Address:  {$email}\n"
          . "Phone / Mobile: {$phone}" . (!empty($whatsappUrl) ? " (WhatsApp: {$whatsappUrl})" : "") . "\n"
          . "Primary Goal:   {$goalText}\n\n"
          . "==================================================\n"
          . "BUSINESS NOTES & BOTTLENECKS\n"
          . "==================================================\n"
          . "{$notes}\n\n"
          . "--------------------------------------------------\n"
          . "Submitted: {$timestamp}\n"
          . "Client IP: {$clientIp}\n"
          . "--------------------------------------------------\n\n"
          . "Reply directly to this email to contact {$contactPerson} ({$email}).\n";

// -------------------------------------------------------------
// 7. DISPATCH LOGIC (SMTP OR PHP MAIL)
// -------------------------------------------------------------

/**
 * Pure PHP SMTP Client Function (Supports SSL on 465 and TLS on 587)
 */
function sendViaSmtp($config, $to, $subject, $textBody, $replyToEmail, $replyToName, $cc = '') {
    $timeout = 15;
    $hostPrefix = ($config['secure'] === 'ssl' ? 'ssl://' : '');
    $socket = @fsockopen($hostPrefix . $config['host'], $config['port'], $errno, $errstr, $timeout);
    
    if (!$socket) {
        return ['success' => false, 'error' => "Cannot connect to SMTP server: {$errstr} ({$errno})"];
    }

    $read = function() use ($socket) {
        $response = '';
        while ($line = fgets($socket, 515)) {
            $response .= $line;
            if (substr($line, 3, 1) === ' ') break;
        }
        return $response;
    };

    $write = function($cmd) use ($socket) {
        fputs($socket, $cmd . "\r\n");
    };

    $greeting = $read();
    if (substr($greeting, 0, 3) !== '220') {
        fclose($socket);
        return ['success' => false, 'error' => "SMTP greeting failed: {$greeting}"];
    }

    $write("EHLO " . ($_SERVER['SERVER_NAME'] ?? 'localhost'));
    $ehlo = $read();

    if ($config['secure'] === 'tls') {
        $write("STARTTLS");
        $tls = $read();
        if (substr($tls, 0, 3) !== '220') {
            fclose($socket);
            return ['success' => false, 'error' => "STARTTLS failed: {$tls}"];
        }
        stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
        $write("EHLO " . ($_SERVER['SERVER_NAME'] ?? 'localhost'));
        $read();
    }

    // Authenticate
    $write("AUTH LOGIN");
    $authResp = $read();
    if (substr($authResp, 0, 3) !== '334') {
        fclose($socket);
        return ['success' => false, 'error' => "AUTH LOGIN rejected: {$authResp}"];
    }

    $write(base64_encode($config['username']));
    $userResp = $read();
    if (substr($userResp, 0, 3) !== '334') {
        fclose($socket);
        return ['success' => false, 'error' => "Username rejected: {$userResp}"];
    }

    $write(base64_encode($config['password']));
    $passResp = $read();
    if (substr($passResp, 0, 3) !== '235') {
        fclose($socket);
        return ['success' => false, 'error' => "Password rejected: {$passResp}"];
    }

    // Envelope
    $write("MAIL FROM: <" . $config['from_email'] . ">");
    $mailFromResp = $read();
    if (substr($mailFromResp, 0, 3) !== '250') {
        fclose($socket);
        return ['success' => false, 'error' => "MAIL FROM rejected: {$mailFromResp}"];
    }

    $write("RCPT TO: <{$to}>");
    $rcptResp = $read();
    if (substr($rcptResp, 0, 3) !== '250' && substr($rcptResp, 0, 3) !== '251') {
        fclose($socket);
        return ['success' => false, 'error' => "RCPT TO rejected: {$rcptResp}"];
    }

    if (!empty($cc)) {
        $write("RCPT TO: <{$cc}>");
        $read();
    }

    $write("DATA");
    $dataResp = $read();
    if (substr($dataResp, 0, 3) !== '354') {
        fclose($socket);
        return ['success' => false, 'error' => "DATA command rejected: {$dataResp}"];
    }

    // Message payload (RFC 5322 formatted for highest inbox deliverability)
    $messageId = '<' . time() . '.' . bin2hex(random_bytes(6)) . '@gmail.com>';
    $date = date('r');

    $headers = [];
    $headers[] = "Date: {$date}";
    $headers[] = "From: \"" . $config['from_name'] . "\" <" . $config['from_email'] . ">";
    $headers[] = "To: <{$to}>";
    if (!empty($cc)) {
        $headers[] = "Cc: <{$cc}>";
    }
    $headers[] = "Reply-To: \"{$replyToName}\" <{$replyToEmail}>";
    $headers[] = "Subject: {$subject}";
    $headers[] = "Message-ID: {$messageId}";
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Content-Type: text/plain; charset=UTF-8; format=flowed";
    $headers[] = "Content-Transfer-Encoding: 8bit";
    $headers[] = "X-Mailer: AlphasonicMailer/1.0";

    $messagePayload = implode("\r\n", $headers) . "\r\n\r\n" . $textBody . "\r\n.";
    $write($messagePayload);
    $sendResp = $read();

    $write("QUIT");
    fclose($socket);

    if (substr($sendResp, 0, 3) !== '250') {
        return ['success' => false, 'error' => "Sending data failed: {$sendResp}"];
    }

    return ['success' => true];
}

header('Content-Type: application/json; charset=UTF-8');

// If SMTP is enabled, send via authenticated SMTP
if (!empty($smtpConfig['enabled']) && !empty($smtpConfig['password'])) {
    $smtpResult = sendViaSmtp($smtpConfig, $toEmail, $subject, $textBody, $email, $contactPerson, $ccEmail);
    if ($smtpResult['success']) {
        echo json_encode([
            'success' => true,
            'message' => 'Your blueprint request has been sent to ' . $toEmail . ' via SMTP!'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error'   => $smtpResult['error'],
            'message' => 'SMTP Dispatch Failed: ' . $smtpResult['error']
        ]);
    }
    exit;
}

// Otherwise fallback to native PHP mail() (standard on Linux Web Hosting)
$serverHost = $_SERVER['SERVER_NAME'] ?? 'alphasonicsolution.com';
$fromEmail  = 'noreply@' . preg_replace('/^www\./', '', $serverHost);

$headers = [];
$headers[] = 'Date: ' . date('r');
$headers[] = 'From: ' . sanitizeHeader("{$smtpConfig['from_name']} <{$fromEmail}>");
$headers[] = 'Reply-To: ' . sanitizeHeader("{$contactPerson} <{$email}>");
$headers[] = 'Message-ID: <' . time() . '.' . bin2hex(random_bytes(6)) . '@' . ($serverHost ?: 'alphasonicsolution.com') . '>';
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-type: text/plain; charset=UTF-8; format=flowed';
$headers[] = 'Content-Transfer-Encoding: 8bit';
$headers[] = 'X-Mailer: AlphasonicMailer/1.0';

$headerString = implode("\r\n", $headers);

// Check if Windows localhost without mail server
$isWindowsLocalhost = (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') && in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1', 'localhost']);

$mailSent = @mail($toEmail, $subject, $textBody, $headerString);

if ($mailSent) {
    echo json_encode([
        'success' => true,
        'message' => 'Your request was dispatched successfully via server mail daemon!'
    ]);
} else {
    if ($isWindowsLocalhost) {
        http_response_code(200);
        echo json_encode([
            'success' => false,
            'is_localhost' => true,
            'message' => 'Notice: Windows localhost does not have a local mail server on port 25. To receive real emails on localhost, enable SMTP in send-mail.php with a Gmail App Password. On live Linux hosting (cPanel/Hostinger), emails will send automatically.'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Could not dispatch email through the hosting server. Please verify mail daemon or configure SMTP.'
        ]);
    }
}
exit;
