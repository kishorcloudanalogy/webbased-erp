import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { role, page = 1, limit = 20, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (role) where.role = String(role);
    if (search) where.OR = [
      { name: { contains: String(search) } },
      { email: { contains: String(search) } }
    ];

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: Number(limit),
        select: { id: true, name: true, email: true, role: true, isActive: true, lastLogin: true, createdAt: true, avatar: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return res.json({
      success: true, data: users,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), password: hashed, role },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
    });
    return res.status(201).json({ success: true, message: 'User created', data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, role, isActive } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, role, isActive },
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });
    return res.json({ success: true, message: 'User updated', data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
