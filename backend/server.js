const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } = require('firebase/storage');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Inicialize o Firebase
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for your frontend
app.use(cors({
  origin: ['https://ratinggraph.onrender.com', 'http://localhost:5173', 'https://backend-ratinggraph.onrender.com']
}));

// Middleware para verificar a autenticação
const authenticate = (req, res, next) => {
  const authToken = req.headers['authorization'];
  if (authToken === process.env.ADMIN_TOKEN) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
};

// Configure multer para usar memoryStorage (não precisamos mais do diskStorage)
const upload = multer({ 
  storage: multer.memoryStorage(),
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
app.post('/upload/:type/:movieId', authenticate, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Define o caminho no Firebase Storage
    let filePath;
    if (req.params.type === 'episodes') {
      const { movieId, seasonNum } = req.params;
      const { episodeNum } = req.query;
      filePath = `imgs/show/${movieId}/${seasonNum}/ep${episodeNum}${path.extname(req.file.originalname)}`;
    } else {
      filePath = `imgs/${req.params.type}/${req.params.movieId}${path.extname(req.file.originalname)}`;
    }

    // Cria referência para o arquivo no Firebase
    const storageRef = ref(storage, filePath);
    
    // Faz upload do arquivo
    await uploadBytes(storageRef, req.file.buffer);
    
    // Obtém a URL pública
    const downloadURL = await getDownloadURL(storageRef);

    res.json({
      message: 'File uploaded successfully',
      imageUrl: downloadURL
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

app.post('/upload/episode/:movieId/:seasonNum/:episodeNum', authenticate, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const filePath = `imgs/show/${req.params.movieId}/${req.params.seasonNum}/ep${req.params.episodeNum}${path.extname(req.file.originalname)}`;
    const storageRef = ref(storage, filePath);
    
    await uploadBytes(storageRef, req.file.buffer);
    const downloadURL = await getDownloadURL(storageRef);

    res.json({
      message: 'Episode image uploaded successfully',
      imageUrl: downloadURL
    });
  } catch (error) {
    console.error('Episode upload error:', error);
    res.status(500).json({ error: 'Failed to upload episode image' });
  }
});

// Endpoint para deletar imagens
app.delete('/delete-image', authenticate, async (req, res) => {
  const { imageUrl } = req.body;
  
  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    // Extrai o path do URL do Firebase
    const urlParts = imageUrl.split('/o/');
    if (urlParts.length < 2) {
      return res.status(400).json({ error: 'Invalid Firebase image URL' });
    }
    
    const filePath = decodeURIComponent(urlParts[1].split('?')[0]);
    const storageRef = ref(storage, filePath);
    
    await deleteObject(storageRef);
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    if (error.code === 'storage/object-not-found') {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.status(500).json({ error: 'Failed to delete image' });
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
  console.log(`Using Firebase Storage: ${firebaseConfig.storageBucket}`);
});