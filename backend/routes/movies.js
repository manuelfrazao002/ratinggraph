// routes/movies.js

const express = require("express");
const prisma = require("../src/lib/prisma");

const router = express.Router();

// Criar movie
router.post("/", async (req, res) => {
  try {
    const { title, type } = req.body;

    const movie = await prisma.movie.create({
      data: {
        title,
        type,
      },
    });

    res.json(movie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar movie" });
  }
});

module.exports = router;