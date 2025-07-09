const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do caminho para a pasta public do frontend
// Modifique este caminho conforme a estrutura do seu projeto
const FRONTEND_PUBLIC_PATH = path.resolve(__dirname, '..', 'rating-graph-app', 'public');

// Enable CORS for your frontend
app.use(cors({
  origin: ['https://ratinggraph.onrender.com', 'http://localhost:5173'] // Add localhost for development
}));

// Middleware para verificar a autenticação (adicione sua lógica real)
const authenticate = (req, res, next) => {
  // Implemente sua lógica de autenticação aqui
  // Exemplo básico:
  const authToken = req.headers['authorization'];
  if (authToken === process.env.ADMIN_TOKEN) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
};

// Configure storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    
    switch(req.params.type) {
      case 'covers':
        uploadPath = path.join(FRONTEND_PUBLIC_PATH, 'imgs', 'covers');
        break;
      case 'trailers':
        uploadPath = path.join(FRONTEND_PUBLIC_PATH, 'imgs', 'trailers');
        break;
      case 'episodes':
        const { movieId, seasonNum } = req.params;
        uploadPath = path.join(FRONTEND_PUBLIC_PATH, 'imgs', 'show', movieId, seasonNum.toString());
        break;
      default:
        return cb(new Error('Invalid upload type'));
    }

    // Create directory if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    let filename;
    
    if (req.params.type === 'episodes') {
      const { episodeNum } = req.params;
      filename = `ep${episodeNum}${path.extname(file.originalname)}`;
    } else {
      // For covers and trailers, use the movieId as filename
      filename = `${req.params.movieId}${path.extname(file.originalname)}`;
    }
    
    cb(null, filename);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpg, .png, and .webp formats are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload endpoints with authentication
app.post('/upload/:type/:movieId', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Construa a URL correta para o frontend acessar
  let imageUrl;
  if (req.params.type === 'episodes') {
    const { movieId, seasonNum } = req.params;
    imageUrl = `/imgs/show/${movieId}/${seasonNum}/${req.file.filename}`;
  } else {
    imageUrl = `/imgs/${req.params.type}/${req.file.filename}`;
  }
  
  res.json({
    message: 'File uploaded successfully',
    imageUrl: imageUrl
  });
});

app.post('/upload/episode/:movieId/:seasonNum/:episodeNum', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const imageUrl = `/imgs/show/${req.params.movieId}/${req.params.seasonNum}/${req.file.filename}`;
  
  res.json({
    message: 'Episode image uploaded successfully',
    imageUrl: imageUrl
  });
});

// Endpoint para deletar imagens
app.delete('/delete-image', authenticate, (req, res) => {
  const { imagePath } = req.body;
  
  if (!imagePath) {
    return res.status(400).json({ error: 'Image path is required' });
  }

  const fullPath = path.join(FRONTEND_PUBLIC_PATH, imagePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return res.json({ message: 'Image deleted successfully' });
    }
    return res.status(404).json({ error: 'Image not found' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: err.message });
  } else if (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Saving images to: ${FRONTEND_PUBLIC_PATH}`);
});