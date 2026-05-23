<?php

// ─────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Admin-Token");
header("Content-Type: application/json; charset=UTF-8");

// Responder preflight requests
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

$id = isset($_GET['id'])
    ? (int)$_GET['id']
    : null;

// ─────────────────────────────────────────────────────────────
// NORMALIZAR IMAGEN
// ─────────────────────────────────────────────────────────────

function parseImagen($row) {

    $row['id'] = (string)$row['id'];

    $row['destacada'] = (bool)$row['destacada'];

    // Compatibilidad frontend React
    $row['src'] = $row['imagen_path'];

    $row['title'] = $row['titulo'] ?? '';

    $row['featured'] = $row['destacada'];

    $row['uploadedAt'] = $row['subido_en'];

    return $row;
}

// ─────────────────────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────────────────────

if ($method === 'GET') {

    $soloDestacadas = isset($_GET['featured']);

    // Obtener una imagen
    if ($id) {

        $stmt = db()->prepare(
            'SELECT * FROM galeria WHERE id = ?'
        );

        $stmt->execute([$id]);

        $row = $stmt->fetch();

        if (!$row) {
            err('Imagen no encontrada', 404);
        }

        ok(parseImagen($row));
    }

    // Obtener todas
    $sql = $soloDestacadas
        ? 'SELECT * FROM galeria WHERE destacada = 1 ORDER BY subido_en DESC'
        : 'SELECT * FROM galeria ORDER BY subido_en DESC';

    $rows = db()
        ->query($sql)
        ->fetchAll();

    ok(array_map('parseImagen', $rows));
}

// ─────────────────────────────────────────────────────────────
// POST — SUBIR IMAGEN
// ─────────────────────────────────────────────────────────────

if ($method === 'POST') {

    requireAdmin();

    $data = json_decode(
        $_POST['data'] ?? '{}',
        true
    ) ?? [];

    $imgUrl = uploadFile(
        'imagen',
        'galeria',
        $ALLOWED_IMG,
        MAX_IMG
    );

    if (!$imgUrl) {
        err('Se requiere una imagen');
    }

    $stmt = db()->prepare('
        INSERT INTO galeria (
            titulo,
            imagen_path,
            destacada
        )
        VALUES (?, ?, ?)
    ');

    $stmt->execute([

        $data['title']
            ?? $data['titulo']
            ?? null,

        $imgUrl,

        (int)!empty(
            $data['featured']
                ?? $data['destacada']
        )
    ]);

    $newId = (int)db()->lastInsertId();

    $row = db()
        ->query("SELECT * FROM galeria WHERE id = {$newId}")
        ->fetch();

    ok(parseImagen($row), 201);
}

// ─────────────────────────────────────────────────────────────
// PUT — ACTUALIZAR
// ─────────────────────────────────────────────────────────────

if ($method === 'PUT') {

    requireAdmin();

    if (!$id) {
        err('ID requerido');
    }

    $stmt = db()->prepare(
        'SELECT * FROM galeria WHERE id = ?'
    );

    $stmt->execute([$id]);

    $old = $stmt->fetch();

    if (!$old) {
        err('Imagen no encontrada', 404);
    }

    $data = bodyJson();

    // Toggle destacada
    if (isset($data['toggle_featured'])) {

        db()
            ->prepare('
                UPDATE galeria
                SET destacada = NOT destacada
                WHERE id = ?
            ')
            ->execute([$id]);

    } else {

        $stmt = db()->prepare('
            UPDATE galeria
            SET
                titulo = ?,
                destacada = ?
            WHERE id = ?
        ');

        $titulo = $data['title']
            ?? $data['titulo']
            ?? $old['titulo'];

        $destacada = $data['featured']
            ?? $data['destacada']
            ?? $old['destacada'];

        $stmt->execute([
            $titulo,
            (int)(bool)$destacada,
            $id
        ]);
    }

    $row = db()
        ->query("SELECT * FROM galeria WHERE id = {$id}")
        ->fetch();

    ok(parseImagen($row));
}

// ─────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────

if ($method === 'DELETE') {

    requireAdmin();

    if (!$id) {
        err('ID requerido');
    }

    $stmt = db()->prepare(
        'SELECT imagen_path FROM galeria WHERE id = ?'
    );

    $stmt->execute([$id]);

    $old = $stmt->fetch();

    if ($old) {
        removeFile($old['imagen_path']);
    }

    db()
        ->prepare('DELETE FROM galeria WHERE id = ?')
        ->execute([$id]);

    ok([
        'deleted' => $id
    ]);
}

// ─────────────────────────────────────────────────────────────
// ERROR
// ─────────────────────────────────────────────────────────────

err('Método no permitido', 405);