-- ==============================================================================
-- SAMPLE SEED DATA FOR DEMO & TESTING
-- ==============================================================================
-- Note: Replace author_id with your real user ID from auth.users or profiles
-- if running manually after creating your user account.
-- ==============================================================================

-- If you have registered a user, you can associate posts with them:
-- Example seed data structure:

/*
INSERT INTO public.posts (
  title,
  slug,
  excerpt,
  content,
  featured_image,
  category,
  tags,
  status,
  author_id,
  reading_time,
  likes_count,
  published_at
) VALUES (
  'The Architecture of Modern Cloud Platforms',
  'the-architecture-of-modern-cloud-platforms',
  'An in-depth exploration into distributed systems, serverless runtimes, and resilient edge compute.',
  '# The Architecture of Modern Cloud Platforms\n\nCloud computing has evolved from simple virtual machines into sophisticated, globally distributed serverless meshes. In this deep dive, we break down what makes contemporary cloud architectures tick.\n\n## 1. Edge Runtimes and Data Locality\n\nMoving compute to the edge drastically reduces round-trip latency. By executing functions closer to users, edge platforms provide instant responsiveness while querying centralized databases efficiently using connection poolers.\n\n> "The fastest request is the one that never has to cross an ocean."\n\n## 2. Serverless PostgreSQL\n\nModern databases like Supabase offer built-in connection scaling, Row Level Security, and instant GraphQL/REST endpoints directly mapped from relational schemas.\n\n```typescript\nimport { createClient } from "@supabase/supabase-js";\n\nconst supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);\nconst { data } = await supabase.from("posts").select("*").eq("status", "published");\n```\n\n## Conclusion\n\nDesigning cloud-native systems requires embracing immutability, automated scaling, and strict security isolation.',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
  'Cloud',
  ARRAY['Architecture', 'Cloud', 'Serverless'],
  'published',
  'YOUR_USER_UUID_HERE',
  5,
  12,
  now()
);
*/
