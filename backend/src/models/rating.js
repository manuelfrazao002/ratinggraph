const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Rating = sequelize.define("Rating", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 10,
      },
    },
  });

  return Rating;
};