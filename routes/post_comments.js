const express = require("express");
const router = express.Router({ mergeParams: true });
const { body, validationResult } = require("express-validator");

const Post = require("../models/post");
const Comment = require("../models/comment");

/** expects to be used in "/posts/:postid/comments/" */

router.get("/", async (req, res, next) => {
  try {
    const comments = await Comment.findAll({
      where: {
        postid: req.params.postid,
      },

      order: [["createdAt", "DESC"]],
    });

    if (!comments) {
      err = new Error(
        `No comments were found for postid ${req.params.postid}.`
      );
      err.status = 404;
      return next(err);
    }

    res.json(comments);
  } catch (err) {
    return next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    if (!req.body.text) {
      const err = new Error("Comments can't be empty.");
      err.status = 400;
      return next(err);
    }

    const post = await Post.findOne({ where: { id: req.params.postid } });
    if (!post) {
      const err = new Error("That post doesn't exist.");
      err.status = 404;
      return next(err);
    }

    const username = req.body.username ? req.body.username : "Anonymous";
    await Comment.sync();
    const result = await Comment.create({
      username,
      text: req.body.text,
      postid: post.id,
    });
    res.json({
      message: "Comment posted successfully.",
      comment: {
        username: result.username,
        text: result.text,
        postid: result.postid,
        id: result.id,
        createdAt: result.createdAt,
      },
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
