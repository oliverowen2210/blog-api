const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const Post = require("../models/post");
const Comment = require("../models/comment");

const async = require("async");

router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.findAll({});

    if (!posts) {
      err = new Error("No posts were found.");
      err.status = 404;
      return next(err);
    }
    res.json(posts);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
