const { Episode, Rating } = require("../models");

const rateEpisode = async (req, res) => {
  try {
    const { episodeId } = req.params;
    const { rating } = req.body;

    const episode = await Episode.findByPk(episodeId);

    if (!episode) {
      return res.status(404).json({ error: "Episode não encontrado" });
    }

    // 🔥 guardar voto individual
    await Rating.create({
      value: rating,
      episodeId: episode.id,
      entryId: episode.entryId,
    });

    // 🔥 recalcular média (opcional para performance)
    const ratings = await Rating.findAll({
      where: { episodeId },
    });

    const totalVotes = ratings.length;
    const avg =
      ratings.reduce((sum, r) => sum + r.value, 0) /
      totalVotes;

    await episode.update({
      rating: avg,
      votes: totalVotes,
    });

    res.json({
      message: "Rating guardado",
      rating: avg,
      votes: totalVotes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao avaliar episódio" });
  }
};

module.exports = {
  rateEpisode,
};