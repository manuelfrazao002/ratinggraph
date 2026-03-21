const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const EpisodeCast = sequelize.define("EpisodeCast", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
  });

  return EpisodeCast;
};