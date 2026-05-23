<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Admin-Token");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

$body = bodyJson();

$action = $body['action']
    ?? ($_GET['action'] ?? '');

// ─────────────────────────────────────────────────────────────
// LOGIN
// POST /api/auth.php
// {
//   "action": "login",
//   "password": "..."
// }
// ─────────────────────────────────────────────────────────────

if ($method === 'POST' && $action === 'login') {

    $pass = trim(
        $body['password'] ?? ''
    );

    if (empty($pass)) {
        err('Contraseña requerida');
    }

    $stmt = db()->prepare("
        SELECT valor
        FROM admin_config
        WHERE clave = 'admin_password'
        LIMIT 1
    ");

    $stmt->execute();

    $row = $stmt->fetch();

    if (!$row) {
        err('Administrador no configurado', 500);
    }

    // Verificar contraseña
    // RECOMENDADO:
    // guardar hash con password_hash()

    $storedPassword = $row['valor'];

    // Compatibilidad temporal
    $valid = password_verify($pass, $storedPassword)
        || $pass === $storedPassword;

    if (!$valid) {
        err('Contraseña incorrecta', 401);
    }

    // ─────────────────────────────────────────
    // Generar token seguro
    // ─────────────────────────────────────────

    $token = bin2hex(
        random_bytes(32)
    );

    $expiry = time() + 86400; // 24h

    $val = $token . '::' . $expiry;

    $stmt = db()->prepare("
        INSERT INTO admin_config (clave, valor)
        VALUES ('session_token', ?)
        ON DUPLICATE KEY UPDATE valor = ?
    ");

    $stmt->execute([
        $val,
        $val
    ]);

    ok([
        'token' => $token,
        'expires_in' => 86400
    ]);
}

// ─────────────────────────────────────────────────────────────
// LOGOUT
// POST /api/auth.php
// {
//   "action": "logout"
// }
// ─────────────────────────────────────────────────────────────

if ($method === 'POST' && $action === 'logout') {

    requireAdmin();

    db()->exec("
        DELETE FROM admin_config
        WHERE clave = 'session_token'
    ");

    ok([
        'message' => 'Sesión cerrada correctamente'
    ]);
}

// ─────────────────────────────────────────────────────────────
// CHECK SESSION
// GET /api/auth.php?action=check
// ─────────────────────────────────────────────────────────────

if ($method === 'GET' && $action === 'check') {

    requireAdmin();

    ok([
        'authenticated' => true
    ]);
}

// ─────────────────────────────────────────────────────────────
// ERROR
// ─────────────────────────────────────────────────────────────

err('Acción no válida', 400);