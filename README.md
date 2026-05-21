# GigFlow — Smart Leads Dashboard

A full-stack **Lead Management Dashboard** built with the MERN stack and TypeScript.

![GigFlow](https://img.shields.io/badge/Stack-MERN-4f6ef7?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6?style=flat-square&logo=typescript) ![Docker](https://img.shields.io/badge/Docker-Ready-0db7ed?style=flat-square&logo=docker)

---

## Live
https://gigflow-smart-leads-dashboard-frontend.onrender.com

---

## Features

### Authentication & Authorization
- JWT-based authentication with `bcrypt` password hashing
- Role-Based Access Control: **Admin** and **Sales** roles
- Protected routes on both frontend and backend
- Secure auth middleware with token expiry

### Leads Management (CRUD)
- Create, view, update, and delete leads
- Fields: Name, Email, Status, Source, Notes
- Status flow: `New → Contacted → Qualified → Lost`
- Sources: Website, Instagram, Referral

### Advanced Filtering & Search
- **Debounced search** by name or email (400ms)
- Filter by **Status** and **Source** simultaneously
- Sort by **Latest** or **Oldest**
- All filters compose together

### Pagination
- Backend pagination with `skip` + `limit`
- 10 records per page (configurable)
- Pagination metadata in every API response

### Additional Features
- **CSV Export** — exports current filter state to CSV
- **Role-Based Access** — Sales users see only their leads; Admins see all
- **Dark Mode** — full dark mode support, persisted to localStorage
- **Docker Setup** — complete multi-container Docker Compose setup

---

## Tech Stack

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | Server framework |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database + ODM |
| JWT + bcryptjs | Auth + password hashing |
| express-validator | Request validation |
| helmet + cors | Security |
| fast-csv | CSV generation |

### Frontend
| Tech | Purpose |
|------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| TailwindCSS | Styling |
| React Query | Server state + caching |
| Zustand | Client state (auth) |
| React Hook Form + Zod | Forms + validation |
| React Router v6 | Routing |
| Lucide React | Icons |
| Axios | HTTP client |

---

## Project Structure

```
gigflow/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection, env config
│   │   ├── controllers/     # Route handlers (auth, leads)
│   │   ├── middlewares/     # Auth, error handling, validation
│   │   ├── models/          # Mongoose schemas (User, Lead)
│   │   ├── routes/          # Express routers
│   │   ├── types/           # TypeScript interfaces
│   │   ├── utils/           # Response helpers
│   │   └── index.ts         # App entry point
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/        # ProtectedRoute, PublicRoute
│   │   │   ├── layout/      # Sidebar, AppLayout
│   │   │   ├── leads/       # LeadModal, LeadRow, DeleteDialog
│   │   │   └── ui/          # Pagination, EmptyState
│   │   ├── hooks/           # useLeads, useDebounce, useDarkMode
│   │   ├── pages/           # LoginPage, RegisterPage, DashboardPage, LeadsPage
│   │   ├── services/        # API client, authService, leadService
│   │   ├── store/           # Zustand auth store
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Helpers, cn(), formatDate()
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- npm or yarn

### Option 1: Local Development

**1. Clone the repo**
```bash
git clone https://github.com/YOUR_USERNAME/gigflow.git
cd gigflow
```

**2. Backend setup**
```bash
cd backend
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET
npm install
npm run dev
```

**3. Frontend setup** (new terminal)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on http://localhost:3000
Backend runs on http://localhost:5000

### Option 2: Docker (Recommended)

```bash
# From project root
cp backend/.env.example backend/.env
docker-compose up --build
```

App is live at http://localhost:80

---

## API Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | — |
| POST | `/auth/login` | Login | — |
| GET | `/auth/me` | Get current user | ✅ |

**Register / Login Request Body:**
```json
{
  "name": "Jane Doe",        // register only
  "email": "jane@example.com",
  "password": "Secret@1234",
  "role": "sales"            // "admin" | "sales", register only
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": { "id": "...", "name": "Jane", "email": "...", "role": "sales" },
    "token": "eyJ..."
  }
}
```

### Leads

All leads endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description | Admin | Sales |
|--------|----------|-------------|-------|-------|
| GET | `/leads` | List leads (paginated) | All leads | Own leads |
| POST | `/leads` | Create lead | ✅ | ✅ |
| GET | `/leads/:id` | Get single lead | ✅ | Own only |
| PUT | `/leads/:id` | Update lead | ✅ | Own only |
| DELETE | `/leads/:id` | Delete lead | ✅ | Own only |
| GET | `/leads/stats` | Dashboard stats | ✅ | Own stats |
| GET | `/leads/export/csv` | Export CSV | ✅ | Own data |

**Query Parameters for GET /leads:**
```
?status=New|Contacted|Qualified|Lost
&source=Website|Instagram|Referral
&search=keyword
&sort=latest|oldest
&page=1
&limit=10
```

**Lead Object:**
```json
{
  "_id": "...",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "status": "Qualified",
  "source": "Instagram",
  "notes": "Interested in premium plan",
  "createdBy": { "_id": "...", "name": "Jane", "email": "jane@example.com" },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-16T08:00:00Z"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "message": "Leads fetched successfully.",
  "items": [...],
  "pagination": {
    "total": 47,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/gigflow
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Design Decisions

- **TypeScript everywhere** — strict mode, no `any`, all interfaces defined
- **React Query** for server state — automatic caching, refetching, and loading states
- **Zustand** for auth — lightweight, with localStorage persistence
- **Debounced search** — 400ms delay prevents excessive API calls
- **RBAC at API level** — never trust the client; permissions enforced in middleware
- **Centralized error handling** — single Express error middleware catches all errors
- **Compound filters** — all query params are composed into a single MongoDB query
- **Backend pagination** — `skip/limit` with count for metadata, never load all records

---

## Demo Accounts

Seed these manually or use the register form:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gigflow.com | Admin@1234 |
| Sales | sales@gigflow.com | Sales@1234 |

---

## License

MIT
