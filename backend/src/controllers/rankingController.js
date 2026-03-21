const { Rating, Popularity, Episode } = require("../models");
const { Op } = require("sequelize");

const generateRanking = async (req, res) => {
  try {
    // 📅 última semana
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    // 🔥 buscar ratings recentes
    const ratings = await Rating.findAll({
      where: {
        createdAt: {
          [Op.gte]: lastWeek,
        },
      },
      include: {
        model: Episode,
        attributes: ["id", "entryId"],
      },
    });

    // 🧠 agrupar por entry
    const grouped = {};

    ratings.forEach((r) => {
      const entryId = r.Episode.entryId;

      if (!grouped[entryId]) {
        grouped[entryId] = [];
      }

      grouped[entryId].push(r.value);
    });

    // 🔥 calcular score
    const ranking = Object.entries(grouped).map(
      ([entryId, values]) => {
        const totalVotes = values.length;

        const avg =
          values.reduce((a, b) => a + b, 0) / totalVotes;

        const score = avg * Math.log10(totalVotes);

        return {
          entryId,
          avg,
          totalVotes,
          score,
        };
      }
    );

    // 🔥 ordenar
    ranking.sort((a, b) => b.score - a.score);

    // 📅 hoje (sem horas)
    const today = new Date().toISOString().split("T")[0];

    // 🔥 guardar ranking
    await Popularity.bulkCreate(
      ranking.map((item, index) => ({
        entryId: item.entryId,
        rank: index + 1,
        type: "series", // podes melhorar depois
        week: today,
      })),
      {
        ignoreDuplicates: true, // evita repetir semana
      }
    );

    res.json({
      message: "Ranking gerado com sucesso",
      total: ranking.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erro ao gerar ranking",
    });
  }
};

module.exports = {
  generateRanking,
};