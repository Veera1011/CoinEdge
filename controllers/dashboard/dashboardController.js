const userModel = require('../../models/userModel');

// Get user dashboard data
const getDashboardData = async (req, res) => {
    try {
        // FIXED: Use req.user.id (which contains the email as document ID)
        const userId = req.user.id;
        
        console.log('Getting dashboard data for user:', userId);
        console.log('Full req.user object:', req.user);
        
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
        // FIXED: Use req.user.id
        const userId = req.user.id;
        
        console.log('Getting profile for user:', userId);
        
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
        // FIXED: Use req.user.id
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 50;
        
        console.log('Getting transactions for user:', userId);
        
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

// Update today's PnL
const updateTodayReport = async (req, res) => {
    try {
        // FIXED: Use req.user.id
        const userId = req.user.id;
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

// Update user holdings
const updateHoldings = async (req, res) => {
    try {
        // FIXED: Use req.user.id
        const userId = req.user.id;
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