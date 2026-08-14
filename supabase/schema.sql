create table if not exists public.registrations (
  id bigint generated always as identity primary key, code text not null unique,
  first_name text not null, last_name text not null, phone text not null, parent_phone text not null,
  school text not null, address text not null, level text not null, subjects jsonb not null default '[]'::jsonb,
  status text not null default 'En attente' check (status in ('En attente','Confirmée','Refusée')),
  created_at timestamptz not null default now()
);
alter table public.registrations enable row level security;
create policy "Public creates pre-registration" on public.registrations for insert to anon with check (true);
create policy "Authenticated manages registrations" on public.registrations for all to authenticated using (true) with check (true);
create table if not exists public.subject_catalogue (level text primary key, subjects jsonb not null default '[]'::jsonb, updated_at timestamptz not null default now());
alter table public.subject_catalogue enable row level security;
create policy "Public reads catalogue" on public.subject_catalogue for select to anon using (true);
create policy "Authenticated manages catalogue" on public.subject_catalogue for all to authenticated using (true) with check (true);
