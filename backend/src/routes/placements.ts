import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/companies', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { isActive: true };
    if (search) where.OR = [
      { name: { contains: String(search) } },
      { industry: { contains: String(search) } }
    ];

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where, skip, take: Number(limit),
        include: { _count: { select: { placements: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.company.count({ where })
    ]);
    return res.json({ success: true, data: companies, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/companies', authenticate, authorize('ADMIN', 'PLACEMENT_COORDINATOR'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, industry, hrName, hrEmail, hrPhone, website, location } = req.body;
    if (!name || !industry) return res.status(400).json({ success: false, message: 'Company name and industry are required' });

    const company = await prisma.company.create({ data: { name, industry, hrName, hrEmail, hrPhone, website, location } });
    return res.status(201).json({ success: true, message: 'Company added', data: company });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { type, status, studentId, companyId, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (type) where.type = String(type);
    if (status) where.status = String(status);
    if (studentId) where.studentId = String(studentId);
    if (companyId) where.companyId = String(companyId);

    const [placements, total] = await Promise.all([
      prisma.placement.findMany({
        where, skip, take: Number(limit),
        include: {
          student: { include: { user: { select: { name: true, email: true } } } },
          company: { select: { name: true, industry: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.placement.count({ where })
    ]);

    return res.json({ success: true, data: placements, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'PLACEMENT_COORDINATOR'), async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, companyId, type, role, salary, startDate, status } = req.body;
    if (!studentId || !companyId || !role) return res.status(400).json({ success: false, message: 'Student, company and role are required' });

    const placement = await prisma.placement.create({
      data: { studentId, companyId, type: type || 'PLACEMENT', role, salary: salary ? Number(salary) : null, startDate: startDate || null, status: status || 'OFFERED' },
      include: { student: { include: { user: { select: { name: true } } } }, company: { select: { name: true, industry: true } } }
    });
    return res.status(201).json({ success: true, message: 'Placement recorded', data: placement });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'PLACEMENT_COORDINATOR'), async (req: AuthRequest, res: Response) => {
  try {
    const { status, salary, startDate, feedback } = req.body;
    const updated = await prisma.placement.update({
      where: { id: req.params.id },
      data: { status, salary: salary ? Number(salary) : undefined, startDate, feedback }
    });
    return res.json({ success: true, message: 'Placement updated', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [total, accepted, internships, placements] = await Promise.all([
      prisma.placement.count(),
      prisma.placement.count({ where: { status: 'ACCEPTED' } }),
      prisma.placement.count({ where: { type: 'INTERNSHIP' } }),
      prisma.placement.count({ where: { type: 'PLACEMENT' } })
    ]);

    const avgSalary = await prisma.placement.aggregate({
      where: { status: 'ACCEPTED', type: 'PLACEMENT' },
      _avg: { salary: true }
    });

    return res.json({
      success: true,
      data: { total, accepted, internships, placements, avgSalary: avgSalary._avg.salary || 0, placementRate: total > 0 ? Math.round((accepted / total) * 100) : 0 }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
