import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Media from '../models/media.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export const getMedia = async (req, res) => {
  try {
    const media = await Media.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(media);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve media assets.' });
  }
};

export const createMedia = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const relativePath = `/uploads/${req.file.filename}`;
    const media = await Media.create({
      data: {
        filename: req.file.originalname,
        path: relativePath,
        mimeType: req.file.mimetype,
        size: req.file.size
      }
    });
    res.status(201).json(media);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save media metadata.' });
  }
};

export const deleteMedia = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const media = await Media.findUnique({
      where: { id }
    });

    if (!media) {
      return res.status(404).json({ error: 'Media asset not found.' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '../../public', media.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from db
    await Media.delete({
      where: { id }
    });

    res.json({ message: 'Media asset deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete media asset.' });
  }
};
