<?php

// ─────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Admin-Token");

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

// PHP no parsea $_POST/$_FILES en PUT multipart; soporte _method override
if ($method === 'POST' && isset($_GET['_method'])) {
    $method = strtoupper($_GET['_method']);
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

// ─────────────────────────────────────────────────────────────
// PARSE PARTICIPANTE
// ─────────────────────────────────────────────────────────────

function parseParticipante($row) {

    $row['id']          = (string)$row['id'];

    $row['habilidades'] = json_decode(
        $row['habilidades'] ?? '[]',
        true
    );

    $row['semestre']    = $row['semestre'] !== null
        ? (int)$row['semestre']
        : null;

    // Compatibilidad frontend React
    $row['name']        = $row['nombre'];
    $row['photo']       = $row['foto_path'];
    $row['role']        = $row['rol'];
    $row['career']      = $row['carrera'];
    $row['skills']      = $row['habilidades'];

    return $row;
}

// ─────────────────────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────────────────────

if ($method === 'GET') {

    // Obtener uno
    if ($id) {

        $stmt = db()->prepare(
            'SELECT * FROM participantes WHERE id = ?'
        );

        $stmt->execute([$id]);

        $row = $stmt->fetch();

        if (!$row) {
            err('Participante no encontrado', 404);
        }

        ok(parseParticipante($row));
    }

    // Obtener todos
    $rows = db()
        ->query('SELECT * FROM participantes ORDER BY nombre ASC')
        ->fetchAll();

    ok(array_map('parseParticipante', $rows));
}

// ─────────────────────────────────────────────────────────────
// POST — CREAR
// ─────────────────────────────────────────────────────────────

if ($method === 'POST') {

    requireAdmin();

    $data = json_decode(
        $_POST['data'] ?? '{}',
        true
    ) ?? [];

    $fotoUrl = uploadFile(
        'foto',
        'participantes',
        $ALLOWED_IMG,
        MAX_IMG
    );

    $stmt = db()->prepare('
        INSERT INTO participantes (
            nombre,
            rol,
            carrera,
            semestre,
            bio,
            habilidades,
            linkedin,
            github,
            email,
            foto_path
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');

    $stmt->execute([

        $data['name']
            ?? $data['nombre']
            ?? '',

        $data['role']
            ?? $data['rol']
            ?? null,

        $data['career']
            ?? $data['carrera']
            ?? null,

        !empty($data['semester'])
            ? (int)$data['semester']
            : (
                !empty($data['semestre'])
                    ? (int)$data['semestre']
                    : null
            ),

        $data['bio']
            ?? null,

        json_encode(
            $data['skills']
                ?? $data['habilidades']
                ?? [],
            JSON_UNESCAPED_UNICODE
        ),

        $data['linkedin']
            ?? null,

        $data['github']
            ?? null,

        $data['email']
            ?? null,

        $fotoUrl
    ]);

    $newId = (int)db()->lastInsertId();

    $row = db()
        ->query("SELECT * FROM participantes WHERE id = {$newId}")
        ->fetch();

    ok(parseParticipante($row), 201);
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
        'SELECT * FROM participantes WHERE id = ?'
    );

    $stmt->execute([$id]);

    $old = $stmt->fetch();

    if (!$old) {
        err('Participante no encontrado', 404);
    }

    $data = isset($_POST['data'])
        ? (json_decode($_POST['data'], true) ?? [])
        : bodyJson();

    $fotoUrl = uploadFile(
        'foto',
        'participantes',
        $ALLOWED_IMG,
        MAX_IMG
    );

    if ($fotoUrl) {
        removeFile($old['foto_path']);
    }

    $stmt = db()->prepare('
        UPDATE participantes
        SET
            nombre=?,
            rol=?,
            carrera=?,
            semestre=?,
            bio=?,
            habilidades=?,
            linkedin=?,
            github=?,
            email=?,
            foto_path=?
        WHERE id=?
    ');

    $semestre = $data['semester']
        ?? $data['semestre']
        ?? null;

    $stmt->execute([

        $data['name']
            ?? $data['nombre']
            ?? $old['nombre'],

        $data['role']
            ?? $data['rol']
            ?? $old['rol'],

        $data['career']
            ?? $data['carrera']
            ?? $old['carrera'],

        $semestre !== null
            ? (int)$semestre
            : $old['semestre'],

        $data['bio']
            ?? $old['bio'],

        json_encode(
            $data['skills']
                ?? $data['habilidades']
                ?? json_decode(
                    $old['habilidades'] ?? '[]',
                    true
                ),
            JSON_UNESCAPED_UNICODE
        ),

        $data['linkedin']
            ?? $old['linkedin'],

        $data['github']
            ?? $old['github'],

        $data['email']
            ?? $old['email'],

        $fotoUrl
            ?? ($data['foto_path'] ?? $old['foto_path']),

        $id
    ]);

    $row = db()
        ->query("SELECT * FROM participantes WHERE id = {$id}")
        ->fetch();

    ok(parseParticipante($row));
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
        'SELECT foto_path FROM participantes WHERE id = ?'
    );

    $stmt->execute([$id]);

    $old = $stmt->fetch();

    if ($old) {
        removeFile($old['foto_path']);
    }

    db()
        ->prepare('DELETE FROM participantes WHERE id = ?')
        ->execute([$id]);

    ok([
        'deleted' => $id
    ]);
}

// ─────────────────────────────────────────────────────────────
// ERROR
// ─────────────────────────────────────────────────────────────

err('Método no permitido', 405);