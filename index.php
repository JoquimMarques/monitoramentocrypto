<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SuperCrypto | Capsule Premium Dashboard</title>
    <meta name="description" content="Dashboard premium de monitoramento de criptomoedas em tempo real com PHP e MySQL.">
    <link rel="stylesheet" href="style.css">
    <!-- Chart.js para os gráficos premium -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- Lucide Icons para ícones vetorizados profissionais -->
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
    <div class="app-container">
        <!-- Barra Lateral Esquerda (Sidebar) -->
        <aside class="sidebar">
            <div class="sidebar-brand">
                <div class="logo">Super<span>Crypto</span></div>
            </div>
            
            <div class="sidebar-search">
                <div class="search-box">
                    <input type="text" id="searchInput" placeholder="Pesquisar moeda...">
                </div>
            </div>
            
            <nav class="sidebar-nav">
                <a href="#" class="nav-item active" id="navDashboard">
                    <i data-lucide="layout-dashboard" class="nav-icon-svg"></i> Dashboard
                </a>
                <a href="#" class="nav-item" id="navTrends">
                    <i data-lucide="trending-up" class="nav-icon-svg"></i> Tendências
                </a>
                <a href="#" class="nav-item" id="openHistory">
                    <i data-lucide="history" class="nav-icon-svg"></i> Histórico Completo
                </a>
            </nav>
            
            <div class="sidebar-footer">
                <!-- Alternador de Tema -->
                <div class="theme-toggle-wrapper">
                    <span>Tema</span>
                    <button class="btn-theme" id="themeToggle" title="Alternar Tema">
                        <i data-lucide="moon" class="theme-icon-svg"></i>
                    </button>
                </div>
            </div>
        </aside>
        
        <!-- Área de Conteúdo Principal -->
        <main class="main-content">
            <!-- Cabeçalho Principal -->
            <header class="main-header">
                <div>
                    <h1 id="pageTitle">Dashboard</h1>
                    <p style="color: var(--text-dim); font-size: 0.9rem;">Visão geral do mercado cripto em tempo real</p>
                </div>
                
                <div class="header-actions">
                    <div class="limit-box">
                        <select id="limitSelect" title="Quantidade de moedas">
                            <option value="20">Top 20</option>
                            <option value="50">Top 50</option>
                            <option value="100">Top 100</option>
                        </select>
                    </div>
                    <div id="lastUpdate" class="last-update">
                        Atualizado às: --:--:--
                    </div>
                </div>
            </header>
            
            <!-- Grade do Dashboard -->
            <div class="dashboard-grid">
                <!-- Coluna Principal (Esquerda) -->
                <div class="dashboard-main-col">
                    <!-- Cards de Destaque -->
                    <section class="stats-grid" id="statsGrid">
                        <div class="card" style="height: 150px; display: flex; align-items: center; justify-content: center; width: 100%;">
                            Carregando moedas...
                        </div>
                    </section>
                    
                    <!-- Gráfico Central Embutido (Crescimento) -->
                    <section class="card chart-section">
                        <div class="chart-section-header">
                            <div>
                                <h3 class="section-title">Análise Temporal</h3>
                                <div id="chartCoinInfo" class="chart-coin-subtitle">Carregando dados da moeda...</div>
                            </div>
                            <div class="chart-actions">
                                <span class="chart-badge">Tempo Real</span>
                            </div>
                        </div>
                        
                        <div class="chart-wrapper">
                            <canvas id="historyChart"></canvas>
                        </div>
                    </section>
                    
                    <!-- Tabela de Moedas -->
                    <section class="card table-section">
                        <h3 class="section-title" style="margin-bottom: 1.5rem;">Tendências do Mercado</h3>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Moeda</th>
                                        <th>Preço</th>
                                        <th>24h %</th>
                                        <th style="text-align: center; width: 140px;">Tendência (7d)</th>
                                        <th>Cap. de Mercado</th>
                                    </tr>
                                </thead>
                                <tbody id="cryptoTableBody">
                                    <!-- Linhas serão inseridas via JS -->
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
                
                <!-- Coluna de Widgets (Direita) -->
                <div class="dashboard-widgets-col">
                    <!-- Widget de Simulador de Cotação (Swapper em Kwanza) -->
                    <div class="widget-card swapper-card card">
                        <h4 class="widget-title">Simulador de Conversão</h4>
                        <div class="swapper-form">
                            <div class="swapper-field">
                                <label for="swapAmount">Você Paga (Kwanza - AOA)</label>
                                <input type="number" id="swapAmount" value="500000" min="100">
                            </div>
                            
                            <div class="swapper-divider">
                                <span class="swap-icon">
                                    <i data-lucide="arrow-left-right" class="swap-icon-svg"></i>
                                </span>
                            </div>
                            
                            <div class="swapper-field">
                                <label for="swapTarget">Você Recebe (Cripto)</label>
                                <select id="swapTarget" title="Moeda de destino">
                                    <option value="bitcoin">BTC (Bitcoin)</option>
                                    <option value="ethereum">ETH (Ethereum)</option>
                                    <option value="tether">USDT (Tether)</option>
                                </select>
                            </div>
                            
                            <div class="swapper-result">
                                <div class="result-label">Resultado estimado</div>
                                <div class="result-value" id="swapResult">0.013000 BTC</div>
                            </div>
                            
                            <div class="swapper-rate-ref">
                                Câmbio de Referência: 1 USD ≈ 830 AOA
                            </div>
                            
                            <button class="btn-primary" style="width: 100%; border-radius: 0.8rem;" onclick="alert('Simulação em Kwanzas realizada! Este é um simulador de cotação em tempo real.')">Simular Cotação</button>
                        </div>
                    </div>
                    
                    <!-- Widget de Log Recente (MySQL) -->
                    <div class="widget-card activity-card card">
                        <h4 class="widget-title">Leituras Recentes (MySQL)</h4>
                        <ul class="activity-list" id="activityLogList">
                            <li class="activity-loading">Carregando logs do banco...</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    </div>
    
    <!-- Modal Oculto para Histórico Completo de Texto -->
    <div class="modal" id="historyModal">
        <div class="modal-content">
            <span class="close-modal" id="closeHistory"><i data-lucide="x"></i></span>
            <div id="modalHeaderDetail">
                <h2 style="margin-bottom: 2rem;">Histórico Recente</h2>
            </div>
            <div id="historyContent">
                Carregando histórico...
            </div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
