<?php

// ─────────────────────────────────────────────────────────────
// CONFIG + CORS
// ─────────────────────────────────────────────────────────────

require_once __DIR__ . '/config.php';

cors();

global $ALLOWED_IMG;

$method = $_SERVER['REQUEST_METHOD'];

$id = isset($_GET['id'])
    ? (int)$_GET['id']
    : null;

// ─────────────────────────────────────────────────────────────
// MIGRACIÓN: hero_order y join_order
// Se ejecuta una vez; seguro si las columnas ya existen.
// ─────────────────────────────────────────────────────────────

function ensure_columns() {
    try {
        $existing = array_column(
            db()->query("SHOW COLUMNS FROM galeria")->fetchAll(),
            'Field'
        );
        if (!in_array('hero_order', $existing)) {
            db()->exec("ALTER TABLE galeria ADD COLUMN hero_order TINYINT UNSIGNED NULL DEFAULT NULL");
        }
        if (!in_array('join_order', $existing)) {
            db()->exec("ALTER TABLE galeria ADD COLUMN join_order TINYINT UNSIGNED NULL DEFAULT NULL");
        }
    } catch (Throwable $e) {
        // Silencioso: la tabla puede no existir aún en primer arranque
    }
}

ensure_columns();

// ─────────────────────────────────────────────────────────────
// NORMALIZAR IMAGEN
// ─────────────────────────────────────────────────────────────

function parseImagen($row) {
    $row['id']       = (string)$row['id'];
    $row['destacada'] = (bool)$row['destacada'];
    $row['src']       = $row['imagen_path'];
    $row['title']     = $row['titulo'] ?? '';
    $row['featured']  = $row['destacada'];
    $row['uploadedAt'] = $row['subido_en'];

    // Secciones: null = no asignada; 1-N = posición dentro de la sección
    $ho = $row['hero_order'] ?? null;
    $jo = $row['join_order'] ?? null;
    $row['heroOrder'] = ($ho !== null) ? (int)$ho : null;
    $row['joinOrder'] = ($jo !== null) ? (int)$jo : null;

    return $row;
}

// ─────────────────────────────────────────────────────────────
// GET
// ─────────────────────────────────────────────────────────────

if ($method === 'GET') {

    $soloDestacadas = isset($_GET['featured']);
    $section        = $_GET['section'] ?? null;

    // Una imagen por ID
    if ($id) {
        $stmt = db()->prepare('SELECT * FROM galeria WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) err('Imagen no encontrada', 404);
        ok(parseImagen($row));
    }

    // Carrusel principal (Hero) — hasta 5 imágenes ordenadas por hero_order
    if ($section === 'hero') {
        $rows = db()
            ->query('SELECT * FROM galeria WHERE hero_order IS NOT NULL ORDER BY hero_order ASC LIMIT 5')
            ->fetchAll();
        ok(array_map('parseImagen', $rows));
    }

    // Sección "Por qué unirse" — hasta 6 imágenes ordenadas por join_order
    if ($section === 'join') {
        $rows = db()
            ->query('SELECT * FROM galeria WHERE join_order IS NOT NULL ORDER BY join_order ASC LIMIT 6')
            ->fetchAll();
        ok(array_map('parseImagen', $rows));
    }

    // Todas (o solo destacadas — retrocompatibilidad)
    $sql = $soloDestacadas
        ? 'SELECT * FROM galeria WHERE destacada = 1 ORDER BY subido_en DESC'
        : 'SELECT * FROM galeria ORDER BY subido_en DESC';

    ok(array_map('parseImagen', db()->query($sql)->fetchAll()));
}

// ─────────────────────────────────────────────────────────────
// POST — SUBIR IMAGEN
// ─────────────────────────────────────────────────────────────

if ($method === 'POST') {

    requireAdmin();

    $data = json_decode($_POST['data'] ?? '{}', true) ?? [];

    $imgUrl = uploadFile('imagen', 'galeria', $ALLOWED_IMG, MAX_IMG);
    if (!$imgUrl) err('Se requiere una imagen');

    $stmt = db()->prepare('
        INSERT INTO galeria (titulo, imagen_path, destacada)
        VALUES (?, ?, ?)
    ');

    $stmt->execute([
        $data['title']    ?? $data['titulo']   ?? null,
        $imgUrl,
        (int)!empty($data['featured'] ?? $data['destacada'] ?? null),
    ]);

    $newId = (int)db()->lastInsertId();
    $row   = db()->query("SELECT * FROM galeria WHERE id = {$newId}")->fetch();

    ok(parseImagen($row), 201);
}

// ─────────────────────────────────────────────────────────────
// PUT — ACTUALIZAR (toggle destacada, orden de sección, título)
// ─────────────────────────────────────────────────────────────

if ($method === 'PUT') {

    requireAdmin();

    if (!$id) err('ID requerido');

    $stmt = db()->prepare('SELECT * FROM galeria WHERE id = ?');
    $stmt->execute([$id]);
    $old = $stmt->fetch();
    if (!$old) err('Imagen no encontrada', 404);

    $data = bodyJson();

    if (isset($data['toggle_featured'])) {
        // Toggle rápido de destacada
        db()->prepare('UPDATE galeria SET destacada = NOT destacada WHERE id = ?')
            ->execute([$id]);

    } else {
        // Actualización de campos individuales
        $sets   = [];
        $params = [];

        if (array_key_exists('titulo', $data) || array_key_exists('title', $data)) {
            $sets[]   = 'titulo = ?';
            $params[] = $data['title'] ?? $data['titulo'] ?? $old['titulo'];
        }

        if (array_key_exists('featured', $data) || array_key_exists('destacada', $data)) {
            $sets[]   = 'destacada = ?';
            $params[] = (int)(bool)($data['featured'] ?? $data['destacada']);
        }

        // hero_order: null = quitar de hero; 1-5 = posición
        if (array_key_exists('hero_order', $data)) {
            $sets[]   = 'hero_order = ?';
            $val      = $data['hero_order'];
            $params[] = ($val === null) ? null : max(1, min(5, (int)$val));
        }

        // join_order: null = quitar de "Por qué unirse"; 1-6 = posición
        if (array_key_exists('join_order', $data)) {
            $sets[]   = 'join_order = ?';
            $val      = $data['join_order'];
            $params[] = ($val === null) ? null : max(1, min(6, (int)$val));
        }

        // Retrocompatibilidad: si no se envía ningún campo conocido, actualiza título/destacada
        if (empty($sets)) {
            $sets     = ['titulo = ?', 'destacada = ?'];
            $params   = [
                $data['title'] ?? $data['titulo'] ?? $old['titulo'],
                (int)(bool)($data['featured'] ?? $data['destacada'] ?? $old['destacada']),
            ];
        }

        $params[] = $id;
        db()->prepare('UPDATE galeria SET ' . implode(', ', $sets) . ' WHERE id = ?')
            ->execute($params);
    }

    $row = db()->query("SELECT * FROM galeria WHERE id = {$id}")->fetch();
    ok(parseImagen($row));
}

// ─────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────

if ($method === 'DELETE') {

    requireAdmin();

    if (!$id) err('ID requerido');

    $stmt = db()->prepare('SELECT imagen_path FROM galeria WHERE id = ?');
    $stmt->execute([$id]);
    $old = $stmt->fetch();

    if ($old) removeFile($old['imagen_path']);

    db()->prepare('DELETE FROM galeria WHERE id = ?')->execute([$id]);

    ok(['deleted' => $id]);
}

// ─────────────────────────────────────────────────────────────
// ERROR
// ─────────────────────────────────────────────────────────────

err('Método no permitido', 405);
