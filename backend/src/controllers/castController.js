const { Cast } = require("../models");

const uploadCastImage = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { actorName, characterName } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Nenhuma imagem enviada" });
    }

    const imageUrl = req.file.path;

    const cast = await Cast.create({
      actorName,
      characterName,
      image: imageUrl,
      entryId,
    });

    res.json({
      message: "Cast criado com imagem",
      cast,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar cast" });
  }
};

module.exports = {
  uploadCastImage,
};