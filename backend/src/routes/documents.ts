import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/mp4', 'video/mpeg'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  }
});

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, type, category, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (type) where.type = String(type);
    if (category) where.category = String(category);

    if (req.user!.role === 'STUDENT') {
      const student = await prisma.student.findFirst({ where: { userId: req.user!.id } });
      if (student) where.studentId = student.id;
    } else if (studentId) {
      where.studentId = String(studentId);
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where, skip, take: Number(limit),
        include: { student: { include: { user: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.document.count({ where })
    ]);

    return res.json({ success: true, data: documents, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/upload', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const { name, type, category, studentId } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;

    const doc = await prisma.document.create({
      data: {
        name: name || req.file.originalname,
        type: type || 'OTHER',
        url: fileUrl,
        size: req.file.size,
        mimeType: req.file.mimetype,
        studentId: studentId || null,
        uploadedBy: req.user!.id,
        category: category || 'OTHER'
      }
    });

    return res.status(201).json({ success: true, message: 'Document uploaded', data: doc });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id/verify', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!['ADMIN', 'COORDINATOR'].includes(req.user!.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    const doc = await prisma.document.update({ where: { id: req.params.id }, data: { isVerified: true } });
    return res.json({ success: true, message: 'Document verified', data: doc });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    if (req.user!.role !== 'ADMIN' && doc.uploadedBy !== req.user!.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const filePath = path.join(process.cwd(), doc.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.document.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
