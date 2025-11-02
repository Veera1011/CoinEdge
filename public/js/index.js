// Load live market data for index page
function loadLiveMarketData() {
    fetch('/user/cryptos/top10')
        .then(response => response.json())
        .then(data => {
            if (data.success && Array.isArray(data.top10)) {
                updateLiveMarketStats(data.top10);
            } else {
                showFallbackMarketData();
            }
        })
        .catch(error => {
            console.error("Error loading live market data:", error);
            showFallbackMarketData();
        });
}

function updateLiveMarketStats(cryptoData) {
    const marketStatsContainer = document.getElementById('live-market-stats');
    if (!marketStatsContainer) return;

    // Get top 3 cryptocurrencies for display
    const top3 = cryptoData.slice(0, 3);
    
    marketStatsContainer.innerHTML = '';
    
    top3.forEach(coin => {
        const statItem = document.createElement('div');
        statItem.className = 'stat-item';
        
        const changeClass = coin.change24h >= 0 ? 'text-success' : 'text-danger';
        const changeIcon = coin.change24h >= 0 ? '↗' : '↘';
        
        statItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="d-flex align-items-center">
                    <img src="${coin.image}" alt="${coin.symbol}" style="width: 24px; height: 24px; margin-right: 8px;">
                    <span class="stat-label">${coin.symbol}/USD</span>
                </div>
                <span class="stat-value ${changeClass}">
                    ${changeIcon} ${coin.change24h >= 0 ? '+' : ''}${coin.change24h.toFixed(2)}%
                </span>
            </div>
            <div class="stat-price text-dark fw-bold">
                $${coin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
        `;
        
        marketStatsContainer.appendChild(statItem);
    });
    
    // Add total volume (simulated or calculated)
    const totalVolumeItem = document.createElement('div');
    totalVolumeItem.className = 'stat-item mt-3 pt-3 border-top';
    totalVolumeItem.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <span class="stat-label">Total Volume</span>
            <span class="stat-value text-primary">$2.4B</span>
        </div>
    `;
    marketStatsContainer.appendChild(totalVolumeItem);
}

function showFallbackMarketData() {
    const marketStatsContainer = document.getElementById('live-market-stats');
    if (!marketStatsContainer) return;
    
    marketStatsContainer.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">BTC/USD</span>
            <span class="stat-value text-success">+2.5%</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">ETH/USD</span>
            <span class="stat-value text-danger">-1.2%</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Total Volume</span>
            <span class="stat-value text-primary">$2.4B</span>
        </div>
    `;
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadLiveMarketData();
    
    // Refresh data every 5 minutes
    setInterval(loadLiveMarketData, 5 * 60 * 1000);
});
