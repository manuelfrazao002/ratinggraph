const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Cast = sequelize.define("Cast", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    actorName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    characterName: {
      type: DataTypes.STRING,
    },

    image: {
      type: DataTypes.STRING,
    },
  });

  return Cast;
};