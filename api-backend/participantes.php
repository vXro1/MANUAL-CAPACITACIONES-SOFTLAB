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

// ─────────────────────────────────────────────────────────────
// MIGRACIÓN — columnas opcionales
// ─────────────────────────────────────────────────────────────

function ensure_columns() {
    try {
        $existing = array_column(db()->query("SHOW COLUMNS FROM participantes")->fetchAll(), 'Field');
        if (!in_array('featured', $existing)) {
            db()->exec("ALTER TABLE participantes ADD COLUMN featured TINYINT(1) NOT NULL DEFAULT 0");
        }
        if (!in_array('roles_adicionales', $existing)) {
            db()->exec("ALTER TABLE participantes ADD COLUMN roles_adicionales TEXT NULL DEFAULT NULL");
        }
        db()->exec("
            CREATE TABLE IF NOT EXISTS participante_proyectos (
                id               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
                participante_id  INT UNSIGNED  NOT NULL,
                titulo           VARCHAR(255)  NOT NULL,
                descripcion      VARCHAR(500)  NULL,
                url_link         VARCHAR(500)  NULL,
                imagen_path      VARCHAR(500)  NULL,
                creado_en        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                KEY idx_participante_id (participante_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
    } catch (Throwable $e) {}
}
ensure_columns();

$method = $_SERVER['REQUEST_METHOD'];

// PHP no parsea $_POST/$_FILES en PUT multipart; soporte _method override
if ($method === 'POST' && isset($_GET['_method'])) {
    $method = strtoupper($_GET['_method']);
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

// ─────────────────────────────────────────────────────────────
// PARSE PARTICIPANTE
// ─────────────────────────────────────────────────────────────

function parseParticipante($row, $includeActividades = false) {

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
    $row['featured']    = (bool)($row['featured'] ?? false);

    // Multi-rol: roles = [rol_principal, ...roles_adicionales]
    $primaryRole      = trim((string)($row['rol'] ?? ''));
    $addRaw           = json_decode($row['roles_adicionales'] ?? '[]', true);
    $addRoles         = is_array($addRaw) ? $addRaw : [];
    $allRoles         = array_values(array_filter(
        array_merge([$primaryRole], $addRoles),
        fn($r) => !empty(trim((string)$r))
    ));
    $row['roles']     = $allRoles;

    // Proyectos del participante
    try {
        $stmtP = db()->prepare('
            SELECT id, titulo, descripcion, url_link, imagen_path, creado_en
            FROM participante_proyectos
            WHERE participante_id = ?
            ORDER BY creado_en ASC
        ');
        $stmtP->execute([(int)$row['id']]);
        $row['proyectos'] = array_map(function ($p) {
            $p['id']   = (string)$p['id'];
            $p['tipo'] = !empty($p['url_link']) ? 'link' : 'imagen';
            return $p;
        }, $stmtP->fetchAll());
    } catch (Throwable $e) {
        $row['proyectos'] = [];
    }

    // Historial de actividades (solo se carga en peticiones individuales o cuando se solicita)
    if ($includeActividades) {
        $actividades = [];

        // Eventos en los que participó
        try {
            $stmtE = db()->prepare('
                SELECT ep.rol, e.id, e.titulo, e.fecha, e.categoria
                FROM eventos_participantes ep
                JOIN eventos e ON ep.evento_id = e.id
                WHERE ep.participante_id = ?
                ORDER BY e.fecha DESC
            ');
            $stmtE->execute([(int)$row['id']]);
            foreach ($stmtE->fetchAll() as $ev) {
                $actividades[] = [
                    'tipo'      => 'evento',
                    'id'        => (string)$ev['id'],
                    'titulo'    => $ev['titulo'],
                    'fecha'     => $ev['fecha'],
                    'categoria' => $ev['categoria'],
                    'rol'       => $ev['rol'],
                ];
            }
        } catch (Exception $e) { /* tabla no disponible */ }

        // Manuales en los que participó
        try {
            $stmtM = db()->prepare('
                SELECT mp.rol, m.id, m.titulo, m.fecha, m.categoria
                FROM manuales_participantes mp
                JOIN manuales m ON mp.manual_id = m.id
                WHERE mp.participante_id = ?
                ORDER BY m.creado_en DESC
            ');
            $stmtM->execute([(int)$row['id']]);
            foreach ($stmtM->fetchAll() as $mn) {
                $actividades[] = [
                    'tipo'      => 'manual',
                    'id'        => (string)$mn['id'],
                    'titulo'    => $mn['titulo'],
                    'fecha'     => $mn['fecha'],
                    'categoria' => $mn['categoria'],
                    'rol'       => $mn['rol'],
                ];
            }
        } catch (Exception $e) { /* tabla no disponible */ }

        $row['actividades'] = $actividades;
    } else {
        $row['actividades'] = [];
    }

    return $row;
}

// ─────────────────────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────────────────────

if ($method === 'GET') {

    // ── Todas las etiquetas de rol del sistema ──────────────────
    if (($action ?? null) === 'roles') {
        $roles = [];

        $rows = db()->query("SELECT DISTINCT rol FROM participantes WHERE rol IS NOT NULL AND rol != ''")->fetchAll();
        foreach ($rows as $r) $roles[] = trim($r['rol']);

        try {
            $rows = db()->query("SELECT roles_adicionales FROM participantes WHERE roles_adicionales IS NOT NULL AND roles_adicionales != '[]'")->fetchAll();
            foreach ($rows as $r) {
                $arr = json_decode($r['roles_adicionales'], true);
                if (is_array($arr)) foreach ($arr as $rol) if (trim((string)$rol)) $roles[] = trim($rol);
            }
        } catch (Throwable $e) {}

        try {
            $rows = db()->query("SELECT DISTINCT rol FROM eventos_participantes WHERE rol IS NOT NULL AND rol != ''")->fetchAll();
            foreach ($rows as $r) $roles[] = trim($r['rol']);
        } catch (Throwable $e) {}

        try {
            $rows = db()->query("SELECT DISTINCT rol FROM manuales_participantes WHERE rol IS NOT NULL AND rol != ''")->fetchAll();
            foreach ($rows as $r) $roles[] = trim($r['rol']);
        } catch (Throwable $e) {}

        $unique = array_values(array_unique(array_filter($roles, fn($r) => !empty($r))));
        sort($unique);
        ok($unique);
    }

    // Obtener uno (incluye historial de actividades)
    if ($id) {

        $stmt = db()->prepare(
            'SELECT * FROM participantes WHERE id = ?'
        );

        $stmt->execute([$id]);

        $row = $stmt->fetch();

        if (!$row) {
            err('Participante no encontrado', 404);
        }

        ok(parseParticipante($row, true));
    }

    // Obtener todos (sin actividades para mejor rendimiento)
    $soloDestacados = isset($_GET['featured']);
    $sql = $soloDestacados
        ? 'SELECT * FROM participantes WHERE featured = 1 ORDER BY nombre ASC'
        : 'SELECT * FROM participantes ORDER BY nombre ASC';
    $rows = db()->query($sql)->fetchAll();

    ok(array_map(function($r) { return parseParticipante($r, false); }, $rows));
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
            foto_path,
            roles_adicionales
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

        $fotoUrl,

        json_encode(
            $data['roles_adicionales'] ?? [],
            JSON_UNESCAPED_UNICODE
        ),
    ]);

    $newId = (int)db()->lastInsertId();

    $row = db()
        ->query("SELECT * FROM participantes WHERE id = {$newId}")
        ->fetch();

    ok(parseParticipante($row, true), 201);
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

    // Toggle destacado (petición JSON simple, sin FormData)
    if (!empty($data['toggle_featured'])) {
        db()->prepare('UPDATE participantes SET featured = 1 - featured WHERE id = ?')->execute([$id]);
        $row = db()->query("SELECT * FROM participantes WHERE id = {$id}")->fetch();
        ok(parseParticipante($row, false));
    }

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
            foto_path=?,
            roles_adicionales=?
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

        json_encode(
            $data['roles_adicionales']
                ?? (json_decode($old['roles_adicionales'] ?? '[]', true) ?? []),
            JSON_UNESCAPED_UNICODE
        ),

        $id
    ]);

    $row = db()
        ->query("SELECT * FROM participantes WHERE id = {$id}")
        ->fetch();

    ok(parseParticipante($row, true));
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
// PROYECTOS — CRUD  (?action=proyecto_add|proyecto_update|proyecto_delete)
// ─────────────────────────────────────────────────────────────

$action = $_GET['action'] ?? null;

if ($action === 'proyecto_add') {

    requireAdmin();

    if (!$id) err('ID de participante requerido');

    $data = json_decode($_POST['data'] ?? '{}', true) ?? [];

    $titulo      = trim($data['titulo'] ?? '');
    $descripcion = trim($data['descripcion'] ?? '') ?: null;
    $urlLink     = trim($data['url_link'] ?? '') ?: null;

    if (empty($titulo)) err('El título del proyecto es requerido');

    $imagenPath = uploadFile('imagen', 'proyectos_participantes', $ALLOWED_IMG, MAX_IMG);

    if (!$urlLink && !$imagenPath) err('Debes proporcionar un link o una imagen de evidencia');

    db()->prepare('
        INSERT INTO participante_proyectos (participante_id, titulo, descripcion, url_link, imagen_path)
        VALUES (?, ?, ?, ?, ?)
    ')->execute([$id, $titulo, $descripcion, $urlLink, $imagenPath]);

    $row = db()->query("SELECT * FROM participantes WHERE id = {$id}")->fetch();
    if (!$row) err('Participante no encontrado', 404);
    ok(parseParticipante($row, true));
}

if ($action === 'proyecto_update') {

    requireAdmin();

    $proyectoId = isset($_GET['proyecto_id']) ? (int)$_GET['proyecto_id'] : null;
    if (!$proyectoId) err('proyecto_id requerido');

    $old = db()->prepare('SELECT * FROM participante_proyectos WHERE id = ?');
    $old->execute([$proyectoId]);
    $oldProyecto = $old->fetch();
    if (!$oldProyecto) err('Proyecto no encontrado', 404);

    $data = json_decode($_POST['data'] ?? '{}', true) ?? [];

    $titulo      = trim($data['titulo'] ?? $oldProyecto['titulo']);
    $descripcion = array_key_exists('descripcion', $data)
        ? (trim($data['descripcion']) ?: null)
        : $oldProyecto['descripcion'];
    $urlLink     = array_key_exists('url_link', $data)
        ? (trim($data['url_link']) ?: null)
        : $oldProyecto['url_link'];

    $imagenPath = uploadFile('imagen', 'proyectos_participantes', $ALLOWED_IMG, MAX_IMG);
    if ($imagenPath) {
        removeFile($oldProyecto['imagen_path']);
    } else {
        $imagenPath = $oldProyecto['imagen_path'];
    }

    db()->prepare('
        UPDATE participante_proyectos
        SET titulo=?, descripcion=?, url_link=?, imagen_path=?
        WHERE id=?
    ')->execute([$titulo, $descripcion, $urlLink, $imagenPath, $proyectoId]);

    $pid = $id ?? (int)$oldProyecto['participante_id'];
    $row = db()->query("SELECT * FROM participantes WHERE id = {$pid}")->fetch();
    if (!$row) err('Participante no encontrado', 404);
    ok(parseParticipante($row, true));
}

if ($action === 'proyecto_delete') {

    requireAdmin();

    $proyectoId = isset($_GET['proyecto_id']) ? (int)$_GET['proyecto_id'] : null;
    if (!$proyectoId) err('proyecto_id requerido');

    $stmt = db()->prepare('SELECT * FROM participante_proyectos WHERE id = ?');
    $stmt->execute([$proyectoId]);
    $proyecto = $stmt->fetch();

    if ($proyecto) {
        removeFile($proyecto['imagen_path']);
        db()->prepare('DELETE FROM participante_proyectos WHERE id = ?')->execute([$proyectoId]);
    }

    ok(['deleted' => $proyectoId]);
}

// ─────────────────────────────────────────────────────────────
// ERROR
// ─────────────────────────────────────────────────────────────

err('Método no permitido', 405);