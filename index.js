const express = require("express");
const server = express();
server.use(express.json());

const db = require("./data/db");
const postsRouter = require("./routes/posts-router");

server.use("/api/posts", postsRouter);

server.get("/hello", (req, res) => {
  res.send("hello world");
});

server.listen(5000, () => {
  console.log("\n*** Server Running on http://localhost:5000 *** \n");
});
