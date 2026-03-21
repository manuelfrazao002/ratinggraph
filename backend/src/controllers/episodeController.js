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

module.exports = {
  getEpisodesForGraph,
  getTopEpisodes,
  getBestEpisode,
  getLatestEpisode,
  addCastToEpisode,
};