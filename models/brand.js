const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Brand = sequelize.define("Brand", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    owner: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return Brand;
};
