# TaskFlow - Complete Task Management Application

## Overview
TaskFlow is a modern, fully-featured task management application built with Next.js, Supabase, and Drizzle ORM. It follows **Atomic Design Methodology** and implements core engineering principles (DRY, KISS, YAGNI).

---

## ✅ Core Features Implemented

### 1. **Authentication**
- ✅ Sign up with email/password
- ✅ Login with email/password
- ✅ Logout functionality
- ✅ Secure session management with Supabase
- ✅ Auth redirects (login → dashboard → home)

### 2. **Task Management**
- ✅ **Create Tasks**: Form with title, description, priority, status, due date
- ✅ **Read Tasks**: Display all user tasks in a kanban-style board
- ✅ **Update Tasks**: Edit task details including status changes
- ✅ **Delete Tasks**: Remove tasks with confirmation
- ✅ **Status Management**: Drag/click to change status (To Do → In Progress → Done)

### 3. **Dashboard & Overview**
- ✅ **Task Statistics**: 
  - Total tasks count
  - Tasks by status (To Do, In Progress, Done)
  - Overdue tasks highlighted in red
- ✅ **Kanban Board**: Three-column layout showing tasks by status
- ✅ **Task Cards**: Display title, description, priority badge, due date
- ✅ **Overdue Highlighting**: 🔴 Red indicator for overdue tasks

### 4. **API Layer**
- ✅ All data operations through Next.js API routes
- ✅ **GET /api/tasks** - Fetch user's tasks
- ✅ **POST /api/tasks** - Create new task
- ✅ **PATCH /api/tasks/[id]** - Update task
- ✅ **DELETE /api/tasks/[id]** - Delete task
- ✅ No direct database calls from UI components (proper separation)

### 5. **Database**
- ✅ **PostgreSQL** via Supabase
- ✅ **Drizzle ORM** for type-safe queries
- ✅ Two main tables with relationships:
  - `users` - User accounts with email
  - `tasks` - User tasks with full details
- ✅ **Foreign Key** relationship with cascade delete
- ✅ **Enums** for priority and status values
- ✅ Timestamps for created/updated tracking

### 6. **Responsive Design**
- ✅ **Desktop** (1280px+): Full 3-column kanban board
- ✅ **Mobile** (375px): Responsive grid layout
- ✅ **Mobile Navigation**: Hamburger menu support
- ✅ **Touch-friendly**: Buttons and inputs work on mobile
- ✅ **Dark Mode Support**: Built-in with Tailwind

---

## 🏗️ Atomic Design Architecture

### **Atoms** (Smallest Reusable Units)
Located in `components/atoms/`:
- `badge.tsx` - Styled badges for status/priority
- `label.tsx` - Form labels
- `input.tsx` - Text input fields
- `avatar.tsx` - User avatar component
- `heading.tsx` - Heading hierarchy (h1-h4)
- `text.tsx` - Paragraph/text component

### **Molecules** (Atom Combinations)
Located in `components/molecules/`:
- `priority-badge.tsx` - Priority display (LOW/MEDIUM/HIGH)
- `status-badge.tsx` - Status display (TODO/IN_PROGRESS/DONE)
- `task-card.tsx` - Complete task card with actions
- `form-field.tsx` - Label + Input wrapper with errors
- `user-avatar.tsx` - User avatar with fallback

### **Organisms** (Complex Sections)
Located in `components/organisms/`:
- `task-board.tsx` - Kanban board with all three columns
- `task-form.tsx` - Create/edit task form with validation
- `dashboard-stats.tsx` - Statistics cards display
- `navbar.tsx` - Top navigation with user menu

### **Templates** (Page Layout Wrappers)
Located in `components/templates/`:
- `dashboard-layout.tsx` - Dashboard page wrapper with navbar
- `auth-layout.tsx` - Authentication pages wrapper

### **Pages** (Next.js Pages)
- `app/page.tsx` - Home (redirects based on auth)
- `app/login/page.tsx` - Login page
- `app/signup/page.tsx` - Sign up page
- `app/dashboard/page.tsx` - Main dashboard

---

## 🛠️ Technology Stack

```
Frontend:
├── Next.js 16.2.6 (App Router)
├── React 19.2.4
├── TypeScript 5
├── Tailwind CSS 4
├── Shadcn/ui (Button, Card, Dialog, Select, Dropdown)
├── Radix UI (accessible components)
└── Lucide React (icons)

Backend & Database:
├── Next.js API Routes
├── Supabase (PostgreSQL)
├── Drizzle ORM 0.45.2
├── Drizzle-kit (migrations)
└── Postgres.js (driver)

Auth:
├── Supabase Auth
└── Supabase SSR (server-side sessions)
```

---

## 📁 Project Structure

```
task-tracker/
├── app/
│   ├── page.tsx                    # Home redirect
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── dashboard/
│   │   └── page.tsx                # Main dashboard
│   ├── login/
│   │   └── page.tsx                # Login page
│   ├── signup/
│   │   └── page.tsx                # Signup page
│   └── api/
│       └── tasks/
│           ├── route.ts            # GET/POST tasks
│           └── [id]/
│               └── route.ts        # PATCH/DELETE task
│
├── components/
│   ├── atoms/                      # Smallest UI units
│   ├── molecules/                  # Atom combinations
│   ├── organisms/                  # Complex sections
│   ├── templates/                  # Page layouts
│   └── ui/                         # Shadcn components
│
├── database/
│   ├── schema.ts                   # Drizzle schema (users, tasks)
│   ├── relations.ts                # Drizzle relationships
│   └── migrations/                 # Migration files
│
├── lib/
│   ├── db.ts                       # Drizzle instance
│   ├── utils.ts                    # Utilities (cn, etc)
│   ├── actions/
│   │   ├── auth.ts                 # Auth helpers
│   │   └── tasks.ts                # Task operations
│   └── supabase/
│       ├── client.ts               # Browser client
│       ├── server.ts               # Server client
│       └── config.ts               # Configuration
│
├── public/                         # Static assets
├── next.config.ts                  # Next.js config
├── tsconfig.json                   # TypeScript config
├── tailwind.config.ts              # Tailwind config
└── drizzle.config.ts               # Drizzle config
```

---

## 🎨 Design Principles Applied

### **DRY (Don't Repeat Yourself)**
- Reusable component hierarchy (atoms → molecules → organisms)
- Shared styling with CVA (class-variance-authority)
- Centralized API layer with action functions
- No duplicate logic

### **KISS (Keep It Simple, Stupid)**
- Straightforward component props and interfaces
- Clear separation of concerns (UI vs logic)
- Minimal dependencies
- Simple naming conventions

### **YAGNI (You Aren't Gonna Need It)**
- No unnecessary features beyond requirements
- No premature optimization
- Only implemented what was asked
- Avoided over-engineering

---

## 🔑 Key Components & Features

### **Smart Task Card**
```tsx
- Displays title, description, priority badge
- Shows due date with overdue indicator
- Quick status change buttons
- Edit and delete actions
- Color-coded badges for priority/status
```

### **Task Form**
```tsx
- Create and edit mode (same form)
- Form validation with error display
- Priority and status selectors
- Due date picker
- Loading states
```

### **Dashboard Stats**
```tsx
- Total task count
- Tasks per status
- Overdue task highlighting
- Real-time calculation
```

### **Kanban Board**
```tsx
- Three-column layout (To Do, In Progress, Done)
- Task count per column
- Responsive grid (1 column mobile → 3 columns desktop)
- Empty state messages
```

---

## 🚀 Running the Application

### **Prerequisites**
```bash
# Ensure you have:
- Node.js 18+
- npm or yarn
- Supabase account with credentials in .env.local
```

### **Setup**
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
# DATABASE_URL=...

# Generate database migrations
npm run db:generate

# Run migrations
npm run db:migrate
```

### **Development**
```bash
npm run dev
# Open http://localhost:3000
```

### **Production Build**
```bash
npm run build
npm start
```

---

## 📊 Database Schema

### **Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIMEZONE DEFAULT NOW()
);
```

### **Tasks Table**
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority task_priority DEFAULT 'MEDIUM',
  status task_status DEFAULT 'TODO',
  due_date TIMESTAMP WITH TIMEZONE,
  created_at TIMESTAMP WITH TIMEZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIMEZONE DEFAULT NOW()
);

-- Enums
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
```

---

## 🔐 Security Features

- ✅ Supabase authentication (secure)
- ✅ Row-level security (user isolation)
- ✅ Server-side session management
- ✅ API validation
- ✅ No direct database access from client
- ✅ Secure password hashing (Supabase)

---

## 📝 API Endpoints

### **GET /api/tasks**
Fetch all tasks for the authenticated user
```json
Response: Task[]
```

### **POST /api/tasks**
Create a new task
```json
Request: {
  title: string (required),
  description: string,
  priority: 'LOW' | 'MEDIUM' | 'HIGH',
  status: 'TODO' | 'IN_PROGRESS' | 'DONE',
  dueDate: string (ISO format)
}
Response: Task
```

### **PATCH /api/tasks/[id]**
Update a task
```json
Request: Partial<Task>
Response: Task
```

### **DELETE /api/tasks/[id]**
Delete a task
```json
Response: Task (deleted)
```

---

## 🎯 Atomic Design Methodology Benefits

1. **Reusability**: Components work at multiple levels
2. **Maintainability**: Easy to locate and modify components
3. **Scalability**: Simple to add new features
4. **Consistency**: Unified design system
5. **Testing**: Components can be tested in isolation

---

## ✨ Quality Assurance

- ✅ TypeScript strict mode
- ✅ Next.js build verification
- ✅ No console errors
- ✅ Responsive design tested
- ✅ API error handling
- ✅ Form validation

---

## 🚀 Production Ready

This application is ready for production deployment with:
- ✅ Optimized build
- ✅ Type safety
- ✅ Security best practices
- ✅ Performance optimization
- ✅ Error handling
- ✅ Responsive design

---

## 📞 Support & Documentation

For more information about technologies used:
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com)
