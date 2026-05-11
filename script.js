async function fetchCryptoData() {
    try {
        const response = await fetch('api_fetch.php');
        const data = await response.json();

        if (data.error) {
            alert('Erro: ' + data.error);
            console.error(data.error);
            return;
        }

        renderDashboard(data);
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

    // Renderizar os 3 primeiros em cards de destaque
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

    // Renderizar todos na tabela
    coins.forEach((coin, index) => {
        const changeClass = coin.price_change_percentage_24h >= 0 ? 'change-up' : 'change-down';
        const row = `
            <tr class="animate-fade" style="animation-delay: ${index * 0.05}s">
                <td>#${index + 1}</td>
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
}

// Atualizar a cada 30 segundos
setInterval(fetchCryptoData, 30000);

// Chamada inicial
document.addEventListener('DOMContentLoaded', fetchCryptoData);
