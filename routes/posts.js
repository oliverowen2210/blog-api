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

      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    if (!posts) {
      err = new Error("No posts were found.");
      err.status = 404;
      return next(err);
    }

    /**Adds the comment count of each post to the post objects */
    const getComments = (post) =>
      new Promise((resolve, reject) => {
        Comment.findAll({
          where: { postid: post.id },
        }).then((comments) => {
          post.dataValues.commentCount = comments.length;
          resolve(post.dataValues.commentCount);
        });
      });

    Promise.all(posts.map(getComments)).then(() => {
      res.json(posts);
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/:postid", async (req, res, next) => {
  try {
    const [post, comments] = await Promise.all([
      Post.findOne({
        where: { id: parseInt(req.params.postid), published: true },
      }),
    ]);

    if (!post) {
      const err = new Error("No post with that id was found.");
      err.status = 404;
      return next(err);
    }
    res.json({
      post: {
        id: post.id,
        title: post.title,
        text: post.text,
        createdAt: post.createdAt,
      },
    });
  } catch (err) {
    return next(err);
  }
});

router.put("/:postid", async (req, res, next) => {
  res.send("todo");
});

module.exports = router;
