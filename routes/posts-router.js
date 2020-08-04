const express = require("express");
const router = express.Router();
const db = require("../data/db");

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

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const foundPost = await db.findById(id);
    foundPost.length < 1
      ? res.status(400).json({ error: `post id:${id} does not exist` })
      : res.json({ ...foundPost });
  } catch {
    res
      .status(500)
      .json({ error: "The post information could not be retrieved." });
  }
});

module.exports = router;
