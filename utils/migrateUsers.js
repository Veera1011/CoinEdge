// utils/migrateUsers.js
// Run this ONCE to add missing fields to existing users

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase (only if not already initialized)
if (!admin.apps.length) {
    const serviceAccount = require(path.join(__dirname, '../config/fireBaseConfig/j.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const defaultFields = {
    balance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalTrades: 0,
    todayPnL: 0,
    todayGain: 0,
    holdings: [],
    isEmailVerified: false,
    profilePicture: null,
    firebaseUid: null,
    resetToken: null,
    resetTokenExpiry: null
};

async function migrateAllUsers() {
    try {
        console.log('🔄 Starting user migration...');
        
        const usersSnapshot = await db.collection('users').get();
        
        if (usersSnapshot.empty) {
            console.log('No users found to migrate');
            return;
        }

        console.log(`Found ${usersSnapshot.size} users to check`);
        
        let updatedCount = 0;
        let skippedCount = 0;

        for (const doc of usersSnapshot.docs) {
            const userId = doc.id;
            const userData = doc.data();
            const updates = {};

            // Check each required field
            Object.keys(defaultFields).forEach(field => {
                if (userData[field] === undefined) {
                    updates[field] = defaultFields[field];
                }
            });

            // Add updatedAt if missing
            if (updates && Object.keys(updates).length > 0) {
                updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
                
                await db.collection('users').doc(userId).update(updates);
                
                console.log(`✅ Updated user ${userId} with fields:`, Object.keys(updates));
                updatedCount++;
            } else {
                console.log(`⏭️  Skipped user ${userId} - all fields present`);
                skippedCount++;
            }
        }

        console.log('\n📊 Migration Summary:');
        console.log(`Total users: ${usersSnapshot.size}`);
        console.log(`Updated: ${updatedCount}`);
        console.log(`Skipped: ${skippedCount}`);
        console.log('✅ Migration completed!');

    } catch (error) {
        console.error('❌ Migration error:', error);
        throw error;
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    migrateAllUsers()
        .then(() => {
            console.log('Migration script finished');
            process.exit(0);
        })
        .catch(error => {
            console.error('Migration script failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateAllUsers };