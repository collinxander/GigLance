-- Add social_links to profiles
alter table public.profiles
add column if not exists social_links jsonb default '{
  "github": null,
  "linkedin": null,
  "twitter": null,
  "website": null
}';

-- Create portfolio_projects table
create table if not exists public.portfolio_projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  image_url text,
  project_url text,
  technologies text[] default '{}',
  featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.portfolio_projects enable row level security;

-- Create policies
create policy "Public projects are viewable by everyone"
  on public.portfolio_projects for select
  using (exists (
    select 1 from public.profiles
    where profiles.id = portfolio_projects.user_id
    and profiles.visibility = 'public'
  ));

create policy "Users can view their own projects"
  on public.portfolio_projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own projects"
  on public.portfolio_projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.portfolio_projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.portfolio_projects for delete
  using (auth.uid() = user_id);

-- Create function to update updated_at timestamp
create or replace function public.handle_project_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for updated_at
create trigger on_project_updated
  before update on public.portfolio_projects
  for each row execute procedure public.handle_project_updated_at(); 