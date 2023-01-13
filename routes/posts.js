const express = require("express");
const router = express.Router();

const Post = require("../models/post");
const Comment = require("../models/comment");

const async = require("async");

/* GET home page. */
router.get("/", async (req, res, next) => {
  const posts = await Post.findAll({
    where: {
      published: true,
    },
  });

  if (!posts) {
    err = new Error("No posts were found.");
    err.status = 404;
    return next(err);
  }
  res.json(posts);
});

router.get("/:postid", async (req, res, next) => {
  const [post, comments] = await Promise.all([
    Post.findOne({ where: { id: parseInt(req.params.postid) } }),
    Comment.findAll({
      where: { postid: req.params.postid },
    }),
  ]);

  if (!post) {
    const err = new Error("No post with that id was found.");
    err.status = 404;
    return next(err);
  }

  res.json({ post, comments });
});

module.exports = router;
