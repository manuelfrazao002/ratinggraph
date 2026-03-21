const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Summary = sequelize.define("Summary", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    positive: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    negative: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    neutral: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  });

  return Summary;
};
