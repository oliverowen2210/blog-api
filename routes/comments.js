const express = require("express");
const router = express.Router();
const Comment = require("../models/comment");

router.delete("/:commentid", async (req, res, next) => {
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
