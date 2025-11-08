const admin = require('firebase-admin');
const userModel = require('../../models/userModel');

const db = admin.firestore();
const DEPOSITS_COLLECTION = 'deposits';

// Record deposit (called when deposit is confirmed)
const recordDeposit = async (req, res) => {
    try {
        // FIX: Use req.user.id instead of req.user.email
        const userId = req.user.id; // This is the email (document ID)
        const { amount, crypto, txHash, walletAddress } = req.body;
        
        console.log('Recording deposit for user:', userId);
        
        if (!amount || !crypto) {
            return res.status(400).json({
                success: false,
                error: 'Amount and crypto are required'
            });
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid amount'
            });
        }

        // Create deposit record
        const depositData = {
            userId: userId,
            amount: numAmount,
            crypto: crypto,
            txHash: txHash || null,
            walletAddress: walletAddress || null,
            status: 'completed',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection(DEPOSITS_COLLECTION).add(depositData);

        // Update user balance (assuming USDT equivalent)
        await userModel.updateUserBalance(userId, numAmount, 'add');

        // Record transaction
        await userModel.recordTransaction(userId, {
            type: 'deposit',
            amount: numAmount,
            status: 'completed',
            description: `Deposit via ${crypto}`,
            crypto: crypto,
            walletAddress: walletAddress
        });

        console.log('✅ Deposit recorded successfully:', docRef.id);

        return res.status(201).json({
            success: true,
            message: 'Deposit recorded successfully',
            depositId: docRef.id,
            deposit: {
                id: docRef.id,
                ...depositData,
                createdAt: new Date()
            }
        });

    } catch (error) {
        console.error('❌ Error recording deposit:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to record deposit'
        });
    }
};

// Get deposit history
const getDepositHistory = async (req, res) => {
    try {
        // FIX: Use req.user.id instead of req.user.email
        const userId = req.user.id;

        console.log('Getting deposit history for user:', userId);

        const depositsQuery = await db.collection(DEPOSITS_COLLECTION)
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const deposits = [];
        depositsQuery.forEach(doc => {
            const data = doc.data();
            deposits.push({
                id: doc.id,
                amount: data.amount,
                crypto: data.crypto,
                txHash: data.txHash,
                walletAddress: data.walletAddress,
                status: data.status,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
            });
        });

        return res.status(200).json({
            success: true,
            deposits: deposits,
            count: deposits.length
        });

    } catch (error) {
        console.error('❌ Error fetching deposit history:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch deposit history'
        });
    }
};

// Get deposit addresses (static addresses for different cryptocurrencies)
const getDepositAddresses = async (req, res) => {
    try {
        // In production, these would be unique addresses per user
        // For now, returning static addresses
        const addresses = {
            ETH: '0xFF5885E5d7b9dA18485440AB73F16d5410627798',
            BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            USDT_ERC20: '0xFF5885E5d7b9dA18485440AB73F16d5410627798',
            USDT_TRC20: 'TYASr5UV6HEcXatwdFQfmLVUqQQQMUxHLS'
        };

        return res.status(200).json({
            success: true,
            addresses: addresses
        });

    } catch (error) {
        console.error('❌ Error fetching deposit addresses:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch deposit addresses'
        });
    }
};

module.exports = {
    recordDeposit,
    getDepositHistory,
    getDepositAddresses
};