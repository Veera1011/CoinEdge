const userModel = require('../../models/userModel');

const resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword, token } = req.body;
        
        // Validate token
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Reset token is required'
            });
        }

        // Get user by token
        const user = await userModel.getUserByResetToken(token);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reset token'
            });
        }

        // Check token expiry
        if (new Date() > user.resetTokenExpiry.toDate()) {
            return res.status(400).json({
                success: false,
                message: 'Reset token has expired'
            });
        }

        // Validate passwords
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Update password
        await userModel.updateUserPassword(user.id, password);

        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });
        
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = { resetPassword };