const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
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

// Inicialização do Firebase
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware CORS
app.use(cors({
  origin: ['https://ratinggraph.onrender.com', 'http://localhost:5173', 'https://backend-ratinggraph.onrender.com']
}));

// Middleware de autenticação
const authenticate = (req, res, next) => {
  const authToken = req.headers['authorization'];
  if (authToken === process.env.ADMIN_TOKEN) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
};

// Configuração do Multer
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
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Middleware de debug para verificar uploads
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Content-Type:', req.headers['content-type']);
  next();
});

// Rota de upload principal
app.post('/upload/:type/:movieId', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file received in upload:', {
        headers: req.headers,
        body: req.body
      });
      return res.status(400).json({ 
        error: 'No file uploaded',
        details: 'Ensure you are sending as multipart/form-data with field named "image"'
      });
    }

    const fileExt = path.extname(req.file.originalname);
    let filePath;

    if (req.params.type === 'episodes') {
      const { movieId, seasonNum } = req.params;
      const { episodeNum } = req.query;
      filePath = `imgs/show/${movieId}/${seasonNum}/ep${episodeNum}${fileExt}`;
    } else {
      filePath = `imgs/${req.params.type}/${req.params.movieId}${fileExt}`;
    }

    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, req.file.buffer);
    const downloadURL = await getDownloadURL(storageRef);

    console.log('Upload successful:', downloadURL);
    res.json({
      message: 'File uploaded successfully',
      imageUrl: downloadURL,
      fileInfo: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload file',
      details: error.message
    });
  }
});

// Rota alternativa para episódios
app.post('/upload/episode/:movieId/:seasonNum/:episodeNum', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

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
    res.status(500).json({ 
      error: 'Failed to upload episode image',
      details: error.message
    });
  }
});

// Rota para deletar imagens
app.delete('/delete-image', authenticate, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const urlParts = imageUrl.split('/o/');
    if (urlParts.length < 2) {
      return res.status(400).json({ error: 'Invalid Firebase image URL' });
    }
    
    const filePath = decodeURIComponent(urlParts[1].split('?')[0]);
    const storageRef = ref(storage, filePath);
    
    await deleteObject(storageRef);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    const status = error.code === 'storage/object-not-found' ? 404 : 500;
    res.status(status).json({ 
      error: 'Failed to delete image',
      details: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    firebase: {
      project: firebaseConfig.projectId,
      bucket: firebaseConfig.storageBucket
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Firebase Config:', {
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket
  });
});