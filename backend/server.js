const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const streamifier = require('streamifier');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Middlewares
app.use(cors({
  origin: ['https://ratinggraph.onrender.com', 'http://localhost:5173', 'https://backend-ratinggraph.onrender.com']
}));
app.use(express.json());

// Autenticação
const authenticate = (req, res, next) => {
  const authToken = req.headers['authorization'];
  if (authToken === process.env.ADMIN_TOKEN) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
};

// Configuração otimizada do Cloudinary Storage
const createStorage = (type) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
      const params = {
        allowed_formats: ['jpg', 'png', 'webp'],
        transformation: [{ width: 800, crop: 'limit', quality: 'auto' }],
        format: 'webp', // Converter para webp automaticamente
      };

      switch(type) {
        case 'covers':
          return {
            ...params,
            folder: `rating-graph/covers`,
            public_id: `cover_${req.params.movieId}`,
          };
        case 'trailers':
          return {
            ...params,
            folder: `rating-graph/trailers`,
            public_id: `trailer_${req.params.movieId}`,
          };
        case 'episodes':
          return {
            ...params,
            folder: `rating-graph/show/${req.params.movieId}/season_${req.params.seasonNum}`,
            public_id: `episode_${req.params.episodeNum}`,
          };
        default:
          throw new Error('Invalid upload type');
      }
    },
    stream: {
      write: (chunk, encoding, callback) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto' }, 
          (error, result) => {
            if (error) return callback(error);
            callback(null, result);
          }
        );
        streamifier.createReadStream(chunk).pipe(stream);
      }
    }
  });
};

// Configurações de upload específicas para cada tipo
const uploadCover = multer({ 
  storage: createStorage('covers'),
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');

const uploadTrailer = multer({ 
  storage: createStorage('trailers'),
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');

const uploadEpisode = multer({ 
  storage: createStorage('episodes'),
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');

// Handlers de upload genéricos
const handleUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({
    message: 'File uploaded successfully',
    imageUrl: req.file.path,
    publicId: req.file.filename
  });
};

// Endpoints otimizados
app.post('/upload/cover/:movieId', authenticate, (req, res, next) => {
  uploadCover(req, res, (err) => {
    if (err) return next(err);
    handleUpload(req, res);
  });
});

app.post('/upload/trailer/:movieId', authenticate, (req, res, next) => {
  uploadTrailer(req, res, (err) => {
    if (err) return next(err);
    handleUpload(req, res);
  });
});

app.post('/upload/episode/:movieId/:seasonNum/:episodeNum', authenticate, (req, res, next) => {
  uploadEpisode(req, res, (err) => {
    if (err) return next(err);
    handleUpload(req, res);
  });
});

// Delete otimizado
app.delete('/delete-image', authenticate, async (req, res) => {
  const { publicId } = req.body;
  
  if (!publicId) {
    return res.status(400).json({ error: 'Public ID is required' });
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === 'ok') {
      return res.json({ message: 'Image deleted successfully' });
    }
    return res.status(404).json({ error: 'Image not found' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Error handling melhorado
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ 
      error: err.code === 'LIMIT_FILE_SIZE' 
        ? 'File size exceeds 5MB limit' 
        : err.message 
    });
  } else {
    console.error(err.stack);
    res.status(500).json({ 
      error: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message
    });
  }
});

// Health check com verificação do Cloudinary
app.get('/health', async (req, res) => {
  try {
    await cloudinary.api.ping();
    res.status(200).json({ 
      status: 'healthy',
      cloudinary: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      cloudinary: 'disconnected',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Cloudinary configured for cloud: ${cloudinary.config().cloud_name}`);
});