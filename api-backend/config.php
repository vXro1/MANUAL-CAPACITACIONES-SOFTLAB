<?php
// ─── Debug temporal (quitar en producción) ────────────────────────────────────
ini_set('display_errors', 0);
ini_set('log_errors', 1);
set_exception_handler(function($e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
});

// ─── Credenciales de base de datos ────────────────────────────────────────────
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_NAME', 'u122834460_softlabarchivo');
define('DB_USER', 'u122834460_admin2026');
define('DB_PASS', 'Bdsoftlab2026');

// ─── Rutas de archivos ────────────────────────────────────────────────────────
// NO usamos realpath() porque en Hostinger public_html es un symlink y realpath
// lo resuelve a un directorio diferente del que sirve el web server.
// Usamos DOCUMENT_ROOT tal como lo reporta el servidor (sin resolver symlinks).
if (!empty($_SERVER['DOCUMENT_ROOT']) && is_dir($_SERVER['DOCUMENT_ROOT'])) {
    define('UPLOAD_DIR', rtrim($_SERVER['DOCUMENT_ROOT'], '/') . '/uploads/');
} else {
    // Fallback: carpeta uploads/ al mismo nivel que api-backend/
    define('UPLOAD_DIR', dirname(__DIR__) . '/uploads/');
}
define('UPLOAD_URL', 'https://semillerosoftlab.com/uploads/');

// Crear subcarpetas de uploads si no existen
foreach (['pdfs', 'portadas', 'galeria', 'participantes', 'evidencias', 'eventos_galeria', 'proyectos_participantes'] as $_subdir) {
    $p = UPLOAD_DIR . $_subdir;
    if (!is_dir($p)) @mkdir($p, 0755, true);
}

// ─── Límites de tamaño ────────────────────────────────────────────────────────
define('MAX_IMG',  5 * 1024 * 1024);   //  5 MB
define('MAX_PDF', 20 * 1024 * 1024);   // 20 MB

// ─── Tipos MIME permitidos ────────────────────────────────────────────────────
$ALLOWED_IMG = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
$ALLOWED_PDF = ['application/pdf'];

// ─── Conexión PDO (singleton) ─────────────────────────────────────────────────
function db() {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]
        );
    }
    return $pdo;
}

// ─── Headers CORS ─────────────────────────────────────────────────────────────
function cors() {
    $origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = [
        'https://semillerosoftlab.com',
        'https://www.semillerosoftlab.com',
        'http://localhost:5173',
        'http://localhost:4173',
    ];
    if (in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    } else {
        header('Access-Control-Allow-Origin: https://semillerosoftlab.com');
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');
    header('Content-Type: application/json; charset=utf-8');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

// ─── Respuestas JSON ──────────────────────────────────────────────────────────
function ok($data, $code = 200) {
    http_response_code($code);
    echo json_encode(
        ['ok' => true, 'data' => $data],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    exit;
}

function err($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

// ─── Verificar token de admin ─────────────────────────────────────────────────
// Compatible con auth.php v3: sesiones en 'session_tokens' (JSON array)
// Formato de cada sesión: "TOKEN::EXPIRY::ADMIN_ID"
// Hostinger elimina headers en multipart → se lee también de $_GET/_POST.
function requireAdmin() {
    $token = trim(
        $_SERVER['HTTP_X_ADMIN_TOKEN']
        ?? $_GET['_token']
        ?? $_POST['_token']
        ?? ''
    );
    if (empty($token)) err('No autorizado', 401);

    $stmt = db()->prepare("SELECT valor FROM admin_config WHERE clave = 'session_tokens' LIMIT 1");
    $stmt->execute();
    $row = $stmt->fetch();
    if (!$row) err('No autorizado', 401);

    $sessions = json_decode($row['valor'], true) ?? [];
    foreach ($sessions as $session) {
        [$stored, $expiry] = array_pad(explode('::', $session, 3), 3, '');
        if (hash_equals($stored, $token)) {
            if (time() > (int)$expiry) err('Sesión expirada. Inicia sesión de nuevo.', 401);
            return;
        }
    }

    err('Token inválido', 401);
}

// ─── Leer body JSON ───────────────────────────────────────────────────────────
function bodyJson() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// ─── Subir archivo al servidor ────────────────────────────────────────────────
function uploadFile($field, $subdir, $allowed, $maxSize) {
    if (!isset($_FILES[$field]) || $_FILES[$field]['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    $f = $_FILES[$field];
    if ($f['error'] !== UPLOAD_ERR_OK) err('Error al subir archivo (código ' . $f['error'] . ')');
    if ($f['size'] > $maxSize)         err('Archivo demasiado grande. Máximo ' . round($maxSize / 1024 / 1024) . ' MB');

    // Verificar MIME real (no confiar solo en la extensión)
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime  = $finfo->file($f['tmp_name']);
    if (!in_array($mime, $allowed, true)) err('Tipo de archivo no permitido: ' . $mime);

    $ext  = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
    $name = bin2hex(random_bytes(16)) . '.' . $ext;
    $dir  = UPLOAD_DIR . $subdir . '/';

    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    if (!is_dir($dir)) err('No se pudo crear el directorio: ' . $dir);

    $dest = $dir . $name;
    if (!move_uploaded_file($f['tmp_name'], $dest)) {
        err('No se pudo guardar el archivo. Ruta de destino: ' . $dest . ' | UPLOAD_DIR: ' . UPLOAD_DIR);
    }
    if (!file_exists($dest)) {
        err('Archivo movido pero no encontrado en disco: ' . $dest);
    }

    return UPLOAD_URL . $subdir . '/' . $name;
}

// ─── Mover archivo a papelera (nunca borrar directamente) ─────────────────────
// Los archivos eliminados van a uploads/_trash/ con timestamp para recuperación.
// La eliminación real puede hacerse manualmente desde el servidor si es necesario.
function removeFile($url) {
    if (empty($url) || strpos($url, UPLOAD_URL) !== 0) return;
    $path = str_replace(UPLOAD_URL, UPLOAD_DIR, $url);
    if (!file_exists($path)) return;

    $trashDir = UPLOAD_DIR . '_trash/';
    if (!is_dir($trashDir)) {
        @mkdir($trashDir, 0755, true);
    }
    // Proteger la papelera contra acceso web directo
    $htaccess = $trashDir . '.htaccess';
    if (!file_exists($htaccess)) {
        @file_put_contents($htaccess, "Deny from all\n");
    }

    // Nombre único: timestamp + random + nombre original (para trazabilidad)
    $safename = date('YmdHis') . '_' . bin2hex(random_bytes(4)) . '_' . basename($path);
    if (!@rename($path, $trashDir . $safename)) {
        // Fallback: si rename falla (ej. sistemas de archivos distintos), copiar y borrar
        if (@copy($path, $trashDir . $safename)) {
            @unlink($path);
        }
        // Si todo falla, el archivo permanece en su lugar (preferible a perderlo)
    }
}
