const express = require("express");
const { rateEpisode } = require("../controllers/ratingController");

const router = express.Router();

router.post("/episode/:episodeId", rateEpisode);

module.exports = router;