const { Sequelize } = require("sequelize");
const config = require("../config/database.js");

const sequelize = new Sequelize(config.development);

const models = {
  Brand: require("./brand")(sequelize),
  Url: require("./url")(sequelize),
  Report: require("./report")(sequelize),
};

// Associations
models.Report.hasMany(models.Brand);
models.Brand.belongsTo(models.Report);
models.Brand.hasMany(models.Url);
models.Url.belongsTo(models.Brand);

module.exports = {
  sequelize,
  ...models,
};
