const db = require("../sequelize");
const { DataTypes } = require("sequelize");

const Comment = db.define("Comment", {
  username: {
    type: DataTypes.STRING,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  postid: {
    type: DataTypes.INTEGER,
  },
});

module.exports = Comment;
