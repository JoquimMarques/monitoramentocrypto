<?php
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');

include 'db_config.php';

$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
if ($limit < 1 || $limit > 100) $limit = 20;

$url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=" . $limit . "&page=1&sparkline=false";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'MonitoCrypto/1.0');
curl_setopt($ch, CURLOPT_TIMEOUT, 10); // Timeout de 10 segundos

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    if ($httpCode === 429) {
        echo json_encode(['error' => 'Limite de requisições da API atingido. Aguarde um momento.']);
    } else {
        echo json_encode(['error' => 'Erro na API (Status: ' . $httpCode . ')']);
    }
    exit;
}

if (!$response) {
    echo json_encode(['error' => 'Sem resposta do servidor da API.']);
    exit;
}

$coins = json_decode($response, true);

if ($coins) {
    foreach ($coins as $coin) {
        // Upsert no banco de dados (Insere ou atualiza se já existir)
        $stmt = $pdo->prepare("INSERT INTO moedas (id, simbolo, nome, imagem, preco_atual, variacao_24h) 
                               VALUES (?, ?, ?, ?, ?, ?) 
                               ON DUPLICATE KEY UPDATE 
                               preco_atual = VALUES(preco_atual), 
                               variacao_24h = VALUES(variacao_24h)");
        $stmt->execute([
            $coin['id'], 
            $coin['symbol'], 
            $coin['name'], 
            $coin['image'], 
            $coin['current_price'], 
            $coin['price_change_percentage_24h']
        ]);

        // Opcional: Salvar no histórico
        $stmtHist = $pdo->prepare("INSERT INTO historico_precos (moeda_id, preco) VALUES (?, ?)");
        $stmtHist->execute([$coin['id'], $coin['current_price']]);
    }
    echo json_encode($coins);
} else {
    echo json_encode(['error' => 'Resposta da API inválida']);
}
?>
