import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { batchId, studentId, sessionId, page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (batchId) where.session = { batchId: String(batchId) };
    if (studentId) where.studentId = String(studentId);
    if (sessionId) where.sessionId = String(sessionId);

    const [attendance, total] = await Promise.all([
      prisma.attendance.findMany({
        where, skip, take: Number(limit),
        include: {
          student: { include: { user: { select: { name: true, email: true } } } },
          session: { include: { batch: { select: { name: true } } } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.attendance.count({ where })
    ]);

    return res.json({
      success: true, data: attendance,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/summary', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, batchId } = req.query;

    const where: any = {};
    if (studentId) where.studentId = String(studentId);
    if (batchId) where.session = { batchId: String(batchId) };

    const [total, present, absent, late] = await Promise.all([
      prisma.attendance.count({ where }),
      prisma.attendance.count({ where: { ...where, status: 'PRESENT' } }),
      prisma.attendance.count({ where: { ...where, status: 'ABSENT' } }),
      prisma.attendance.count({ where: { ...where, status: 'LATE' } })
    ]);

    return res.json({
      success: true,
      data: {
        total, present, absent, late,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/session', authenticate, authorize('ADMIN', 'COORDINATOR', 'TRAINER'), async (req: AuthRequest, res: Response) => {
  try {
    const { batchId, trainerId, date, topic, duration, notes } = req.body;
    if (!batchId || !date || !topic || !duration) {
      return res.status(400).json({ success: false, message: 'Batch, date, topic, and duration are required' });
    }

    let resolvedTrainerId = trainerId;
    if (!resolvedTrainerId && req.user!.role === 'TRAINER') {
      const trainer = await prisma.trainer.findFirst({ where: { userId: req.user!.id } });
      if (trainer) resolvedTrainerId = trainer.id;
    }

    const session = await prisma.sessionLog.create({
      data: { batchId, trainerId: resolvedTrainerId, date, topic, duration: Number(duration), notes }
    });
    return res.status(201).json({ success: true, message: 'Session created', data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/mark', authenticate, authorize('ADMIN', 'COORDINATOR', 'TRAINER'), async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, attendanceData } = req.body;

    if (!sessionId || !Array.isArray(attendanceData)) {
      return res.status(400).json({ success: false, message: 'Session ID and attendance data are required' });
    }

    const results = await Promise.all(
      attendanceData.map(({ studentId, status, remarks }: any) =>
        prisma.attendance.upsert({
          where: { studentId_sessionId: { studentId, sessionId } },
          create: { studentId, sessionId, status, remarks },
          update: { status, remarks }
        })
      )
    );

    return res.json({ success: true, message: 'Attendance marked successfully', data: { count: results.length } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
