export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'COORDINATOR' | 'TRAINER' | 'PLACEMENT_COORDINATOR' | 'STUDENT';
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  student?: Student;
  trainer?: Trainer;
}

export interface Student {
  id: string;
  userId: string;
  studentCode: string;
  dob?: string;
  gender?: string;
  mobile?: string;
  address?: string;
  aadhaarNumber?: string;
  qualification?: string;
  skills?: string;
  status: string;
  user: { name: string; email: string; avatar?: string };
  enrollments?: Enrollment[];
  attendancePercentage?: number;
  _count?: { attendances: number; results: number; placements: number; enrollments: number };
  createdAt: string;
}

export interface Trainer {
  id: string;
  userId: string;
  trainerCode: string;
  qualification?: string;
  experience?: number;
  domain?: string;
  certifications?: string;
  skills?: string;
  status: string;
  user: { name: string; email: string; avatar?: string };
  batches?: Batch[];
  avgRating?: number;
  _count?: { batches: number; sessionLogs: number; feedbacks: number };
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  duration: number;
  modules?: string;
  certType?: string;
  sector?: string;
  nsdcCode?: string;
  isActive: boolean;
  _count?: { batches: number; materials: number };
  createdAt: string;
}

export interface Batch {
  id: string;
  name: string;
  courseId: string;
  course: { name: string; code: string; duration?: number };
  trainerId?: string;
  trainer?: { user: { name: string; email: string } };
  startDate: string;
  endDate: string;
  status: string;
  maxStudents: number;
  venue?: string;
  nsdcBatchId?: string;
  _count?: { enrollments: number; sessions: number; assessments: number };
  createdAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  batchId: string;
  batch: Batch;
  status: string;
  enrolledAt: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  student: { user: { name: string; email: string } };
  sessionId: string;
  session: { date: string; topic: string; batch: { name: string } };
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  createdAt: string;
}

export interface Assessment {
  id: string;
  title: string;
  batchId: string;
  batch: { name: string; course: { name: string } };
  type: 'MID' | 'FINAL' | 'PRACTICE';
  totalMarks: number;
  passingMarks: number;
  duration: number;
  status: string;
  scheduledAt: string;
  _count?: { questions: number; results: number };
  questions?: Question[];
  results?: Result[];
}

export interface Question {
  id: string;
  assessmentId: string;
  question: string;
  type: 'MCQ' | 'SUBJECTIVE' | 'PRACTICAL';
  options?: string;
  correctAnswer: string;
  marks: number;
}

export interface Result {
  id: string;
  studentId: string;
  student: { user: { name: string; email: string } };
  assessmentId: string;
  assessment: { title: string; type: string; totalMarks: number };
  score: number;
  totalMarks: number;
  percentage: number;
  isPassed: boolean;
  grade?: string;
  submittedAt: string;
}

export interface Feedback {
  id: string;
  studentId: string;
  student: { user: { name: string } };
  trainerId: string;
  trainer: { user: { name: string } };
  trainerRating: number;
  contentRating: number;
  infraRating: number;
  overallRating: number;
  comment?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  hrName?: string;
  hrEmail?: string;
  hrPhone?: string;
  website?: string;
  location?: string;
  isActive: boolean;
  _count?: { placements: number };
}

export interface Placement {
  id: string;
  studentId: string;
  student: { user: { name: string; email: string } };
  companyId: string;
  company: { name: string; industry: string };
  type: 'INTERNSHIP' | 'PLACEMENT';
  role: string;
  salary?: number;
  startDate?: string;
  status: string;
  feedback?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  size?: number;
  mimeType?: string;
  studentId?: string;
  student?: { user: { name: string } };
  uploadedBy: string;
  category: string;
  isVerified: boolean;
  createdAt: string;
}

export interface DashboardStats {
  overview: {
    totalStudents: number;
    totalTrainers: number;
    totalCourses: number;
    totalBatches: number;
    activeBatches: number;
    totalPlacements: number;
    totalEnrollments: number;
    totalAssessments: number;
    avgAttendance: number;
    avgFeedbackRating: number;
  };
  recentStudents: any[];
  batchStatusDistribution: any[];
  placementTypeDistribution: any[];
  monthlyTrend: { month: string; students: number; placements: number; completions: number }[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
