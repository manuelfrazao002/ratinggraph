const { Episode } = require("../models");

const rateEpisode = async (req, res) => {
  try {
    const { episodeId } = req.params;
    const { rating } = req.body;

    const episode = await Episode.findByPk(episodeId);

    if (!episode) {
      return res.status(404).json({ error: "Episode não encontrado" });
    }

    // 🔥 cálculo
    const totalScore = episode.rating * episode.votes;
    const newVotes = episode.votes + 1;
    const newRating = (totalScore + rating) / newVotes;

    await episode.update({
      rating: newRating,
      votes: newVotes,
    });

    res.json({
      message: "Rating atualizado",
      rating: newRating,
      votes: newVotes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao avaliar episódio" });
  }
};

module.exports = {
  rateEpisode,
};