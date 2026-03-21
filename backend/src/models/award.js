const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Award = sequelize.define("Award", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    type: {
      type: DataTypes.ENUM(
        "oscars",
        "emmys",
        "wins",
        "nominations"
      ),
      allowNull: false,
    },

    count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  return Award;
};