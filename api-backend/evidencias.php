<?php

// ─────────────────────────────────────────────────────────────
// CONFIG + CORS (centralizado, sin wildcard)
// ─────────────────────────────────────────────────────────────

require_once __DIR__ . '/config.php';

cors();

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
