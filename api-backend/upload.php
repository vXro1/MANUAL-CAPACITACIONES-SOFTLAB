<?php

// upload.php es un endpoint legado; todos los uploads deben realizarse a través
// de los endpoints específicos (galeria.php, manuales.php, etc.) que usan
// uploadFile() de config.php. Este archivo se mantiene como fallback pero
// requiere autenticación de admin.

require_once __DIR__ . '/config.php';

// Reemplazar headers manuales con la función cors() centralizada
cors();

// Verificar autenticación de admin (igual que el resto de endpoints)
requireAdmin();

// ─────────────────────────────────────────────
// CONFIGURACIÓN
// ─────────────────────────────────────────────

$category = $_POST['category'] ?? '';

$map = [
    'image'  => __DIR__ . '/../uploads/images',
    'pdf'    => __DIR__ . '/../uploads/pdfs',
    'manual' => __DIR__ . '/../uploads/manuals'
];

if (!isset($map[$category])) {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' => 'Categoría inválida'
    ]);

    exit;
}

// ─────────────────────────────────────────────
// VALIDAR ARCHIVO
// ─────────────────────────────────────────────

if (
    !isset($_FILES['file']) ||
    $_FILES['file']['error'] !== UPLOAD_ERR_OK
) {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' => 'No se recibió archivo'
    ]);

    exit;
}

$file = $_FILES['file'];

$maxSize = 20 * 1024 * 1024; // 20MB

if ($file['size'] > $maxSize) {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' => 'Archivo demasiado grande'
    ]);

    exit;
}

// ─────────────────────────────────────────────
// VALIDAR MIME TYPE
// ─────────────────────────────────────────────

$finfo = new finfo(FILEINFO_MIME_TYPE);

$mime = $finfo->file($file['tmp_name']);

$allowedMimes = [

    'image' => [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif'
    ],

    'pdf' => [
        'application/pdf'
    ],

    'manual' => [
        'application/pdf'
    ]
];

if (!in_array($mime, $allowedMimes[$category])) {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' => 'Tipo de archivo no permitido'
    ]);

    exit;
}

// ─────────────────────────────────────────────
// EXTENSIONES
// ─────────────────────────────────────────────

$extensions = [

    'image/jpeg'      => 'jpg',
    'image/png'       => 'png',
    'image/webp'      => 'webp',
    'image/gif'       => 'gif',
    'application/pdf' => 'pdf'
];

$ext = $extensions[$mime]
    ?? pathinfo($file['name'], PATHINFO_EXTENSION);

// ─────────────────────────────────────────────
// GENERAR NOMBRE ÚNICO
// ─────────────────────────────────────────────

$filename = $category .
    '_' .
    bin2hex(random_bytes(8)) .
    '.' .
    $ext;

// ─────────────────────────────────────────────
// CREAR CARPETA
// ─────────────────────────────────────────────

$targetDir = $map[$category];

if (!is_dir($targetDir)) {

    mkdir($targetDir, 0755, true);
}

// ─────────────────────────────────────────────
// GUARDAR ARCHIVO
// ─────────────────────────────────────────────

$targetPath = $targetDir . '/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'No se pudo guardar el archivo'
    ]);

    exit;
}

// ─────────────────────────────────────────────
// URL PÚBLICA
// ─────────────────────────────────────────────

$folder = match ($category) {

    'image'  => 'images',
    'pdf'    => 'pdfs',
    'manual' => 'manuals',

    default => 'uploads'
};

$url = 'https://semillerosoftlab.com/uploads/' .
    $folder .
    '/' .
    $filename;

// ─────────────────────────────────────────────
// RESPUESTA
// ─────────────────────────────────────────────

echo json_encode([

    'success'  => true,

    'url'      => $url,

    'filename' => $filename
]);