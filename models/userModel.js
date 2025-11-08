// models/userModel.js - FIXED for auto-generated document IDs

const admin = require("firebase-admin");

class UserModel {
  constructor() {
    this.db = admin.firestore();
    this.collection = "users";
    this.contactCollection = "contacts";
    this.transactionsCollection = "transactions";
  }

  getDefaultUserData() {
    return {
      balance: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalTrades: 0,
      todayPnL: 0,
      todayGain: 0,
      holdings: [],
      isEmailVerified: false,
      provider: 'email',
      profilePicture: null,
      firebaseUid: null,
      resetToken: null,
      resetTokenExpiry: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
  }

  // ============ USER MANAGEMENT ============
  
  async getUserByEmail(email) {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("email", "==", email.toLowerCase().trim())
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to check email: ${error.message}`);
    }
  }

  async createUser(userData) {
    try {
      const email = userData.email.toLowerCase().trim();
      
      // Check if user already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      // Merge provided data with defaults
      const defaultData = this.getDefaultUserData();
      const newUserData = {
        ...defaultData,
        ...userData,
        email: email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Create user with auto-generated ID
      const docRef = await this.db.collection(this.collection).add(newUserData);
      
      console.log('✅ User created with ID:', docRef.id);
      
      // Return the created user data with ID
      return { id: docRef.id, ...newUserData };
    } catch (error) {
      console.error('Error in createUser:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async getUserById(userId) {
    try {
      const doc = await this.db.collection(this.collection).doc(userId).get();

      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to get user by ID: ${error.message}`);
    }
  }

  async ensureUserFields(userId) {
    try {
      const userRef = this.db.collection(this.collection).doc(userId);
      const user = await userRef.get();

      if (!user.exists) {
        throw new Error('User not found');
      }

      const userData = user.data();
      const defaultData = this.getDefaultUserData();
      const updates = {};

      // Check each required field and add if missing
      Object.keys(defaultData).forEach(key => {
        if (userData[key] === undefined) {
          updates[key] = defaultData[key];
        }
      });

      // Only update if there are missing fields
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        await userRef.update(updates);
        console.log(`Updated user ${userId} with missing fields:`, Object.keys(updates));
      }

      return { success: true, updated: Object.keys(updates) };
    } catch (error) {
      throw new Error(`Failed to ensure user fields: ${error.message}`);
    }
  }

  // ============ BALANCE & TRANSACTION METHODS ============

  async updateUserBalance(userId, amount, type = 'add') {
    try {
      const userRef = this.db.collection(this.collection).doc(userId);
      const user = await userRef.get();

      if (!user.exists) {
        throw new Error('User not found');
      }

      const currentBalance = user.data().balance || 0;
      const newBalance = type === 'add' 
        ? currentBalance + parseFloat(amount)
        : currentBalance - parseFloat(amount);

      if (newBalance < 0) {
        throw new Error('Insufficient balance');
      }

      const updateData = {
        balance: newBalance,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await userRef.update(updateData);
      console.log(`✅ Balance updated for ${userId}: ${currentBalance} → ${newBalance}`);
      
      return { success: true, newBalance };
    } catch (error) {
      throw new Error(`Failed to update balance: ${error.message}`);
    }
  }

  async recordTransaction(userId, transactionData) {
    try {
      const transaction = {
        userId: userId,
        type: transactionData.type,
        amount: parseFloat(transactionData.amount),
        status: transactionData.status || 'completed',
        description: transactionData.description || '',
        crypto: transactionData.crypto || null,
        walletAddress: transactionData.walletAddress || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await this.db.collection(this.transactionsCollection).add(transaction);

      // Update user totals
      const userRef = this.db.collection(this.collection).doc(userId);
      const updates = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };

      if (transactionData.type === 'deposit') {
        updates.totalDeposits = admin.firestore.FieldValue.increment(parseFloat(transactionData.amount));
      } else if (transactionData.type === 'withdrawal') {
        updates.totalWithdrawals = admin.firestore.FieldValue.increment(parseFloat(transactionData.amount));
      } else if (transactionData.type === 'trade') {
        updates.totalTrades = admin.firestore.FieldValue.increment(1);
      }

      await userRef.update(updates);

      return { id: docRef.id, ...transaction };
    } catch (error) {
      throw new Error(`Failed to record transaction: ${error.message}`);
    }
  }

  async getUserTransactions(userId, limit = 50) {
    try {
      const snapshot = await this.db
        .collection(this.transactionsCollection)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const transactions = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
        });
      });

      return transactions;
    } catch (error) {
      throw new Error(`Failed to get transactions: ${error.message}`);
    }
  }

  async updateTodayReport(userId, pnl, gain) {
    try {
      const userRef = this.db.collection(this.collection).doc(userId);
      
      await userRef.update({
        todayPnL: parseFloat(pnl),
        todayGain: parseFloat(gain),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ Today's report updated for ${userId}: PnL=$${pnl}, Gain=${gain}%`);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to update today's report: ${error.message}`);
    }
  }

  async updateUserHoldings(userId, holdings) {
    try {
      const userRef = this.db.collection(this.collection).doc(userId);
      
      await userRef.update({
        holdings: holdings,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ Holdings updated for ${userId}: ${holdings.length} assets`);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to update holdings: ${error.message}`);
    }
  }

  async getUserDashboardData(userId) {
    try {
      // Ensure user has all required fields
      await this.ensureUserFields(userId);
      
      const user = await this.getUserById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      return {
        accountBalance: user.balance || 0,
        todayPnL: user.todayPnL || 0,
        todayGain: user.todayGain || 0,
        balanceReport: (user.balance || 0) + (user.todayPnL || 0),
        totalDeposits: user.totalDeposits || 0,
        totalWithdrawals: user.totalWithdrawals || 0,
        totalTrades: user.totalTrades || 0,
        holdings: user.holdings || []
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard data: ${error.message}`);
    }
  }

  // ============ PASSWORD/AUTH METHODS ============

  async updateUserResetToken(userId, resetToken, resetTokenExpiry) {
    try {
      await this.db.collection(this.collection).doc(userId).update({
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating reset token:", error);
      throw error;
    }
  }

  async getUserByResetToken(token) {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("resetToken", "==", token)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to get user by reset token: ${error.message}`);
    }
  }

  async updateUserPassword(userId, newPassword) {
    try {
      await this.db.collection(this.collection).doc(userId).update({
        password: newPassword,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to update password: ${error.message}`);
    }
  }

  async updateUserFirebaseUid(userId, firebaseUid) {
    try {
      await this.db.collection(this.collection).doc(userId).update({
        firebaseUid: firebaseUid,
        provider: 'google',
        isEmailVerified: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to update Firebase UID: ${error.message}`);
    }
  }

  async getUserByFirebaseUid(firebaseUid) {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("firebaseUid", "==", firebaseUid)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Failed to get user by Firebase UID: ${error.message}`);
    }
  }

  // ============ CONTACT FORM ============

  async userContact({ name, email, message }) {
    try {
      const docRef = await this.db.collection(this.contactCollection).add({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        message: message.trim(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { id: docRef.id, name, email, message };
    } catch (error) {
      throw new Error(`Failed to save contact message: ${error.message}`);
    }
  }
}

module.exports = new UserModel();