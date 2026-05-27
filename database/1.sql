-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Enum types for better data integrity
create type task_priority as enum ('LOW', 'MEDIUM', 'HIGH');
create type task_status as enum ('TODO', 'IN_PROGRESS', 'DONE');

-- Tasks table
create table public.tasks (
    id uuid primary key default uuid_generate_v4(),

    -- relation to Supabase Auth user
    user_id uuid not null references auth.users(id) on delete cascade,

    title text not null,
    description text,

    priority task_priority not null default 'MEDIUM',
    status task_status not null default 'TODO',

    due_date timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);