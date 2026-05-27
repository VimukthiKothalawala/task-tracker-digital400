# TaskFlow - Modern Task Management Application

A production-ready task management application built with **Next.js 16**, **React 19**, **Supabase**, and **Drizzle ORM**. Features a clean Atomic Design architecture, full authentication, real-time task management, and a responsive kanban-style dashboard.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61dafb)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38b2ac)](https://tailwindcss.com/)

---

## ✨ Features

### 🔐 Authentication
- Sign up and login with email/password
- Secure session management via Supabase
- Protected routes and redirects
- User account management

### 📋 Task Management
- **Create** tasks with title, description, priority, status, and due dates
- **Read** all user tasks in an organized kanban board
- **Update** task details and status in real-time
- **Delete** tasks with confirmation
- **Filter & Sort** by status and priority

### 📊 Dashboard
- Real-time task statistics (total, by status, overdue count)
- Three-column kanban board (To Do, In Progress, Done)
- Overdue task highlighting in red
- Task cards with priority badges and due dates
- Responsive design for desktop and mobile

### 🛠️ Developer Experience
- **Type-safe** throughout with TypeScript
- **Atomic Design** architecture for maintainable components
- **Next.js API routes** for clean separation of concerns
- **Drizzle ORM** for type-safe database queries
- **ESLint & Prettier** for code quality

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account ([create one here](https://app.supabase.com))

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd task-tracker
npm install
```

### 2. Configure Supabase

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_public_key
DATABASE_URL=postgresql://postgres:password@aws-0-region.pooler.supabase.com:6543/postgres
```

**How to get these values:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project → Settings → API
3. Copy `Project URL` and `anon public key`
4. For `DATABASE_URL`, use the connection string from Settings → Database

### 3. Set Up the Database

```bash
# Generate database migrations
npm run db:generate

# Apply migrations to create tables
npm run db:migrate
```

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be redirected to the login page.

---

## 📁 Project Structure

```
task-tracker/
│
├── app/                                # Next.js App Router
│   ├── page.tsx                        # Home page (auth redirect)
│   ├── layout.tsx                      # Root layout
│   ├── globals.css                     # Global styles
│   ├── login/page.tsx                  # Login page
│   ├── signup/page.tsx                 # Sign up page
│   ├── dashboard/page.tsx              # Main dashboard
│   └── api/tasks/
│       ├── route.ts                    # GET tasks, POST create task
│       └── [id]/route.ts               # PATCH update, DELETE task
│
├── components/                         # Atomic Design Components
│   ├── atoms/                          # Single-purpose UI components
│   │   ├── badge.tsx                   # Badge display
│   │   ├── input.tsx                   # Text input
│   │   ├── label.tsx                   # Form label
│   │   ├── avatar.tsx                  # User avatar
│   │   ├── heading.tsx                 # Heading hierarchy
│   │   └── text.tsx                    # Paragraph/text
│   │
│   ├── molecules/                      # Combinations of atoms
│   │   ├── form-field.tsx              # Label + Input wrapper
│   │   ├── priority-badge.tsx          # Priority display
│   │   ├── status-badge.tsx            # Status display
│   │   ├── task-card.tsx               # Complete task card
│   │   └── user-avatar.tsx             # User avatar with fallback
│   │
│   ├── organisms/                      # Complex UI sections
│   │   ├── navbar.tsx                  # Top navigation
│   │   ├── task-board.tsx              # Kanban board
│   │   ├── task-form.tsx               # Task creation/edit form
│   │   └── dashboard-stats.tsx         # Statistics display
│   │
│   ├── templates/                      # Page layout templates
│   │   ├── dashboard-layout.tsx        # Dashboard wrapper
│   │   └── auth-layout.tsx             # Auth pages wrapper
│   │
│   └── ui/                             # Shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       └── select.tsx
│
├── database/                           # Database schema & migrations
│   ├── schema.ts                       # Drizzle ORM table definitions
│   ├── relations.ts                    # Table relationships
│   └── migrations/                     # Generated SQL migrations
│
├── lib/                                # Utilities & business logic
│   ├── db.ts                           # Drizzle database instance
│   ├── utils.ts                        # Helper functions
│   ├── actions/
│   │   ├── auth.ts                     # Authentication logic
│   │   └── tasks.ts                    # Task CRUD operations
│   └── supabase/
│       ├── client.ts                   # Client-side Supabase
│       ├── server.ts                   # Server-side Supabase
│       └── config.ts                   # Supabase configuration
│
├── public/                             # Static assets
│
├── package.json                        # Dependencies & scripts
├── tsconfig.json                       # TypeScript configuration
├── next.config.ts                      # Next.js configuration
├── tailwind.config.ts                  # Tailwind CSS configuration
├── components.json                     # Shadcn/ui configuration
└── drizzle.config.ts                   # Drizzle ORM configuration
```

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint to check code quality |
| `npm run db:generate` | Generate database migrations |
| `npm run db:migrate` | Apply migrations to database |
| `npm run db:studio` | Open Drizzle Studio to manage DB visually |

---

## 🏗️ Technology Stack

### Frontend
- **Next.js 16.2.6** - React framework with App Router
- **React 19.2.4** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS
- **Shadcn/ui** - High-quality component library
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### Backend & Database
- **Next.js API Routes** - Serverless backend
- **Supabase** - PostgreSQL database & authentication
- **Drizzle ORM 0.45.2** - Type-safe database queries
- **Drizzle-kit** - Schema migrations and management
- **Postgres.js** - PostgreSQL driver

### Developer Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TSX** - TypeScript executor for scripts

---

## 🔄 API Endpoints

### Tasks API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | Fetch all user tasks |
| `POST` | `/api/tasks` | Create a new task |
| `PATCH` | `/api/tasks/[id]` | Update a specific task |
| `DELETE` | `/api/tasks/[id]` | Delete a specific task |

### Request/Response Examples

**Create Task (POST /api/tasks)**
```json
{
  "title": "Fix bug in dashboard",
  "description": "The stats component is showing incorrect counts",
  "priority": "HIGH",
  "status": "TODO",
  "dueDate": "2025-06-15"
}
```

**Update Task (PATCH /api/tasks/[id])**
```json
{
  "status": "IN_PROGRESS",
  "priority": "MEDIUM"
}
```

---

## 📊 Database Schema

### Users Table
```sql
users (
  id: UUID,
  email: string (unique),
  created_at: timestamp
)
```

### Tasks Table
```sql
tasks (
  id: UUID,
  user_id: UUID (foreign key),
  title: string,
  description: string (optional),
  priority: enum (LOW, MEDIUM, HIGH),
  status: enum (TODO, IN_PROGRESS, DONE),
  due_date: date (optional),
  created_at: timestamp,
  updated_at: timestamp
)
```

---

## 🎨 Design System

### Component Architecture (Atomic Design)
- **Atoms**: Small, reusable components (Badge, Button, Input, Label)
- **Molecules**: Combinations of atoms (FormField, TaskCard, PriorityBadge)
- **Organisms**: Complex sections (TaskBoard, TaskForm, Navbar)
- **Templates**: Page layouts (DashboardLayout, AuthLayout)
- **Pages**: Full pages using templates

### Styling
- **Tailwind CSS** for utility-first styling
- **CSS-in-JS** via Tailwind for dynamic values
- **Dark mode support** built-in
- **Responsive breakpoints**: Mobile-first approach

---

## 🔒 Authentication Flow

1. User lands on home page (`/`)
2. Redirected to login if not authenticated
3. User signs up or logs in
4. Session stored securely with Supabase SSR
5. Redirected to dashboard on success
6. All API routes verify user context before returning data

---

## 🚀 Deployment

### Deploy on Vercel (Recommended)

```bash
# Push to GitHub
git push origin main

# Connect repository to Vercel
# Go to vercel.com and import your repository
```

Vercel will automatically:
- Install dependencies
- Run build
- Deploy on every push to main

### Environment Variables for Production
Add to Vercel project settings:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
DATABASE_URL
```

### Alternative: Docker Deployment

```bash
docker build -t task-tracker .
docker run -p 3000:3000 task-tracker
```

---

## 📝 Development Guidelines

### Code Quality
- Run `npm run lint` before committing
- Use TypeScript strict mode
- Write meaningful commit messages
- Follow Atomic Design principles

### Adding New Features

1. **Database changes**: Update `database/schema.ts` → Run `npm run db:generate` → Apply migrations
2. **New components**: Create in appropriate folder (atoms/molecules/organisms)
3. **New API routes**: Add to `app/api/` folder with proper type safety
4. **Business logic**: Add to `lib/actions/` for reusability

### Component Template

```typescript
import { PropsWithChildren } from 'react';

interface MyComponentProps {
  title: string;
  // ... other props
}

export function MyComponent({ title }: MyComponentProps) {
  return <div>{title}</div>;
}
```

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Supabase Guide](https://supabase.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Atomic Design Methodology](https://bradfrost.com/blog/post/atomic-web-design/)

---

## 📄 License

This project is private and for internal use.

---

## 🤝 Support

For questions or issues, please contact the development team or open an issue in the repository.
