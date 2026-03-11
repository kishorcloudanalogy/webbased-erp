import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { user: { name: { contains: String(search) } } },
        { user: { email: { contains: String(search) } } },
        { studentCode: { contains: String(search) } },
        { mobile: { contains: String(search) } }
      ];
    }
    if (status) where.status = status;

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true, lastLogin: true } },
          enrollments: {
            include: { batch: { include: { course: { select: { name: true } } } } },
            where: { status: 'ACTIVE' }
          },
          _count: { select: { attendances: true, results: true, placements: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.student.count({ where })
    ]);

    return res.json({
      success: true,
      data: students,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    console.error('Get students error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, createdAt: true } },
        enrollments: {
          include: {
            batch: {
              include: {
                course: true,
                trainer: { include: { user: { select: { name: true } } } }
              }
            }
          }
        },
        attendances: {
          include: { session: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        results: {
          include: { assessment: { select: { title: true, type: true, totalMarks: true } } },
          orderBy: { submittedAt: 'desc' }
        },
        placements: {
          include: { company: true }
        },
        documents: true,
        _count: { select: { attendances: true, results: true, placements: true, enrollments: true } }
      }
    });

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const totalAttendance = await prisma.attendance.count({ where: { studentId: student.id } });
    const presentCount = await prisma.attendance.count({ where: { studentId: student.id, status: 'PRESENT' } });
    const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    return res.json({ success: true, data: { ...student, attendancePercentage } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'COORDINATOR'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, dob, gender, mobile, address, aadhaarNumber, qualification, skills } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const studentCount = await prisma.student.count();
    const studentCode = `STU${String(studentCount + 1).padStart(4, '0')}`;

    const student = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'STUDENT',
        student: {
          create: {
            studentCode,
            dob, gender, mobile, address, aadhaarNumber, qualification, skills
          }
        }
      },
      include: { student: true }
    });

    const { password: _, ...userWithoutPassword } = student;
    return res.status(201).json({ success: true, message: 'Student created successfully', data: userWithoutPassword });
  } catch (error) {
    console.error('Create student error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'COORDINATOR'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, dob, gender, mobile, address, aadhaarNumber, qualification, skills, status } = req.body;

    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const updated = await prisma.student.update({
      where: { id: req.params.id },
      data: { dob, gender, mobile, address, aadhaarNumber, qualification, skills, status },
      include: { user: { select: { name: true, email: true } } }
    });

    if (name) {
      await prisma.user.update({ where: { id: student.userId }, data: { name } });
    }

    return res.json({ success: true, message: 'Student updated successfully', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    await prisma.user.update({ where: { id: student.userId }, data: { isActive: false } });
    await prisma.student.update({ where: { id: req.params.id }, data: { status: 'INACTIVE' } });

    return res.json({ success: true, message: 'Student deactivated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
