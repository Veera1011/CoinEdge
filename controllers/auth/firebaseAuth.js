// controllers/auth/firebaseAuth.js - UPDATED with proper initialization

const admin = require('firebase-admin');
const UserModel = require('../../models/userModel');
const { generateToken } = require('../../utils/jwt/jwt');

// Verify Firebase ID token
const verifyFirebaseToken = async (req, res) => {
    try {
        const { idToken } = req.body;
        
        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: 'ID token is required'
            });
        }

        // Verify the Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const email = decodedToken.email;
        const name = decodedToken.name;
        const picture = decodedToken.picture;

        console.log('Firebase auth successful for:', email);

        // Check if user exists in your database
        let user = await UserModel.getUserByEmail(email);
        
        if (!user) {
            console.log('Creating new user from Google auth:', email);
            
            // Create new user with ALL required fields
            const newUserData = {
                firebaseUid: uid,
                name: name,
                email: email,
                profilePicture: picture,
                isEmailVerified: true,
                provider: 'google',
                password: null, // Google users don't have password
                // Financial fields (from default)
                balance: 0,
                totalDeposits: 0,
                totalWithdrawals: 0,
                totalTrades: 0,
                todayPnL: 0,
                todayGain: 0,
                holdings: []
            };
            
            user = await UserModel.createUser(newUserData);
            console.log('✅ New Google user created:', user.id);
        } else {
            console.log('Existing user found:', email);
            
            // Update existing user with Firebase UID if not set
            if (!user.firebaseUid) {
                await UserModel.updateUserFirebaseUid(user.id, uid);
                user.firebaseUid = uid;
            }
            
            // Ensure user has all required fields (for existing users)
            await UserModel.ensureUserFields(user.id);
        }

        // Generate JWT token for your application
        const token = generateToken({
            id: user.id,
            email: user.email,
            name: user.name,
            firebaseUid: uid
        });

        res.status(200).json({
            success: true,
            message: 'Firebase authentication successful',
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                profilePicture: user.profilePicture || picture,
                token: token,
                expiresIn: '1h'
            }
        });

    } catch (error) {
        console.error('Firebase token verification error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid Firebase token',
            error: error.message
        });
    }
};

// Get Firebase config for frontend
const getFirebaseConfig = (req, res) => {
    res.json({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    });
};

module.exports = {
    verifyFirebaseToken,
    getFirebaseConfig
};