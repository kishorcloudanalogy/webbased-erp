import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/student-progress', authenticate, authorize('ADMIN', 'COORDINATOR'), async (req: AuthRequest, res: Response) => {
  try {
    const { batchId } = req.query;
    const where: any = {};
    if (batchId) where.enrollments = { some: { batchId: String(batchId) } };

    const students = await prisma.student.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        enrollments: { include: { batch: { include: { course: { select: { name: true } } } } } },
        results: { include: { assessment: { select: { title: true, type: true, totalMarks: true } } } },
        _count: { select: { attendances: true } }
      }
    });

    const report = await Promise.all(students.map(async (student) => {
      const totalAttendance = await prisma.attendance.count({ where: { studentId: student.id } });
      const presentCount = await prisma.attendance.count({ where: { studentId: student.id, status: 'PRESENT' } });
      const avgScore = student.results.length > 0
        ? student.results.reduce((sum, r) => sum + r.percentage, 0) / student.results.length
        : 0;

      return {
        studentCode: student.studentCode,
        name: student.user.name,
        email: student.user.email,
        enrolledCourses: student.enrollments.map(e => e.batch.course.name).join(', '),
        attendancePercentage: totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0,
        avgAssessmentScore: Math.round(avgScore),
        totalAssessments: student.results.length,
        passedAssessments: student.results.filter(r => r.isPassed).length,
        status: student.status
      };
    }));

    return res.json({ success: true, data: report });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/trainer-performance', authenticate, authorize('ADMIN', 'COORDINATOR'), async (req: AuthRequest, res: Response) => {
  try {
    const trainers = await prisma.trainer.findMany({
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { batches: true, sessionLogs: true, feedbacks: true } }
      }
    });

    const report = await Promise.all(trainers.map(async (trainer) => {
      const feedbackAvg = await prisma.feedback.aggregate({
        where: { trainerId: trainer.id },
        _avg: { overallRating: true }
      });
      const totalSessions = await prisma.sessionLog.count({ where: { trainerId: trainer.id } });

      return {
        trainerCode: trainer.trainerCode,
        name: trainer.user.name,
        domain: trainer.domain,
        experience: trainer.experience,
        totalBatches: trainer._count.batches,
        totalSessions,
        avgRating: Math.round((feedbackAvg._avg.overallRating || 0) * 10) / 10,
        totalFeedbacks: trainer._count.feedbacks
      };
    }));

    return res.json({ success: true, data: report });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/placement', authenticate, authorize('ADMIN', 'PLACEMENT_COORDINATOR'), async (req: AuthRequest, res: Response) => {
  try {
    const placements = await prisma.placement.findMany({
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        company: { select: { name: true, industry: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const stats = {
      total: placements.length,
      accepted: placements.filter(p => p.status === 'ACCEPTED').length,
      internships: placements.filter(p => p.type === 'INTERNSHIP').length,
      fullPlacements: placements.filter(p => p.type === 'PLACEMENT' && p.status === 'ACCEPTED').length,
      avgSalary: placements.filter(p => p.salary).reduce((sum, p) => sum + (p.salary || 0), 0) / (placements.filter(p => p.salary).length || 1)
    };

    return res.json({ success: true, data: { placements, stats } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/attendance', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { batchId } = req.query;
    const sessionWhere: any = {};
    if (batchId) sessionWhere.batchId = String(batchId);

    const sessions = await prisma.sessionLog.findMany({
      where: sessionWhere,
      include: {
        batch: { include: { course: { select: { name: true } } } },
        trainer: { include: { user: { select: { name: true } } } },
        _count: { select: { attendances: true } }
      },
      orderBy: { date: 'desc' }
    });

    const report = await Promise.all(sessions.map(async (session) => {
      const [total, present, absent, late] = await Promise.all([
        prisma.attendance.count({ where: { sessionId: session.id } }),
        prisma.attendance.count({ where: { sessionId: session.id, status: 'PRESENT' } }),
        prisma.attendance.count({ where: { sessionId: session.id, status: 'ABSENT' } }),
        prisma.attendance.count({ where: { sessionId: session.id, status: 'LATE' } })
      ]);
      return {
        sessionId: session.id,
        date: session.date,
        topic: session.topic,
        batch: session.batch.name,
        course: session.batch.course.name,
        trainer: session.trainer.user.name,
        total, present, absent, late,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0
      };
    }));

    return res.json({ success: true, data: report });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/nsdc-compliance', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const [totalStudents, nsdcRegistered, totalBatches, nsdcMappedBatches, certifiedStudents] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.batch.count(),
      prisma.batch.count({ where: { nsdcBatchId: { not: null } } }),
      prisma.result.count({ where: { isPassed: true } })
    ]);

    return res.json({
      success: true,
      data: {
        totalStudents, nsdcRegistered, registrationRate: totalStudents > 0 ? Math.round((nsdcRegistered / totalStudents) * 100) : 0,
        totalBatches, nsdcMappedBatches, batchMappingRate: totalBatches > 0 ? Math.round((nsdcMappedBatches / totalBatches) * 100) : 0,
        certifiedStudents, certificationRate: totalStudents > 0 ? Math.round((certifiedStudents / totalStudents) * 100) : 0
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
