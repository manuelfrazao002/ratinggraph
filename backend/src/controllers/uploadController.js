const { Entry } = require("../models");

const handleCoverUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const imageUrl = req.file.path;
    const movieId = req.params.movieId;

    // 🔥 atualizar DB
    await Entry.update(
      { coverImage: imageUrl },
      { where: { id: movieId } }
    );

    res.json({
      message: "Upload realizado e Entry atualizada",
      url: imageUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no upload" });
  }
};

module.exports = {
  handleCoverUpload,
};