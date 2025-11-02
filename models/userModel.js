const admin = require("firebase-admin");

class UserModel {
  constructor() {
    this.db = admin.firestore();
    this.collection = "users";
    this.contactCollection = "contacts";
  }
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
      const docRef = await this.db.collection(this.collection).add({
        ...userData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { id: docRef.id, ...userData };
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async updateUserResetToken(userId, resetToken, resetTokenExpiry) {
    try {
      await this.db.collection(this.collection).doc(userId).update({
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry,
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
      });

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to update password: ${error.message}`);
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
  // Add these methods to your existing UserModel class

async updateUserFirebaseUid(userId, firebaseUid) {
    try {
        await this.db.collection(this.collection).doc(userId).update({
            firebaseUid: firebaseUid,
            provider: 'google'
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


async updateUserFirebaseUid(userId, firebaseUid) {
    try {
        await this.db.collection(this.collection).doc(userId).update({
            firebaseUid: firebaseUid,
            provider: 'google'
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
}



module.exports = new UserModel();
