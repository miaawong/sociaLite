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
};
