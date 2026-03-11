import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '', isActive } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) where.OR = [
      { name: { contains: String(search) } },
      { code: { contains: String(search) } },
      { sector: { contains: String(search) } }
    ];
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where, skip, take: Number(limit),
        include: {
          _count: { select: { batches: true, materials: true } },
          batches: { where: { status: { in: ['TRAINING', 'ENROLLMENT'] } }, take: 3 }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.course.count({ where })
    ]);

    return res.json({
      success: true, data: courses,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        batches: { include: { trainer: { include: { user: { select: { name: true } } } }, _count: { select: { enrollments: true } } } },
        materials: { orderBy: { createdAt: 'desc' } },
        _count: { select: { batches: true, materials: true } }
      }
    });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    return res.json({ success: true, data: course });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'COORDINATOR'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, duration, modules, certType, sector, nsdcCode } = req.body;
    if (!name || !duration) return res.status(400).json({ success: false, message: 'Name and duration are required' });

    const courseCount = await prisma.course.count();
    const code = `CRS${String(courseCount + 1).padStart(4, '0')}`;

    const course = await prisma.course.create({
      data: { name, code, description, duration: Number(duration), modules, certType, sector, nsdcCode }
    });
    return res.status(201).json({ success: true, message: 'Course created successfully', data: course });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'COORDINATOR'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, duration, modules, certType, sector, nsdcCode, isActive } = req.body;
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const updated = await prisma.course.update({
      where: { id: req.params.id },
      data: { name, description, duration: duration ? Number(duration) : undefined, modules, certType, sector, nsdcCode, isActive }
    });
    return res.json({ success: true, message: 'Course updated', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.course.update({ where: { id: req.params.id }, data: { isActive: false } });
    return res.json({ success: true, message: 'Course deactivated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
