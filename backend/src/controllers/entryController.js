const { Entry, Season, Episode, Video, EntryImage } = require("../models");

// 🔥 helper slug
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");

// ✅ CREATE
const createEntry = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      slug: slugify(req.body.title),
    };

    const entry = await Entry.create(payload);

    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar entry" });
  }
};

// ✅ GET ALL
const getEntries = async (req, res) => {
  try {
    const entries = await Entry.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar entries" });
  }
};

// ✅ GET ONE (FULL + FAKE TRAFFIC ENGINE)
const getEntryById = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await Entry.findByPk(id, {
      include: [
        {
          model: Season,
          as: "seasons",
          include: [
            {
              model: Episode,
              as: "episodes",
            },
          ],
        },
        {
          model: Video,
          as: "videos",
        },
        {
          model: EntryImage,
          as: "images",
          separate: true,
          order: [["order", "ASC"]],
        },
      ],
    });

    if (!entry) {
      return res.status(404).json({ error: "Entry não encontrada" });
    }

    // 🔥 total seasons
    const totalSeasons = entry.seasons?.length || 0;

    // 🔥 todos episódios
    const allEpisodes =
      entry.seasons?.flatMap((s) => s.episodes || []) || [];

    // 🔥 anos únicos
    const yearsSet = new Set();

    allEpisodes.forEach((ep) => {
      if (ep.releaseDate) {
        const year = new Date(ep.releaseDate).getFullYear();
        if (!isNaN(year)) {
          yearsSet.add(year);
        }
      }
    });

    const totalYears = yearsSet.size;

    /* =========================
       🔥 FAKE TRAFFIC ENGINE
    ========================= */

    const now = new Date();
    const lastUpdate =
      entry.lastTrafficUpdate || entry.createdAt;

    const hoursPassed = Math.floor(
      (now - new Date(lastUpdate)) / (1000 * 60 * 60)
    );

    if (hoursPassed > 0) {
      let growth = 0;

      // 📈 crescimento base
      for (let i = 0; i < hoursPassed; i++) {
        growth += Math.floor(Math.random() * 3); // 0–2 por hora
      }

      // 🚀 detectar episódio recente
      const recentEpisode = entry.seasons
        ?.flatMap((s) => s.episodes)
        .find((ep) => {
          if (!ep.airDate) return false;

          const diff =
            (now - new Date(ep.airDate)) /
            (1000 * 60 * 60 * 24);

          return diff >= 0 && diff <= 3;
        });

      // 🚀 spike
      if (recentEpisode) {
        growth *= 3;
      }

      // 📉 decay por idade
      if (entry.releaseDate) {
        const releaseYear = new Date(
          entry.releaseDate
        ).getFullYear();
        const currentYear = new Date().getFullYear();
        const age = currentYear - releaseYear;

        if (age > 5) growth *= 0.3;
        else if (age > 2) growth *= 0.6;
      }

      // 🎲 variação natural
      growth *= 0.8 + Math.random() * 0.4;

      // 🧱 limite máximo
      growth = Math.min(growth, 50);

      // ✅ aplicar votos
      if (growth > 0) {
        await entry.increment("votes", {
          by: Math.floor(growth),
        });
      }

      // 🎬 crescimento de vídeos
      for (const video of entry.videos || []) {
        let likeGrowth = Math.floor(Math.random() * 2);

        if (recentEpisode) {
          likeGrowth += 2;
        }

        if (likeGrowth > 0) {
          await video.increment("likes", {
            by: likeGrowth,
          });
        }
      }

      // 🔄 atualizar timestamp
      await entry.update({
        lastTrafficUpdate: new Date(),
      });
    }

    /* ========================= */

    res.json({
      ...entry.toJSON(),
      totalSeasons,
      totalYears,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar entry" });
  }
};

// ✅ UPDATE
const updateEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await Entry.findByPk(id);

    if (!entry) {
      return res.status(404).json({ error: "Entry não encontrada" });
    }

    const payload = {
      ...req.body,
    };

    // 🔥 slug automático
    if (req.body.title) {
      payload.slug = slugify(req.body.title);
    }

    await entry.update(payload);

    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar entry" });
  }
};

// ✅ DELETE
const deleteEntry = async (req, res) => {
  try {
    await Entry.destroy({
      where: { id: req.params.id },
    });

    res.json({ message: "Entry apagada" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao apagar" });
  }
};

module.exports = {
  createEntry,
  getEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
};