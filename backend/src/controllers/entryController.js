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
   🔥 FAKE TRAFFIC ENGINE COMPLETO
========================= */

const now = new Date();
const lastUpdate = entry.lastTrafficUpdate || entry.createdAt;

const hoursPassed = Math.floor(
  (now - new Date(lastUpdate)) / (1000 * 60 * 60)
);

if (hoursPassed > 0) {
  let voteGrowth = 0;
  let watchlistGrowth = 0;

  // 🔥 crescimento base
  for (let i = 0; i < hoursPassed; i++) {
    voteGrowth += Math.floor(Math.random() * 3);      // 0–2
    watchlistGrowth += Math.floor(Math.random() * 4); // 0–3 (mais rápido)
  }

  // 🔥 episódios
  const allEpisodes = entry.seasons?.flatMap(s => s.episodes) || [];

  const recentEpisode = allEpisodes.find(ep => {
    if (!ep.airDate) return false;

    const diff =
      (now - new Date(ep.airDate)) / (1000 * 60 * 60 * 24);

    return diff >= 0 && diff <= 3;
  });

  const hasReleasedEpisode = allEpisodes.some(ep => {
    if (!ep.airDate) return false;
    return new Date(ep.airDate) <= now;
  });

  // 🚀 spike
  if (recentEpisode) {
    voteGrowth *= 3;
    watchlistGrowth *= 2;
  }

  // 📉 decay
  if (entry.releaseDate) {
    const releaseYear = new Date(entry.releaseDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - releaseYear;

    if (age > 5) {
      voteGrowth *= 0.3;
      watchlistGrowth *= 0.4;
    } else if (age > 2) {
      voteGrowth *= 0.6;
      watchlistGrowth *= 0.7;
    }
  }

  // 🔥 hype pré-lançamento
  if (!hasReleasedEpisode) {
    watchlistGrowth *= 1.5;
  }

  // 🎲 variação natural
  const randomFactor = 0.8 + Math.random() * 0.4;
  voteGrowth *= randomFactor;
  watchlistGrowth *= randomFactor;

  // 🔒 limites
  voteGrowth = Math.min(voteGrowth, 50);
  watchlistGrowth = Math.min(watchlistGrowth, 100);

  // ✅ aplicar watchlist (SEMPRE)
  if (watchlistGrowth > 0) {
    await entry.increment("watchlistNumber", {
      by: Math.floor(watchlistGrowth),
    });
  }

  // ✅ aplicar votos (SÓ se já lançou)
  if (hasReleasedEpisode && voteGrowth > 0) {
    await entry.increment("votes", {
      by: Math.floor(voteGrowth),
    });
  }

  // 🎬 vídeos
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