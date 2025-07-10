const express = require('express');
const multer = require('multer');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

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

// Configuração do storage para episódios
const episodeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Nome temporário que mantém o original para extrair o número depois
    return {
      folder: `rating-graph/show/${req.params.movieId}/season_${req.params.seasonNum}`,
      public_id: `temp_${file.originalname.replace(/\.[^/.]+$/, '')}`, // Remove a extensão
      allowed_formats: ['jpg', 'png', 'webp'],
      format: 'webp',
      transformation: [{ width: 800, crop: 'limit', quality: 'auto' }]
    };
  }
});

const uploadEpisodes = multer({ 
  storage: episodeStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

app.post('/upload/episode/:movieId/:seasonNum', authenticate, uploadEpisodes.array('episodes', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const results = await Promise.all(
      req.files.map(async (file) => {
        // Extrai o número do formato "ep1" (case insensitive)
        const epMatch = file.originalname.match(/ep(\d+)/i);
        if (!epMatch) {
          throw new Error(`Formato de nome inválido: ${file.originalname} (use ep1.jpg, ep2.png)`);
        }
        const epNum = epMatch[1];

        // Obtém o public_id CORRETO do arquivo temporário
        const tempPublicId = file.filename; // Usa file.filename em vez de file.public_id
        
        // Novo public_id no formato ep1, ep2, etc.
        const newPublicId = `rating-graph/show/${req.params.movieId}/season_${req.params.seasonNum}/ep${epNum}`;
        
        // Renomeia no Cloudinary (agora com os parâmetros corretos)
        await cloudinary.uploader.rename(
          tempPublicId, // from_public_id (o nome temporário)
          newPublicId,  // to_public_id (o novo nome)
          { resource_type: 'image' } // Tipo explícito
        );
        
        return {
          episodeNumber: epNum,
          url: `https://res.cloudinary.com/${cloudinary.config().cloud_name}/image/upload/${newPublicId}.webp`,
          publicId: newPublicId
        };
      })
    );

    res.json({
      message: `${results.length} episódios processados com sucesso`,
      uploadedEpisodes: results
    });
  } catch (error) {
    console.error('Erro no upload de episódios:', error);
    res.status(500).json({ 
      error: 'Erro no processamento',
      details: error.message 
    });
  }
});

// Endpoints para capas e trailers (mantidos como antes)
const mediaStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    let folder, publicId;
    
    switch(req.params.type) {
      case 'covers':
        folder = 'rating-graph/covers';
        publicId = `cover_${req.params.movieId}`;
        break;
      case 'trailers':
        folder = 'rating-graph/trailers';
        publicId = `trailer_${req.params.movieId}`;
        break;
      default:
        throw new Error('Tipo de upload inválido');
    }
    
    return {
      folder,
      public_id: publicId,
      allowed_formats: ['jpg', 'png', 'webp'],
      format: 'webp',
      transformation: [{ width: 800, crop: 'limit', quality: 'auto' }]
    };
  }
});

const uploadMedia = multer({ 
  storage: mediaStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Apenas formatos JPG, PNG e WebP são permitidos'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

app.post('/upload/:type/:movieId', authenticate, uploadMedia.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }
  res.json({
    message: 'Upload realizado com sucesso',
    imageUrl: req.file.path,
    publicId: req.file.filename
  });
});

// Endpoint para deletar
app.delete('/delete-image', authenticate, async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) {
    return res.status(400).json({ error: 'publicId é obrigatório' });
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    result.result === 'ok' 
      ? res.json({ message: 'Imagem deletada com sucesso' })
      : res.status(404).json({ error: 'Imagem não encontrada' });
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    res.status(500).json({ error: 'Falha ao deletar imagem' });
  }
});

// Health check
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

// Error handling
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ 
      error: err.code === 'LIMIT_FILE_SIZE' 
        ? 'Tamanho do arquivo excede 5MB' 
        : err.message 
    });
  } else {
    console.error(err.stack);
    res.status(500).json({ 
      error: process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor'
        : err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Cloudinary configurado para: ${cloudinary.config().cloud_name}`);
});