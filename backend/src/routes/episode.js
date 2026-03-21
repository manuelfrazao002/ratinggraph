const express = require("express");
const { Episode } = require("../models");
const {
  getEpisodesForGraph,
  getTopEpisodes,
  getBestEpisode,
  getLatestEpisode,
  addCastToEpisode,
  getEndingYear,
} = require("../controllers/episodeController");

const router = express.Router();

// Criar episode
router.post("/", async (req, res) => {
  try {
    const episode = await Episode.create(req.body);
    res.json(episode);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar episode" });
  }
});

// Buscar por season
router.get("/season/:seasonId", async (req, res) => {
  try {
    const episodes = await Episode.findAll({
      where: { seasonId: req.params.seasonId },
    });

    res.json(episodes);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar episodes" });
  }
});

router.get("/graph/:seasonId", getEpisodesForGraph);
router.get("/ranking/:seasonId", getTopEpisodes);
router.get("/best/:seasonId", getBestEpisode);
router.get("/latest/:seasonId", getLatestEpisode);
router.post("/:episodeId/cast", addCastToEpisode);
router.get("/ending-year/:entryId", getEndingYear);

module.exports = router;
