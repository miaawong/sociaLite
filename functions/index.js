const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./socialite-780ad-firebase-adminsdk-7a6qz-0b8e5d3d20.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello Mia");
});

exports.getThoughts = functions.https.onRequest((req, res) => {
    admin
        .firestore()
        .collection("thoughts")
        .get()
        .then(data => {
            let thoughts = [];
            data.forEach(doc => {
                thoughts.push(doc.data());
            });
            return res.json(thoughts);
        })
        .catch(err => console.error(err));
});

exports.createThought = functions.https.onRequest((req, res) => {
    const newThought = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };
    admin
        .firestore()
        .collection("thoughts")
        .add(newThought)
        .then(doc => {
            res.json({ message: `document ${doc.id} created successfully` });
        })
        .catch(err => {
            res.status(500).json({ error: "oops, something went wrong" });
            console.error(err);
        });
});
