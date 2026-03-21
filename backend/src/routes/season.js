const express = require("express");
const { Season } = require("../models");

const router = express.Router();

// Criar season
router.post("/", async (req, res) => {
  try {
    const season = await Season.create(req.body);
    res.json(season);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar season" });
  }
});

// Buscar por entry
router.get("/entry/:entryId", async (req, res) => {
  try {
    const seasons = await Season.findAll({
      where: { entryId: req.params.entryId },
    });

    res.json(seasons);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar seasons" });
  }
});

module.exports = router;