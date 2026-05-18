let allCoins = [];
let priceChart = null;
let activeCoinId = 'bitcoin'; // Bitcoin ativo por padrão no carregamento inicial

// Inicialização do tema antes de carregar o DOM para evitar flashes brancos
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

async function fetchCryptoData() {
    try {
        const limit = document.getElementById('limitSelect').value;
        console.log(`Buscando ${limit} moedas da API CoinGecko...`);

        const response = await fetch(`api_fetch.php?limit=${limit}`);
        const data = await response.json();
        console.log(`Recebidas ${data.length} moedas.`);

        if (data.error) {
            console.error(data.error);
            return;
        }

        allCoins = data;
        
        // Renderizar elementos do painel principal
        renderDashboard(allCoins);
        updateLastUpdateTime();
        
        // Carregar o conversor com as opções de moedas disponíveis
        populateSwapperSelect(allCoins);
        updateSwapCalculation();

        // Carregar o gráfico central com a moeda ativa
        selectCoinForChart(activeCoinId);

        // Carregar a lista de atividades recentes a partir do banco MySQL
        fetchRecentActivityLog();
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }
}

function renderDashboard(coins) {
    const statsGrid = document.getElementById('statsGrid');
    const cryptoTableBody = document.getElementById('cryptoTableBody');

    statsGrid.innerHTML = '';
    cryptoTableBody.innerHTML = '';

    const isSearching = document.getElementById('searchInput').value.length > 0;
    
    // Renderizar os 3 cards de destaque superiores (BTC, ETH, USDT)
    if (!isSearching) {
        // Encontrar especificamente BTC, ETH e USDT no array para os 3 cards ideais do Capsule
        const featuredSymbols = ['btc', 'eth', 'usdt'];
        const featuredCoins = [];
        
        featuredSymbols.forEach(sym => {
            const match = coins.find(c => c.symbol.toLowerCase() === sym);
            if (match) featuredCoins.push(match);
        });
        
        // Fallback para as 3 primeiras se não encontrar
        const displayFeatured = featuredCoins.length === 3 ? featuredCoins : coins.slice(0, 3);

        displayFeatured.forEach(coin => {
            const changeClass = coin.price_change_percentage_24h >= 0 ? 'change-up' : 'change-down';
            const changeSign = coin.price_change_percentage_24h >= 0 ? '+' : '';
            const isActive = coin.id === activeCoinId ? 'border-color: var(--primary);' : '';
            
            const card = `
                <div class="card animate-fade" onclick="selectCoinForChart('${coin.id}')" style="${isActive}">
                    <div class="card-header">
                        <img src="${coin.image}" alt="${coin.name}">
                        <span class="card-title">${coin.name} (${coin.symbol.toUpperCase()})</span>
                    </div>
                    <div class="card-price">$${coin.current_price.toLocaleString()}</div>
                    <div class="card-change ${changeClass}">
                        ${changeSign}${coin.price_change_percentage_24h.toFixed(2)}% (24h)
                    </div>
                    <canvas id="card-sparkline-${coin.id}" class="card-sparkline-canvas"></canvas>
                </div>
            `;
            statsGrid.innerHTML += card;
        });
    } else {
        statsGrid.style.display = 'none';
    }

    if (!isSearching) {
        statsGrid.style.display = 'grid';
    }

    // Renderizar moedas na tabela principal
    coins.forEach((coin, index) => {
        const changeClass = coin.price_change_percentage_24h >= 0 ? 'change-up' : 'change-down';
        const changeSign = coin.price_change_percentage_24h >= 0 ? '+' : '';
        const isSelected = coin.id === activeCoinId ? 'background-color: var(--table-hover); font-weight: 500;' : '';
        const row = `
            <tr class="animate-fade" style="animation-delay: ${index * 0.03}s; cursor: pointer; ${isSelected}" onclick="selectCoinForChart('${coin.id}')">
                <td>#${coin.market_cap_rank || index + 1}</td>
                <td>
                    <div class="coin-name-cell">
                        <img src="${coin.image}" alt="${coin.name}">
                        <div>
                            <div style="font-weight: 600">${coin.name}</div>
                            <div style="color: var(--text-dim); font-size: 0.8rem">${coin.symbol.toUpperCase()}</div>
                        </div>
                    </div>
                </td>
                <td style="font-weight: 600">$${coin.current_price.toLocaleString()}</td>
                <td class="${changeClass}">${changeSign}${coin.price_change_percentage_24h.toFixed(2)}%</td>
                <td style="text-align: center; vertical-align: middle;">
                    <canvas id="sparkline-${coin.id}" class="sparkline-canvas"></canvas>
                </td>
                <td>$${coin.market_cap.toLocaleString()}</td>
            </tr>
        `;
        cryptoTableBody.innerHTML += row;
    });

    if (coins.length === 0) {
        cryptoTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 3rem;">Nenhuma moeda encontrada.</td></tr>';
    }

    // Compilar ícones Lucide recém-inseridos se houver
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Desenhar minigráficos (sparklines) com Canvas 2D
    coins.forEach(coin => {
        const sparklineData = coin.sparkline_in_7d ? coin.sparkline_in_7d.price : null;
        const isPositive = coin.price_change_percentage_24h >= 0;
        
        if (sparklineData) {
            renderSparkline(`sparkline-${coin.id}`, sparklineData, isPositive);
            
            // Renderizar se o card existir no statsGrid
            const hasCard = document.getElementById(`card-sparkline-${coin.id}`);
            if (hasCard && !isSearching) {
                renderSparkline(`card-sparkline-${coin.id}`, sparklineData, isPositive);
            }
        }
    });
}

function renderSparkline(canvasId, prices, isPositive) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!prices || prices.length < 2) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min === 0 ? 1 : max - min;
    
    ctx.beginPath();
    const padding = 2;
    
    prices.forEach((price, index) => {
        const x = (index / (prices.length - 1)) * width;
        const y = height - padding - ((price - min) / range) * (height - 2 * padding);
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    let strokeStyle = '';
    
    if (isPositive) {
        strokeStyle = theme === 'dark' ? '#10b981' : '#059669';
    } else {
        strokeStyle = theme === 'dark' ? '#ef4444' : '#dc2626';
    }
    
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // Gradiente abaixo da linha
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    if (isPositive) {
        gradient.addColorStop(0, theme === 'dark' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(5, 150, 105, 0.05)');
    } else {
        gradient.addColorStop(0, theme === 'dark' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(220, 38, 38, 0.05)');
    }
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();
}

// Seleção de Moeda para o Gráfico Central
async function selectCoinForChart(coinId) {
    activeCoinId = coinId;
    const coin = allCoins.find(c => c.id === coinId);
    
    // Atualizar visual da seleção (cards e tabela)
    const cards = document.querySelectorAll('.stats-grid .card');
    cards.forEach(c => {
        c.style.borderColor = 'var(--glass-border)';
    });
    
    const selectedRows = document.querySelectorAll('tbody tr');
    selectedRows.forEach(row => {
        row.style.backgroundColor = '';
        row.style.fontWeight = 'normal';
    });

    // Se a moeda existir, atualiza cabeçalho e swapper
    if (coin) {
        const coinSubtitle = document.getElementById('chartCoinInfo');
        const changeClass = coin.price_change_percentage_24h >= 0 ? 'change-up' : 'change-down';
        const changeSign = coin.price_change_percentage_24h >= 0 ? '+' : '';
        
        coinSubtitle.innerHTML = `
            <span style="font-weight: 700; color: var(--text-main); font-size: 1.1rem; display: flex; align-items: center; gap: 0.4rem;">
                <img src="${coin.image}" style="width: 20px; height: 20px; vertical-align: middle;">
                ${coin.name} (${coin.symbol.toUpperCase()})
            </span>
            <span style="margin-left: 0.5rem; color: var(--text-main); font-weight: 600;">$${coin.current_price.toLocaleString()}</span>
            <span class="${changeClass}" style="margin-left: 0.5rem; font-weight: 600;">
                ${changeSign}${coin.price_change_percentage_24h.toFixed(2)}%
            </span>
        `;
        
        // Atualizar também o destino no Swapper e rodar o cálculo
        const swapperSelect = document.getElementById('swapTarget');
        if (swapperSelect && swapperSelect.value !== coinId) {
            swapperSelect.value = coinId;
            updateSwapCalculation();
        }
    }
    
    // Carregar dados históricos do MySQL para desenhar o gráfico central
    await fetchHistoryDataForChart(coinId);
}

// Carrega o Histórico do MySQL e Renderiza o Gráfico Central
async function fetchHistoryDataForChart(coinId) {
    try {
        const response = await fetch(`get_history.php?moeda_id=${coinId}`);
        const data = await response.json();

        if (data.error) {
            console.error('Erro no histórico:', data.error);
            return;
        }

        if (data.length > 0) {
            renderCentralChart(data);
        } else {
            // Se não houver dados no banco, desenhar fallback usando dados fictícios baseados no sparkline do CoinGecko
            const coin = allCoins.find(c => c.id === coinId);
            if (coin && coin.sparkline_in_7d) {
                const dummyHistory = coin.sparkline_in_7d.price.slice(-24).map((p, index) => {
                    const date = new Date();
                    date.setHours(date.getHours() - (24 - index));
                    return {
                        preco: p,
                        data_registro: date.toISOString()
                    };
                });
                renderCentralChart(dummyHistory);
            }
        }
    } catch (error) {
        console.error('Erro ao buscar histórico do banco:', error);
    }
}

function renderCentralChart(historyData) {
    const canvas = document.getElementById('historyChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (priceChart) {
        priceChart.destroy();
    }
    
    const labels = historyData.map(item => {
        const date = new Date(item.data_registro);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    });
    
    const prices = historyData.map(item => parseFloat(item.preco));
    
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const isDark = theme === 'dark';
    
    // Azul elétrico premium e grades discretas
    const lineColor = '#1e50ff';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.03)';
    const textColor = isDark ? '#767a93' : '#6e7391';
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    if (isDark) {
        gradient.addColorStop(0, 'rgba(30, 80, 255, 0.12)');
        gradient.addColorStop(1, 'rgba(30, 80, 255, 0.0)');
    } else {
        gradient.addColorStop(0, 'rgba(30, 80, 255, 0.06)');
        gradient.addColorStop(1, 'rgba(30, 80, 255, 0.0)');
    }

    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: prices,
                borderColor: lineColor,
                borderWidth: 2.2,
                backgroundColor: gradient,
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBackgroundColor: lineColor,
                pointBorderColor: isDark ? '#111322' : '#ffffff',
                pointBorderWidth: 1.5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: isDark ? '#111322' : '#ffffff',
                    titleColor: isDark ? '#f4f4f5' : '#0c0e19',
                    bodyColor: textColor,
                    borderColor: lineColor,
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'Preço: $' + context.raw.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6});
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: gridColor,
                        borderColor: 'transparent'
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'Outfit',
                            size: 10,
                            weight: '500'
                        },
                        maxTicksLimit: 8
                    }
                },
                y: {
                    grid: {
                        color: gridColor,
                        borderColor: 'transparent'
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'Outfit',
                            size: 10,
                            weight: '500'
                        },
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Lógica de Atividades Recientes (MySQL)
async function fetchRecentActivityLog() {
    try {
        const response = await fetch('get_history.php');
        const data = await response.json();
        const activityList = document.getElementById('activityLogList');
        
        if (!activityList) return;
        
        if (data.error || data.length === 0) {
            activityList.innerHTML = '<li class="activity-loading">Nenhum log de monitoramento no banco.</li>';
            return;
        }

        activityList.innerHTML = '';
        
        // Exibir as últimas 5 leitivas salvas no banco
        data.slice(0, 5).forEach(item => {
            const date = new Date(item.data_registro);
            const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            
            // Tentar encontrar moeda correspondente para obter o símbolo correto
            const coin = allCoins.find(c => c.id === item.moeda_id);
            const coinSymbol = coin ? coin.symbol.toUpperCase() : item.moeda_id.substring(0, 3).toUpperCase();
            
            const li = document.createElement('li');
            li.className = 'activity-item animate-fade';
            li.innerHTML = `
                <div class="activity-info">
                    <div class="activity-icon">
                        <i data-lucide="activity" class="activity-icon-svg"></i>
                    </div>
                    <div class="activity-desc">
                        <span class="activity-coin">${item.nome} (${coinSymbol})</span>
                        <span class="activity-time">${timeStr}</span>
                    </div>
                </div>
                <span class="activity-price">$${parseFloat(item.preco).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})}</span>
            `;
            activityList.appendChild(li);
        });

        // Compilar os novos ícones Lucide inseridos no feed
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    } catch (error) {
        console.error('Erro ao buscar logs do MySQL:', error);
    }
}

// Preenche as opções do Conversor de Cotação
function populateSwapperSelect(coins) {
    const select = document.getElementById('swapTarget');
    if (!select) return;
    
    // Reter o valor antigo selecionado
    const prevValue = select.value;
    select.innerHTML = '';
    
    coins.forEach(coin => {
        const option = document.createElement('option');
        option.value = coin.id;
        option.innerText = `${coin.symbol.toUpperCase()} (${coin.name})`;
        select.appendChild(option);
    });
    
    // Restaurar seleção anterior se existir
    if (coins.some(c => c.id === prevValue)) {
        select.value = prevValue;
    } else if (coins.length > 0) {
        select.value = coins[0].id;
    }
}

// Lógica de Cálculo do Conversor (Swapper) em Kwanza (AOA)
function updateSwapCalculation() {
    const amountAoaField = document.getElementById('swapAmount');
    const targetSelect = document.getElementById('swapTarget');
    const resultField = document.getElementById('swapResult');
    
    if (!amountAoaField || !targetSelect || !resultField) return;
    
    const amountAoa = parseFloat(amountAoaField.value) || 0;
    const targetId = targetSelect.value;
    
    // Taxa de câmbio referencial: 1 USD = 830 AOA (Kwanza angolano)
    const rateAoaToUsd = 830;
    const amountUsd = amountAoa / rateAoaToUsd;
    
    const targetCoin = allCoins.find(c => c.id === targetId);
    
    if (targetCoin && targetCoin.current_price > 0) {
        const result = amountUsd / targetCoin.current_price;
        resultField.innerText = `${result.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 6})} ${targetCoin.symbol.toUpperCase()}`;
    } else {
        resultField.innerText = `0.0000 ---`;
    }
}

// Lógica de Pesquisa
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredCoins = allCoins.filter(coin => 
        coin.name.toLowerCase().includes(searchTerm) || 
        coin.symbol.toLowerCase().includes(searchTerm)
    );
    renderDashboard(filteredCoins);
});

// Lógica de Limite (Top 20, 50, 100)
document.getElementById('limitSelect').addEventListener('change', () => {
    fetchCryptoData();
});

// Registrar eventos no Swapper
document.getElementById('swapAmount').addEventListener('input', updateSwapCalculation);
document.getElementById('swapTarget').addEventListener('change', updateSwapCalculation);

// Evento do botão de tema e inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar os ícones Lucide na tela
    if (typeof lucide !== 'undefined') {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const themeIcon = themeToggle.querySelector('i');
            if (themeIcon) {
                themeIcon.setAttribute('data-lucide', savedTheme === 'dark' ? 'moon' : 'sun');
            }
        }
        lucide.createIcons();
    }

    // Alternador de tema
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentActive = document.documentElement.getAttribute('data-theme') || 'dark';
            const targetTheme = currentActive === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', targetTheme);
            localStorage.setItem('theme', targetTheme);
            
            // Trocar o ícone do botão
            const themeIcon = themeToggle.querySelector('i');
            if (themeIcon && typeof lucide !== 'undefined') {
                themeIcon.setAttribute('data-lucide', targetTheme === 'dark' ? 'moon' : 'sun');
                lucide.createIcons();
            }
            
            // Re-renderizar dashboards e minigráficos
            renderDashboard(allCoins);
            
            // Re-renderizar o gráfico central
            if (activeCoinId) {
                selectCoinForChart(activeCoinId);
            }
        });
    }
    
    // Carregar dados na abertura da página
    fetchCryptoData();
});

// Modal Oculto para Histórico Completo de Texto (caso precisem do histórico completo)
const historyModal = document.getElementById('historyModal');
const openHistoryBtn = document.getElementById('openHistory');
const closeHistoryBtn = document.getElementById('closeHistory');

if (openHistoryBtn && historyModal && closeHistoryBtn) {
    openHistoryBtn.onclick = async (e) => {
        e.preventDefault();
        historyModal.style.display = 'flex';
        
        const coin = allCoins.find(c => c.id === activeCoinId) || allCoins[0];
        if (!coin) return;
        
        const headerDetail = document.getElementById('modalHeaderDetail');
        headerDetail.innerHTML = `<h2 style="font-size: 1.5rem; margin-bottom: 1.5rem;">Histórico Geral de Leituras: ${coin.name}</h2>`;
        
        const historyContent = document.getElementById('historyContent');
        historyContent.innerHTML = '<p>Carregando leituras do banco...</p>';
        
        try {
            const response = await fetch(`get_history.php?moeda_id=${coin.id}`);
            const data = await response.json();
            
            if (data.length === 0) {
                historyContent.innerHTML = '<p>Nenhuma leitura salva para esta moeda ainda.</p>';
                return;
            }
            
            let html = '<div class="history-table-wrapper" style="max-height: 300px; overflow-y: auto;"><table style="width:100%; border-collapse:collapse;">';
            html += '<thead><tr><th>Preço</th><th>Hora do Monitoramento</th></tr></thead><tbody>';
            
            const displayData = [...data].reverse();
            displayData.forEach(item => {
                const date = new Date(item.data_registro).toLocaleString('pt-BR');
                html += `
                    <tr>
                        <td style="padding: 0.8rem; border-bottom: 1px solid var(--glass-border); font-weight:600;">$${parseFloat(item.preco).toLocaleString()}</td>
                        <td style="padding: 0.8rem; border-bottom: 1px solid var(--glass-border); color: var(--text-dim);">${date}</td>
                    </tr>
                `;
            });
            html += '</tbody></table></div>';
            historyContent.innerHTML = html;
        } catch (error) {
            historyContent.innerHTML = '<p>Erro ao buscar leituras.</p>';
        }
    };
    
    closeHistoryBtn.onclick = () => {
        historyModal.style.display = 'none';
    };
    
    window.onclick = (event) => {
        if (event.target == historyModal) {
            historyModal.style.display = 'none';
        }
    };
}

// Configura o cabeçalho no clique da barra lateral (Simular abas)
document.getElementById('navDashboard').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('pageTitle').innerText = 'Dashboard';
    document.querySelector('.dashboard-grid').style.display = 'grid';
});

document.getElementById('navTrends').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('pageTitle').innerText = 'Tendências do Mercado';
    // Rolar suavemente até a seção de tabelas
    document.querySelector('.table-section').scrollIntoView({ behavior: 'smooth' });
});

function updateLastUpdateTime() {
    const now = new Date();
    document.getElementById('lastUpdate').innerText = `Atualizado às: ${now.toLocaleTimeString()}`;
}

// Atualizar cotações e logs do MySQL a cada 60 segundos
setInterval(fetchCryptoData, 60000);
