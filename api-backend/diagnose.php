<?php
/**
 * diagnose.php — Diagnóstico de rutas de archivos (solo admin)
 * Llama desde el panel: GET /api-backend/diagnose.php
 * con header X-Admin-Token o ?_token=... en la URL.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/config.php';
requireAdmin();

$subdirs = ['galeria', 'eventos_galeria', 'participantes', 'portadas', 'evidencias', 'pdfs'];

$info = [
    '__DIR__'            => __DIR__,
    'DOCUMENT_ROOT'      => $_SERVER['DOCUMENT_ROOT'] ?? '(no definido)',
    'UPLOAD_DIR'         => UPLOAD_DIR,
    'UPLOAD_URL'         => UPLOAD_URL,
    'UPLOAD_DIR_real'    => realpath(UPLOAD_DIR) ?: '(no existe)',
    'UPLOAD_DIR_exists'  => is_dir(UPLOAD_DIR)  ? 'sí' : 'NO',
    'UPLOAD_DIR_writable'=> is_writable(UPLOAD_DIR) ? 'sí' : 'NO',
    'subdirs'            => [],
    'test_write'         => null,
];

foreach ($subdirs as $d) {
    $path = UPLOAD_DIR . $d;
    $info['subdirs'][$d] = [
        'path'     => $path,
        'exists'   => is_dir($path) ? 'sí' : 'no',
        'writable' => is_writable($path) ? 'sí' : 'no',
        'files'    => is_dir($path) ? count(glob($path . '/*')) : 0,
    ];
}

// Prueba de escritura real
$testPath = UPLOAD_DIR . 'diagnose_test_' . time() . '.txt';
$wrote = file_put_contents($testPath, 'test');
if ($wrote !== false) {
    $info['test_write'] = 'OK — archivo creado en ' . $testPath;
    @unlink($testPath);
} else {
    $info['test_write'] = 'FALLO — no se pudo escribir en ' . UPLOAD_DIR;
}

echo json_encode($info, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
