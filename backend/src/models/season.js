const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Season = sequelize.define("Season", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      // opcional (ex: "Season 1", "Book 1", etc.)
    },

    description: {
      type: DataTypes.TEXT,
    },

    releaseDate: {
      type: DataTypes.DATE,
    },

    coverImage: {
      type: DataTypes.STRING,
    },
  });

  return Season;
};