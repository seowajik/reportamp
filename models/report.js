const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Report = sequelize.define("Report", {
    owner: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    attention: DataTypes.TEXT,
    updates: DataTypes.TEXT,
    messageId: DataTypes.STRING,
  });

  return Report;
};
