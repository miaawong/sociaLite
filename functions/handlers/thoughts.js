const { db } = require("../util/admin");
exports.getAllThoughts = (req, res) => {
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
};

exports.postThought = (req, res) => {
    // to prevent a get request with a status code of 400 instead of 500
    // !!!! not needed anymore since we switch to express, which handles this for us
    // if (req.method !== "POST") {
    //     return res.status(400).json({ error: "Method not allowed" });
    // }
    const newThought = {
        body: req.body.body,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0
    };
    db.collection("thoughts")
        .add(newThought)
        .then(doc => {
            const resThought = newThought;
            resThought.thoughtId = doc.id;
            res.json(resThought);
        })
        .catch(err => {
            res.status(500).json({ error: "oops, something went wrong" });
            console.error(err);
        });
};
//get one thought
exports.getThought = (req, res) => {
    let thoughtData = {};
    db.doc(`/thoughts/${req.params.thoughtId}`)
        .get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: "Thought not found" });
            }
            // else then return thoughtData to doc.data(which is a function)
            thoughtData = doc.data();
            thoughtData.thoughtId = doc.id;
            //fetch comments
            return (
                db
                    .collection("comments")
                    // to order the comments by their date
                    .orderBy("createdAt", "desc")
                    .where("thoughtId", "==", req.params.thoughtId)
                    .get()
            );
        })
        .then(data => {
            thoughtData.comments = [];
            data.forEach(doc => {
                thoughtData.comments.push(doc.data());
            });
            return res.json(thoughtData);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

// comment on a thought
exports.commentOnThought = (req, res) => {
    // validate
    if (req.body.body.trim() === "")
        return res.status(400).json({ comment: "must not be empty " });
    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        thoughtId: req.params.thoughtId,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl
    };
    db.doc(`/thoughts/${req.params.thoughtId}`)
        .get()
        .then(doc => {
            if (!doc.exists) {
                res.status(404).json({ error: "not found" });
            }
            return db.collection("comments").add(newComment);
        })
        .then(() => {
            res.json(newComment);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Something went wrong" });
        });
};

exports.likeThought = (req, res) => {
    // need to check whether a 'like' document exist or not
    const likeDocument = db
        .collection("likes")
        .where("userHandle", "==", req.user.handle)
        .where("thoughtId", "==", req.params.thoughtId)
        .limit(1);

    const thoughtDocument = db.doc(`/thoughts/${req.params.thoughtId}`);
    let thoughtData;
    // making sure thought exists
    thoughtDocument
        .get()
        .then(doc => {
            if (doc.exists) {
                thoughtData = doc.data();
                thoughtData.thoughtId = doc.id;
                return likeDocument.get();
            } else {
                return res.status(404).json({ error: "Thought not found" });
            }
        })
        .then(data => {
            // data has an empty
            if (data.empty) {
                // if it is empty, we create the document of like
                return db
                    .collection("likes")
                    .add({
                        thoughtId: req.params.thoughtId,
                        userHandle: req.user.handle
                    })
                    .then(() => {
                        thoughtData.likeCount++;
                        return thoughtDocument
                            .update({
                                likeCount: thoughtData.likeCount
                            })
                            .then(() => {
                                return res.json(thoughtData);
                            });
                    });
            } else {
                return res.status(400).json({ error: "thought already liked" });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

exports.unlikeThought = (req, res) => {
    const likeDocument = db
        .collection("likes")
        .where("userHandle", "==", req.user.handle)
        .where("thoughtId", "==", req.params.thoughtId)
        .limit(1);

    const thoughtDocument = db.doc(`/thoughts/${req.params.thoughtId}`);

    let thoughtData;

    thoughtDocument
        .get()
        .then(doc => {
            if (doc.exists) {
                thoughtData = doc.data();
                thoughtData.thoughtId = doc.id;
                return likeDocument.get();
            } else {
                return res.status(404).json({ error: "thought not found" });
            }
        })
        .then(data => {
            if (data.empty) {
                return res.status(400).json({ error: "thought not liked" });
            } else {
                return db
                    .doc(`/likes/${data.docs[0].id}`)
                    .delete()
                    .then(() => {
                        thoughtData.likeCount--;
                        return thoughtDocument.update({
                            likeCount: thoughtData.likeCount
                        });
                    })
                    .then(() => {
                        res.json(thoughtData);
                    });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};
