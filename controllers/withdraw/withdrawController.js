const admin = require('firebase-admin');
const userModel = require('../../models/userModel');

const db = admin.firestore();
const WITHDRAWALS_COLLECTION = 'withdrawals';

// Create withdrawal request
const createWithdrawal = async (req, res) => {
    try {
        // FIX: Use req.user.id instead of req.user.email
        const userId = req.user.id; // This is the email (document ID)
        const { amount, walletAddress } = req.body;
        
        console.log('Creating withdrawal for user:', userId);
        
        if (!amount || !walletAddress) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: amount, walletAddress'
            });
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid amount. Must be a positive number.'
            });
        }

        // Validate wallet address
        if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
            return res.status(400).json({
                success: false,
                error: 'Invalid wallet address format. Must be a valid ERC20 address.'
            });
        }

        // Check user balance
        const user = await userModel.getUserById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const currentBalance = user.balance || 0;
        if (currentBalance < numAmount) {
            return res.status(400).json({
                success: false,
                error: `Insufficient balance. Your current balance is $${currentBalance.toFixed(2)}`
            });
        }

        // Deduct balance
        await userModel.updateUserBalance(userId, numAmount, 'subtract');

        // Create withdrawal document
        const withdrawalData = {
            userId: userId,
            amount: numAmount,
            walletAddress: walletAddress,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            transactionId: null,
            processedAt: null
        };

        const docRef = await db.collection(WITHDRAWALS_COLLECTION).add(withdrawalData);

        // Record transaction
        await userModel.recordTransaction(userId, {
            type: 'withdrawal',
            amount: numAmount,
            status: 'pending',
            description: `Withdrawal to ${walletAddress.substring(0, 10)}...`,
            walletAddress: walletAddress
        });

        console.log('✅ Withdrawal request created:', docRef.id);

        return res.status(201).json({
            success: true,
            message: 'Withdrawal request submitted successfully',
            withdrawalId: docRef.id,
            withdrawal: {
                id: docRef.id,
                ...withdrawalData,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

    } catch (error) {
        console.error('❌ Error creating withdrawal:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to create withdrawal request'
        });
    }
};

// Get user's withdrawal history
const getWithdrawalHistory = async (req, res) => {
    try {
        // FIX: Use req.user.id instead of req.user.email
        const userId = req.user.id;

        console.log('Getting withdrawal history for user:', userId);

        const withdrawalsQuery = await db.collection(WITHDRAWALS_COLLECTION)
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const withdrawals = [];
        withdrawalsQuery.forEach(doc => {
            const data = doc.data();
            withdrawals.push({
                id: doc.id,
                amount: data.amount,
                walletAddress: data.walletAddress,
                status: data.status,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
                transactionId: data.transactionId,
                processedAt: data.processedAt?.toDate ? data.processedAt.toDate() : data.processedAt
            });
        });

        return res.status(200).json({
            success: true,
            withdrawals: withdrawals,
            count: withdrawals.length
        });

    } catch (error) {
        console.error('❌ Error fetching withdrawal history:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch withdrawal history'
        });
    }
};

// Update withdrawal status (admin function)
const updateWithdrawalStatus = async (req, res) => {
    try {
        const { withdrawalId } = req.params;
        const { status, transactionId } = req.body;

        if (!withdrawalId || !status) {
            return res.status(400).json({
                success: false,
                error: 'Withdrawal ID and status are required'
            });
        }

        const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        const withdrawalRef = db.collection(WITHDRAWALS_COLLECTION).doc(withdrawalId);
        const withdrawal = await withdrawalRef.get();

        if (!withdrawal.exists) {
            return res.status(404).json({
                success: false,
                error: 'Withdrawal not found'
            });
        }

        const withdrawalData = withdrawal.data();
        const updateData = {
            status: status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (transactionId) {
            updateData.transactionId = transactionId;
        }

        if (status === 'completed' || status === 'failed') {
            updateData.processedAt = admin.firestore.FieldValue.serverTimestamp();
        }

        // If withdrawal is cancelled or failed, refund the balance
        if ((status === 'cancelled' || status === 'failed') && withdrawalData.status === 'pending') {
            await userModel.updateUserBalance(withdrawalData.userId, withdrawalData.amount, 'add');
        }

        await withdrawalRef.update(updateData);

        console.log('✅ Withdrawal status updated:', withdrawalId, 'to', status);

        return res.status(200).json({
            success: true,
            message: 'Withdrawal status updated successfully',
            withdrawalId: withdrawalId,
            status: status
        });

    } catch (error) {
        console.error('❌ Error updating withdrawal status:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to update withdrawal status'
        });
    }
};

// Get user balance
const getUserBalance = async (req, res) => {
    try {
        // FIX: Use req.user.id instead of req.user.email
        const userId = req.user.id;

        console.log('Getting balance for user:', userId);

        const user = await userModel.getUserById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            balance: user.balance || 0,
            currency: 'USDT'
        });

    } catch (error) {
        console.error('❌ Error fetching user balance:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch user balance'
        });
    }
};

module.exports = {
    createWithdrawal,
    getWithdrawalHistory,
    updateWithdrawalStatus,
    getUserBalance
};