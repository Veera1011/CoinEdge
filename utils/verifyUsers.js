// utils/verifyUsers.js
// Check if all users have required fields

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

const REQUIRED_FIELDS = [
    'email',
    'name',
    'balance',
    'totalDeposits',
    'totalWithdrawals',
    'totalTrades',
    'todayPnL',
    'todayGain',
    'holdings',
    'isEmailVerified',
    'provider',
    'createdAt',
    'updatedAt'
];

async function verifyAllUsers() {
    try {
        console.log('🔍 Verifying user data...\n');
        
        const usersSnapshot = await db.collection('users').get();
        
        if (usersSnapshot.empty) {
            console.log('No users found');
            return;
        }

        console.log(`Checking ${usersSnapshot.size} users\n`);
        console.log('='.repeat(80));
        
        const issues = [];

        usersSnapshot.forEach(doc => {
            const userId = doc.id;
            const userData = doc.data();
            const missingFields = [];

            // Check for missing required fields
            REQUIRED_FIELDS.forEach(field => {
                if (userData[field] === undefined) {
                    missingFields.push(field);
                }
            });

            if (missingFields.length > 0) {
                issues.push({
                    userId,
                    email: userData.email || 'N/A',
                    name: userData.name || 'N/A',
                    missingFields
                });
            }
        });

        if (issues.length === 0) {
            console.log('✅ All users have complete data!');
            console.log(`   Verified ${usersSnapshot.size} users`);
        } else {
            console.log(`⚠️  Found ${issues.length} users with missing fields:\n`);
            
            issues.forEach((issue, index) => {
                console.log(`${index + 1}. User: ${issue.email} (${issue.name})`);
                console.log(`   ID: ${issue.userId}`);
                console.log(`   Missing: ${issue.missingFields.join(', ')}`);
                console.log('');
            });

            console.log('\n💡 Run migration script to fix: node utils/migrateUsers.js');
        }

        console.log('='.repeat(80));

        // Show sample of complete user data
        const sampleUser = usersSnapshot.docs[0];
        console.log('\n📋 Sample User Structure:');
        console.log(JSON.stringify(sampleUser.data(), null, 2));

    } catch (error) {
        console.error('❌ Verification error:', error);
        throw error;
    }
}

// Run verification if this file is executed directly
if (require.main === module) {
    verifyAllUsers()
        .then(() => {
            console.log('\nVerification completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('Verification failed:', error);
            process.exit(1);
        });
}

module.exports = { verifyAllUsers };