-- Create saved_gigs table
create table if not exists public.saved_gigs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  gig_id uuid references public.gigs(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, gig_id)
);

-- Enable RLS
alter table public.saved_gigs enable row level security;

-- Create policies
create policy "Users can view their own saved gigs"
  on public.saved_gigs for select
  using (auth.uid() = user_id);

create policy "Users can save gigs"
  on public.saved_gigs for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave gigs"
  on public.saved_gigs for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index saved_gigs_user_id_idx on public.saved_gigs(user_id);
create index saved_gigs_gig_id_idx on public.saved_gigs(gig_id); 