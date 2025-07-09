const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for your frontend
app.use(cors({
  origin: ['https://ratinggraph.onrender.com', 'http://localhost:5173'] // Add localhost for development
}));

// Configure storage based on your frontend structure
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    
    switch(req.params.type) {
      case 'covers':
        uploadPath = path.join(__dirname, 'public', 'imgs', 'covers');
        break;
      case 'trailers':
        uploadPath = path.join(__dirname, 'public', 'imgs', 'trailers');
        break;
      case 'episodes':
        const { movieId, seasonNum } = req.params;
        uploadPath = path.join(__dirname, 'public', 'imgs', 'show', movieId, seasonNum.toString());
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

// Upload endpoints
app.post('/upload/:type/:movieId', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const imageUrl = `/imgs/${req.params.type}/${req.file.filename}`;
  
  res.json({
    message: 'File uploaded successfully',
    imageUrl: imageUrl
  });
});

app.post('/upload/episode/:movieId/:seasonNum/:episodeNum', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const imageUrl = `/imgs/show/${req.params.movieId}/${req.params.seasonNum}/${req.file.filename}`;
  
  res.json({
    message: 'Episode image uploaded successfully',
    imageUrl: imageUrl
  });
});

// Serve static files
app.use('/imgs', express.static(path.join(__dirname, 'public', 'imgs')));

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: err.message });
  } else if (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});