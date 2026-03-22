const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const EntryImage = sequelize.define("EntryImage", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("poster", "banner", "backdrop", "gallery"),
      defaultValue: "gallery",
    },

    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    publicId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return EntryImage;
};
