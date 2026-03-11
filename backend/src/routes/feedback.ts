import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { trainerId, studentId, batchId, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (trainerId) where.trainerId = String(trainerId);
    if (studentId) where.studentId = String(studentId);
    if (batchId) where.batchId = String(batchId);

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where, skip, take: Number(limit),
        include: {
          student: { include: { user: { select: { name: true } } } },
          trainer: { include: { user: { select: { name: true } } } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.feedback.count({ where })
    ]);

    return res.json({
      success: true, data: feedbacks,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/analytics', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const overallStats = await prisma.feedback.aggregate({
      _avg: { trainerRating: true, contentRating: true, infraRating: true, overallRating: true },
      _count: { id: true }
    });

    const trainerStats = await prisma.feedback.groupBy({
      by: ['trainerId'],
      _avg: { overallRating: true },
      _count: { id: true },
      orderBy: { _avg: { overallRating: 'desc' } },
      take: 5
    });

    const trainerDetails = await Promise.all(
      trainerStats.map(async (stat) => {
        const trainer = await prisma.trainer.findUnique({
          where: { id: stat.trainerId },
          include: { user: { select: { name: true } } }
        });
        return { ...stat, trainerName: trainer?.user.name };
      })
    );

    return res.json({
      success: true,
      data: {
        overall: overallStats._avg,
        totalFeedbacks: overallStats._count.id,
        topTrainers: trainerDetails
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { trainerId, trainerRating, contentRating, infraRating, comment, batchId } = req.body;

    if (!trainerId || !trainerRating || !contentRating || !infraRating) {
      return res.status(400).json({ success: false, message: 'All ratings are required' });
    }

    let studentId = req.body.studentId;
    if (!studentId && req.user!.role === 'STUDENT') {
      const student = await prisma.student.findFirst({ where: { userId: req.user!.id } });
      if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
      studentId = student.id;
    }

    const overallRating = (Number(trainerRating) + Number(contentRating) + Number(infraRating)) / 3;

    const feedback = await prisma.feedback.create({
      data: {
        studentId, trainerId, batchId: batchId || null,
        trainerRating: Number(trainerRating),
        contentRating: Number(contentRating),
        infraRating: Number(infraRating),
        overallRating: Math.round(overallRating * 10) / 10,
        comment
      }
    });
    return res.status(201).json({ success: true, message: 'Feedback submitted', data: feedback });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
