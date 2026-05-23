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

global $ALLOWED_IMG, $ALLOWED_PDF;

$method = $_SERVER['REQUEST_METHOD'];

// PHP no parsea $_POST/$_FILES en PUT multipart; soporte _method override
if ($method === 'POST' && isset($_GET['_method'])) {
    $method = strtoupper($_GET['_method']);
}

$id = isset($_GET['id'])
    ? (int)$_GET['id']
    : null;

// ─────────────────────────────────────────────────────────────
// NORMALIZAR MANUAL
// ─────────────────────────────────────────────────────────────

function parseManual($row) {

    $row['id'] = (string)$row['id'];

    $row['destacado'] = (bool)$row['destacado'];

    $row['autor_ids'] = json_decode(
        $row['autor_ids'] ?? '[]',
        true
    );

    $row['galeria_evidencias'] = json_decode(
        $row['galeria_evidencias'] ?? '[]',
        true
    );

    $extra = json_decode($row['datos_extra'] ?? '{}', true) ?? [];
    $row['subtitle']      = $extra['subtitle']      ?? null;
    $row['introduction']  = $extra['introduction']  ?? null;
    $row['time']          = $extra['time']          ?? null;
    $row['duration']      = $extra['duration']      ?? null;
    $row['speakerId']     = $extra['speakerId']     ?? null;
    $row['speakerIds']    = $extra['speakerIds']    ?? ($extra['speakerId'] ? [$extra['speakerId']] : []);
    $row['institution']   = $extra['institution']   ?? null;
    $row['cover']         = $extra['cover']         ?? null;
    $row['objectives']    = $extra['objectives']    ?? [];
    $row['auxiliaresIds'] = $extra['auxiliaresIds'] ?? [];

    return $row;
}

// ─────────────────────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────────────────────

if ($method === 'GET') {

    // Obtener uno
    if ($id) {

        $stmt = db()->prepare(
            'SELECT * FROM manuales WHERE id = ?'
        );

        $stmt->execute([$id]);

        $row = $stmt->fetch();

        if (!$row) {
            err('Manual no encontrado', 404);
        }

        ok(parseManual($row));
    }

    // Obtener todos
    $rows = db()
        ->query('SELECT * FROM manuales ORDER BY creado_en DESC')
        ->fetchAll();

    ok(array_map('parseManual', $rows));
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

    $pdfUrl = uploadFile(
        'pdf',
        'pdfs',
        $ALLOWED_PDF,
        MAX_PDF
    );

    $imgUrl = uploadFile(
        'imagen',
        'portadas',
        $ALLOWED_IMG,
        MAX_IMG
    );

    $datos_extra = json_encode([
        'subtitle'      => $data['subtitle']      ?? null,
        'introduction'  => $data['introduction']  ?? null,
        'time'          => $data['time']          ?? null,
        'duration'      => $data['duration']      ?? null,
        'speakerId'     => $data['speakerId']     ?? null,
        'speakerIds'    => $data['speakerIds']    ?? ($data['speakerId'] ? [$data['speakerId']] : []),
        'institution'   => $data['institution']   ?? null,
        'cover'         => $data['cover']         ?? null,
        'objectives'    => $data['objectives']    ?? [],
        'auxiliaresIds' => $data['auxiliaresIds'] ?? [],
    ], JSON_UNESCAPED_UNICODE);

    $stmt = db()->prepare('
        INSERT INTO manuales (
            titulo,
            categoria,
            descripcion,
            autor_ids,
            fecha,
            destacado,
            pdf_path,
            imagen_portada,
            galeria_evidencias,
            datos_extra
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');

    $stmt->execute([

        $data['titulo']
            ?? '',

        $data['categoria']
            ?? null,

        $data['descripcion']
            ?? null,

        json_encode(
            $data['autor_ids'] ?? [],
            JSON_UNESCAPED_UNICODE
        ),

        !empty($data['fecha'])
            ? $data['fecha']
            : null,

        (int)!empty($data['destacado']),

        $pdfUrl,

        $imgUrl,

        json_encode(
            $data['galeria_evidencias'] ?? $data['gallery'] ?? [],
            JSON_UNESCAPED_UNICODE
        ),

        $datos_extra,
    ]);

    $newId = (int)db()->lastInsertId();

    $row = db()
        ->query("SELECT * FROM manuales WHERE id = {$newId}")
        ->fetch();

    ok(parseManual($row), 201);
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
        'SELECT * FROM manuales WHERE id = ?'
    );

    $stmt->execute([$id]);

    $old = $stmt->fetch();

    if (!$old) {
        err('Manual no encontrado', 404);
    }

    // Soporta multipart o JSON
    $data = isset($_POST['data'])
        ? (json_decode($_POST['data'], true) ?? [])
        : bodyJson();

    $pdfUrl = uploadFile(
        'pdf',
        'pdfs',
        $ALLOWED_PDF,
        MAX_PDF
    );

    $imgUrl = uploadFile(
        'imagen',
        'portadas',
        $ALLOWED_IMG,
        MAX_IMG
    );

    // Eliminar archivos viejos
    if ($pdfUrl) {
        removeFile($old['pdf_path']);
    }

    if ($imgUrl) {
        removeFile($old['imagen_portada']);
    }

    $old_extra = json_decode($old['datos_extra'] ?? '{}', true) ?? [];

    $datos_extra = json_encode([
        'subtitle'      => $data['subtitle']      ?? $old_extra['subtitle']      ?? null,
        'introduction'  => $data['introduction']  ?? $old_extra['introduction']  ?? null,
        'time'          => $data['time']          ?? $old_extra['time']          ?? null,
        'duration'      => $data['duration']      ?? $old_extra['duration']      ?? null,
        'speakerId'     => $data['speakerId']     ?? $old_extra['speakerId']     ?? null,
        'speakerIds'    => $data['speakerIds']    ?? $old_extra['speakerIds']    ?? ($old_extra['speakerId'] ? [$old_extra['speakerId']] : []),
        'institution'   => $data['institution']   ?? $old_extra['institution']   ?? null,
        'cover'         => $data['cover']         ?? $old_extra['cover']         ?? null,
        'objectives'    => $data['objectives']    ?? $old_extra['objectives']    ?? [],
        'auxiliaresIds' => $data['auxiliaresIds'] ?? $old_extra['auxiliaresIds'] ?? [],
    ], JSON_UNESCAPED_UNICODE);

    $stmt = db()->prepare('
        UPDATE manuales
        SET
            titulo=?,
            categoria=?,
            descripcion=?,
            autor_ids=?,
            fecha=?,
            destacado=?,
            pdf_path=?,
            imagen_portada=?,
            galeria_evidencias=?,
            datos_extra=?
        WHERE id=?
    ');

    $stmt->execute([

        $data['titulo']
            ?? $old['titulo'],

        $data['categoria']
            ?? $old['categoria'],

        $data['descripcion']
            ?? $old['descripcion'],

        json_encode(
            $data['autor_ids']
                ?? json_decode(
                    $old['autor_ids'] ?? '[]',
                    true
                ),
            JSON_UNESCAPED_UNICODE
        ),

        !empty($data['fecha'])
            ? $data['fecha']
            : $old['fecha'],

        isset($data['destacado'])
            ? (int)(bool)$data['destacado']
            : (int)$old['destacado'],

        $pdfUrl
            ?? ($data['pdf_path'] ?? $old['pdf_path']),

        $imgUrl
            ?? ($data['imagen_portada'] ?? $old['imagen_portada']),

        json_encode(
            $data['galeria_evidencias']
                ?? $data['gallery']
                ?? json_decode(
                    $old['galeria_evidencias'] ?? '[]',
                    true
                ),
            JSON_UNESCAPED_UNICODE
        ),

        $datos_extra,

        $id
    ]);

    $row = db()
        ->query("SELECT * FROM manuales WHERE id = {$id}")
        ->fetch();

    ok(parseManual($row));
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
        'SELECT pdf_path, imagen_portada FROM manuales WHERE id = ?'
    );

    $stmt->execute([$id]);

    $old = $stmt->fetch();

    if ($old) {

        removeFile($old['pdf_path']);

        removeFile($old['imagen_portada']);
    }

    db()
        ->prepare('DELETE FROM manuales WHERE id = ?')
        ->execute([$id]);

    ok([
        'deleted' => $id
    ]);
}

// ─────────────────────────────────────────────────────────────
// ERROR
// ─────────────────────────────────────────────────────────────

err('Método no permitido', 405);