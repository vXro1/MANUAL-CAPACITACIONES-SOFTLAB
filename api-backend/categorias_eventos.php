<?php

// ─────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Admin-Token");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

// ─────────────────────────────────────────────────────────────
// GET — LISTAR
// ─────────────────────────────────────────────────────────────

if ($method === 'GET') {

    $rows = db()
        ->query('SELECT * FROM categorias_eventos ORDER BY nombre ASC')
        ->fetchAll();

    ok(array_map(function ($r) {
        return [
            'id'   => (string)$r['id'],
            'name' => $r['nombre'],
        ];
    }, $rows));
}

// ─────────────────────────────────────────────────────────────
// POST — CREAR
// ─────────────────────────────────────────────────────────────

if ($method === 'POST') {

    requireAdmin();

    $data = bodyJson();

    if (empty($data['nombre'])) err('El nombre es obligatorio');

    $nombre = trim($data['nombre']);

    try {
        $stmt = db()->prepare('INSERT INTO categorias_eventos (nombre) VALUES (?)');
        $stmt->execute([$nombre]);
        $newId = (int)db()->lastInsertId();
        ok(['id' => (string)$newId, 'name' => $nombre], 201);
    } catch (PDOException $e) {
        // Código 23000 = Duplicate entry (UNIQUE KEY)
        if ($e->getCode() === '23000') err('La categoría ya existe', 409);
        throw $e;
    }
}

// ─────────────────────────────────────────────────────────────
// DELETE — ELIMINAR
// ─────────────────────────────────────────────────────────────

if ($method === 'DELETE') {

    requireAdmin();

    if (!$id) err('ID requerido');

    db()->prepare('DELETE FROM categorias_eventos WHERE id = ?')->execute([$id]);

    ok(['deleted' => $id]);
}

// ─────────────────────────────────────────────────────────────
// ERROR
// ─────────────────────────────────────────────────────────────

err('Método no permitido', 405);
