const { Episode, Cast } = require("../models");

const getEpisodesForGraph = async (req, res) => {
  try {
    const { seasonId } = req.params;

    const episodes = await Episode.findAll({
      where: { seasonId },
      order: [["number", "ASC"]],
      attributes: ["number", "rating", "votes"],
    });

    // 🔥 formato perfeito para gráfico
    const formatted = episodes.map((ep) => ({
      episode: ep.number,
      rating: ep.rating,
      votes: ep.votes,
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar dados do gráfico" });
  }
};

const getTopEpisodes = async (req, res) => {
  try {
    const { seasonId } = req.params;

    const episodes = await Episode.findAll({
      where: { seasonId },
      order: [["rating", "DESC"]],
      limit: 10,
      attributes: ["id", "number", "title", "rating", "votes"],
    });

    res.json(episodes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar ranking" });
  }
};

const getBestEpisode = async (req, res) => {
  try {
    const { seasonId } = req.params;

    const episode = await Episode.findOne({
      where: { seasonId },
      order: [
        ["rating", "DESC"],  // primeiro critério
        ["votes", "DESC"],   // desempate 🔥
      ],
    });

    res.json(episode);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar melhor episódio" });
  }
};

const getLatestEpisode = async (req, res) => {
  try {
    const { seasonId } = req.params;

    const episode = await Episode.findOne({
      where: { seasonId },
      order: [["airDate", "DESC"]],
    });

    res.json(episode);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar episódio recente" });
  }
};

const addCastToEpisode = async (req, res) => {
  try {
    const { episodeId } = req.params;
    const { castIds } = req.body;

    const episode = await Episode.findByPk(episodeId);

    if (!episode) {
      return res.status(404).json({ error: "Episode não encontrado" });
    }

    const cast = await Cast.findAll({
      where: { id: castIds },
    });

    await episode.setCast(cast);

    res.json({ message: "Cast associado ao episódio" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao associar cast" });
  }
};

const getEndingYear = async (req, res) => {
  try {
    const { entryId } = req.params;

    // 🔥 buscar episódios através das seasons
    const episodes = await Episode.findAll({
      include: {
        model: Season,
        as: "season",
        where: { entryId },
        attributes: [],
      },
    });

    if (!episodes.length) {
      return res.json({ endingYear: null });
    }

    // 🔥 1. tenta episódio final manual
    const finalEpisode = episodes.find((ep) => ep.isFinal);

    // 🔥 2. fallback → último episódio por data
    const lastEpisode =
      finalEpisode ||
      episodes
        .filter((ep) => ep.airDate)
        .sort(
          (a, b) => new Date(b.airDate) - new Date(a.airDate)
        )[0];

    const endingYear = lastEpisode?.airDate
      ? new Date(lastEpisode.airDate).getFullYear()
      : null;

    res.json({ endingYear });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao calcular ending year" });
  }
};

const updateEpisode = async (req, res) => {
  try {
    const { id } = req.params;

    await Episode.update(req.body, { where: { id } });

    const updated = await Episode.findByPk(id);

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar episódio" });
  }
};

module.exports = {
  getEpisodesForGraph,
  getTopEpisodes,
  getBestEpisode,
  getLatestEpisode,
  addCastToEpisode,
  getEndingYear,
  updateEpisode,
};