const { Sequelize, DataTypes } = require("sequelize");
const config = require("../config/database.js");

const sequelize = new Sequelize(config.development);

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Import models
db.Report = require("./report")(sequelize, DataTypes);
db.Brand = require("./brand")(sequelize, DataTypes);
db.Url = require("./url")(sequelize, DataTypes);

// Define associations
db.Report.hasMany(db.Brand);
db.Brand.belongsTo(db.Report);

db.Brand.hasMany(db.Url);
db.Url.belongsTo(db.Brand);

module.exports = db;
