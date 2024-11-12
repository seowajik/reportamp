require("dotenv").config();
const path = require("path");

module.exports = {
  development: {
    dialect: "sqlite",
    storage: path.join(__dirname, "..", process.env.DB_PATH),
  },
};
