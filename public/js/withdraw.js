document.addEventListener('DOMContentLoaded', function() {
    const withdrawBtn = document.getElementById('withdrawBtn');
    const amountInput = document.getElementById('amount');
    const walletInput = document.getElementById('walletAddress');
    const userBalanceEl = document.getElementById('userBalance');
    const withdrawalHistoryEl = document.getElementById('withdrawalHistory');
    
    // Message elements
    const messageCard = document.getElementById('messageCard');
    const messageIcon = document.getElementById('messageIcon');
    const messageTitle = document.getElementById('messageTitle');
    const messageDescription = document.getElementById('messageDescription');
    
    let userBalance = 0;

    // Initialize
    init();

    async function init() {
        // Load user balance (mock data for now)
        userBalance = 0; // Replace with actual API call
        userBalanceEl.textContent = `${userBalance.toFixed(2)}`;
        
        // Load withdrawal history
        loadWithdrawalHistory();
    }

    function loadWithdrawalHistory() {
        // Mock data - replace with actual API call
        const mockHistory = [];
        
        if (mockHistory.length === 0) {
            withdrawalHistoryEl.innerHTML = `
                <div class="no-history">
                    <i class="fas fa-history"></i>
                    <p>No withdrawal history available</p>
                </div>
            `;
        }
    }

    // Show message function
    function showMessage(type, icon, title, description) {
        messageCard.className = `message-card ${type}`;
        messageIcon.className = `message-icon ${icon}`;
        messageTitle.textContent = title;
        messageDescription.textContent = description;
        messageCard.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideMessage();
        }, 5000);
    }

    // Hide message function
    function hideMessage() {
        messageCard.style.display = 'none';
    }

    // Handle withdraw button click
    withdrawBtn.addEventListener('click', function() {
        const amount = parseFloat(amountInput.value);
        const walletAddress = walletInput.value.trim();

        // Hide any existing message
        hideMessage();

        // Basic validation
        if (!amount || amount <= 0) {
            showMessage('error', 'fas fa-exclamation-triangle', 'Invalid Amount', 'Please enter a valid amount greater than 0');
            return;
        }

        if (amount > userBalance) {
            showMessage('error', 'fas fa-exclamation-triangle', 'Insufficient Balance', 'You do not have enough balance for this withdrawal');
            return;
        }

        if (!walletAddress || !walletAddress.startsWith('0x')) {
            showMessage('error', 'fas fa-exclamation-triangle', 'Invalid Wallet Address', 'Please enter a valid ERC20 wallet address');
            return;
        }

        if (walletAddress.length !== 42) {
            showMessage('error', 'fas fa-exclamation-triangle', 'Invalid Wallet Address', 'Wallet address must be 42 characters long');
            return;
        }

        if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            showMessage('error', 'fas fa-exclamation-triangle', 'Invalid Wallet Address', 'Please enter a valid ERC20 wallet address format');
            return;
        }

        // Show loading
        withdrawBtn.textContent = 'Processing...';
        withdrawBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            showMessage('success', 'fas fa-check-circle', 'Success', 'Withdrawal request submitted successfully! You will receive an email confirmation shortly.');
            
            // Reset form
            amountInput.value = '';
            walletInput.value = '';
            
            // Reset button
            withdrawBtn.textContent = 'Withdraw';
            withdrawBtn.disabled = false;
            
            // Update balance
            userBalance -= amount;
            userBalanceEl.textContent = `$${userBalance.toFixed(2)}`;
            
        }, 2000);
    });
});