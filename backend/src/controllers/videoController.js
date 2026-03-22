const { Video } = require("../models");

const uploadVideo = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { title, type } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Imagem não enviada" });
    }

    const imageUrl = req.file.path; // 👈 Cloudinary

    const video = await Video.create({
      title,
      url: imageUrl, // 👈 usa o campo url como imagem
      type,
      entryId,
    });

    res.json({
      message: "Imagem de video criada",
      video,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar video" });
  }
};

const likeVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findByPk(videoId);

    await video.increment("likes");

    res.json({ message: "Like adicionado" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao dar like" });
  }
};

const reactToVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findByPk(videoId);

    await video.increment("reactions");

    res.json({ message: "Reaction adicionada" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao reagir" });
  }
};

module.exports = {
  uploadVideo,
  likeVideo,
  reactToVideo,
};