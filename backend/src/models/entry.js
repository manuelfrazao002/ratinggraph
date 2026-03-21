const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Entry = sequelize.define("Entry", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    slug: {
      type: DataTypes.STRING,
      unique: true,
    },

    type: {
      type: DataTypes.ENUM("movie", "series", "anime"),
      allowNull: false,
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
    topRank: {
      type: DataTypes.INTEGER,
    },
  });

  return Entry;
};
