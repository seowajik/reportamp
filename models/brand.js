module.exports = (sequelize, DataTypes) => {
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
