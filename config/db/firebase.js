const admin = require('firebase-admin');
const path = require('path');
const { rootMainFile } = require('../../utils/path');
const serviceAccount = require(path.join(rootMainFile, 'config/fireBaseConfig/testcoin-ServiceKey.json'));

try {
    admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const connectionName = admin.app().name;
console.log(connectionName);

 console.log('✅ Firebase Admin initialized successfully!');
} catch (error) {
      console.error('❌ Firebase initialization failed:', error.message);
}

module.exports = {serviceAccount}

