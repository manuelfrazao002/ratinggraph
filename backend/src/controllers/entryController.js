const { Entry, Season, Episode } = require("../models");

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

// ✅ GET ONE (FULL)
const getEntryById = async (req, res) => {
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

    await entry.update(payload); // 🔥 AQUI está a diferença

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