module.exports = (sequelize, DataTypes) => {
  const Url = sequelize.define("Url", {
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ampUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ampStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return Url;
};
