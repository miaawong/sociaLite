const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./socialite-780ad-firebase-adminsdk-7a6qz-5eb0ce02ba.json");
const app = require("express")();

const config = {
    apiKey: "AIzaSyD7qG9pW8UfFEckaI1a-JRpjSXI1G6qa_g",
    authDomain: "socialite-780ad.firebaseapp.com",
    databaseURL: "https://socialite-780ad.firebaseio.com",
    projectId: "socialite-780ad",
    storageBucket: "socialite-780ad.appspot.com",
    messagingSenderId: "974476341294",
    appId: "1:974476341294:web:a08e09b4f37dea99"
};
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const firebase = require("firebase");
firebase.initializeApp(config);

const db = admin.firestore();

app.get("/thoughts", (req, res) => {
    db.collection("thoughts")
        .orderBy("createdAt", "desc")
        .get()
        .then(data => {
            let thoughts = [];
            data.forEach(doc => {
                thoughts.push({
                    thoughtId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                });
            });
            return res.json(thoughts);
        })
        .catch(err => console.error(err));
});

app.post("/thought", (req, res) => {
    // to prevent a get request with a status code of 400 instead of 500
    // !!!! not needed anymore since we switch to express, which handles this for us
    // if (req.method !== "POST") {
    //     return res.status(400).json({ error: "Method not allowed" });
    // }
    const newThought = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };
    db.collection("thoughts")
        .add(newThought)
        .then(doc => {
            res.json({ message: `document ${doc.id} created successfully` });
        })
        .catch(err => {
            res.status(500).json({ error: "oops, something went wrong" });
            console.error(err);
        });
});

// sign up route
app.post("/signup", (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };
    // TODO validate data
    let token, userId;
    db.doc(`/users/${newUser.handle}`)
        .get()
        .then(doc => {
            // if user exists
            if (doc.exists) {
                return res
                    .status(400)
                    .json({ handle: "this handle is already taken" });
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(
                        newUser.email,
                        newUser.password
                    );
            }
        })
        .then(data => {
            userId = data.user.uid;
            // return an accessToken so the user can use throughout
            return data.user.getIdToken();
        })
        .then(idToken => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch(err => {
            console.error(err);
            if (err.code === "auth/email-already-in-use") {
                return res
                    .status(400)
                    .json({ email: "email is already in use" });
            } else {
                return res.status(500).json({ error: err.code });
            }
        });
});
exports.api = functions.https.onRequest(app);
