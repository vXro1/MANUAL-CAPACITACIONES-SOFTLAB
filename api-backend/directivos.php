<?php
/**
 * directivos.php — API REST para el módulo de Personal Directivo
 * Métodos: GET, POST, PUT, DELETE
 */

require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function json_ok($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_err(string $msg, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

function get_db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    return $pdo;
}

function ensure_table(): void {
    get_db()->exec("
        CREATE TABLE IF NOT EXISTS directivos (
            id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            nombre        VARCHAR(160)  NOT NULL,
            rol           VARCHAR(160)  NOT NULL,
            profesion     VARCHAR(160)  DEFAULT '',
            facultad      VARCHAR(200)  DEFAULT '',
            descripcion   TEXT          DEFAULT '',
            highlights    TEXT          DEFAULT '',
            chips         JSON          DEFAULT '[]',
            docs          JSON          DEFAULT '[]',
            foto          MEDIUMTEXT    DEFAULT NULL,
            accent        VARCHAR(20)   DEFAULT '#1A3FAA',
            bg            VARCHAR(20)   DEFAULT '#EEF3FF',
            border_color  VARCHAR(20)   DEFAULT '#C7D5F8',
            badge         VARCHAR(80)   DEFAULT '',
            featured      TINYINT(1)    NOT NULL DEFAULT 0,
            created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
}

function normalize(array $row): array {
    return [
        'id'          => (string) $row['id'],
        'name'        => $row['nombre'],
        'role'        => $row['rol'],
        'profession'  => $row['profesion']    ?? '',
        'faculty'     => $row['facultad']     ?? '',
        'description' => $row['descripcion']  ?? '',
        'highlights'  => $row['highlights']   ?? '',
        'chips'       => json_decode($row['chips'] ?? '[]', true) ?: [],
        'docs'        => json_decode($row['docs']  ?? '[]', true) ?: [],
        'photo'       => $row['foto']         ?? null,
        'accent'      => $row['accent']       ?? '#1A3FAA',
        'bg'          => $row['bg']           ?? '#EEF3FF',
        'borderColor' => $row['border_color'] ?? '#C7D5F8',
        'border'      => $row['border_color'] ?? '#C7D5F8',
        'badge'       => $row['badge']        ?? '',
        'featured'    => (bool) $row['featured'],
        'createdAt'   => $row['created_at']   ?? '',
        'initials'    => mb_strtoupper(
            implode('', array_map(
                fn($w) => mb_substr($w, 0, 1),
                array_slice(array_filter(explode(' ', $row['nombre'])), 0, 2)
            ))
        ),
    ];
}

try {
    ensure_table();
} catch (PDOException $e) {
    json_err('Error de base de datos: ' . $e->getMessage(), 500);
}

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int) $_GET['id'] : null;
$db     = get_db();

if ($method === 'GET') {
    if ($id) {
        $stmt = $db->prepare('SELECT * FROM directivos WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_err('Directivo no encontrado', 404);
        json_ok(normalize($row));
    }
    if (isset($_GET['featured'])) {
        $stmt = $db->query('SELECT * FROM directivos WHERE featured = 1 ORDER BY created_at ASC');
        json_ok(array_map('normalize', $stmt->fetchAll()));
    }
    $stmt = $db->query('SELECT * FROM directivos ORDER BY created_at DESC');
    json_ok(array_map('normalize', $stmt->fetchAll()));
}

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) json_err('Cuerpo inválido');
    $nombre = trim($body['name'] ?? '');
    $rol    = trim($body['role'] ?? '');
    if ($nombre === '' || $rol === '') json_err('Nombre y cargo son obligatorios');
    $stmt = $db->prepare("
        INSERT INTO directivos
            (nombre, rol, profesion, facultad, descripcion, highlights,
             chips, docs, foto, accent, bg, border_color, badge, featured)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ");
    $stmt->execute([
        $nombre, $rol,
        trim($body['profession']  ?? ''),
        trim($body['faculty']     ?? ''),
        trim($body['description'] ?? ''),
        trim($body['highlights']  ?? ''),
        json_encode($body['chips'] ?? [], JSON_UNESCAPED_UNICODE),
        json_encode($body['docs']  ?? [], JSON_UNESCAPED_UNICODE),
        $body['photo']  ?? null,
        $body['accent'] ?? '#1A3FAA',
        $body['bg']     ?? '#EEF3FF',
        $body['border'] ?? $body['borderColor'] ?? '#C7D5F8',
        $body['badge']  ?? '',
        isset($body['featured']) ? (int)(bool)$body['featured'] : 0,
    ]);
    $newId = (int) $db->lastInsertId();
    $row   = $db->query("SELECT * FROM directivos WHERE id = $newId")->fetch();
    json_ok(normalize($row), 201);
}

if ($method === 'PUT') {
    if (!$id) json_err('Se requiere ?id=', 400);
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) json_err('Cuerpo inválido');
    $exists = $db->prepare('SELECT id FROM directivos WHERE id = ?');
    $exists->execute([$id]);
    if (!$exists->fetch()) json_err('Directivo no encontrado', 404);
    $map = [
        'name' => 'nombre', 'role' => 'rol', 'profession' => 'profesion',
        'faculty' => 'facultad', 'description' => 'descripcion',
        'highlights' => 'highlights', 'accent' => 'accent',
        'bg' => 'bg', 'badge' => 'badge', 'photo' => 'foto',
    ];
    $setParts = []; $params = [];
    foreach ($map as $jk => $dc) {
        if (!array_key_exists($jk, $body)) continue;
        $setParts[] = "$dc = ?";
        $params[]   = $jk === 'featured' ? (int)(bool)$body[$jk] : $body[$jk];
    }
    if (array_key_exists('featured', $body)) {
        $setParts[] = 'featured = ?';
        $params[]   = (int)(bool)$body['featured'];
    }
    if (array_key_exists('border', $body))      { $setParts[] = 'border_color = ?'; $params[] = $body['border']; }
    elseif (array_key_exists('borderColor', $body)) { $setParts[] = 'border_color = ?'; $params[] = $body['borderColor']; }
    if (array_key_exists('chips', $body)) { $setParts[] = 'chips = ?'; $params[] = json_encode($body['chips'], JSON_UNESCAPED_UNICODE); }
    if (array_key_exists('docs',  $body)) { $setParts[] = 'docs = ?';  $params[] = json_encode($body['docs'],  JSON_UNESCAPED_UNICODE); }
    if (empty($setParts)) json_err('No hay campos para actualizar');
    $params[] = $id;
    $db->prepare('UPDATE directivos SET ' . implode(', ', $setParts) . ' WHERE id = ?')->execute($params);
    $row = $db->query("SELECT * FROM directivos WHERE id = $id")->fetch();
    json_ok(normalize($row));
}

if ($method === 'DELETE') {
    if (!$id) json_err('Se requiere ?id=', 400);
    $stmt = $db->prepare('DELETE FROM directivos WHERE id = ?');
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) json_err('Directivo no encontrado', 404);
    json_ok(['deleted' => true, 'id' => (string) $id]);
}

json_err('Método no soportado', 405);