const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./socialite-780ad-firebase-adminsdk-7a6qz-0b8e5d3d20.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const express = require("express");
const app = express();

app.get("/thoughts", (req, res) => {
    admin
        .firestore()
        .collection("thoughts")
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
    // !!! not needed anymore since we switch to express, which handles this for us
    // if (req.method !== "POST") {
    //     return res.status(400).json({ error: "Method not allowed" });
    // }
    const newThought = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
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

exports.api = functions.https.onRequest(app);
