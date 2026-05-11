<?php
$host = 'localhost';
$dbname = 'monitocrypto';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$dbname` ");
    
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Criar tabelas se não existirem
    $pdo->exec("CREATE TABLE IF NOT EXISTS moedas (
        id VARCHAR(50) PRIMARY KEY,
        simbolo VARCHAR(10) NOT NULL,
        nome VARCHAR(100) NOT NULL,
        imagem VARCHAR(255),
        preco_atual DECIMAL(20, 10),
        variacao_24h DECIMAL(10, 5),
        ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS historico_precos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        moeda_id VARCHAR(50),
        preco DECIMAL(20, 10),
        data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (moeda_id) REFERENCES moedas(id) ON DELETE CASCADE
    )");

} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Erro na conexão: ' . $e->getMessage()]);
    exit;
}
?>
