
// Simple SweetAlert2 loader functions
function showSweetLoader(title = 'Loading...', text = 'Please wait') {
    Swal.fire({
        title: title,
        text: text,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

function hideSweetLoader() {
    Swal.close();
}


function showCryptoLoader() {
    showSweetLoader('Loading Crypto Data...', 'Please wait while we fetch the latest market data');
}

function hideCryptoLoader() {
    hideSweetLoader();
}


// Load crypto data and create charts

function loadCryptoData() {
    const authData = localStorage.getItem("activeUser");
    const userData = JSON.parse(authData);
    
    // Show loader when starting to fetch data
    showCryptoLoader();
    
    fetch('/user/cryptos/top10', {
        headers: {
            'Authorization': `Bearer ${userData.token}`
        }
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("activeUser");
            hideCryptoLoader(); // Hide loader on error
            window.location.href = '/auth/login';
            return;
        }
        return response.json();
    })
    .then(data => {
        console.log("Fetched crypto data:", data);
        if (data.success && Array.isArray(data.top10)) {
            const currentPath = window.location.pathname;
            
            // Dashboard and Market pages - show table and charts
            if (currentPath === '/user/dashboard' || currentPath === '/user/market') {
                populateTable(data.top10);
                createCharts(data.top10);
            }
            // Trading page - show arbitrage opportunities
            else if (currentPath === '/user/trading') {
                populateArbitrageOpportunities(data.top10);
            }
            
            // Hide loader after data is loaded
            hideCryptoLoader();
        } else {
            hideCryptoLoader(); // Hide loader on error
            showError("Invalid data received from server.");
        }
    })
    .catch(error => {
        console.error("Error loading crypto data:", error);
        hideCryptoLoader(); // Hide loader on error
        showError("Error loading data.");
    });
}

// ✅ Populate crypto table
function populateTable(cryptoData) {
    const tbody = document.getElementById('crypto-table-body');
    tbody.innerHTML = '';

    cryptoData.forEach(coin => {
        const row = document.createElement('tr');

        // ✅ Handle missing values gracefully
        const price = coin.price ? 
            `$${coin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
            'N/A';
        const marketCap = coin.marketCap ? 
            `$${Number(coin.marketCap).toLocaleString('en-US')}` : 
            'N/A';
        const change24h = coin.change24h ? parseFloat(coin.change24h) : 0;

        row.innerHTML = `
            <td class="coin-cell">
                <img src="${coin.image || ''}" alt="${coin.symbol}" style="width:40px;height:40px;vertical-align:middle;">
            </td>
            <td class="coin-cell">
                <div class="coin-info">
                    <span class="coin-symbol">${coin.symbol || '-'}</span>
                    <span class="coin-name">${coin.name || '-'}</span>
                </div>
            </td>
            <td class="price-cell">${price}</td>
            <td class="chart-cell">
                <div class="mini-chart">
                    <canvas id="chart-${coin.symbol?.toLowerCase() || 'unknown'}"></canvas>
                </div>
            </td>
            <td class="coin-cell">${marketCap}</td>
            <td class="coin-cell">${change24h.toFixed(2)}%</td>
            <td class="change-cell ${change24h >= 0 ? 'positive' : 'negative'}">
                <i class="fas fa-arrow-${change24h >= 0 ? 'up' : 'down'}"></i>
                <span>${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%</span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ✅ Create mini line charts using Chart.js
function createCharts(cryptoData) {
    cryptoData.forEach(coin => {
        const canvasId = `chart-${coin.symbol?.toLowerCase() || 'unknown'}`;
        const ctx = document.getElementById(canvasId);

        if (ctx && Array.isArray(coin.chartData) && coin.chartData.length > 0) {
            const color = coin.change24h >= 0 ? '#10b981' : '#ef4444';

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: coin.chartData.map((_, i) => i),
                    datasets: [{
                        data: coin.chartData,
                        borderColor: color,
                        backgroundColor: color + '20',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                    },
                    scales: {
                        x: { display: false },
                        y: { display: false }
                    }
                }
            });
        }
    });
}


function populateArbitrageOpportunities(cryptoData) {
    const arbitrageGrid = document.getElementById('arbitrage-grid');
    if (!arbitrageGrid) return;

    // Define arbitrage opportunities based on the image
    const arbitrageOpportunities = [
        {
            title: "5 Day Arbitrage",
            amount: "2,000 - 10,000 USDT",
            roi: "0.6%",
            cryptos: ["ethereum"]
        },
        {
            title: "15 Day Arbitrage", 
            amount: "10,000 - 50,000 USDT",
            roi: "0.9%",
            cryptos: ["tron", "chainlink", "tether"]
        },
        {
            title: "30 Day Arbitrage",
            amount: "50,000 - 100,000 USDT", 
            roi: "1.2%",
            cryptos: ["avalanche-2", "binancecoin", "dogecoin", "solana"]
        },
         {
            title: "60 Day Arbitrage",
            amount: "100,000 - 200,000 USDT",
            roi: "1.5%", 
            cryptos: ["ethereum", "matic-network", "usd-coin", "litecoin", "cosmos"]
        },
        {
            title: "120 Day Arbitrage",
            amount: "200,000 - 500,000 USDT",
            roi: "2.2%",
            cryptos: ["shiba-inu", "tron", "filecoin", "tether", "bitcoin", "bitcoin-cash"]
        }
    ];

    arbitrageGrid.innerHTML = '';

    arbitrageOpportunities.forEach(opportunity => {
        const card = document.createElement('div');
        card.className = 'arbitrage-card';

        // Find crypto icons from the fetched data
        const cryptoIcons = opportunity.cryptos.map(cryptoId => {
            const crypto = cryptoData.find(c => c.id === cryptoId);
            return crypto ? crypto.image : null;
        }).filter(img => img !== null);
 card.innerHTML = `
            <div class="arbitrage-title">${opportunity.title}</div>
            <div class="arbitrage-amount">${opportunity.amount}</div>
            <div class="arbitrage-roi">${opportunity.roi}</div>
            <div class="arbitrage-crypto-icons">
                ${cryptoIcons.map(img => 
                    `<img src="${img}" alt="crypto" class="crypto-icon">`
                ).join('')}
            </div>
        `;

        arbitrageGrid.appendChild(card);
    });
}

// Add this function to chart.js
function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonText: 'OK'
    });
}

// Deposit page functionality
function initializeDepositPage() {
    const currentPath = window.location.pathname;
    
    if (currentPath === '/user/deposit') {
        showDepositLoader();
        loadCryptoDataForDeposit();
        setupDepositEventListeners();
    }
}


function showDepositLoader() {
    showSweetLoader('Loading Deposit Data...', 'Please wait while we load cryptocurrency data for deposit');
}

function hideDepositLoader() {
    hideSweetLoader();
}

function loadCryptoDataForDeposit() {
    const authData = localStorage.getItem("activeUser");
    const userData = JSON.parse(authData);
    
    if (!userData || !userData.token) {
       // hideDepositLoader();
        window.location.href = '/auth/login';
        return;
    }
    
    fetch('/user/cryptos/top10', {
        headers: {
            'Authorization': `Bearer ${userData.token}`
        }
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("activeUser");
          //  hideDepositLoader();
            window.location.href = '/auth/login';
            return;
        }
        return response.json();
    })
    .then(data => {
        if (data.success && Array.isArray(data.top10)) {
            populateCryptoSelection(data.top10);
            setDefaultCrypto(data.top10[0]); // Set first crypto as default

            // SHOW the deposit UI
            const depositContainer = document.getElementById('depositContainer');
            if (depositContainer) depositContainer.style.display = 'block';
            
            // Hide loader after data is loaded
            // setTimeout(() => {
            //     hideDepositLoader();
            // }, 500); // Small delay for smooth transition
        } else {
            //hideDepositLoader();
            showError("Failed to load cryptocurrency data.");
        }
    })
    .catch(error => {
        console.error("Error loading crypto data:", error);
        hideDepositLoader();
        showError("Error loading cryptocurrency data. Please try again.");
    });
}

function populateCryptoSelection(cryptoData) {
    const cryptoList = document.getElementById('cryptoList');
    if (!cryptoList) return;
    
    cryptoList.innerHTML = '';
    
    cryptoData.forEach(coin => {
        const cryptoOption = document.createElement('div');
        cryptoOption.className = 'crypto-option';
        cryptoOption.dataset.symbol = coin.symbol;
        cryptoOption.dataset.price = coin.price;
        cryptoOption.dataset.image = coin.image;
        
        cryptoOption.innerHTML = `
            <img src="${coin.image || ''}" alt="${coin.symbol}" class="crypto-option-logo">
            <span class="crypto-option-symbol">${coin.symbol || '-'}</span>
        `;
        
        cryptoOption.addEventListener('click', () => {
            selectCrypto(coin);
            toggleDropdown(); // Close dropdown after selection
        });
        
        cryptoList.appendChild(cryptoOption);
    });
}

function setDefaultCrypto(crypto) {
    if (crypto) {
        selectCrypto(crypto);
    }
}

function selectCrypto(crypto) {
    // Update selected crypto display
    const selectedCryptoLogo = document.getElementById('selectedCryptoLogo');
    const selectedCryptoSymbol = document.getElementById('selectedCryptoSymbol');
    const exchangeRateValue = document.getElementById('exchangeRateValue');
    const cryptoHighlight = document.getElementById('cryptoHighlight');
    
    if (selectedCryptoLogo) selectedCryptoLogo.src = crypto.image || '';
    if (selectedCryptoSymbol) selectedCryptoSymbol.textContent = crypto.symbol || '';
    if (exchangeRateValue) {
        const price = crypto.price ? crypto.price.toFixed(2) : '0.00';
        exchangeRateValue.textContent = `1 ${crypto.symbol} = $${price}`;
    }
    if (cryptoHighlight) cryptoHighlight.textContent = crypto.symbol || '';
    
    // Update visual selection
    document.querySelectorAll('.crypto-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.symbol === crypto.symbol) {
            option.classList.add('selected');
        }
    });
    
    // Generate QR code and deposit address (mock data for now)
    generateDepositDetails(crypto);
}


const qrCodeMapping = {
    'BTC': 'bc1qf06zlevtyxzymgrk3yevcx7wwzhvuawt0e0ark_BTC.jpg',
    'ETH': '0xd9b0cafbb65a58ca2d1b675ccf663d9d49c7fb21_ETH.jpg',
    'BNB': '0xd9B0CafbB65A58ca2d1b675CcF663d9D49C7FB21_BNB.jpg',
    'USDC': '0xd9B0CafbB65A58ca2d1b675CcF663d9D49C7FB21_USDC.jpg',
    'STETH': '0xd9B0CafbB65A58ca2d1b675CcF663d9D49C7FB21_steth.jpg',
    'USDT': 'TUE7Pt8YKxJsrNhnmbTvG4spG3fSazanLP_USDT.jpg',
    'TRX': 'TUE7Pt8YKxJsrNhnmbTvG4spG3fSazanLP_trx.jpg',
    'XRP': 'rpPCVkbUz2Wkya5eC91QMVQWhVgbZPsRRC_XRP.jpg',
    'DOGE': 'DCXKsWTFKLRhz3MJSCgxSgcJrgrpqh5xmG_Doge.jpg',
    'SOL': 'GPUoj646GLzSJxedKmchXfegM186EYV1KQMyELKFfKM6_sol.jpg'
};

function generateDepositDetails(crypto) {
    const qrCode = document.getElementById('qrCode');
    const depositAddress = document.getElementById('depositAddress');
    
    if (!crypto || !crypto.symbol) {
        return;
    }
    
    // Get the symbol in uppercase for mapping
    const symbolUpper = crypto.symbol.toUpperCase();
    
    // Find the QR code filename for this crypto
    const qrFileName = qrCodeMapping[symbolUpper];
    
    if (qrFileName && qrCode) {
        // Extract the address/ID from filename (everything before the last underscore)
        const address = qrFileName.substring(0, qrFileName.lastIndexOf('_'));
        
        // Construct the full path to the QR code image
        const qrImagePath = `/assets/QR Codes/${qrFileName}`;
        
        // Display the actual QR code image
        qrCode.innerHTML = `
            <img src="${qrImagePath}" alt="QR Code for ${crypto.symbol}" style="max-width: 100%; height: auto; border-radius: 8px;">
        `;
        
        // Update the deposit address with the extracted ID
        if (depositAddress) {
            depositAddress.textContent = address;
        }
    } else {
        // Fallback if QR code not found
        if (qrCode) {
            qrCode.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 2rem;">
                    <div style="font-size: 0.7rem; font-weight: bold;">QR CODE</div>
                    <div style="font-size: 0.6rem; color: #64748b;">No QR code available for ${crypto.symbol}</div>
                </div>
            `;
        }
        if (depositAddress) {
            depositAddress.textContent = 'Address not available';
        }
    }
}



function generateMockAddress(symbol) {
    const prefix = '0x';
    const randomHex = Array.from({length: 40}, () => 
        Math.floor(Math.random() * 16).toString(16)
    ).join('');
    return prefix + randomHex;
}

function toggleDropdown() {
    const dropdown = document.getElementById('cryptoDropdown');
    const arrow = document.getElementById('dropdownArrow');
    
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block';
        arrow.classList.add('rotated');
    } else {
        dropdown.style.display = 'none';
        arrow.classList.remove('rotated');
    }
}

function setupDepositEventListeners() {
    // Main crypto card click handler
    const selectedCryptoCard = document.getElementById('selectedCryptoCard');
    if (selectedCryptoCard) {
        selectedCryptoCard.addEventListener('click', toggleDropdown);
    }
    
    // Copy button handler
    const copyBtn = document.getElementById('copyBtn');
    const depositAddress = document.getElementById('depositAddress');
    
    if (copyBtn && depositAddress) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(depositAddress.textContent).then(() => {
                copyBtn.textContent = 'Copied!';
                copyBtn.style.background = '#10b981';
                
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                    copyBtn.style.background = '#3b82f6';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy address:', err);
            });
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('cryptoDropdown');
        const card = document.getElementById('selectedCryptoCard');
        
        if (dropdown && card && !card.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
            document.getElementById('dropdownArrow').classList.remove('rotated');
        }
    });
}


// Wait for DOM and token initialization before checking auth

document.addEventListener('DOMContentLoaded', function() {
    const authData = localStorage.getItem("activeUser");
    const userData = JSON.parse(authData);
    
    // Don't load crypto data on settings page
    const currentPath = window.location.pathname;
    if (currentPath === '/user/settings') {
        console.log('Settings page - skipping crypto data load');
        return;
    }
    
    if (userData.isLoggedIn === true && userData.token) {
        // Validate token with server
        fetch('/auth/validate-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: userData.token })
        })
        .then(response => response.json())
        .then(result => {
            if (result.valid) {
                console.log('✅ Token validated - loading data');
                loadCryptoData();
            } else {
                console.log('❌ Invalid token - clearing session');
                localStorage.removeItem("activeUser");
                window.location.href = '/auth/login';
            }
        })
         .catch(error => {
            console.error('Token validation error:', error);
            localStorage.removeItem("activeUser");
            window.location.href = '/auth/login';
        });
    } else {
        console.log('User not logged in.');
    }
    initializeDepositPage();
});