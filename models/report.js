module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define("Report", {
    owner: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    attention: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    updates: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    messageId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return Report;
};
