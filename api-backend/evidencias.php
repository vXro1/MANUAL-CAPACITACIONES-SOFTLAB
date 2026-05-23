<?php

// ─────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Admin-Token");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────

require_once __DIR__ . '/config.php';

global $ALLOWED_IMG;

$method = $_SERVER['REQUEST_METHOD'];

// ─────────────────────────────────────────────────────────────
// POST — Subir imagen de evidencia
// ─────────────────────────────────────────────────────────────

if ($method === 'POST') {

    requireAdmin();

    $imgUrl = uploadFile('imagen', 'evidencias', $ALLOWED_IMG, MAX_IMG);

    if (!$imgUrl) {
        err('No se recibió ninguna imagen', 400);
    }

    ok(['url' => $imgUrl]);
}

// ─────────────────────────────────────────────────────────────
// DELETE — Eliminar imagen de evidencia
// ─────────────────────────────────────────────────────────────

if ($method === 'DELETE') {

    requireAdmin();

    $data = bodyJson();
    $url  = $data['url'] ?? '';

    if ($url) {
        removeFile($url);
    }

    ok(['deleted' => true]);
}

// ─────────────────────────────────────────────────────────────
// ERROR
// ─────────────────────────────────────────────────────────────

err('Método no permitido', 405);
