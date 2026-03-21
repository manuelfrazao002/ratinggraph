const express = require("express");
const entryRoutes = require("./entry");
const seasonRoutes = require("./season");
const episodeRoutes = require("./episode");
const uploadRoutes = require("./uploadController");
const episodeImageRoutes = require("./episodeImages");
const ratingRoutes = require("./rating");
const castRoutes = require("./cast");
const videoRoutes = require("./video");
const awardRoutes = require("./award");

const router = express.Router();

router.use("/entries", entryRoutes);
router.use("/seasons", seasonRoutes);
router.use("/episodes", episodeRoutes);
router.use("/upload", uploadRoutes);
router.use("/episode-images", episodeImageRoutes);
router.use("/ratings", ratingRoutes);
router.use("/cast", castRoutes);
router.use("/videos", videoRoutes);
router.use("/awards", awardRoutes);

module.exports = router;
