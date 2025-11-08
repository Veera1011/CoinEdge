// controllers/register/userRegistration.js - UPDATED with proper initialization

const userModel = require('../../models/userModel');
const { sendWelcomeEmail } = require('../../utils/emailService');

const userRegistration = async (req, res) => {
    try {
        console.log('Received registration data:', req.body);
        
        const { username, email, password, confirmPassword } = req.body;
        
        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        const existingUser = await userModel.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists. Please use a different email.'
            });
        }
        
        // Prepare complete user data with ALL required fields
        const userData = { 
            name: username,
            email: email.toLowerCase().trim(),
            password: password,
            provider: 'email',
            isEmailVerified: false,
            profilePicture: null,
            firebaseUid: null,
            // Financial fields
            balance: 0,
            totalDeposits: 0,
            totalWithdrawals: 0,
            totalTrades: 0,
            todayPnL: 0,
            todayGain: 0,
            holdings: []
        };
        
        // First, try to send the welcome email
        let emailResult;
        try {
            emailResult = await sendWelcomeEmail(username, email);
            if (!emailResult.success) {
                console.error('Failed to send welcome email to:', email, 'Error:', emailResult.error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to send welcome email. Registration cancelled.',
                    emailError: emailResult.error
                });
            }
            console.log('Welcome email sent successfully to:', email);
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Failed to send welcome email. Registration cancelled.',
                emailError: emailError.message
            });
        }

        // Only save to database if email was sent successfully
        const newUser = await userModel.createUser(userData);
        
        console.log('✅ User registered successfully:', {
            id: newUser.id,
            email: newUser.email,
            balance: newUser.balance,
            holdings: newUser.holdings
        });
        
        // Send success response
        res.status(201).json({
            success: true,
            message: 'User registered successfully and welcome email sent',
            data: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name
            },
            emailSent: true
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { userRegistration };