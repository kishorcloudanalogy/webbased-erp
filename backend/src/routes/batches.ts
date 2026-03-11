import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '', status = '', courseId = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) where.name = { contains: String(search) };
    if (status) where.status = status;
    if (courseId) where.courseId = String(courseId);

    const [batches, total] = await Promise.all([
      prisma.batch.findMany({
        where, skip, take: Number(limit),
        include: {
          course: { select: { name: true, code: true, duration: true } },
          trainer: { include: { user: { select: { name: true, email: true } } } },
          _count: { select: { enrollments: true, sessions: true, assessments: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.batch.count({ where })
    ]);

    return res.json({
      success: true, data: batches,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const batch = await prisma.batch.findUnique({
      where: { id: req.params.id },
      include: {
        course: true,
        trainer: { include: { user: { select: { name: true, email: true } } } },
        enrollments: {
          include: { student: { include: { user: { select: { name: true, email: true } } } } }
        },
        sessions: { orderBy: { createdAt: 'desc' }, take: 10 },
        assessments: { orderBy: { createdAt: 'desc' } },
        _count: { select: { enrollments: true, sessions: true, assessments: true } }
      }
    });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    return res.json({ success: true, data: batch });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'COORDINATOR'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, courseId, trainerId, startDate, endDate, maxStudents, venue } = req.body;
    if (!name || !courseId || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Name, course, start and end dates are required' });
    }

    const batch = await prisma.batch.create({
      data: { name, courseId, trainerId: trainerId || null, startDate, endDate, maxStudents: maxStudents ? Number(maxStudents) : 30, venue, status: 'CREATED' },
      include: { course: { select: { name: true } }, trainer: { include: { user: { select: { name: true } } } } }
    });
    return res.status(201).json({ success: true, message: 'Batch created successfully', data: batch });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'COORDINATOR'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, trainerId, startDate, endDate, maxStudents, venue, status } = req.body;

    const validStatuses = ['CREATED', 'ENROLLMENT', 'TRAINING', 'MID_ASSESSMENT', 'FINAL_ASSESSMENT', 'CERTIFICATION', 'PLACEMENT', 'COMPLETED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updated = await prisma.batch.update({
      where: { id: req.params.id },
      data: { name, trainerId: trainerId || undefined, startDate, endDate, maxStudents: maxStudents ? Number(maxStudents) : undefined, venue, status },
      include: { course: { select: { name: true } } }
    });
    return res.json({ success: true, message: 'Batch updated', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/:id/enroll', authenticate, authorize('ADMIN', 'COORDINATOR'), async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.body;
    const batch = await prisma.batch.findUnique({ where: { id: req.params.id }, include: { _count: { select: { enrollments: true } } } });
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });
    if (batch._count.enrollments >= batch.maxStudents) {
      return res.status(400).json({ success: false, message: 'Batch is full' });
    }

    const enrollment = await prisma.enrollment.create({
      data: { studentId, batchId: req.params.id }
    });
    return res.status(201).json({ success: true, message: 'Student enrolled successfully', data: enrollment });
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ success: false, message: 'Student already enrolled in this batch' });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
