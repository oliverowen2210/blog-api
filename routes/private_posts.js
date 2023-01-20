const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const Post = require("../models/post");
const Comment = require("../models/comment");

const async = require("async");

router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      order: [["createdAt", "DESC"]],
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

          order: [["createdAt", "DESC"]],
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
    } catch (err) {
      return next(err);
    }
  },
]);

router.get("/:postid", async (req, res, next) => {
  try {
    const [post, comments] = await Promise.all([
      Post.findOne({
        where: { id: parseInt(req.params.postid) },
      }),
    ]);

    if (!post) {
      const err = new Error("No post with that id was found.");
      err.status = 404;
      return next(err);
    }
    res.json({
      post,
    });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:postid", async (req, res, next) => {
  try {
    await Post.destroy({ where: { id: req.params.postid } });
    res.sendStatus(200);
  } catch (err) {
    return next(err);
  }
});

router.put("/:postid", async (req, res, next) => {
  try {
    let postData = {};

    if (req.body.title !== undefined) postData.title = req.body.title;
    if (req.body.text !== undefined) postData.text = req.body.text;
    if (req.body.published !== undefined || req.body.published !== "")
      postData.published = req.body.published;

    await Post.update(postData, { where: { id: req.params.postid } });
    return res.sendStatus(200);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
