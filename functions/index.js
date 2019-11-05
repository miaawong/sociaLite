const functions = require("firebase-functions");
const app = require("express")();

const {
    getAllThoughts,
    postThought,
    getThought,
    commentOnThought,
    likeThought,
    unlikeThought,
    deleteThought
} = require("./handlers/thoughts");
const {
    signUp,
    login,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser
} = require("./handlers/users");
const FBAuth = require("./util/fbAuth");

// thought route
app.get("/thoughts", getAllThoughts);
app.post("/thought", FBAuth, postThought);
app.get("/thought/:thoughtId", getThought);
app.delete("/thought/:thoughtId", FBAuth, deleteThought);
app.post("/thought/:thoughtId/comment", FBAuth, commentOnThought);
app.get("/thought/:thoughtId/like", FBAuth, likeThought);
app.get("/thought/:thoughtId/unlike", FBAuth, unlikeThought);

// users route
app.post("/signup", signUp);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);
