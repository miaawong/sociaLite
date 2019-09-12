const functions = require("firebase-functions");
const app = require("express")();

const { getAllThoughts, postThought } = require("./handlers/thoughts");
const { signUp, login, uploadImage } = require("./handlers/users");
const FBAuth = require("./util/fbAuth");

// thought route
app.get("/thoughts", getAllThoughts);
app.post("/thought", FBAuth, postThought);
// users route
app.post("/signup", signUp);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);

exports.api = functions.https.onRequest(app);
