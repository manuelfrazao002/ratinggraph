const express = require("express");
const { Entry, Season, Episode } = require("../models");

const router = express.Router();

// ✅ Criar entry
router.post("/", async (req, res) => {
  try {
    const entry = await Entry.create(req.body);
    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar entry" });
  }
});

// ✅ Buscar todas
router.get("/", async (req, res) => {
  try {
    const entries = await Entry.findAll();
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar entries" });
  }
});

// 🔥 Buscar com tudo (seasons + episodes)
router.get("/:id", async (req, res) => {
  try {
    const entry = await Entry.findByPk(req.params.id, {
      include: {
        model: Season,
        as: "seasons",
        include: {
          model: Episode,
          as: "episodes",
        },
      },
    });

    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar entry" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Entry.destroy({
      where: { id: req.params.id },
    });

    res.json({ message: "Entry apagada" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao apagar" });
  }
});

module.exports = router;