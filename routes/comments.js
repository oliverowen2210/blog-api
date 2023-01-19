const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const Post = require("../models/post");
const Comment = require("../models/comment");

const async = require("async");

router.get("/posts/:postid/comments", async (req, res, next) => {
  try {
    const comments = await Comment.findAll({
      where: {
        postid: req.params.postid,
      },
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

router.post("/posts/:postid/comments", async (req, res, next) => {
  try {
    const username = req.body.username ? req.body.username : "Anonymous";
    await Comment.sync();
    const result = await Comment.create({
      username,
      text: req.body.text,
      postid: req.params.postid,
    });
    res.json({
      message: "Comment posted successfully.",
      comment: {
        username: result.username,
        text: result.text,
        postid: result.postid,
        id: result.id,
      },
    });
  } catch (err) {
    return next(err);
  }
});

router.delete("/comments/:commentid", async (req, res, next) => {
  try {
    await Comment.destroy({
      where: {
        id: req.params.commentid,
      },
    });
    res.json({
      message: `Comment id ${req.params.commentid} deleted successfully.`,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;