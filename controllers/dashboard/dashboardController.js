const userModel = require('../../models/userModel');

// Get user dashboard data
const getDashboardData = async (req, res) => {
    try {
        const userId = req.user.email; // From JWT middleware
        
        const dashboardData = await userModel.getUserDashboardData(userId);
        
        res.status(200).json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.email;
        
        const user = await userModel.getUserById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Remove sensitive data
        const { password, resetToken, resetTokenExpiry, ...userProfile } = user;
        
        res.status(200).json({
            success: true,
            data: userProfile
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user profile',
            error: error.message
        });
    }
};

// Get user transactions
const getUserTransactions = async (req, res) => {
    try {
        const userId = req.user.email;
        const limit = parseInt(req.query.limit) || 50;
        
        const transactions = await userModel.getUserTransactions(userId, limit);
        
        res.status(200).json({
            success: true,
            data: transactions,
            count: transactions.length
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transactions',
            error: error.message
        });
    }
};

// Update today's PnL (can be called from trading operations)
const updateTodayReport = async (req, res) => {
    try {
        const userId = req.user.email;
        const { pnl, gain } = req.body;

        if (pnl === undefined || gain === undefined) {
            return res.status(400).json({
                success: false,
                message: 'PnL and gain are required'
            });
        }

        await userModel.updateTodayReport(userId, pnl, gain);
        
        res.status(200).json({
            success: true,
            message: 'Today\'s report updated successfully'
        });
    } catch (error) {
        console.error('Update report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update today\'s report',
            error: error.message
        });
    }
};

// Update user holdings (called when portfolio changes)
const updateHoldings = async (req, res) => {
    try {
        const userId = req.user.email;
        const { holdings } = req.body;

        if (!Array.isArray(holdings)) {
            return res.status(400).json({
                success: false,
                message: 'Holdings must be an array'
            });
        }

        await userModel.updateUserHoldings(userId, holdings);
        
        res.status(200).json({
            success: true,
            message: 'Holdings updated successfully'
        });
    } catch (error) {
        console.error('Update holdings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update holdings',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardData,
    getUserProfile,
    getUserTransactions,
    updateTodayReport,
    updateHoldings
};