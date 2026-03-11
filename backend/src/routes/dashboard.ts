import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import NodeCache from 'node-cache';

const router = Router();
const cache = new NodeCache({ stdTTL: 60 });

router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const cacheKey = `dashboard_stats_${req.user!.role}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached });

    const [
      totalStudents, totalTrainers, totalCourses, totalBatches,
      activeBatches, totalPlacements, totalAssessments,
      recentStudents, batchStatusCounts, placementStats
    ] = await Promise.all([
      prisma.student.count(),
      prisma.trainer.count(),
      prisma.course.count({ where: { isActive: true } }),
      prisma.batch.count(),
      prisma.batch.count({ where: { status: { in: ['TRAINING', 'MID_ASSESSMENT', 'ENROLLMENT'] } } }),
      prisma.placement.count({ where: { status: 'ACCEPTED' } }),
      prisma.assessment.count(),
      prisma.student.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } }
      }),
      prisma.batch.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.placement.groupBy({ by: ['type'], _count: { id: true } })
    ]);

    const totalEnrollments = await prisma.enrollment.count({ where: { status: 'ACTIVE' } });
    const totalAttendance = await prisma.attendance.count();
    const presentCount = await prisma.attendance.count({ where: { status: 'PRESENT' } });
    const avgAttendance = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    const feedbackStats = await prisma.feedback.aggregate({
      _avg: { overallRating: true }
    });

    const stats = {
      overview: {
        totalStudents,
        totalTrainers,
        totalCourses,
        totalBatches,
        activeBatches,
        totalPlacements,
        totalEnrollments,
        totalAssessments,
        avgAttendance,
        avgFeedbackRating: Math.round((feedbackStats._avg.overallRating || 0) * 10) / 10
      },
      recentStudents: recentStudents.map(s => ({
        id: s.id,
        name: s.user.name,
        email: s.user.email,
        code: s.studentCode,
        status: s.status,
        createdAt: s.createdAt
      })),
      batchStatusDistribution: batchStatusCounts,
      placementTypeDistribution: placementStats,
      monthlyTrend: generateMonthlyTrend()
    };

    cache.set(cacheKey, stats);
    return res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

function generateMonthlyTrend() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  return months.slice(0, currentMonth + 1).map((month, i) => ({
    month,
    students: Math.floor(Math.random() * 50) + 20,
    placements: Math.floor(Math.random() * 20) + 5,
    completions: Math.floor(Math.random() * 30) + 10
  }));
}

export default router;
