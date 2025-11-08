// utils/adminOperations.js
// Utility functions for manually updating user data via Firebase Admin

const admin = require('firebase-admin');
const userModel = require('../models/userModel');

class AdminOperations {
    constructor() {
        this.db = admin.firestore();
    }

    /**
     * Manually add balance to a user
     * @param {string} userEmail - User's email (document ID)
     * @param {number} amount - Amount to add
     */
    async addBalanceToUser(userEmail, amount) {
        try {
            console.log(`Adding $${amount} to user: ${userEmail}`);
            
            const result = await userModel.updateUserBalance(userEmail, amount, 'add');
            
            // Record as deposit transaction
            await userModel.recordTransaction(userEmail, {
                type: 'deposit',
                amount: amount,
                status: 'completed',
                description: 'Manual balance addition by admin'
            });

            console.log(`✅ Successfully added $${amount}. New balance: $${result.newBalance}`);
            return result;
        } catch (error) {
            console.error('❌ Error adding balance:', error.message);
            throw error;
        }
    }

    /**
     * Manually deduct balance from a user
     * @param {string} userEmail - User's email (document ID)
     * @param {number} amount - Amount to deduct
     */
    async deductBalanceFromUser(userEmail, amount) {
        try {
            console.log(`Deducting $${amount} from user: ${userEmail}`);
            
            const result = await userModel.updateUserBalance(userEmail, amount, 'subtract');
            
            // Record as withdrawal transaction
            await userModel.recordTransaction(userEmail, {
                type: 'withdrawal',
                amount: amount,
                status: 'completed',
                description: 'Manual balance deduction by admin'
            });

            console.log(`✅ Successfully deducted $${amount}. New balance: $${result.newBalance}`);
            return result;
        } catch (error) {
            console.error('❌ Error deducting balance:', error.message);
            throw error;
        }
    }

    /**
     * Set user's balance to a specific amount
     * @param {string} userEmail - User's email (document ID)
     * @param {number} newBalance - New balance amount
     */
    async setUserBalance(userEmail, newBalance) {
        try {
            console.log(`Setting balance for user ${userEmail} to $${newBalance}`);
            
            const userRef = this.db.collection('users').doc(userEmail);
            await userRef.update({
                balance: parseFloat(newBalance),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log(`✅ Successfully set balance to $${newBalance}`);
            return { success: true, newBalance };
        } catch (error) {
            console.error('❌ Error setting balance:', error.message);
            throw error;
        }
    }

    /**
     * Update user's today report (PnL and Gain)
     * @param {string} userEmail - User's email
     * @param {number} pnl - Today's PnL
     * @param {number} gain - Today's gain percentage
     */
    async updateUserTodayReport(userEmail, pnl, gain) {
        try {
            console.log(`Updating today's report for ${userEmail}: PnL=$${pnl}, Gain=${gain}%`);
            
            await userModel.updateTodayReport(userEmail, pnl, gain);
            
            console.log(`✅ Successfully updated today's report`);
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating today\'s report:', error.message);
            throw error;
        }
    }

    /**
     * Update user's holdings
     * @param {string} userEmail - User's email
     * @param {Array} holdings - Array of holdings objects
     * Example: [{symbol: 'BTC', name: 'Bitcoin', balance: 0.5, value: 25000, allocation: 50, change24h: 2.5}]
     */
    async updateUserHoldings(userEmail, holdings) {
        try {
            console.log(`Updating holdings for ${userEmail}`);
            
            await userModel.updateUserHoldings(userEmail, holdings);
            
            console.log(`✅ Successfully updated holdings`);
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating holdings:', error.message);
            throw error;
        }
    }

    /**
     * Get user's complete data
     * @param {string} userEmail - User's email
     */
    async getUserData(userEmail) {
        try {
            const user = await userModel.getUserById(userEmail);
            
            if (!user) {
                console.log(`❌ User not found: ${userEmail}`);
                return null;
            }

            console.log(`✅ User data for ${userEmail}:`);
            console.log(JSON.stringify(user, null, 2));
            return user;
        } catch (error) {
            console.error('❌ Error getting user data:', error.message);
            throw error;
        }
    }

    /**
     * Record a manual transaction
     * @param {string} userEmail - User's email
     * @param {object} transactionData - Transaction details
     */
    async recordManualTransaction(userEmail, transactionData) {
        try {
            console.log(`Recording manual transaction for ${userEmail}`);
            
            const transaction = await userModel.recordTransaction(userEmail, transactionData);
            
            console.log(`✅ Transaction recorded with ID: ${transaction.id}`);
            return transaction;
        } catch (error) {
            console.error('❌ Error recording transaction:', error.message);
            throw error;
        }
    }

    /**
     * List all users
     */
    async listAllUsers() {
        try {
            const snapshot = await this.db.collection('users').get();
            
            const users = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                users.push({
                    email: doc.id,
                    name: data.name,
                    balance: data.balance || 0,
                    totalDeposits: data.totalDeposits || 0,
                    totalWithdrawals: data.totalWithdrawals || 0,
                    createdAt: data.createdAt
                });
            });

            console.log(`✅ Found ${users.length} users:`);
            console.table(users);
            return users;
        } catch (error) {
            console.error('❌ Error listing users:', error.message);
            throw error;
        }
    }
}

// Create instance
const adminOps = new AdminOperations();

// Example usage (uncomment to use):
/*
// Add $1000 to a user
adminOps.addBalanceToUser('user@example.com', 1000);

// Set balance to specific amount
adminOps.setUserBalance('user@example.com', 5000);

// Update today's report
adminOps.updateUserTodayReport('user@example.com', 250, 2.5);

// Update holdings
adminOps.updateUserHoldings('user@example.com', [
    {
        symbol: 'BTC',
        name: 'Bitcoin',
        balance: 0.25,
        value: 11000,
        allocation: 87,
        change24h: 2.1
    },
    {
        symbol: 'ETH',
        name: 'Ethereum',
        balance: 0.5,
        value: 1600,
        allocation: 13,
        change24h: -1.5
    }
]);

// Get user data
adminOps.getUserData('user@example.com');

// List all users
adminOps.listAllUsers();
*/

module.exports = adminOps;