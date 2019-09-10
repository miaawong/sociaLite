const admin = require("firebase-admin");
const serviceAccount = require("../socialite.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db };
