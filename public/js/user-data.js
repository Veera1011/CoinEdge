// public/js/user-data.js
// This script fetches and displays dynamic user data

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('token');
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

    if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
        throw new Error('Session expired');
    }

    return response;
}

// Fetch dashboard data
async function fetchDashboardData() {
    try {
        const response = await fetchWithAuth('/user/api/dashboard-data');
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to fetch dashboard data');
        }
    } catch (error) {
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
    // Update account balance
    const balanceElements = document.querySelectorAll('[data-user-balance]');
    balanceElements.forEach(el => {
        el.textContent = `$${data.accountBalance.toFixed(2)}`;
    });

    // Update today's PnL
    const pnlElements = document.querySelectorAll('[data-today-pnl]');
    pnlElements.forEach(el => {
        const pnl = data.todayPnL;
        el.textContent = pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`;
        el.className = pnl >= 0 ? 'sub-card-value positive' : 'sub-card-value negative';
    });

    // Update today's gain
    const gainElements = document.querySelectorAll('[data-today-gain]');
    gainElements.forEach(el => {
        const gain = data.todayGain;
        el.textContent = gain >= 0 ? `+${gain.toFixed(2)}%` : `${gain.toFixed(2)}%`;
        el.className = gain >= 0 ? 'sub-card-value positive' : 'sub-card-value negative';
    });

    // Update balance report
    const reportElements = document.querySelectorAll('[data-balance-report]');
    reportElements.forEach(el => {
        el.textContent = `$${data.balanceReport.toFixed(2)}`;
    });
}

// Update withdrawal page display
function updateWithdrawalDisplay(balance, history) {
    // Update balance
    const balanceElement = document.getElementById('userBalance');
    if (balanceElement) {
        balanceElement.textContent = `$${balance.toFixed(2)}`;
    }

    // Update history
    const historyContainer = document.getElementById('withdrawalHistory');
    if (historyContainer && history.length > 0) {
        const historyHTML = history.map(withdrawal => `
            <div class="history-item">
                <div class="history-header">
                    <span class="history-amount">$${withdrawal.amount.toFixed(2)}</span>
                    <span class="history-status status-${withdrawal.status}">${withdrawal.status}</span>
                </div>
                <div class="history-details">
                    <div class="history-address">${withdrawal.walletAddress}</div>
                    <div class="history-date">${new Date(withdrawal.createdAt).toLocaleString()}</div>
                </div>
                ${withdrawal.transactionId ? `<div class="history-tx">TX: ${withdrawal.transactionId}</div>` : ''}
            </div>
        `).join('');

        historyContainer.innerHTML = historyHTML;
    }
}

// Initialize page-specific data
async function initializePageData() {
    const path = window.location.pathname;

    if (!isAuthenticated()) {
        // Redirect to login if on protected pages
        const protectedPaths = ['/user/dashboard', '/user/portfolio', '/user/withdraw', '/user/deposit', '/user/settings'];
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
            if (nameElement) {
                nameElement.textContent = profile.name;
            }
        }
    } catch (error) {
        console.error('Error initializing page data:', error);
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePageData);
} else {
    initializePageData();
}

// Export functions for use in other scripts
window.UserData = {
    fetchDashboardData,
    fetchUserBalance,
    fetchUserProfile,
    fetchWithdrawalHistory,
    fetchTransactions,
    fetchWithAuth,
    isAuthenticated
};