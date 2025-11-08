// utils/adminOperations.js - UPDATED to work with email or document ID

const admin = require('firebase-admin');
const userModel = require('../models/userModel');

class AdminOperations {
    constructor() {
        this.db = admin.firestore();
    }

    /**
     * Get user by email or ID
     * @param {string} emailOrId - User's email or document ID
     */
    async getUserIdentifier(emailOrId) {
        // Check if it's an email (contains @)
        if (emailOrId.includes('@')) {
            const user = await userModel.getUserByEmail(emailOrId);
            if (!user) {
                throw new Error(`User not found with email: ${emailOrId}`);
            }
            return user.id; // Return the document ID
        }
        
        // Otherwise, assume it's already a document ID
        const user = await userModel.getUserById(emailOrId);
        if (!user) {
            throw new Error(`User not found with ID: ${emailOrId}`);
        }
        return emailOrId;
    }

    /**
     * Add balance to a user
     * @param {string} emailOrId - User's email or document ID
     * @param {number} amount - Amount to add
     */
    async addBalanceToUser(emailOrId, amount) {
        try {
            const userId = await this.getUserIdentifier(emailOrId);
            console.log(`Adding $${amount} to user: ${userId}`);
            
            const result = await userModel.updateUserBalance(userId, amount, 'add');
            
            // Record as deposit transaction
            await userModel.recordTransaction(userId, {
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
     * Deduct balance from a user
     * @param {string} emailOrId - User's email or document ID
     * @param {number} amount - Amount to deduct
     */
    async deductBalanceFromUser(emailOrId, amount) {
        try {
            const userId = await this.getUserIdentifier(emailOrId);
            console.log(`Deducting $${amount} from user: ${userId}`);
            
            const result = await userModel.updateUserBalance(userId, amount, 'subtract');
            
            // Record as withdrawal transaction
            await userModel.recordTransaction(userId, {
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
     * @param {string} emailOrId - User's email or document ID
     * @param {number} newBalance - New balance amount
     */
    async setUserBalance(emailOrId, newBalance) {
        try {
            const userId = await this.getUserIdentifier(emailOrId);
            console.log(`Setting balance for user ${userId} to $${newBalance}`);
            
            const userRef = this.db.collection('users').doc(userId);
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
     * @param {string} emailOrId - User's email or document ID
     * @param {number} pnl - Today's PnL
     * @param {number} gain - Today's gain percentage
     */
    async updateUserTodayReport(emailOrId, pnl, gain) {
        try {
            const userId = await this.getUserIdentifier(emailOrId);
            console.log(`Updating today's report for ${userId}: PnL=$${pnl}, Gain=${gain}%`);
            
            await userModel.updateTodayReport(userId, pnl, gain);
            
            console.log(`✅ Successfully updated today's report`);
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating today\'s report:', error.message);
            throw error;
        }
    }

    /**
     * Update user's holdings
     * @param {string} emailOrId - User's email or document ID
     * @param {Array} holdings - Array of holdings objects
     */
    async updateUserHoldings(emailOrId, holdings) {
        try {
            const userId = await this.getUserIdentifier(emailOrId);
            console.log(`Updating holdings for ${userId}`);
            
            await userModel.updateUserHoldings(userId, holdings);
            
            console.log(`✅ Successfully updated holdings`);
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating holdings:', error.message);
            throw error;
        }
    }

    /**
     * Get user's complete data
     * @param {string} emailOrId - User's email or document ID
     */
    async getUserData(emailOrId) {
        try {
            const userId = await this.getUserIdentifier(emailOrId);
            const user = await userModel.getUserById(userId);
            
            if (!user) {
                console.log(`❌ User not found: ${emailOrId}`);
                return null;
            }

            console.log(`✅ User data for ${emailOrId}:`);
            console.log(JSON.stringify(user, null, 2));
            return user;
        } catch (error) {
            console.error('❌ Error getting user data:', error.message);
            throw error;
        }
    }

    /**
     * Record a manual transaction
     * @param {string} emailOrId - User's email or document ID
     * @param {object} transactionData - Transaction details
     */
    async recordManualTransaction(emailOrId, transactionData) {
        try {
            const userId = await this.getUserIdentifier(emailOrId);
            console.log(`Recording manual transaction for ${userId}`);
            
            const transaction = await userModel.recordTransaction(userId, transactionData);
            
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
                    id: doc.id,
                    email: data.email,
                    name: data.name,
                    balance: data.balance || 0,
                    totalDeposits: data.totalDeposits || 0,
                    totalWithdrawals: data.totalWithdrawals || 0,
                    provider: data.provider || 'N/A',
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
// Works with EMAIL:
adminOps.addBalanceToUser('mjtamil392@gmail.com', 1000);

// Or works with DOCUMENT ID:
adminOps.addBalanceToUser('0SpGLFWCVMM4gvg3nk8n', 1000);

// Update today's report
adminOps.updateUserTodayReport('mjtamil392@gmail.com', 250, 2.5);

// Update holdings
adminOps.updateUserHoldings('mjtamil392@gmail.com', [
    {
        symbol: 'BTC',
        name: 'Bitcoin',
        balance: 0.25,
        value: 11000,
        allocation: 87,
        change24h: 2.1
    }
]);

// Get user data
adminOps.getUserData('mjtamil392@gmail.com');

// List all users
adminOps.listAllUsers();
*/

module.exports = adminOps;