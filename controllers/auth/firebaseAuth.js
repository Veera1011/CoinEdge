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

        // Check if user exists in your database
        let user = await UserModel.getUserByEmail(email);
        
        if (!user) {
            // Create new user if doesn't exist
            const newUserData = {
                firebaseUid: uid,
                name: name,
                email: email,
                profilePicture: picture,
                isEmailVerified: true,
                provider: 'google',
                createdAt: new Date()
            };
            
            user = await UserModel.createUser(newUserData);
        } else {
            // Update existing user with Firebase UID if not set
            if (!user.firebaseUid) {
                await UserModel.updateUserFirebaseUid(user.id, uid);
                user.firebaseUid = uid;
            }
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
                profilePicture: user.profilePicture,
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