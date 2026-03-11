import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { batchId, type, status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (batchId) where.batchId = String(batchId);
    if (type) where.type = String(type);
    if (status) where.status = String(status);

    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where, skip, take: Number(limit),
        include: {
          batch: { include: { course: { select: { name: true } } } },
          _count: { select: { questions: true, results: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.assessment.count({ where })
    ]);

    return res.json({
      success: true, data: assessments,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.id },
      include: {
        batch: { include: { course: true } },
        questions: true,
        results: {
          include: { student: { include: { user: { select: { name: true } } } } },
          orderBy: { score: 'desc' }
        }
      }
    });
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
    return res.json({ success: true, data: assessment });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'COORDINATOR'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, batchId, type, totalMarks, passingMarks, duration, scheduledAt, questions } = req.body;
    if (!title || !batchId || !totalMarks || !passingMarks || !duration || !scheduledAt) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    const assessment = await prisma.assessment.create({
      data: {
        title, batchId, type: type || 'MID', totalMarks: Number(totalMarks),
        passingMarks: Number(passingMarks), duration: Number(duration), scheduledAt,
        questions: questions ? { create: questions } : undefined
      },
      include: { questions: true }
    });
    return res.status(201).json({ success: true, message: 'Assessment created', data: assessment });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/:id/submit', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { answers, studentId: bodyStudentId } = req.body;

    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.id },
      include: { questions: true }
    });
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });

    let resolvedStudentId = bodyStudentId;
    if (!resolvedStudentId && req.user!.role === 'STUDENT') {
      const student = await prisma.student.findFirst({ where: { userId: req.user!.id } });
      if (student) resolvedStudentId = student.id;
    }

    let score = 0;
    if (answers && Array.isArray(answers)) {
      answers.forEach(({ questionId, answer }: any) => {
        const question = assessment.questions.find(q => q.id === questionId);
        if (question && question.type === 'MCQ' && question.correctAnswer === answer) {
          score += question.marks;
        }
      });
    }

    const percentage = (score / assessment.totalMarks) * 100;
    const isPassed = score >= assessment.passingMarks;
    const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : 'F';

    const result = await prisma.result.upsert({
      where: { studentId_assessmentId: { studentId: resolvedStudentId, assessmentId: req.params.id } },
      create: { studentId: resolvedStudentId, assessmentId: req.params.id, score, totalMarks: assessment.totalMarks, percentage, isPassed, grade },
      update: { score, percentage, isPassed, grade, submittedAt: new Date() }
    });

    return res.json({ success: true, message: 'Assessment submitted', data: { result, score, percentage, isPassed, grade } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/results/all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, assessmentId, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (studentId) where.studentId = String(studentId);
    if (assessmentId) where.assessmentId = String(assessmentId);

    const [results, total] = await Promise.all([
      prisma.result.findMany({
        where, skip, take: Number(limit),
        include: {
          student: { include: { user: { select: { name: true, email: true } } } },
          assessment: { include: { batch: { include: { course: { select: { name: true } } } } } }
        },
        orderBy: { submittedAt: 'desc' }
      }),
      prisma.result.count({ where })
    ]);

    return res.json({
      success: true, data: results,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
