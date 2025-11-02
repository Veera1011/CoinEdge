const userModel = require("../../models/userModel");
const emailService = require("../../utils/emailService");
const crypto = require('crypto');
require('dotenv').config();

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Validate required fields
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if user exists in database
        const user = await userModel.getUserByEmail(email);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Email not found'
            });
        }

        // Send reset email
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); 
        await userModel.updateUserResetToken(user.id, resetToken, resetTokenExpiry);

        const resetLink = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;        
        await emailService.sendPasswordResetEmail(user.name,user.email, resetLink);

        res.status(200).json({
            success: true,
            message: 'Password reset link sent to your email'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

module.exports = { forgotPassword };