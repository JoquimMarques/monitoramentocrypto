let allCoins = [];

async function fetchCryptoData() {
    try {
        const limit = document.getElementById('limitSelect').value;
        console.log(`Buscando ${limit} moedas...`);
        
        // Mostrar feedback de carregamento na tabela
        const tableBody = document.getElementById('cryptoTableBody');
        if (tableBody.innerHTML === '') {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Atualizando dados...</td></tr>';
        }

        const response = await fetch(`api_fetch.php?limit=${limit}`);
        const data = await response.json();
        console.log(`Recebidas ${data.length} moedas.`);

        if (data.error) {
            console.error(data.error);
            return;
        }

        allCoins = data;
        renderDashboard(allCoins);
        updateLastUpdateTime();
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }
}

function renderDashboard(coins) {
    const statsGrid = document.getElementById('statsGrid');
    const cryptoTableBody = document.getElementById('cryptoTableBody');

    // Limpar conteúdos atuais
    statsGrid.innerHTML = '';
    cryptoTableBody.innerHTML = '';

    // Renderizar os 3 primeiros em cards de destaque (apenas se não estiver filtrando)
    const isSearching = document.getElementById('searchInput').value.length > 0;
    
    if (!isSearching) {
        coins.slice(0, 3).forEach(coin => {
            const changeClass = coin.price_change_percentage_24h >= 0 ? 'change-up' : 'change-down';
            const changeIcon = coin.price_change_percentage_24h >= 0 ? '↑' : '↓';
            
            const card = `
                <div class="card animate-fade">
                    <div class="card-header">
                        <img src="${coin.image}" alt="${coin.name}">
                        <span class="card-title">${coin.name}</span>
                    </div>
                    <div class="card-price">$${coin.current_price.toLocaleString()}</div>
                    <div class="card-change ${changeClass}">
                        ${changeIcon} ${Math.abs(coin.price_change_percentage_24h).toFixed(2)}% (24h)
                    </div>
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

    // Renderizar na tabela
    coins.forEach((coin, index) => {
        const changeClass = coin.price_change_percentage_24h >= 0 ? 'change-up' : 'change-down';
        const row = `
            <tr class="animate-fade" style="animation-delay: ${index * 0.05}s">
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
                <td class="${changeClass}">${coin.price_change_percentage_24h.toFixed(2)}%</td>
                <td>$${coin.market_cap.toLocaleString()}</td>
            </tr>
        `;
        cryptoTableBody.innerHTML += row;
    });

    if (coins.length === 0) {
        cryptoTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 3rem;">Nenhuma moeda encontrada.</td></tr>';
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

// Lógica de Limite (Quantidade de moedas)
document.getElementById('limitSelect').addEventListener('change', () => {
    fetchCryptoData();
});

// Lógica do Modal de Histórico
const historyModal = document.getElementById('historyModal');
const openHistoryBtn = document.getElementById('openHistory');
const closeHistoryBtn = document.getElementById('closeHistory');

openHistoryBtn.onclick = async () => {
    historyModal.style.display = 'flex';
    await fetchHistory();
}

closeHistoryBtn.onclick = () => {
    historyModal.style.display = 'none';
}

window.onclick = (event) => {
    if (event.target == historyModal) {
        historyModal.style.display = 'none';
    }
}

async function fetchHistory() {
    const historyContent = document.getElementById('historyContent');
    historyContent.innerHTML = 'Carregando histórico...';

    try {
        const response = await fetch('get_history.php');
        const data = await response.json();

        if (data.error) {
            historyContent.innerHTML = `<p style="color: var(--danger)">${data.error}</p>`;
            return;
        }

        let html = '<table style="width: 100%; border-collapse: collapse;">';
        html += '<thead><tr><th>Moeda</th><th>Preço</th><th>Data/Hora</th></tr></thead><tbody>';

        data.forEach(item => {
            const date = new Date(item.data_registro).toLocaleString('pt-BR');
            html += `
                <tr>
                    <td>
                        <div class="coin-name-cell">
                            <img src="${item.imagem}" alt="${item.nome}" style="width: 20px;">
                            <span>${item.nome}</span>
                        </div>
                    </td>
                    <td style="color: var(--primary); font-weight: 600;">$${parseFloat(item.preco).toLocaleString()}</td>
                    <td style="font-size: 0.85rem; color: var(--text-dim);">${date}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        historyContent.innerHTML = html;
    } catch (error) {
        historyContent.innerHTML = '<p>Erro ao carregar histórico.</p>';
    }
}

function updateLastUpdateTime() {
    const now = new Date();
    document.getElementById('lastUpdate').innerText = `Atualizado às: ${now.toLocaleTimeString()}`;
}

// Atualizar a cada 60 segundos (para não sobrecarregar a API pública)
setInterval(fetchCryptoData, 60000);

// Chamada inicial
document.addEventListener('DOMContentLoaded', fetchCryptoData);
