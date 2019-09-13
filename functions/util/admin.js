const admin = require("firebase-admin");
const serviceAccount = require("../socialite.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "socialite-780ad.appspot.com"
});

const db = admin.firestore();

module.exports = { admin, db };
