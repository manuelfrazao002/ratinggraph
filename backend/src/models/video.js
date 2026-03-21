const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Video = sequelize.define("Video", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING,
    },

    url: {
      type: DataTypes.STRING, // YouTube ou Cloudinary
      allowNull: false,
    },

    thumbnail: {
      type: DataTypes.STRING,
    },

    type: {
      type: DataTypes.ENUM("trailer", "clip", "opening", "ending"),
    },
        likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    reactions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    duration: {
      type: DataTypes.INTEGER,
    },
  });

  return Video;
};