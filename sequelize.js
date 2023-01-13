const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(process.env.POSTGRES_URI);

module.exports = sequelize;
