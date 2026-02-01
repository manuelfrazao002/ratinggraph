const express = require("express");
const multer = require("multer");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middlewares
app.use(
  cors({
    origin: [
      "https://ratinggraph.onrender.com",
      "http://localhost:5173",
      "https://backend-ratinggraph.onrender.com",
    ],
  }),
);
app.use(express.json());

// Autenticação
const authenticate = (req, res, next) => {
  const authToken = req.headers["authorization"];
  if (authToken === process.env.ADMIN_TOKEN) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
};

// Factory function para criar storages
const createStorage = (type) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
      const baseParams = {
        allowed_formats: ["jpg", "png", "webp"],
        format: "webp",
        transformation: [{ width: 800, crop: "limit", quality: "auto" }],
        invalidate: true,
      };

      switch (type) {
        case "cover":
          return {
            ...baseParams,
            folder: "rating-graph/covers",
            public_id: `cover_${req.params.movieId}`,
          };
        case "trailer":
          return {
            ...baseParams,
            folder: "rating-graph/trailers",
            public_id: `trailer_${req.params.movieId}`,
          };
        case "episode":
          const epNum = file.originalname.match(/ep(\d+)/i)?.[1] || "1";
          return {
            ...baseParams,
            folder: `rating-graph/show/${req.params.movieId}/season_${req.params.seasonNum}`,
            public_id: `ep${epNum}`,
          };
        case "character":
          return {
            ...baseParams,
            folder: "rating-graph/characters",
            public_id: `character_${req.params.movieId}`,
          };
        case "voiceactor":
          return {
            ...baseParams,
            folder: "rating-graph/voiceactors",
            public_id: `voiceactor_${req.params.movieId}`,
          };
        case "staff":
          return {
            ...baseParams,
            folder: "rating-graph/staff",
            public_id: `staff_${req.params.movieId}`,
          };
        case "stars":
          return {
            ...baseParams,
            folder: "rating-graph/stars",
            public_id: `stars_${req.params.movieId}`,
          };
        case "episodeImage": {
          const episodeMatch = file.originalname.match(/ep(\d+)/i);
          const imgMatch = file.originalname.match(/img(\d+)/i);

          if (!episodeMatch || !imgMatch) {
            throw new Error(
              "Nome do ficheiro inválido. Use o formato ep{n}_img{m}.jpg",
            );
          }

          const episodeNum = episodeMatch[1];
          const imgNum = imgMatch[1];

          return {
            ...baseParams,
            folder: `rating-graph/show/${req.params.movieId}/imgs`,
            public_id: `ep${episodeNum}_img${imgNum}`,
          };
        }
        default:
          throw new Error(`Tipo de upload inválido: ${type}`);
      }
    },
  });
};

// Configurações de upload
const uploadCover = multer({
  storage: createStorage("cover"),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadTrailer = multer({
  storage: createStorage("trailer"),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadCharacter = multer({
  storage: createStorage("character"),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadVoiceActor = multer({
  storage: createStorage("voiceactor"),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadStaff = multer({
  storage: createStorage("staff"),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadStars = multer({
  storage: createStorage("stars"),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadEpisode = multer({
  storage: createStorage("episode"),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadEpisodeImages = multer({
  storage: createStorage("episodeImage"),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Handlers
const handleSingleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }
  res.json({
    message: "Upload realizado com sucesso",
    url: req.file.path,
    publicId: req.file.filename,
  });
};

const handleEpisodeUpload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const results = req.files.map((file) => ({
      episodeNumber: file.filename.match(/ep(\d+)/)?.[1] || "1",
      url: file.path,
      publicId: file.filename,
    }));

    res.json({
      message: `${results.length} episódios processados com sucesso`,
      uploadedEpisodes: results,
    });
  } catch (error) {
    console.error("Erro no upload de episódios:", error);
    res.status(500).json({
      error: "Erro no processamento",
      details: error.message,
    });
  }
};

// Endpoints
app.post(
  "/upload/cover/:movieId",
  authenticate,
  uploadCover.single("image"),
  handleSingleUpload,
);
app.post(
  "/upload/trailer/:movieId",
  authenticate,
  uploadTrailer.single("image"),
  handleSingleUpload,
);
app.post(
  "/upload/characters/:movieId",
  authenticate,
  uploadCharacter.single("image"),
  handleSingleUpload,
);
app.post(
  "/upload/voiceactors/:movieId",
  authenticate,
  uploadVoiceActor.single("image"),
  handleSingleUpload,
);
app.post(
  "/upload/staff/:movieId",
  authenticate,
  uploadStaff.single("image"),
  handleSingleUpload,
);
app.post(
  "/upload/stars/:movieId",
  authenticate,
  uploadStars.single("image"),
  handleSingleUpload,
);
app.post(
  "/upload/episode/:movieId/:seasonNum",
  authenticate,
  uploadEpisode.array("episodes", 10),
  handleEpisodeUpload,
);
app.post(
  "/upload/episode-images/:movieId",
  authenticate,
  uploadEpisodeImages.array("images", 20),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Nenhuma imagem enviada" });
    }

    const results = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    res.json({
      message: `${results.length} imagens de episódio enviadas com sucesso`,
      images: results,
    });
  }
);

// Endpoint para deletar com invalidação de cache
app.delete("/delete-image", authenticate, async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) {
    return res.status(400).json({ error: "publicId é obrigatório" });
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });
    res.json({
      message: "Imagem deletada com sucesso",
      details: result,
    });
  } catch (error) {
    console.error("Erro ao deletar imagem:", error);
    res.status(500).json({
      error: "Falha ao deletar imagem",
      details: error.message,
    });
  }
});

// Health check
app.get("/health", async (req, res) => {
  try {
    await cloudinary.api.ping();
    res.status(200).json({
      status: "healthy",
      cloudinary: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      cloudinary: "disconnected",
      error: error.message,
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({
      error:
        err.code === "LIMIT_FILE_SIZE"
          ? "Tamanho do arquivo excede 5MB"
          : err.message,
    });
  } else {
    console.error(err.stack);
    res.status(500).json({
      error:
        process.env.NODE_ENV === "production"
          ? "Erro interno do servidor"
          : err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Cloudinary configurado para: ${cloudinary.config().cloud_name}`);
});
