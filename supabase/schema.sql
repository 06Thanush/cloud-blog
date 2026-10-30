-- ==============================================================================
-- CLOUD-BASED BLOG PLATFORM - COMPLETE SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Includes:
-- 1. Tables: profiles, posts, comments, post_likes
-- 2. Foreign keys with CASCADE deletes & UUID primary keys
-- 3. Automatic profile generation on auth.users signup
-- 4. Automatic likes_count synchronization
-- 5. Full Row Level Security (RLS) policies
-- 6. Storage bucket setup ('blog-images') with upload policies
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  website text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 2. POSTS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  featured_image text,
  category text default 'Technology' not null,
  tags text[] default array[]::text[],
  status text default 'draft' check (status in ('draft', 'published')) not null,
  author_id uuid not null references public.profiles(id) on delete cascade,
  reading_time integer default 1,
  likes_count integer default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  published_at timestamptz
);

-- Indexes for fast lookup & filtering
create index if not exists posts_slug_idx on public.posts (slug);
create index if not exists posts_category_idx on public.posts (category);
create index if not exists posts_status_idx on public.posts (status);
create index if not exists posts_author_id_idx on public.posts (author_id);
create index if not exists posts_published_at_idx on public.posts (published_at desc);

-- Enable RLS for posts
alter table public.posts enable row level security;

-- Posts Policies:
-- 1. Public can read published posts
create policy "Anyone can read published posts"
  on public.posts for select
  using (status = 'published');

-- 2. Authors can read all their own posts (both draft & published)
create policy "Authors can view all their own posts"
  on public.posts for select
  using (auth.uid() = author_id);

-- 3. Authors can insert posts
create policy "Authenticated users can create posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

-- 4. Authors can update their own posts
create policy "Authors can update their own posts"
  on public.posts for update
  using (auth.uid() = author_id);

-- 5. Authors can delete their own posts
create policy "Authors can delete their own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- ------------------------------------------------------------------------------
-- 3. COMMENTS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for comments
create index if not exists comments_post_id_idx on public.comments (post_id);
create index if not exists comments_user_id_idx on public.comments (user_id);

-- Enable RLS for comments
alter table public.comments enable row level security;

-- Comments Policies:
-- 1. Public can view comments on published posts
create policy "Comments on published posts are viewable by everyone"
  on public.comments for select
  using (
    exists (
      select 1 from public.posts
      where posts.id = comments.post_id
      and (posts.status = 'published' or posts.author_id = auth.uid())
    )
  );

-- 2. Authenticated users can insert comments
create policy "Authenticated users can create comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

-- 3. Comment owners can update their comment
create policy "Users can update their own comments"
  on public.comments for update
  using (auth.uid() = user_id);

-- 4. Comment owners or Post authors can delete comments
create policy "Users can delete their own comments"
  on public.comments for delete
  using (
    auth.uid() = user_id or
    exists (
      select 1 from public.posts
      where posts.id = comments.post_id
      and posts.author_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 4. POST LIKES TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.post_likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (post_id, user_id)
);

create index if not exists post_likes_post_id_idx on public.post_likes (post_id);
create index if not exists post_likes_user_id_idx on public.post_likes (user_id);

-- Enable RLS for post_likes
alter table public.post_likes enable row level security;

-- Likes Policies:
create policy "Likes are viewable by everyone"
  on public.post_likes for select
  using (true);

create policy "Authenticated users can like posts"
  on public.post_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own like"
  on public.post_likes for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. TRIGGERS AND STORED FUNCTIONS
-- ------------------------------------------------------------------------------

-- A. Auto-create Profile when a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
declare
  raw_username text;
  clean_username text;
begin
  raw_username := split_part(new.email, '@', 1);
  -- Ensure username is safe and lowercase
  clean_username := regexp_replace(lower(raw_username), '[^a-z0-9_]', '', 'g');
  
  if clean_username is null or clean_username = '' then
    clean_username := 'user_' || substr(new.id::text, 1, 8);
  end if;

  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    clean_username || '_' || substr(new.id::text, 1, 4),
    coalesce(new.raw_user_meta_data->>'full_name', clean_username),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://avatar.vercel.sh/' || clean_username)
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- B. Auto-update posts.likes_count when likes are inserted or deleted
create or replace function public.update_post_likes_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.posts
    set likes_count = likes_count + 1
    where id = new.post_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.posts
    set likes_count = greatest(0, likes_count - 1)
    where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_post_like_added on public.post_likes;
create trigger on_post_like_added
  after insert or delete on public.post_likes
  for each row execute function public.update_post_likes_count();

-- C. Auto-update updated_at timestamp trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
  before update on public.posts
  for each row execute function public.handle_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 6. STORAGE BUCKET CONFIGURATION ('blog-images')
-- ------------------------------------------------------------------------------
-- Insert bucket if not present
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = true;

-- Storage Policies:
-- 1. Anyone can view images
create policy "Public images are viewable by everyone"
  on storage.objects for select
  using (bucket_id = 'blog-images');

-- 2. Authenticated users can upload images
create policy "Authenticated users can upload blog images"
  on storage.objects for insert
  with check (bucket_id = 'blog-images' and auth.role() = 'authenticated');

-- 3. Users can update their images
create policy "Users can update their blog images"
  on storage.objects for update
  using (bucket_id = 'blog-images' and auth.uid() = owner);

-- 4. Users can delete their images
create policy "Users can delete their blog images"
  on storage.objects for delete
  using (bucket_id = 'blog-images' and auth.uid() = owner);
