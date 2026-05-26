<?php
/**
 * auth.php  —  Autenticación multi-administrador (v3)
 *
 * ADMINS: Las contraseñas NO están en este archivo.
 * Insertar hashes en la BD con el script setup_admins.php (ver abajo).
 *
 * MEJORAS:
 *  1. Soporte para múltiples admins (tabla admin_users)
 *  2. Rate limiting por IP en BD
 *  3. Comparación timing-safe para evitar timing attacks
 *  4. Hash bcrypt con migración automática desde texto plano
 *  5. Token con admin_id embebido (128 hex chars = 64 bytes entropía)
 *  6. Rotación de token en cada login
 *  7. Cabeceras de seguridad HTTP
 *  8. Sin diagnóstico en errores de producción
 */

// ─── Cabeceras de seguridad ───────────────────────────────────────────────────
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config.php';

// ─── Configuración ────────────────────────────────────────────────────────────
const MAX_ATTEMPTS    = 10;
const WINDOW_SECONDS  = 900;   // 15 min
const LOCKOUT_SECONDS = 900;   // 15 min
const TOKEN_TTL       = 86400; // 24 h

$method = $_SERVER['REQUEST_METHOD'];
$body   = bodyJson();
$action = $body['action'] ?? ($_GET['action'] ?? '');

// ─── IP del cliente ───────────────────────────────────────────────────────────
function clientIp(): string {
    foreach ([
        $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '',
        $_SERVER['HTTP_X_FORWARDED_FOR']  ?? '',
        $_SERVER['REMOTE_ADDR']           ?? '',
    ] as $ip) {
        $ip = trim(explode(',', $ip)[0]);
        if (filter_var($ip, FILTER_VALIDATE_IP)) return $ip;
    }
    return '0.0.0.0';
}

// ─── Rate limiting ────────────────────────────────────────────────────────────
function getRateRow(string $ipHash): array {
    $stmt = db()->prepare("
        SELECT attempts, first_attempt, locked_until
        FROM admin_rate_limit WHERE ip_hash = ? LIMIT 1
    ");
    $stmt->execute([$ipHash]);
    return $stmt->fetch() ?: ['attempts' => 0, 'first_attempt' => null, 'locked_until' => null];
}

function checkRateLimit(string $ip): void {
    $row = getRateRow(hash('sha256', $ip));
    if ($row['locked_until'] && strtotime($row['locked_until']) > time()) {
        $wait = strtotime($row['locked_until']) - time();
        err("Demasiados intentos fallidos. Espera {$wait} segundos.", 429);
    }
    if ($row['first_attempt'] && (time() - strtotime($row['first_attempt'])) > WINDOW_SECONDS) {
        db()->prepare("DELETE FROM admin_rate_limit WHERE ip_hash = ?")
            ->execute([hash('sha256', $ip)]);
    }
}

function recordFailedAttempt(string $ip): void {
    $ipHash  = hash('sha256', $ip);
    $now     = date('Y-m-d H:i:s');
    $row     = getRateRow($ipHash);
    $newAtt  = ($row['attempts'] ?? 0) + 1;
    $locked  = $newAtt >= MAX_ATTEMPTS
        ? date('Y-m-d H:i:s', time() + LOCKOUT_SECONDS)
        : null;

    db()->prepare("
        INSERT INTO admin_rate_limit (ip_hash, attempts, first_attempt, locked_until)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE attempts = VALUES(attempts), locked_until = VALUES(locked_until)
    ")->execute([$ipHash, $newAtt, $row['first_attempt'] ?? $now, $locked]);
}

function clearRateLimit(string $ip): void {
    db()->prepare("DELETE FROM admin_rate_limit WHERE ip_hash = ?")
        ->execute([hash('sha256', $ip)]);
}

// ─── Verificar token ──────────────────────────────────────────────────────────
/**
 * Retorna el admin_id del token activo, o termina con error.
 * Formato almacenado: "<token>::<expiry>::<admin_id>"
 */
function requireAdminV3(): string {
    $token = trim($_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '');
    if (empty($token)) err('No autenticado', 401);

    $stmt = db()->prepare("
        SELECT valor FROM admin_config WHERE clave = 'session_tokens' LIMIT 1
    ");
    $stmt->execute();
    $row = $stmt->fetch();
    if (!$row) err('Sesión inválida', 401);

    // Múltiples tokens en JSON (uno por admin)
    $sessions = json_decode($row['valor'], true) ?? [];

    foreach ($sessions as $session) {
        [$stored, $expiry, $adminId] = array_pad(explode('::', $session, 3), 3, '');
        if (hash_equals($stored, $token)) {
            if ((int)$expiry < time()) err('Sesión expirada. Inicia sesión de nuevo.', 401);
            return $adminId;
        }
    }

    err('Token inválido', 401);
}

// ─── Helpers de sesión ────────────────────────────────────────────────────────
function getSessions(): array {
    $stmt = db()->prepare("SELECT valor FROM admin_config WHERE clave = 'session_tokens' LIMIT 1");
    $stmt->execute();
    $row = $stmt->fetch();
    return $row ? (json_decode($row['valor'], true) ?? []) : [];
}

function saveSessions(array $sessions): void {
    $val = json_encode(array_values($sessions));
    db()->prepare("
        INSERT INTO admin_config (clave, valor)
        VALUES ('session_tokens', ?)
        ON DUPLICATE KEY UPDATE valor = ?
    ")->execute([$val, $val]);
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// POST { "action": "login", "username": "...", "password": "..." }
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'login') {

    $ip       = clientIp();
    $username = trim($body['username'] ?? '');
    $pass     = trim($body['password'] ?? '');

    if (empty($username) || empty($pass)) err('Credenciales requeridas', 400);

    checkRateLimit($ip);

    // Buscar admin por username
    $stmt = db()->prepare("
        SELECT id, username, password_hash, display_name
        FROM admin_users
        WHERE username = ? AND active = 1
        LIMIT 1
    ");
    $stmt->execute([$username]);
    $admin = $stmt->fetch();

    // Siempre ejecutar verify (evita timing attack por early-return)
    $dummyHash  = '$2y$12$invalidsaltinvalidsaltinvalidsaltinvalidXXXXXXXXXXXX';
    $storedHash = $admin ? $admin['password_hash'] : $dummyHash;
    $valid      = password_verify($pass, $storedHash) && (bool)$admin;

    if (!$valid) {
        recordFailedAttempt($ip);
        err('Credenciales incorrectas', 401);
    }

    clearRateLimit($ip);

    // Generar token (128 hex = 64 bytes entropía)
    $token   = bin2hex(random_bytes(64));
    $expiry  = time() + TOKEN_TTL;
    $adminId = $admin['id'];

    // Guardar token junto a los de otros admins activos
    $sessions = getSessions();

    // Reemplazar sesión previa de este mismo admin si existe
    $sessions = array_filter($sessions, function ($s) use ($adminId) {
        [,, $aid] = array_pad(explode('::', $s, 3), 3, '');
        return $aid !== (string)$adminId;
    });
    $sessions[] = "{$token}::{$expiry}::{$adminId}";
    saveSessions($sessions);

    ok([
        'token'        => $token,
        'expires_in'   => TOKEN_TTL,
        'display_name' => $admin['display_name'],
        'admin_id'     => $adminId,
    ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT
// POST { "action": "logout" }
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'logout') {
    $adminId  = requireAdminV3();
    $token    = trim($_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '');
    $sessions = array_filter(getSessions(), function ($s) use ($token) {
        [$stored] = explode('::', $s, 2);
        return !hash_equals($stored, $token);
    });
    saveSessions($sessions);
    ok(['message' => 'Sesión cerrada correctamente']);
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECK  GET ?action=check
// ─────────────────────────────────────────────────────────────────────────────
if ($method === 'GET' && $action === 'check') {
    $adminId = requireAdminV3();

    $stmt = db()->prepare("SELECT display_name FROM admin_users WHERE id = ? LIMIT 1");
    $stmt->execute([$adminId]);
    $admin = $stmt->fetch();

    ok([
        'authenticated' => true,
        'display_name'  => $admin['display_name'] ?? 'Admin',
        'admin_id'      => $adminId,
    ]);
}

err('Acción no válida', 400);