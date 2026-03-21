const { EpisodeImage } = require("../models");

const uploadEpisodeImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Nenhuma imagem enviada" });
    }

    const episodeId = req.params.episodeId;

    const images = req.files.map((file, index) => ({
      url: file.path,
      order: index + 1,
      episodeId,
    }));

    await EpisodeImage.bulkCreate(images);

    res.json({
      message: "Imagens guardadas com sucesso",
      images,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no upload de imagens" });
  }
};

module.exports = {
  uploadEpisodeImages,
};