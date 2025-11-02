// Firebase Auth Script using CDN Compat version
// Firebase configuration
let firebaseConfig = {};
let auth = null;
let googleProvider = null;

// Initialize Firebase
async function initializeFirebase() {
    try {
        console.log('Initializing Firebase...');
        const response = await fetch('/auth/firebase/config');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        firebaseConfig = await response.json();
        console.log('Firebase config loaded:', firebaseConfig);
        
        // Wait for Firebase to be available
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase is not loaded');
        }
        
        // Initialize Firebase using CDN compat version
        const app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        googleProvider = new firebase.auth.GoogleAuthProvider();
        
        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Firebase initialization failed:', error);
        alert('Firebase initialization failed: ' + error.message);
        return false;
    }
}

// Google Sign In
async function signInWithGoogle() {
    try {
        console.log('Starting Google sign-in...');
        
        // Ensure Firebase is initialized
        if (!auth || !googleProvider) {
            const initialized = await initializeFirebase();
            if (!initialized) {
                throw new Error('Failed to initialize Firebase');
            }
        }
        
        console.log('Opening Google sign-in popup...');
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;
        
        console.log('Google sign-in successful:', user);
        
        // Get the ID token
        const idToken = await user.getIdToken();
        console.log('ID token obtained');
        
        // Send token to your backend for verification
        const response = await fetch('/auth/firebase/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken })
        });
        
        const data = await response.json();
        console.log('Backend response:', data);
        
        if (data.success) {
            // Store data in the format expected by main.js
            const activeUserData = {
                isLoggedIn: true,
                token: data.data.token,
                userName: data.data.name,
                userEmail: data.data.email,
                userId: data.data.id,
                profilePicture: data.data.profilePicture,
                firebaseUid: data.data.firebaseUid
            };
            
            // Store in the format expected by main.js
            localStorage.setItem('activeUser', JSON.stringify(activeUserData));
            
            // Also store separately for compatibility
            localStorage.setItem('authToken', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data));
            
            console.log('Authentication successful, redirecting...');
            console.log('Stored activeUser:', activeUserData);
            
            // Redirect to dashboard
            window.location.href = '/user/dashboard';
        } else {
            throw new Error(data.message || 'Authentication failed');
        }
        
    } catch (error) {
        console.error('Google sign-in error:', error);
        
        // More specific error messages
        let errorMessage = 'Sign-in failed: ';
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage += 'Sign-in popup was closed';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage += 'Popup was blocked by browser';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage += 'Network error occurred';
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
    }
}

// Sign Out
async function signOutUser() {
    try {
        if (auth) {
            await auth.signOut();
        }
        
        // Clear all authentication data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('activeUser');
        
        // Redirect to login page
        window.location.href = '/auth/login';
        
    } catch (error) {
        console.error('Sign-out error:', error);
    }
}

// Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return token && user;
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Wait for Firebase to load before initializing
function waitForFirebase() {
    return new Promise((resolve) => {
        const checkFirebase = () => {
            if (typeof firebase !== 'undefined') {
                console.log('Firebase is now available');
                resolve();
            } else {
                console.log('Waiting for Firebase to load...');
                setTimeout(checkFirebase, 100);
            }
        };
        checkFirebase();
    });
}

// Initialize Firebase on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded, waiting for Firebase...');
    await waitForFirebase();
    console.log('Firebase is available, initializing...');
    initializeFirebase();
});

// Make functions globally available
window.signInWithGoogle = signInWithGoogle;
window.signOutUser = signOutUser;
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;