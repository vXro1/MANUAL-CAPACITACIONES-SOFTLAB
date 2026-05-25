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
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

// ─────────────────────────────────────────────────────────────
// POST — SUBIR IMAGEN
// ─────────────────────────────────────────────────────────────

if ($method === 'POST') {

    requireAdmin();

    $eventoId = (int)($_POST['evento_id'] ?? 0);
    if (!$eventoId) err('evento_id es obligatorio');

    // Verificar que el evento existe
    $stmt = db()->prepare('SELECT id FROM eventos WHERE id = ?');
    $stmt->execute([$eventoId]);
    if (!$stmt->fetch()) err('Evento no encontrado', 404);

    $imgUrl = uploadFile('imagen', 'eventos_galeria', $ALLOWED_IMG, MAX_IMG);
    if (!$imgUrl) err('Se requiere una imagen');

    $titulo = trim($_POST['titulo'] ?? '');

    $stmt = db()->prepare(
        'INSERT INTO eventos_galeria (evento_id, imagen_path, titulo) VALUES (?, ?, ?)'
    );
    $stmt->execute([$eventoId, $imgUrl, $titulo]);

    $newId = (int)db()->lastInsertId();

    $row = db()->query("SELECT * FROM eventos_galeria WHERE id = {$newId}")->fetch();

    ok([
        'id'         => (string)$row['id'],
        'eventoId'   => (string)$row['evento_id'],
        'src'        => $row['imagen_path'],
        'title'      => $row['titulo'] ?? '',
        'uploadedAt' => $row['subido_en'],
    ], 201);
}

// ─────────────────────────────────────────────────────────────
// DELETE — ELIMINAR IMAGEN
// ─────────────────────────────────────────────────────────────

if ($method === 'DELETE') {

    requireAdmin();

    if (!$id) err('ID requerido');

    $stmt = db()->prepare('SELECT imagen_path FROM eventos_galeria WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();

    if ($row) removeFile($row['imagen_path']);

    db()->prepare('DELETE FROM eventos_galeria WHERE id = ?')->execute([$id]);

    ok(['deleted' => $id]);
}

// ─────────────────────────────────────────────────────────────
// ERROR
// ─────────────────────────────────────────────────────────────

err('Método no permitido', 405);
