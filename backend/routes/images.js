// backend/routes/images.js
import express from "express";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({ 
  cloudinary_url: process.env.CLOUDINARY_URL 
});

const router = express.Router();

router.get("/all-images", async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "rating-graph/show/toe/imgs/",
      max_results: 100
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

export default router;