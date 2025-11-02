const { rootMainFile } = require('./path');
const path = require('path');
const ejs = require('ejs');
const { transporter } = require('../config/email/email');
require('dotenv').config();




// Constants
const FROM_EMAIL = process.env.GMAIL_USER;
const APP_NAME = 'CoinEdge';

// Input validation
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const renderTemplate = async (templateName, data) => {
    const templatePath = path.join(rootMainFile, 'utils', 'templates' , 'ejs', `${templateName}.ejs`);
    return await ejs.renderFile(templatePath, data);
};

// Send welcome email
const sendWelcomeEmail = async (username, email) => {
    // Input validation
    if (!username || !email || !validateEmail(email)) {
        return { success: false, error: 'Invalid input parameters' };
    }   

    try {
        // Render HTML template
        const htmlContent = await renderTemplate('welcomeEmail', {
            username,
            email,
            APP_NAME,
            dashboardUrl: process.env.DASHBOARD_URL || 'https://yourapp.com/dashboard'
        });

        const mailOptions = {
            from: FROM_EMAIL,
            to: email,
            subject: `Welcome to ${APP_NAME}!`,
            text: `Hello ${username}, welcome to ${APP_NAME}!`,
            html: htmlContent
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully:', result.messageId);
        return { success: true };
    } catch (error) {
        console.error('Welcome email error:', error.message);
        return { success: false, error: error.message };
    }
};


// Send password reset email link
const sendPasswordResetEmail = async (username, email, resetLink) => {
    // Input validation
    if (!email || !resetLink || !validateEmail(email)) {
        return { success: false, error: 'Invalid input parameters' };
    }

    try {
        // Render HTML template
        const htmlContent = await renderTemplate('passwordResetEmailLink', {
            username,
            email,
            resetLink,
            APP_NAME
        });

        const mailOptions = {
            from: FROM_EMAIL,
            to: email,
            subject: `Password Reset - ${APP_NAME}`,
            text: `Click the link to reset your password: ${resetLink}`,
            html: htmlContent
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully:', result.messageId);
        return { success: true };
    } catch (error) {
        console.error('Password reset email error:', error.message);
        return { success: false, error: error.message };
    }
};



module.exports = { sendWelcomeEmail , sendPasswordResetEmail};