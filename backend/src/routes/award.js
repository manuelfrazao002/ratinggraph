const express = require("express");
const {
  addAwardsToEntry,
  addAwardsToEpisode,
  getEntryAwards,
  getEpisodeAwards,
} = require("../controllers/awardController");

const router = express.Router();

// 🔥 adicionar awards a entry
router.post("/entry/:entryId", addAwardsToEntry);
router.post("/episode/:episodeId", addAwardsToEpisode);
router.get("/entry/:entryId", getEntryAwards);
router.get("/episode/:episodeId", getEpisodeAwards);

module.exports = router;
