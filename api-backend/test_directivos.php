<?php
/**
 * test_directivos.php — Diagnóstico rápido
 * Sube este archivo junto a directivos.php y ábrelo en el navegador.
 * BÓRRALO del servidor cuando termines de depurar.
 */
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

$result = [];

// 1. ¿Existe config.php?
$configPath = __DIR__ . '/config.php';
$result['config_exists'] = file_exists($configPath);

// 2. ¿Se puede cargar config.php sin errores?
if ($result['config_exists']) {
    try {
        require_once $configPath;
        $result['config_loaded'] = true;
        // Muestra las constantes definidas (sin la contraseña completa)
        $result['DB_HOST'] = defined('DB_HOST') ? DB_HOST : 'NO DEFINIDA';
        $result['DB_NAME'] = defined('DB_NAME') ? DB_NAME : 'NO DEFINIDA';
        $result['DB_USER'] = defined('DB_USER') ? DB_USER : 'NO DEFINIDA';
        $result['DB_PASS_set'] = defined('DB_PASS') && DB_PASS !== '';
    } catch (Throwable $e) {
        $result['config_loaded'] = false;
        $result['config_error']  = $e->getMessage();
    }
} else {
    $result['config_loaded'] = false;
}

// 3. ¿Se puede conectar a MySQL?
if ($result['config_loaded'] ?? false) {
    try {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $result['db_connected'] = true;

        // 4. ¿Existe la tabla directivos?
        $tables = $pdo->query("SHOW TABLES LIKE 'directivos'")->fetchAll();
        $result['table_directivos_exists'] = count($tables) > 0;

        // 5. ¿Cuántos registros hay?
        if ($result['table_directivos_exists']) {
            $count = $pdo->query("SELECT COUNT(*) FROM directivos")->fetchColumn();
            $result['directivos_count'] = (int) $count;
        }
    } catch (PDOException $e) {
        $result['db_connected'] = false;
        $result['db_error']     = $e->getMessage();
    }
}

// 6. ¿Existe directivos.php?
$result['directivos_php_exists'] = file_exists(__DIR__ . '/directivos.php');

// 7. Versión PHP
$result['php_version'] = PHP_VERSION;

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);