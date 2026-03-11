# Skill Training ERP Platform
### NSDC Integrated Academic Management System

A comprehensive web-based ERP platform for managing the complete lifecycle of a skill training institute, aligned with the NSDC framework.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### 1. Install Dependencies
```bash
# Install all (from root)
cd backend && npm install
cd ../frontend && npm install
```

### 2. Start Backend
```bash
cd backend
npm run dev
# Runs on http://localhost:5001
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

### 4. Seed Database (first time only)
```bash
cd backend
npm run seed
```

---

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@erp.com | admin123 |
| Academic Coordinator | academic@erp.com | password123 |
| Trainer | trainer@erp.com | password123 |
| Placement Coordinator | placement@erp.com | password123 |
| Student | student@erp.com | password123 |

---

## 🏗️ Architecture

```
webbased-erp/
├── backend/              # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── index.ts      # Express server entry point
│   │   ├── routes/       # API route handlers
│   │   ├── middleware/   # Auth, RBAC middleware
│   │   ├── lib/          # Prisma client
│   │   └── utils/        # Seed data
│   ├── prisma/
│   │   └── schema.prisma # Database schema (SQLite dev)
│   └── .env              # Backend environment variables
│
├── frontend/             # Next.js 14 + TypeScript + TailwindCSS
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   ├── components/   # Reusable UI components
│   │   ├── lib/          # API client (Axios)
│   │   ├── store/        # Zustand state management
│   │   └── types/        # TypeScript types
│   └── .env.local        # Frontend environment variables
└── package.json          # Root workspace config
```

---

## 📋 Core Modules

1. **Student Management** - Full student lifecycle management
2. **Academic & Training Management** - Course, batch, curriculum planning
3. **Trainer/Faculty Management** - Onboarding, profiles, KPIs
4. **Attendance Management** - Session tracking, analytics
5. **Assessment & Examination** - MCQ, subjective, result management
6. **Feedback System** - Student & trainer ratings
7. **Placement Management** - Companies, offers, internships
8. **Document Management** - Centralized file repository
9. **Reports & Analytics** - NSDC compliance, KPI dashboards
10. **Admin Settings** - User management, system config

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| GET | /api/students | List students |
| POST | /api/students | Create student |
| GET | /api/trainers | List trainers |
| GET | /api/courses | List courses |
| GET | /api/batches | List batches |
| GET | /api/attendance | Attendance records |
| GET | /api/assessments | List assessments |
| GET | /api/feedback | Feedback data |
| GET | /api/placements | Placement records |
| GET | /api/dashboard/stats | Dashboard KPIs |
| GET | /api/reports/* | Various reports |

---

## ⚡ Performance Features

- **Rate Limiting**: 1000 req/15min per IP (configurable)
- **Response Compression**: gzip compression enabled
- **API Caching**: Node-cache with 60s TTL for dashboard stats
- **Database**: Prisma ORM with connection pooling
- **Security**: Helmet.js headers, JWT auth, RBAC
- **Scalability**: Ready to switch from SQLite → PostgreSQL for production

---

## 🔧 Environment Variables

### Backend (.env)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="skill_erp_super_secret..."
PORT=5001
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_APP_NAME="Skill Training ERP"
```

---

## 🗄️ Database

Uses **SQLite** for local development (zero config!).
Switch to **PostgreSQL** for production by updating `DATABASE_URL` in backend `.env`.

```bash
# Run migrations for production
cd backend
npx prisma migrate dev
```
