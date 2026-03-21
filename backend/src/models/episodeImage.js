const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const EpisodeImage = sequelize.define("EpisodeImage", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    order: {
      type: DataTypes.INTEGER, // ordem das imagens
    },
  });

  return EpisodeImage;
};