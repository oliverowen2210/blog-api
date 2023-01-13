const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const Post = require("../models/post");
const Comment = require("../models/comment");

const async = require("async");

/* GET home page. */
router.get("/", async (req, res, next) => {
  try {
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
  } catch (err) {
    return next(err);
  }
  res.json(posts);
});

router.get("/:postid", async (req, res, next) => {
  try {
    const [post, comments] = await Promise.all([
      Post.findOne({
        where: { id: parseInt(req.params.postid), published: true },
      }),
      Comment.findAll({
        where: { postid: req.params.postid },
      }),
    ]);

    if (!post) {
      const err = new Error("No post with that id was found.");
      err.status = 404;
      return next(err);
    }
  } catch (err) {
    return next(err);
  }

  res.json({ post, comments });
});

router.post("/", [
  body("title", "Post title is invalid.").trim().isLength({ min: 1, max: 100 }),
  body("text", "Post text is invalid").trim().notEmpty(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return next(errors);
      }

      let published = req.body.published ? true : false;

      const postData = {
        title: req.body.title,
        text: req.body.text,
        published,
      };

      await Post.sync();
      const result = await Post.create(postData);
    } catch (err) {
      return next(err);
    }
    res.json({
      message: "Post added successfully.",
      post: {
        title: result.title,
        text: result.text,
        published: result.published,
        createdAt: result.createdAt,
        id: result.id,
      },
    });
  },
]);

router.put("/:postid", async (req, res, next) => {
  res.send("todo");
});

module.exports = router;
