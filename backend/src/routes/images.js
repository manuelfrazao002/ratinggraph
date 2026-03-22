// backend/routes/images.js
const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { EntryImage } = require("../models");

const router = express.Router();

router.get("/all-images/:movieId", async (req, res) => {
  try {
    const { movieId } = req.params;

    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: `rating-graph/show/${movieId}/imgs`,
      max_results: 500,
    });

    const images = result.resources.map(img => ({
      url: img.secure_url,
      publicId: img.public_id
    }));

    res.json({ images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar imagens" });
  }
});

// guardar em memória (não disco)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ CREATE IMAGE
router.post("/:entryId", upload.single("image"), async (req, res) => {
  try {
    const { entryId } = req.params;
    const { type, order } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Sem imagem" });
    }

    // 🔥 upload para cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `rating-graph/entries/${entryId}/images`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    // 🔥 guardar na BD
    const image = await EntryImage.create({
      entryId,
      url: result.secure_url,
      type: type || "gallery",
      order: order || 0,
    });

    res.json(image);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar imagem" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const image = await EntryImage.findByPk(req.params.id);

    if (!image) {
      return res.status(404).json({ error: "Imagem não encontrada" });
    }

    // 🔥 opcional: apagar também do cloudinary
    // extrair public_id do URL (hack simples)
    const parts = image.url.split("/");
    const filename = parts[parts.length - 1];
    const publicId = `rating-graph/entries/${image.entryId}/images/${filename.split(".")[0]}`;

    await cloudinary.uploader.destroy(publicId);

    await image.destroy();

    res.json({ message: "Imagem apagada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao apagar imagem" });
  }
});

module.exports = router;