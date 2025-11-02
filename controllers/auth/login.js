const UserModel = require("../../models/userModel");
const { generateToken } = require("../../utils/jwt/jwt");
const jwt = require('jsonwebtoken');

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Check if user exists in database
        const user = await UserModel.getUserByEmail(email);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
           // Generate JWT token with 1 hour expiration
        const token = generateToken({
            id: user.id,
            email: user.email,
            name: user.name
        });

        // Login successful
        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            data: {
                id: user.id,
                email: user.email,
                name:user.name,
                token:token,
                
                expiresIn: '1h'
            }
            
        });
        console.log(user);
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


const tokenValidation= async (req, res) => {
    try {
        const { token } = req.body;
        
        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user still exists and is active
        const user = await UserModel.getUserById(decoded.id);
        
        if (user) {
            res.json({ valid: true, user: decoded });
        } else {
            res.json({ valid: false });
        }
    } catch (error) {
        res.json({ valid: false });
    }
}





module.exports = { userLogin, tokenValidation};