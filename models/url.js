const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Url = sequelize.define("Url", {
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rank: {
      type: DataTypes.STRING,
    },
    ampStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return Url;
};
