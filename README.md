# MONOLITH — Cloud-Based Editorial Blog Platform

A modern, production-grade cloud blogging and publishing platform engineered with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL, Auth, Storage, Row Level Security)**. Built for developers, architects, and technical publications.

---

## 🌟 Key Features

### 1. User Authentication (Supabase Auth)
- **Email & Password Authentication**: Full sign up, email validation, and sign in flows.
- **Automated Profile Creation**: Database trigger (`handle_new_user`) initializes a linked record in `public.profiles` on user signup.
- **Author Dashboard Route Protection**: Middleware and server-side session checks ensure `/dashboard/*` is accessible only to authenticated users.
- **Author Profile Management**: Edit display name, unique handle/username, bio, website link, and avatar.

### 2. Blog Creation & Publishing Studio
- **Rich Markdown Editor**: Write with toolbar controls (headings, quotes, bold, code snippets, lists, links), live preview mode, and split-screen mode.
- **Supabase Storage Image Upload**: Direct upload of featured images into the `blog-images` storage bucket, with auto-generated public URLs and file size limits (5MB).
- **Drafts & Instant Publishing**: Save works in progress as `draft` or toggle directly to `published`.
- **Dynamic Slug Generation**: Automatically generates URL-safe slugs from titles, with custom editing and duplicate prevention.
- **Categorization & Tagging**: Organize articles with primary categories (*Technology, Cloud, Architecture, AI, DevOps*) and dynamic hashtag chips.
- **Estimated Reading Time**: Dynamic calculation based on article word count.

### 3. Editorial Blog Reader Experience
- **Editorial Design Language**: Crisp black and white typography, clean serif headings (`font-serif`), high readability, and fluid transitions.
- **Dark & Light Themes**: Seamless theme switching with `next-themes` and zero layout shift.
- **Live Search & Category Filtering**: Fast client-side filtering by keywords, categories, and tags.
- **Hero Featured Article**: Automatic highlight for the top editorial piece.
- **Related Articles**: Recommendations based on shared category.

### 4. Community & Interaction
- **Discussion System**: Authenticated readers can post comments; authors can delete their own comments. Non-logged-in readers are provided with an inline sign-in prompt.
- **Claps / Like System**: Interactive like counter backed by the `post_likes` table with triggers to prevent duplicate likes and keep `posts.likes_count` synchronized.
- **Social Sharing**: One-click sharing to Twitter / X, LinkedIn, and clipboard URL copying with visual feedback.
- **Author Bio Card**: Displayed beneath every article with avatar, handle, bio, and website.

### 5. Admin & Author Metrics Dashboard
- **Real-Time Studio Metrics**:
  - Total Articles
  - Published Articles
  - Draft Articles
  - Total Comments
  - Total Likes Received
- **Post Management Table**: Filter, edit, view live article, toggle draft/published status, and delete articles with confirmation dialogs.

### 6. Database & Row Level Security (RLS)
- Strict PostgreSQL schema with UUID primary keys and cascading foreign keys.
- **RLS Policies**:
  - `posts`: Public users can only view `status = 'published'`; authors can view, create, update, and delete their own posts.
  - `comments`: Viewable on published posts; authenticated users can comment; comment owners can delete.
  - `post_likes`: Authenticated users can like/unlike; count is public.
  - `storage.objects`: Public read on `blog-images`; authenticated users can upload.

### 7. Search Engine Optimization (SEO)
- **Dynamic Metadata**: Title, description, OpenGraph images, Twitter summary cards, and canonical URLs for every post.
- **Dynamic Sitemap**: Automatically generated `/sitemap.xml` including all published articles.
- **Search Engine Directives**: `/robots.txt` configuration restricting crawl on dashboard routes.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Server Components & Server Actions) |
| **Language** | TypeScript (Strict mode enabled) |
| **Styling** | Tailwind CSS v4 |
| **Database** | Supabase PostgreSQL |
| **Authentication** | Supabase Auth (SSR Cookies) |
| **File Storage** | Supabase Storage (`blog-images` bucket) |
| **Icons** | Lucide React |
| **Hosting Target** | Vercel |

---

## 🚀 Quickstart & Setup Guide

### Step 1: Clone & Install Dependencies

```bash
git clone <repository-url>
cd "Cloud-Based Blog Platform"
npm install
```

### Step 2: Supabase Project Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to your project's **SQL Editor** in the Supabase Dashboard.
3. Open the file [`supabase/schema.sql`](supabase/schema.sql) in this repository, copy its entire contents, paste it into the SQL Editor, and click **Run**.
   - This sets up the tables (`profiles`, `posts`, `comments`, `post_likes`).
   - Sets up automatic triggers (`handle_new_user`, `update_post_likes_count`, `handle_updated_at`).
   - Enables Row Level Security (RLS) and defines all security policies.
   - Creates the public `blog-images` storage bucket with upload policies.
4. *(Optional)* Run [`supabase/seed.sql`](supabase/seed.sql) to add sample articles.

### Step 3: Configure Environment Variables

Create `.env.local` in the project root:

```env
# Supabase Project Credentials (from Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💻 VS Code Setup

This repository includes pre-configured VS Code settings:
- `.vscode/settings.json`: TypeScript workspace SDK, auto-formatting, ESLint integration.
- `.vscode/launch.json`: Full debugging configurations for server-side and Chrome client-side debugging.

Press `F5` in VS Code to launch the debugging session.

---

## 🌐 Deploying to Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon public key.
   - `NEXT_PUBLIC_SITE_URL`: Your production domain (e.g., `https://your-blog.vercel.app`).
5. Click **Deploy**. Vercel will build the application using `npm run build` and publish it globally to edge nodes.
6. In Supabase Dashboard -> **Authentication** -> **URL Configuration**, add your Vercel URL to the **Redirect URLs** list:
   - `https://your-blog.vercel.app/auth/callback`

---

## 🧪 Testing Checklist

- [x] **Sign Up & Profile**: Register a new user at `/signup`. Check Supabase `auth.users` and `public.profiles` to confirm profile record was auto-created.
- [x] **Create Post**: Visit `/dashboard/new`, fill in title, upload an image, select category, write Markdown, and click "Save Draft".
- [x] **Publish Post**: Click "Publish Article", verify redirect to `/blog/[slug]`, and verify it appears on the public homepage feed.
- [x] **Read & Search**: Use the search bar on `/` to filter by keyword and category pills.
- [x] **Interactions**: Like the article and check count update; post a comment and test comment deletion.
- [x] **Edit Post**: Edit the post title or body via `/dashboard/edit/[id]`.
- [x] **Author Metrics**: Verify that metrics update on `/dashboard` (Total articles, drafts, published, comments, likes).
- [x] **Dark Mode**: Toggle theme in header to verify contrast in both light and dark modes.
- [x] **SEO**: Open `/sitemap.xml` and `/robots.txt` in your browser.
