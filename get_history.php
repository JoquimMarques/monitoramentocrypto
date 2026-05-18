<?php
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');

include 'db_config.php';

try {
    $moeda_id = isset($_GET['moeda_id']) ? $_GET['moeda_id'] : null;

    if ($moeda_id) {
        // Busca os 50 registros mais recentes para uma moeda específica e os ordena por data crescente para o gráfico
        $query = "SELECT * FROM (
                    SELECT h.preco, h.data_registro, m.nome, m.simbolo, m.imagem 
                    FROM historico_precos h 
                    JOIN moedas m ON h.moeda_id = m.id 
                    WHERE h.moeda_id = ? 
                    ORDER BY h.data_registro DESC 
                    LIMIT 50
                  ) tmp ORDER BY data_registro ASC";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute([$moeda_id]);
    } else {
        // Log geral recente (para fallback)
        $query = "SELECT h.preco, h.data_registro, m.nome, m.simbolo, m.imagem 
                  FROM historico_precos h 
                  JOIN moedas m ON h.moeda_id = m.id 
                  ORDER BY h.data_registro DESC 
                  LIMIT 30";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute();
    }
    
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($history);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Erro ao buscar histórico: ' . $e->getMessage()]);
}
?>
