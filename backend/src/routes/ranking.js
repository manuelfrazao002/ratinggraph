const express = require("express");
const {
  generateRanking,
} = require("../controllers/rankingController");

const { Popularity } = require("../models");

const router = express.Router();

// 🔥 gerar ranking
router.post("/generate", generateRanking);

// 🔥 buscar ranking + mudança
router.get("/:entryId", async (req, res) => {
  try {
    const history = await Popularity.findAll({
      where: { entryId: req.params.entryId },
      order: [["week", "DESC"]],
      limit: 2,
    });

    const current = history[0];
    const previous = history[1];

    const change = previous
      ? previous.rank - current.rank
      : 0;

    res.json({
      rank: current?.rank || null,
      change,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Erro ao buscar ranking",
    });
  }
});

module.exports = router;