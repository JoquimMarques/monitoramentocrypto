<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MonitoCrypto | Dashboard</title>
    <meta name="description" content="Monitoramento de criptomoedas em tempo real com PHP e MySQL.">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <div class="logo">Monito<span>Crypto</span></div>
        <div id="lastUpdate" style="font-size: 0.9rem; color: var(--text-dim);">
            Atualização em tempo real
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
            <h2 style="margin-bottom: 1.5rem; font-weight: 600;">Tendências do Mercado</h2>
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

    <footer style="text-align: center; padding: 2rem; color: var(--text-dim); font-size: 0.8rem;">
        &copy; 2026 MonitoCrypto - Powered by CoinGecko API
    </footer>

    <script src="script.js"></script>
</body>
</html>
