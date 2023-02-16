const express = require("express");
const router = express.Router();

const postCommentsRouter = require("./post_comments");

const Post = require("../models/post");
const Comment = require("../models/comment");

router.use("/:postid/comments/", postCommentsRouter);

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
    const post = await Post.findOne({
      where: { id: parseInt(req.params.postid), published: true },
    });

    if (!post) {
      const err = new Error("No post with that id was found.");
      err.status = 404;
      return next(err);
    }
    res.json({
      id: post.id,
      title: post.title,
      text: post.text,
      createdAt: post.createdAt,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
