const express = require("express");
const router = express.Router();
const db = require("../data/db");

// GET all posts
router.get("/", async (req, res) => {
  try {
    const posts = await db.find();
    !posts
      ? res.status(500).json({ error: "Could not retrieve posts...error!" })
      : res.status(200).json({ ...posts });
  } catch {
    res
      .status(500)
      .json({ error: "The posts information could not be retrieved." });
  }
});
// GET post by :id
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const foundPost = await db.findById(id);
    foundPost.length < 1
      ? res.status(404).json({ error: `post id:${id} does not exist` })
      : res.status(200).json({ ...foundPost });
  } catch {
    res
      .status(500)
      .json({ error: "The post information could not be retrieved." });
  }
});
// GET comments by post :id
router.get("/:id/comments", async (req, res) => {
  try {
    const id = req.params.id;
    const foundPostComments = await db.findPostComments(id);
    foundPostComments.length < 1
      ? res.status(400).json({
          message: `Post id:${id} has no comments or doesn't exist at all.`,
        })
      : res.status(200).json({ ...foundPostComments });
  } catch {
    res
      .status(500)
      .json({ error: "The comments information could not be retrieved." });
  }
});

// POST a new post (title + contents required)
router.post("/", async (req, res) => {
  const { title, contents } = req.body;
  if (!title || !contents) {
    return res.status(400).json({
      errorMessage: "Please provide title and contents for the post.",
    });
  }

  try {
    const newPost = await db.insert(req.body);
    res.status(201).json({ ...newPost, ...req.body });
  } catch {
    res.status(500).json({
      error: "There was an error while saving the post to the database",
    });
  }
});

// POST a new comment to post :id
router.post("/:id/comments", async (req, res) => {
  //  [1.] see if there is a post to post the comment to
  //  --> if not, 404 -> message:
  const postFound = await db.findById(req.params.id);
  if (postFound.length < 1) {
    res
      .status(404)
      .json({ message: "The post with the specified ID does not exist." });
  }
  // console.log("newComment", newComment);

  //  [2.] check if client sent 'text' data in the body
  //  --> if not, 400 -> errorMessage
  req.body.text === undefined &&
    res
      .status(400)
      .json({ errorMessage: "Please provide comment on 'text' property" });

  //  [3] idk if this is necessary?
  //  --> I like to insertComment(<something_legible>)
  const newComment = { post_id: req.params.id, text: req.body.text };
  console.log("newComment", newComment);

  //  [4.] try to insertComment([3])
  //  --> saved_id: response from db.insertComment --> should be unique
  //  --> catch errors while saving
  try {
    const savedComment = await db.insertComment(newComment);
    console.log("savedComment", savedComment);
    res.status(201).json({ ...newComment, saved_id: savedComment["id"] });
  } catch {
    res.status(500).json({
      error: "There was an error while saving the comment to the database",
    });
  }
});

// PUT --> update post (title + content both needed)
router.put("/:id", async (req, res) => {
  //  [1.] make sure post is there to edit
  const postFound = await db.findById(req.params.id);
  if (postFound.length < 1) {
    res
      .status(404)
      .json({ message: "The post with the specified ID does not exist." });
  }

  //  [2.] make sure contents + title keys are both there
  let req_contents = req.body.contents;
  let req_title = req.body.title;
  if (!req_contents || !req_title) {
    res.status(400).json({
      errorMessage: "Please provide both 'title' and 'contents' properties",
    });
  }
  try {
    //  [3.] try --> to_update post :id with {request body}
    //  --> if nothing to_update ... 500 --> post not modified
    //  --> if something to_update ... 200 --> {message, updated}
    const to_update = await db.update(req.params.id, { ...req.body });
    const updated_post = await db.findById(req.params.id);
    if (to_update < 1) {
      res
        .status(500)
        .json({ error: "The post information could not be modified." });
    }
    res.status(200).json({
      message: `${to_update} post was modified`,
      updated: { ...updated_post },
    });
  } catch {
    res.status(500).json({
      error: "There was an error while saving the comment to the database",
    });
  }
});

// DELETE a post based on :id
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    //  [1.] see if there is any (and all) posts with :id to delete
    const toDelete = await db.findById(id);
    //  [2.] try to remove :id from db --> returns 1 if it removed something
    const deleted = await db.remove(id);
    if (deleted < 1) {
      return res
        .status(404)
        .json({ message: "The post with the specified ID does not exist." });
    }
    res.json({
      message: `${deleted} post was deleted`,
      deleted: { ...toDelete },
    });
  } catch {
    res.status(500).json({ error: "The post could not be removed" });
  }
});

module.exports = router;
