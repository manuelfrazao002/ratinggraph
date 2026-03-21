const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Popularity = sequelize.define(
    "Popularity",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      rank: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      type: {
        type: DataTypes.ENUM("movie", "series"),
        allowNull: false,
      },

      week: {
        type: DataTypes.DATEONLY, // 👈 melhor que DATE
        allowNull: false,
      },
    },
    {
      timestamps: true, // 👈 createdAt ajuda para debug
      indexes: [
        {
          unique: true,
          fields: ["entryId", "week"], // 👈 evita duplicados por semana
        },
      ],
    }
  );

  return Popularity;
};