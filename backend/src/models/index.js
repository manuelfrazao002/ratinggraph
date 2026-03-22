const { sequelize } = require("../lib/db");

const EntryModel = require("./entry");
const SeasonModel = require("./season");
const EpisodeModel = require("./episode");
const EpisodeImageModel = require("./episodeImage");
const VideoModel = require("./video");
const CastModel = require("./cast");
const EpisodeCastModel = require("./EpisodeCast");
const AwardModel = require("./award");
const PopularityModel = require("./popularity");
const SummaryModel = require("./summary");
const RatingModel = require("./rating");

// Inicializar models
const Entry = EntryModel(sequelize);
const Season = SeasonModel(sequelize);
const Episode = EpisodeModel(sequelize);
const EpisodeImage = EpisodeImageModel(sequelize);
const Video = VideoModel(sequelize);
const Cast = CastModel(sequelize);
const EpisodeCast = EpisodeCastModel(sequelize);
const Award = AwardModel(sequelize);
const Popularity = PopularityModel(sequelize);
const Summary = SummaryModel(sequelize);
const Rating = RatingModel(sequelize);

// 🔗 RELAÇÕES

// Entry → Seasons
Entry.hasMany(Season, {
  foreignKey: "entryId",
  as: "seasons",
});

Season.belongsTo(Entry, {
  foreignKey: "entryId",
  as: "entry",
});

// Entry → Video
Entry.hasMany(Video, {
  foreignKey: "entryId",
  as: "videos",
});

Video.belongsTo(Entry, {
  foreignKey: "entryId",
  as: "entry",
});

//Entry → Cast
Entry.hasMany(Cast, {
  foreignKey: "entryId",
  as: "cast",
});

Cast.belongsTo(Entry, {
  foreignKey: "entryId",
  as: "entry",
});

// Entry → Awards
Entry.hasMany(Award, {
  foreignKey: "entryId",
  as: "awards",
});

Award.belongsTo(Entry, {
  foreignKey: "entryId",
});

// Entry → Popularity
Entry.hasMany(Popularity, {
  foreignKey: "entryId",
  as: "popularityHistory",
});

Popularity.belongsTo(Entry, {
  foreignKey: "entryId",
  as: "entry",
});

// Entry → Summary
Entry.hasOne(Summary, {
  foreignKey: "entryId",
  as: "summaryData",
});

Summary.belongsTo(Entry, {
  foreignKey: "entryId",
  as: "entry",
});

// Entry → Rating
Entry.hasMany(Rating, { foreignKey: "entryId" });
Rating.belongsTo(Entry, { foreignKey: "entryId" });

// Episode → Awards
Episode.hasMany(Award, {
  foreignKey: "episodeId",
  as: "awards",
});

Award.belongsTo(Episode, {
  foreignKey: "episodeId",
});

// Episode → Rating
Episode.hasMany(Rating, { foreignKey: "episodeId", as: "ratings" });
Rating.belongsTo(Episode, { foreignKey: "episodeId" });

// Season → Episodes
Season.hasMany(Episode, {
  foreignKey: "seasonId",
  as: "episodes",
});

Episode.belongsTo(Season, {
  foreignKey: "seasonId",
  as: "season",
});

// Episodes → Images
Episode.hasMany(EpisodeImage, {
  foreignKey: "episodeId",
  as: "images",
});

EpisodeImage.belongsTo(Episode, {
  foreignKey: "episodeId",
  as: "episode",
});

// Episode ↔ Cast (M:N)
Episode.belongsToMany(Cast, {
  through: EpisodeCast,
  foreignKey: "episodeId",
  as: "cast",
});

Cast.belongsToMany(Episode, {
  through: EpisodeCast,
  foreignKey: "castId",
  as: "episodes",
});

module.exports = {
  sequelize,
  Entry,
  Season,
  Episode,
  EpisodeImage,
  Cast,
  EpisodeCast,
  Award,
  Popularity,
  Summary,
  Rating,
  Video,
};
