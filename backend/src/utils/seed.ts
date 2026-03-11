import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.document.deleteMany();
  await prisma.placement.deleteMany();
  await prisma.company.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.result.deleteMany();
  await prisma.question.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.sessionLog.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.material.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();
  await prisma.trainer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  const hash = async (pwd: string) => bcrypt.hash(pwd, 12);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@erp.com',
      password: await hash('admin123'),
      role: 'ADMIN'
    }
  });

  // Create academic coordinator
  const coordinator = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'academic@erp.com',
      password: await hash('password123'),
      role: 'COORDINATOR'
    }
  });

  // Create placement coordinator
  const placementCoord = await prisma.user.create({
    data: {
      name: 'Neha Gupta',
      email: 'placement@erp.com',
      password: await hash('password123'),
      role: 'PLACEMENT_COORDINATOR'
    }
  });

  // Create trainer user
  const trainerUser = await prisma.user.create({
    data: {
      name: 'Amit Verma',
      email: 'trainer@erp.com',
      password: await hash('password123'),
      role: 'TRAINER',
      trainer: {
        create: {
          trainerCode: 'TRN0001',
          qualification: 'B.Tech Computer Science',
          experience: 8,
          domain: 'Full Stack Development',
          certifications: 'AWS Certified, Google Cloud Professional',
          skills: 'React, Node.js, Python, Machine Learning'
        }
      }
    },
    include: { trainer: true }
  });

  // Create more trainers
  const trainer2 = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      email: 'priya.trainer@erp.com',
      password: await hash('password123'),
      role: 'TRAINER',
      trainer: {
        create: {
          trainerCode: 'TRN0002',
          qualification: 'M.Tech Electronics',
          experience: 6,
          domain: 'IoT & Embedded Systems',
          certifications: 'CISCO CCNA, CompTIA Security+',
          skills: 'Python, Arduino, IoT, Raspberry Pi'
        }
      }
    },
    include: { trainer: true }
  });

  const trainer3 = await prisma.user.create({
    data: {
      name: 'Suresh Kumar',
      email: 'suresh.trainer@erp.com',
      password: await hash('password123'),
      role: 'TRAINER',
      trainer: {
        create: {
          trainerCode: 'TRN0003',
          qualification: 'MBA Finance',
          experience: 10,
          domain: 'Banking & Finance',
          certifications: 'CFA Level 1, NSE Certified',
          skills: 'Financial Analysis, Tally, SAP'
        }
      }
    },
    include: { trainer: true }
  });

  // Create student user
  const studentUser = await prisma.user.create({
    data: {
      name: 'Riya Singh',
      email: 'student@erp.com',
      password: await hash('password123'),
      role: 'STUDENT',
      student: {
        create: {
          studentCode: 'STU0001',
          dob: '2000-05-15',
          gender: 'Female',
          mobile: '9876543210',
          address: '123 MG Road, Bangalore, Karnataka',
          aadhaarNumber: '1234-5678-9012',
          qualification: 'B.Sc Computer Science',
          skills: 'Python, HTML, CSS'
        }
      }
    },
    include: { student: true }
  });

  // Create more students
  const studentNames = [
    { name: 'Arjun Kumar', email: 'arjun@erp.com', code: 'STU0002', gender: 'Male', mobile: '9876543211', qualification: 'B.Tech IT' },
    { name: 'Sneha Reddy', email: 'sneha@erp.com', code: 'STU0003', gender: 'Female', mobile: '9876543212', qualification: 'BCA' },
    { name: 'Vikram Malhotra', email: 'vikram@erp.com', code: 'STU0004', gender: 'Male', mobile: '9876543213', qualification: 'B.Sc Mathematics' },
    { name: 'Ananya Joshi', email: 'ananya@erp.com', code: 'STU0005', gender: 'Female', mobile: '9876543214', qualification: 'B.Tech CSE' },
    { name: 'Rohit Sharma', email: 'rohit@erp.com', code: 'STU0006', gender: 'Male', mobile: '9876543215', qualification: 'Diploma IT' },
    { name: 'Kavya Nair', email: 'kavya@erp.com', code: 'STU0007', gender: 'Female', mobile: '9876543216', qualification: 'B.Sc IT' },
    { name: 'Manish Gupta', email: 'manish@erp.com', code: 'STU0008', gender: 'Male', mobile: '9876543217', qualification: 'MCA' },
    { name: 'Divya Mehra', email: 'divya@erp.com', code: 'STU0009', gender: 'Female', mobile: '9876543218', qualification: 'B.Tech ECE' },
    { name: 'Karan Bose', email: 'karan@erp.com', code: 'STU0010', gender: 'Male', mobile: '9876543219', qualification: 'B.Com' }
  ];

  const createdStudents: any[] = [studentUser.student];
  for (const s of studentNames) {
    const su = await prisma.user.create({
      data: {
        name: s.name, email: s.email, password: await hash('password123'), role: 'STUDENT',
        student: { create: { studentCode: s.code, gender: s.gender, mobile: s.mobile, qualification: s.qualification, dob: '1999-01-01', address: 'Bangalore, Karnataka', aadhaarNumber: '1234-5678-0000' } }
      },
      include: { student: true }
    });
    if (su.student) createdStudents.push(su.student);
  }

  // Create courses
  const courses = await Promise.all([
    prisma.course.create({ data: { name: 'Full Stack Web Development', code: 'CRS0001', description: 'Complete MERN stack development course with industry projects', duration: 480, modules: 'HTML/CSS,JavaScript,React,Node.js,MongoDB,SQL', certType: 'NSDC Certificate', sector: 'IT/ITeS', nsdcCode: 'NSDC/IT/001' } }),
    prisma.course.create({ data: { name: 'Data Science & AI', code: 'CRS0002', description: 'Machine learning, deep learning, and data analysis', duration: 600, modules: 'Python,Statistics,ML,Deep Learning,NLP,Computer Vision', certType: 'NSDC Certificate', sector: 'IT/ITeS', nsdcCode: 'NSDC/IT/002' } }),
    prisma.course.create({ data: { name: 'Digital Marketing', code: 'CRS0003', description: 'SEO, SEM, Social Media Marketing, and Analytics', duration: 240, modules: 'SEO,Google Ads,Facebook Ads,Analytics,Content Marketing', certType: 'NSDC Certificate', sector: 'Media & Entertainment', nsdcCode: 'NSDC/ME/001' } }),
    prisma.course.create({ data: { name: 'Banking & Finance', code: 'CRS0004', description: 'Banking operations, financial analysis, and accounting', duration: 360, modules: 'Banking Basics,Accounting,Tally,SAP,Financial Analysis', certType: 'NSDC Certificate', sector: 'BFSI', nsdcCode: 'NSDC/BFSI/001' } }),
    prisma.course.create({ data: { name: 'IoT & Embedded Systems', code: 'CRS0005', description: 'Internet of Things, Arduino, Raspberry Pi programming', duration: 300, modules: 'Electronics Basics,Arduino,Raspberry Pi,Python,Cloud IoT', certType: 'NSDC Certificate', sector: 'Electronics', nsdcCode: 'NSDC/EL/001' } }),
    prisma.course.create({ data: { name: 'Cloud Computing (AWS)', code: 'CRS0006', description: 'AWS cloud services, DevOps, and infrastructure management', duration: 400, modules: 'AWS Core,EC2,S3,Lambda,DevOps,Docker,Kubernetes', certType: 'AWS + NSDC Certificate', sector: 'IT/ITeS', nsdcCode: 'NSDC/IT/003' } })
  ]);

  // Create batches
  const batches = await Promise.all([
    prisma.batch.create({ data: { name: 'FSWB-2024-01', courseId: courses[0].id, trainerId: trainerUser.trainer!.id, startDate: '2024-01-15', endDate: '2024-07-15', status: 'TRAINING', maxStudents: 30, venue: 'Lab 101, Block A' } }),
    prisma.batch.create({ data: { name: 'DSA-2024-01', courseId: courses[1].id, trainerId: trainerUser.trainer!.id, startDate: '2024-02-01', endDate: '2024-09-30', status: 'MID_ASSESSMENT', maxStudents: 25, venue: 'Lab 102, Block A' } }),
    prisma.batch.create({ data: { name: 'DM-2024-01', courseId: courses[2].id, trainerId: trainer2.trainer!.id, startDate: '2024-03-01', endDate: '2024-07-01', status: 'ENROLLMENT', maxStudents: 35, venue: 'Room 201, Block B' } }),
    prisma.batch.create({ data: { name: 'BF-2024-01', courseId: courses[3].id, trainerId: trainer3.trainer!.id, startDate: '2024-01-10', endDate: '2024-07-10', status: 'FINAL_ASSESSMENT', maxStudents: 40, venue: 'Room 301, Block C' } }),
    prisma.batch.create({ data: { name: 'IOT-2024-01', courseId: courses[4].id, trainerId: trainer2.trainer!.id, startDate: '2024-04-01', endDate: '2024-10-01', status: 'CREATED', maxStudents: 20, venue: 'Lab 105, Block A' } })
  ]);

  // Enroll students in batches
  const enrollmentData = [
    { studentId: createdStudents[0].id, batchId: batches[0].id },
    { studentId: createdStudents[1].id, batchId: batches[0].id },
    { studentId: createdStudents[2].id, batchId: batches[0].id },
    { studentId: createdStudents[3].id, batchId: batches[1].id },
    { studentId: createdStudents[4].id, batchId: batches[1].id },
    { studentId: createdStudents[5].id, batchId: batches[2].id },
    { studentId: createdStudents[6].id, batchId: batches[2].id },
    { studentId: createdStudents[7].id, batchId: batches[3].id },
    { studentId: createdStudents[8].id, batchId: batches[3].id },
    { studentId: createdStudents[9].id, batchId: batches[0].id },
    { studentId: createdStudents[0].id, batchId: batches[1].id },
  ];

  for (const e of enrollmentData) {
    await prisma.enrollment.create({ data: e });
  }

  // Create sessions and attendance
  const sessions = await Promise.all([
    prisma.sessionLog.create({ data: { batchId: batches[0].id, trainerId: trainerUser.trainer!.id, date: '2024-01-20', topic: 'Introduction to HTML & CSS', duration: 3 } }),
    prisma.sessionLog.create({ data: { batchId: batches[0].id, trainerId: trainerUser.trainer!.id, date: '2024-01-22', topic: 'JavaScript Fundamentals', duration: 3 } }),
    prisma.sessionLog.create({ data: { batchId: batches[0].id, trainerId: trainerUser.trainer!.id, date: '2024-01-25', topic: 'React Components & Hooks', duration: 4 } }),
    prisma.sessionLog.create({ data: { batchId: batches[1].id, trainerId: trainerUser.trainer!.id, date: '2024-02-05', topic: 'Python for Data Science', duration: 3 } }),
    prisma.sessionLog.create({ data: { batchId: batches[1].id, trainerId: trainerUser.trainer!.id, date: '2024-02-08', topic: 'NumPy & Pandas', duration: 3 } })
  ]);

  const attendanceStatuses = ['PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'ABSENT'];
  for (const session of sessions) {
    const batchStudents = createdStudents.slice(0, 5);
    for (let i = 0; i < batchStudents.length; i++) {
      try {
        await prisma.attendance.create({
          data: { sessionId: session.id, studentId: batchStudents[i].id, status: attendanceStatuses[i] }
        });
      } catch (e) { /* skip duplicates */ }
    }
  }

  // Create assessments
  const assessment1 = await prisma.assessment.create({
    data: {
      title: 'HTML & CSS Mid Assessment',
      batchId: batches[0].id,
      type: 'MID',
      totalMarks: 100,
      passingMarks: 40,
      duration: 60,
      scheduledAt: '2024-03-15',
      status: 'COMPLETED',
      questions: {
        create: [
          { question: 'What does HTML stand for?', type: 'MCQ', options: JSON.stringify(['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'None']), correctAnswer: 'Hyper Text Markup Language', marks: 5 },
          { question: 'Which CSS property is used to change text color?', type: 'MCQ', options: JSON.stringify(['font-color', 'text-color', 'color', 'foreground-color']), correctAnswer: 'color', marks: 5 },
          { question: 'What is the correct HTML for creating a hyperlink?', type: 'MCQ', options: JSON.stringify(['<a href="url">link</a>', '<link href="url">link</link>', '<a>url</a>', '<hyperlink>url</hyperlink>']), correctAnswer: '<a href="url">link</a>', marks: 5 }
        ]
      }
    }
  });

  // Create results
  const resultData = [
    { studentId: createdStudents[0].id, assessmentId: assessment1.id, score: 85, totalMarks: 100, percentage: 85, isPassed: true, grade: 'A' },
    { studentId: createdStudents[1].id, assessmentId: assessment1.id, score: 72, totalMarks: 100, percentage: 72, isPassed: true, grade: 'B' },
    { studentId: createdStudents[2].id, assessmentId: assessment1.id, score: 38, totalMarks: 100, percentage: 38, isPassed: false, grade: 'F' }
  ];

  for (const r of resultData) {
    try {
      await prisma.result.create({ data: r });
    } catch (e) { /* skip duplicates */ }
  }

  // Create feedback
  const feedbackData = [
    { studentId: createdStudents[0].id, trainerId: trainerUser.trainer!.id, trainerRating: 5, contentRating: 4, infraRating: 4, overallRating: 4.3, comment: 'Excellent teaching methodology, very clear explanations', batchId: batches[0].id },
    { studentId: createdStudents[1].id, trainerId: trainerUser.trainer!.id, trainerRating: 4, contentRating: 5, infraRating: 3, overallRating: 4.0, comment: 'Good course content, lab could be improved', batchId: batches[0].id },
    { studentId: createdStudents[3].id, trainerId: trainerUser.trainer!.id, trainerRating: 5, contentRating: 5, infraRating: 5, overallRating: 5.0, comment: 'Best trainer I have had, very knowledgeable', batchId: batches[1].id },
    { studentId: createdStudents[4].id, trainerId: trainerUser.trainer!.id, trainerRating: 4, contentRating: 4, infraRating: 4, overallRating: 4.0, comment: 'Very helpful and supportive', batchId: batches[1].id }
  ];

  for (const f of feedbackData) {
    await prisma.feedback.create({ data: f });
  }

  // Create companies
  const companies = await Promise.all([
    prisma.company.create({ data: { name: 'Infosys Limited', industry: 'IT Services', hrName: 'Sanjay Mehta', hrEmail: 'hr@infosys.com', hrPhone: '8001234567', website: 'https://infosys.com', location: 'Bangalore' } }),
    prisma.company.create({ data: { name: 'Wipro Technologies', industry: 'IT Services', hrName: 'Anita Singh', hrEmail: 'hr@wipro.com', hrPhone: '8001234568', website: 'https://wipro.com', location: 'Bangalore' } }),
    prisma.company.create({ data: { name: 'TCS', industry: 'IT Services', hrName: 'Ramesh Kumar', hrEmail: 'hr@tcs.com', hrPhone: '8001234569', website: 'https://tcs.com', location: 'Mumbai' } }),
    prisma.company.create({ data: { name: 'HDFC Bank', industry: 'Banking & Finance', hrName: 'Preethi Nair', hrEmail: 'hr@hdfc.com', hrPhone: '8001234570', website: 'https://hdfc.com', location: 'Mumbai' } }),
    prisma.company.create({ data: { name: 'Amazon India', industry: 'E-Commerce', hrName: 'Vikram Shah', hrEmail: 'hr@amazon.in', hrPhone: '8001234571', website: 'https://amazon.in', location: 'Hyderabad' } })
  ]);

  // Create placements
  await Promise.all([
    prisma.placement.create({ data: { studentId: createdStudents[0].id, companyId: companies[0].id, type: 'PLACEMENT', role: 'Software Engineer', salary: 650000, startDate: '2024-08-01', status: 'ACCEPTED' } }),
    prisma.placement.create({ data: { studentId: createdStudents[1].id, companyId: companies[1].id, type: 'PLACEMENT', role: 'Full Stack Developer', salary: 700000, startDate: '2024-08-15', status: 'ACCEPTED' } }),
    prisma.placement.create({ data: { studentId: createdStudents[2].id, companyId: companies[2].id, type: 'INTERNSHIP', role: 'Software Intern', salary: 25000, startDate: '2024-07-01', status: 'ACCEPTED' } }),
    prisma.placement.create({ data: { studentId: createdStudents[3].id, companyId: companies[0].id, type: 'PLACEMENT', role: 'Data Analyst', salary: 800000, startDate: '2024-09-01', status: 'OFFERED' } }),
    prisma.placement.create({ data: { studentId: createdStudents[7].id, companyId: companies[3].id, type: 'PLACEMENT', role: 'Banking Associate', salary: 450000, startDate: '2024-08-01', status: 'ACCEPTED' } })
  ]);

  // Create materials
  await Promise.all([
    prisma.material.create({ data: { title: 'HTML & CSS Complete Guide', courseId: courses[0].id, type: 'PDF', url: '/uploads/html-css-guide.pdf', uploadedBy: trainerUser.id } }),
    prisma.material.create({ data: { title: 'JavaScript ES6 Presentation', courseId: courses[0].id, type: 'PPT', url: '/uploads/js-es6.pptx', uploadedBy: trainerUser.id } }),
    prisma.material.create({ data: { title: 'React Hooks Tutorial Video', courseId: courses[0].id, type: 'VIDEO', url: '/uploads/react-hooks.mp4', uploadedBy: trainerUser.id } }),
    prisma.material.create({ data: { title: 'Python Data Science Notebook', courseId: courses[1].id, type: 'PDF', url: '/uploads/python-ds.pdf', uploadedBy: trainerUser.id } })
  ]);

  // Create institution
  await prisma.institution.create({
    data: {
      name: 'National Skill Development Institute',
      code: 'NSDI-001',
      address: '45 Training Hub, Electronic City',
      state: 'Karnataka',
      district: 'Bangalore Urban',
      pincode: '560100',
      contactName: 'Dr. Rajesh Menon',
      contactEmail: 'contact@nsdi.edu.in',
      contactPhone: '8001234500',
      status: 'ACTIVE',
      mouStatus: 'SIGNED',
      nsdcCode: 'NSDC-KA-001'
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Dummy Login Credentials:');
  console.log('Admin:      admin@erp.com      / admin123');
  console.log('Coordinator: academic@erp.com  / password123');
  console.log('Trainer:    trainer@erp.com    / password123');
  console.log('Placement:  placement@erp.com  / password123');
  console.log('Student:    student@erp.com    / password123');
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
