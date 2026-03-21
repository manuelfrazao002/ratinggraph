const { Award } = require("../models");

const addAwardsToEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { awards } = req.body;

    await Award.bulkCreate(
      awards.map((a) => ({
        ...a,
        entryId,
      }))
    );

    res.json({ message: "Awards adicionados" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao adicionar awards" });
  }
};

const addAwardsToEpisode = async (req, res) => {
  try {
    const { episodeId } = req.params;
    const { awards } = req.body;

    await Award.bulkCreate(
      awards.map((a) => ({
        ...a,
        episodeId,
      }))
    );

    res.json({ message: "Awards adicionados ao episódio" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao adicionar awards ao episódio" });
  }
};

const getEntryAwards = async (req, res) => {
  const { entryId } = req.params;

  const awards = await Award.findAll({
    where: { entryId },
  });

  res.json(awards);
};

const getEpisodeAwards = async (req, res) => {
  const { episodeId } = req.params;

  const awards = await Award.findAll({
    where: { episodeId },
  });

  res.json(awards);
};

module.exports = {
  addAwardsToEntry,
  addAwardsToEpisode,
  getEntryAwards,
  getEpisodeAwards,
};