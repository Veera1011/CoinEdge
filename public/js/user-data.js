// public/js/user-data.js - Enhanced version
// This script fetches and displays dynamic user data from Firestore

// Get auth token from localStorage
function getAuthToken() {
    try {
        const authData = localStorage.getItem('activeUser');
        const userData = JSON.parse(authData);
        return userData?.token || null;
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
}

// Check if user is authenticated
function isAuthenticated() {
    return !!getAuthToken();
}

// Fetch with auth header
async function fetchWithAuth(url, options = {}) {
    const token = getAuthToken();
    
    if (!token) {
        throw new Error('Not authenticated');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401 || response.status === 403) {
        // Token expired or invalid
        localStorage.removeItem('activeUser');
        window.location.href = '/auth/login';
        throw new Error('Session expired');
    }

    return response;
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount || 0);
}

// Format percentage
function formatPercentage(value) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

// Fetch dashboard data
async function fetchDashboardData() {
    try {
        showSweetLoader('Loading Dashboard...', 'Please wait while we fetch your data');
        
        const response = await fetchWithAuth('/user/api/dashboard-data');
        const result = await response.json();
        
        hideSweetLoader();
        
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch dashboard data');
        }
    } catch (error) {
        hideSweetLoader();
        console.error('Error fetching dashboard data:', error);
        return null;
    }
}

// Fetch user balance
async function fetchUserBalance() {
    try {
        const response = await fetchWithAuth('/user/api/withdraw/balance');
        const result = await response.json();
        
        if (result.success) {
            return result.balance;
        } else {
            throw new Error(result.message || 'Failed to fetch balance');
        }
    } catch (error) {
        console.error('Error fetching balance:', error);
        return 0;
    }
}

// Fetch user profile
async function fetchUserProfile() {
    try {
        const response = await fetchWithAuth('/user/api/profile');
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch profile');
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
}

// Fetch withdrawal history
async function fetchWithdrawalHistory() {
    try {
        const response = await fetchWithAuth('/user/api/withdraw/history');
        const result = await response.json();
        
        if (result.success) {
            return result.withdrawals;
        } else {
            throw new Error(result.message || 'Failed to fetch withdrawal history');
        }
    } catch (error) {
        console.error('Error fetching withdrawal history:', error);
        return [];
    }
}

// Fetch transactions
async function fetchTransactions(limit = 50) {
    try {
        const response = await fetchWithAuth(`/user/api/transactions?limit=${limit}`);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch transactions');
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

// Update dashboard display
function updateDashboardDisplay(data) {
    console.log('Updating dashboard with data:', data);
    
    // Update account balance
    const balanceElements = document.querySelectorAll('[data-balance="account"]');
    balanceElements.forEach(el => {
        el.textContent = formatCurrency(data.accountBalance);
    });

    // Update today's PnL
    const pnlElements = document.querySelectorAll('[data-balance="pnl"]');
    pnlElements.forEach(el => {
        const pnl = data.todayPnL || 0;
        el.textContent = formatCurrency(pnl);
        el.classList.remove('positive', 'negative');
        el.classList.add(pnl >= 0 ? 'positive' : 'negative');
    });

    // Update today's gain
    const gainElements = document.querySelectorAll('[data-balance="gain"]');
    gainElements.forEach(el => {
        const gain = data.todayGain || 0;
        el.textContent = formatPercentage(gain);
        el.classList.remove('positive', 'negative');
        el.classList.add(gain >= 0 ? 'positive' : 'negative');
    });

    // Update balance report
    const reportElements = document.querySelectorAll('[data-balance="report"]');
    reportElements.forEach(el => {
        el.textContent = formatCurrency(data.balanceReport);
    });

    // Update holdings if present
    if (data.holdings && data.holdings.length > 0) {
        updateHoldingsDisplay(data.holdings);
    }
}

// Update holdings display
function updateHoldingsDisplay(holdings) {
    const holdingsTable = document.querySelector('.holdings-table tbody');
    if (!holdingsTable) return;

    holdingsTable.innerHTML = holdings.map(holding => `
        <tr>
            <td class="asset-cell">
                <div class="asset-info">
                    <div class="asset-icon ${holding.symbol.toLowerCase()}-icon">
                        ${getAssetIcon(holding.symbol)}
                    </div>
                    <div class="asset-details">
                        <span class="asset-symbol">${holding.symbol}</span>
                        <span class="asset-name">${holding.name}</span>
                    </div>
                </div>
            </td>
            <td class="balance-cell">${holding.balance} ${holding.symbol}</td>
            <td class="value-cell">${formatCurrency(holding.value)}</td>
            <td class="change-cell ${holding.change24h >= 0 ? 'positive' : 'negative'}">
                <i class="fas fa-arrow-${holding.change24h >= 0 ? 'up' : 'down'}"></i>
                <span>${formatPercentage(holding.change24h)}</span>
            </td>
            <td class="allocation-cell">
                <div class="allocation-bar">
                    <div class="allocation-fill" style="width: ${holding.allocation}%"></div>
                </div>
                <span class="allocation-text">${holding.allocation}%</span>
            </td>
        </tr>
    `).join('');
}

// Get asset icon
function getAssetIcon(symbol) {
    const icons = {
        'BTC': '₿',
        'ETH': 'Ξ',
        'SOL': '◎',
        'BNB': 'B',
        'USDT': '₮',
        'XRP': 'X',
        'ADA': 'A',
        'DOGE': 'Ð'
    };
    return icons[symbol.toUpperCase()] || symbol.charAt(0);
}

// Update withdrawal page display
function updateWithdrawalDisplay(balance, history) {
    // Update balance
    const balanceElement = document.getElementById('userBalance');
    if (balanceElement) {
        balanceElement.textContent = formatCurrency(balance);
    }

    // Update history
    const historyContainer = document.getElementById('withdrawalHistory');
    if (!historyContainer) return;
    
    if (history.length === 0) {
        historyContainer.innerHTML = `
            <div class="no-history">
                <i class="fas fa-history"></i>
                <p>No withdrawal history available</p>
            </div>
        `;
        return;
    }

    historyContainer.innerHTML = history.map(withdrawal => `
        <div class="history-item">
            <div class="history-header">
                <span class="history-amount">${formatCurrency(withdrawal.amount)}</span>
                <span class="history-status status-${withdrawal.status}">${withdrawal.status}</span>
            </div>
            <div class="history-details">
                <div class="history-address">${withdrawal.walletAddress}</div>
                <div class="history-date">${new Date(withdrawal.createdAt).toLocaleString()}</div>
            </div>
            ${withdrawal.transactionId ? `<div class="history-tx">TX: ${withdrawal.transactionId}</div>` : ''}
        </div>
    `).join('');
}

// Initialize page-specific data
async function initializePageData() {
    const path = window.location.pathname;

    if (!isAuthenticated()) {
        // Redirect to login if on protected pages
        const protectedPaths = ['/user/dashboard', '/user/portfolio', '/user/withdraw', '/user/deposit', '/user/trading'];
        if (protectedPaths.some(p => path.includes(p))) {
            window.location.href = '/auth/login';
        }
        return;
    }

    try {
        // Dashboard and Portfolio pages
        if (path.includes('/dashboard') || path.includes('/portfolio')) {
            const dashboardData = await fetchDashboardData();
            if (dashboardData) {
                updateDashboardDisplay(dashboardData);
            }
        }

        // Withdraw page
        if (path.includes('/withdraw')) {
            const balance = await fetchUserBalance();
            const history = await fetchWithdrawalHistory();
            updateWithdrawalDisplay(balance, history);
        }

        // Load user profile for navbar
        const profile = await fetchUserProfile();
        if (profile) {
            const nameElement = document.getElementById('loginSpanname');
            if (nameElement && profile.name) {
                nameElement.textContent = profile.name.toUpperCase();
            }
        }
    } catch (error) {
        console.error('Error initializing page data:', error);
    }
}

// Auto-refresh data every 30 seconds
let refreshInterval = null;

function startAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    refreshInterval = setInterval(async () => {
        const path = window.location.pathname;
        
        if (path.includes('/dashboard') || path.includes('/portfolio')) {
            const dashboardData = await fetchDashboardData();
            if (dashboardData) {
                updateDashboardDisplay(dashboardData);
            }
        }
    }, 30000); // 30 seconds
}

// Stop auto-refresh
function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializePageData();
        startAutoRefresh();
    });
} else {
    initializePageData();
    startAutoRefresh();
}

// Cleanup on page unload
window.addEventListener('beforeunload', stopAutoRefresh);

// Export functions for use in other scripts
window.UserData = {
    fetchDashboardData,
    fetchUserBalance,
    fetchUserProfile,
    fetchWithdrawalHistory,
    fetchTransactions,
    fetchWithAuth,
    isAuthenticated,
    updateDashboardDisplay,
    formatCurrency,
    formatPercentage
};