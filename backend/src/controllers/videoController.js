const { Video } = require("../models");

const uploadVideo = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { title, url, type } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Thumbnail não enviada" });
    }

    const thumbnail = req.file.path;

    const video = await Video.create({
      title,
      url,
      type,
      thumbnail,
      entryId,
    });

    res.json({
      message: "Video criado com thumbnail",
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