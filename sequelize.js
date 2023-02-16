const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: "postgres",
  logging: false,
});

module.exports = sequelize;
