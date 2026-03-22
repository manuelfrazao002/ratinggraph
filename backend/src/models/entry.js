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
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM("movie", "series", "anime"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("not aired", "running", "ended"),
      defaultValue: "not aired",
    },
    description: {
      type: DataTypes.TEXT,
    },

    releaseDate: {
      type: DataTypes.DATE,
    },

    endingYear: {
      type: DataTypes.INTEGER,
    },

    coverImage: {
      type: DataTypes.STRING,
    },
    topRank: {
      type: DataTypes.INTEGER,
    },
    ageRating: {
      type: DataTypes.STRING,
    },
    genres: {
      type: DataTypes.JSON, // array tipo ["Drama", "Action"]
      defaultValue: [],
    },
    creators: {
      type: DataTypes.JSON, // ["Vince Gilligan"]
      defaultValue: [],
    },
    writers: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    directors: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    summary: {
      type: DataTypes.TEXT,
    },
    storyline: {
      type: DataTypes.TEXT,
    },
    storylineAuthor: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    plotKeywords: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    tagline: {
      type: DataTypes.STRING,
    },
    countriesOrigin: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    language: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    alsoknownas: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    productionCompanies: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    watchlistNumber: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastTrafficUpdate: {
      type: DataTypes.DATE,
    },
    votes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  return Entry;
};
