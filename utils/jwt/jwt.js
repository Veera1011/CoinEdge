require('dotenv').config();
const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET;
// Generate token with 1 hour expiration
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

// Verify token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = { generateToken, verifyToken };