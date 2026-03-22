// backend/routes/images.js
const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { EntryImage } = require("../models");

const router = express.Router();

// guardar em memória (não disco)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* =========================
   ✅ CREATE IMAGE (AUTO ORDER)
========================= */
router.post("/:entryId", upload.single("image"), async (req, res) => {
  try {
    const { entryId } = req.params;
    const { type } = req.body;

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

    // 🔥 AUTO ORDER
    const lastImage = await EntryImage.findOne({
      where: { entryId },
      order: [["order", "DESC"]],
    });

    const nextOrder = lastImage ? lastImage.order + 1 : 0;

    // 🔥 guardar na BD
    const image = await EntryImage.create({
      entryId,
      url: result.secure_url,
      type: type || "gallery",
      order: nextOrder,
      publicId: result.public_id, // 🔥 MUITO IMPORTANTE
    });

    res.json(image);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar imagem" });
  }
});

/* =========================
   ✅ DELETE IMAGE
========================= */
router.delete("/:id", async (req, res) => {
  try {
    const image = await EntryImage.findByPk(req.params.id);

    if (!image) {
      return res.status(404).json({ error: "Imagem não encontrada" });
    }

    // 🔥 apagar do cloudinary (clean 🔥)
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    await image.destroy();

    // 🔥 reorganizar order (sem buracos)
    const images = await EntryImage.findAll({
      where: { entryId: image.entryId },
      order: [["order", "ASC"]],
    });

    for (let i = 0; i < images.length; i++) {
      await images[i].update({ order: i });
    }

    res.json({ message: "Imagem apagada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao apagar imagem" });
  }
});

module.exports = router;