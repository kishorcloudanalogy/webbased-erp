import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { user: { name: { contains: String(search) } } },
        { domain: { contains: String(search) } },
        { trainerCode: { contains: String(search) } }
      ];
    }

    const [trainers, total] = await Promise.all([
      prisma.trainer.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          batches: {
            include: { course: { select: { name: true } } },
            where: { status: { in: ['TRAINING', 'ENROLLMENT'] } }
          },
          _count: { select: { batches: true, sessionLogs: true, feedbacks: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.trainer.count({ where })
    ]);

    const trainersWithRating = await Promise.all(
      trainers.map(async (trainer) => {
        const feedbackAvg = await prisma.feedback.aggregate({
          where: { trainerId: trainer.id },
          _avg: { overallRating: true }
        });
        return { ...trainer, avgRating: Math.round((feedbackAvg._avg.overallRating || 0) * 10) / 10 };
      })
    );

    return res.json({
      success: true,
      data: trainersWithRating,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const trainer = await prisma.trainer.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, createdAt: true } },
        batches: { include: { course: true } },
        sessionLogs: { orderBy: { createdAt: 'desc' }, take: 10 },
        feedbacks: { include: { student: { include: { user: { select: { name: true } } } } }, orderBy: { createdAt: 'desc' }, take: 10 },
        _count: { select: { batches: true, sessionLogs: true, feedbacks: true } }
      }
    });

    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    const feedbackAvg = await prisma.feedback.aggregate({
      where: { trainerId: trainer.id },
      _avg: { trainerRating: true, contentRating: true, infraRating: true, overallRating: true }
    });

    return res.json({ success: true, data: { ...trainer, feedbackStats: feedbackAvg._avg } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'COORDINATOR'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, qualification, experience, domain, certifications, skills } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const trainerCount = await prisma.trainer.count();
    const trainerCode = `TRN${String(trainerCount + 1).padStart(4, '0')}`;

    const trainer = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'TRAINER',
        trainer: {
          create: { trainerCode, qualification, experience: experience ? Number(experience) : null, domain, certifications, skills }
        }
      },
      include: { trainer: true }
    });

    const { password: _, ...userWithoutPassword } = trainer;
    return res.status(201).json({ success: true, message: 'Trainer created successfully', data: userWithoutPassword });
  } catch (error) {
    console.error('Create trainer error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'COORDINATOR'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, qualification, experience, domain, certifications, skills, status } = req.body;

    const trainer = await prisma.trainer.findUnique({ where: { id: req.params.id } });
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    const updated = await prisma.trainer.update({
      where: { id: req.params.id },
      data: { qualification, experience: experience ? Number(experience) : undefined, domain, certifications, skills, status }
    });

    if (name) await prisma.user.update({ where: { id: trainer.userId }, data: { name } });

    return res.json({ success: true, message: 'Trainer updated successfully', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
