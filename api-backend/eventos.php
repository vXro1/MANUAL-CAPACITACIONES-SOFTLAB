<?php

// ─────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
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

// PHP no parsea $_POST/$_FILES en PUT multipart; soporte _method override
if ($method === 'POST' && isset($_GET['_method'])) {
    $method = strtoupper($_GET['_method']);
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

// Crear tabla de relación evento-directivo si no existe aún
db()->exec('
    CREATE TABLE IF NOT EXISTS eventos_directivos (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        evento_id    INT NOT NULL,
        directivo_id INT NOT NULL,
        rol          VARCHAR(120) DEFAULT NULL,
        UNIQUE KEY uq_ev_dir (evento_id, directivo_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
');

// ─────────────────────────────────────────────────────────────
// NORMALIZAR EVENTO
// ─────────────────────────────────────────────────────────────

function parseEvento($row) {
    $row['id'] = (string)$row['id'];

    // Participantes del evento con sus roles
    $stmt = db()->prepare(
        'SELECT participante_id, rol FROM eventos_participantes WHERE evento_id = ?'
    );
    $stmt->execute([(int)$row['id']]);
    $rawParticipants = $stmt->fetchAll();

    $row['participantRoles'] = array_map(function ($r) {
        return [
            'participante_id' => (string)$r['participante_id'],
            'rol'             => $r['rol'],
        ];
    }, $rawParticipants);

    $row['participantIds'] = array_map(
        function ($r) { return (string)$r['participante_id']; },
        $rawParticipants
    );

    // Directivos del evento con sus roles
    $stmtDir = db()->prepare(
        'SELECT directivo_id, rol FROM eventos_directivos WHERE evento_id = ?'
    );
    $stmtDir->execute([(int)$row['id']]);
    $rawDirectivos = $stmtDir->fetchAll();

    $row['directivoRoles'] = array_map(function ($r) {
        return [
            'directivo_id' => (string)$r['directivo_id'],
            'rol'          => $r['rol'],
        ];
    }, $rawDirectivos);

    $row['directivoIds'] = array_map(
        function ($r) { return (string)$r['directivo_id']; },
        $rawDirectivos
    );

    // Galería del evento
    $stmt = db()->prepare(
        'SELECT id, imagen_path, titulo FROM eventos_galeria WHERE evento_id = ? ORDER BY subido_en ASC'
    );
    $stmt->execute([(int)$row['id']]);
    $row['gallery'] = array_map(
        function ($g) {
            return [
                'id'    => (string)$g['id'],
                'src'   => $g['imagen_path'],
                'title' => $g['titulo'] ?? '',
            ];
        },
        $stmt->fetchAll()
    );

    // Aliases amigables para el frontend
    $row['title']       = $row['titulo'];
    $row['description'] = $row['descripcion'] ?? '';
    $row['date']        = $row['fecha'];
    $row['category']    = $row['categoria'];
    $row['createdAt']   = $row['creado_en'];

    return $row;
}

// ─────────────────────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────────────────────

if ($method === 'GET') {

    // Obtener uno
    if ($id) {
        $stmt = db()->prepare('SELECT * FROM eventos WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) err('Evento no encontrado', 404);
        ok(parseEvento($row));
    }

    // Obtener todos
    $rows = db()
        ->query('SELECT * FROM eventos ORDER BY fecha DESC')
        ->fetchAll();

    ok(array_map('parseEvento', $rows));
}

// ─────────────────────────────────────────────────────────────
// POST — CREAR
// ─────────────────────────────────────────────────────────────

if ($method === 'POST') {

    requireAdmin();

    $data = bodyJson();

    if (empty($data['titulo'])) err('El título es obligatorio');
    if (empty($data['fecha']))  err('La fecha es obligatoria');
    if (empty($data['categoria'])) err('La categoría es obligatoria');

    $stmt = db()->prepare('
        INSERT INTO eventos (titulo, descripcion, fecha, categoria)
        VALUES (?, ?, ?, ?)
    ');

    $stmt->execute([
        trim($data['titulo']),
        trim($data['descripcion'] ?? ''),
        $data['fecha'],
        $data['categoria'],
    ]);

    $newId = (int)db()->lastInsertId();

    // Asociar participantes con roles
    if (!empty($data['participantRoles']) && is_array($data['participantRoles'])) {
        $insP = db()->prepare(
            'INSERT IGNORE INTO eventos_participantes (evento_id, participante_id, rol) VALUES (?, ?, ?)'
        );
        foreach ($data['participantRoles'] as $pr) {
            $insP->execute([$newId, (int)$pr['participante_id'], $pr['rol'] ?? null]);
        }
    } elseif (!empty($data['participantIds']) && is_array($data['participantIds'])) {
        $insP = db()->prepare(
            'INSERT IGNORE INTO eventos_participantes (evento_id, participante_id) VALUES (?, ?)'
        );
        foreach ($data['participantIds'] as $pid) {
            $insP->execute([$newId, (int)$pid]);
        }
    }

    // Asociar directivos con roles
    if (!empty($data['directivoRoles']) && is_array($data['directivoRoles'])) {
        $insD = db()->prepare(
            'INSERT IGNORE INTO eventos_directivos (evento_id, directivo_id, rol) VALUES (?, ?, ?)'
        );
        foreach ($data['directivoRoles'] as $dr) {
            if (!empty($dr['directivo_id'])) {
                $insD->execute([$newId, (int)$dr['directivo_id'], $dr['rol'] ?? null]);
            }
        }
    }

    $row = db()->query("SELECT * FROM eventos WHERE id = {$newId}")->fetch();
    ok(parseEvento($row), 201);
}

// ─────────────────────────────────────────────────────────────
// PUT — ACTUALIZAR
// ─────────────────────────────────────────────────────────────

if ($method === 'PUT') {

    requireAdmin();

    if (!$id) err('ID requerido');

    $stmt = db()->prepare('SELECT * FROM eventos WHERE id = ?');
    $stmt->execute([$id]);
    $old = $stmt->fetch();
    if (!$old) err('Evento no encontrado', 404);

    // Soporta multipart o JSON puro
    $data = isset($_POST['data'])
        ? (json_decode($_POST['data'], true) ?? [])
        : bodyJson();

    db()->prepare('
        UPDATE eventos
        SET titulo = ?, descripcion = ?, fecha = ?, categoria = ?
        WHERE id = ?
    ')->execute([
        $data['titulo']     ?? $old['titulo'],
        $data['descripcion'] ?? $old['descripcion'],
        $data['fecha']      ?? $old['fecha'],
        $data['categoria']  ?? $old['categoria'],
        $id,
    ]);

    // Reemplazar participantes si se envían
    if (isset($data['participantRoles']) && is_array($data['participantRoles'])) {
        db()->prepare(
            'DELETE FROM eventos_participantes WHERE evento_id = ?'
        )->execute([$id]);

        $insP = db()->prepare(
            'INSERT IGNORE INTO eventos_participantes (evento_id, participante_id, rol) VALUES (?, ?, ?)'
        );
        foreach ($data['participantRoles'] as $pr) {
            $insP->execute([$id, (int)$pr['participante_id'], $pr['rol'] ?? null]);
        }
    } elseif (isset($data['participantIds']) && is_array($data['participantIds'])) {
        db()->prepare(
            'DELETE FROM eventos_participantes WHERE evento_id = ?'
        )->execute([$id]);

        $insP = db()->prepare(
            'INSERT IGNORE INTO eventos_participantes (evento_id, participante_id) VALUES (?, ?)'
        );
        foreach ($data['participantIds'] as $pid) {
            $insP->execute([$id, (int)$pid]);
        }
    }

    // Reemplazar directivos si se envían
    if (isset($data['directivoRoles']) && is_array($data['directivoRoles'])) {
        db()->prepare(
            'DELETE FROM eventos_directivos WHERE evento_id = ?'
        )->execute([$id]);

        $insD = db()->prepare(
            'INSERT IGNORE INTO eventos_directivos (evento_id, directivo_id, rol) VALUES (?, ?, ?)'
        );
        foreach ($data['directivoRoles'] as $dr) {
            if (!empty($dr['directivo_id'])) {
                $insD->execute([$id, (int)$dr['directivo_id'], $dr['rol'] ?? null]);
            }
        }
    }

    $row = db()->query("SELECT * FROM eventos WHERE id = {$id}")->fetch();
    ok(parseEvento($row));
}

// ─────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────

if ($method === 'DELETE') {

    requireAdmin();

    if (!$id) err('ID requerido');

    // Eliminar archivos de la galería del servidor
    $imgs = db()->prepare(
        'SELECT imagen_path FROM eventos_galeria WHERE evento_id = ?'
    );
    $imgs->execute([$id]);
    foreach ($imgs->fetchAll() as $img) {
        removeFile($img['imagen_path']);
    }

    // Eliminar directivos del evento (sin FK cascade)
    db()->prepare('DELETE FROM eventos_directivos WHERE evento_id = ?')->execute([$id]);

    // La FK CASCADE elimina eventos_participantes y eventos_galeria automáticamente
    db()->prepare('DELETE FROM eventos WHERE id = ?')->execute([$id]);

    ok(['deleted' => $id]);
}

// ─────────────────────────────────────────────────────────────
// ERROR
// ─────────────────────────────────────────────────────────────

err('Método no permitido', 405);
