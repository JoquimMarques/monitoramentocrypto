<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MonitoCrypto | Red Dashboard</title>
    <meta name="description" content="Monitoramento de criptomoedas em tempo real com PHP e MySQL.">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <div class="logo">Monito<span>Crypto</span></div>
        
        <div class="header-actions">
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="Pesquisar moeda...">
            </div>
            <div class="limit-box">
                <select id="limitSelect" title="Quantidade de moedas">
                    <option value="20">Top 20</option>
                    <option value="50">Top 50</option>
                    <option value="100">Top 100</option>
                </select>
            </div>
            <button class="btn-history" id="openHistory">Ver Histórico</button>
            <div id="lastUpdate" style="font-size: 0.8rem; color: var(--text-dim);">
                Atualização em tempo real
            </div>
        </div>
    </header>

    <main class="dashboard-container">
        <!-- Grid de Destaque -->
        <div class="stats-grid" id="statsGrid">
            <!-- Cards serão inseridos via JS -->
            <div class="card" style="height: 150px; display: flex; align-items: center; justify-content: center;">
                Carregando moedas...
            </div>
        </div>

        <!-- Tabela de Mercado -->
        <div class="table-container">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2 style="font-weight: 600;">Tendências do Mercado</h2>
            </div>
            
            <div style="overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Moeda</th>
                            <th>Preço</th>
                            <th>24h %</th>
                            <th>Cap. de Mercado</th>
                        </tr>
                    </thead>
                    <tbody id="cryptoTableBody">
                        <!-- Linhas serão inseridas via JS -->
                    </tbody>
                </table>
            </div>
        </div>
    </main>

    <!-- Modal de Histórico -->
    <div class="modal" id="historyModal">
        <div class="modal-content">
            <span class="close-modal" id="closeHistory">&times;</span>
            <h2 style="margin-bottom: 2rem; color: var(--primary);">Histórico Recente</h2>
            <div id="historyContent">
                <!-- Conteúdo do histórico via JS -->
                Carregando histórico...
            </div>
        </div>
    </div>

    <footer style="text-align: center; padding: 3rem; color: var(--text-dim); font-size: 0.8rem; border-top: 1px solid var(--glass-border); margin-top: 4rem;">
        &copy; 2026 MonitoCrypto - Design Premium Red - Powered by CoinGecko API
    </footer>

    <script src="script.js"></script>
</body>
</html>
