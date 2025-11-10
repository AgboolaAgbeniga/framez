--- aligned migration SQL ---
-- Ensure extension for gen_random_uuid exists
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- FOLLOWS: create table if missing, keep existing structure if present
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL,
    following_id UUID NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure follower/following columns exist (in case table existed with different columns)
ALTER TABLE public.follows ADD COLUMN IF NOT EXISTS follower_id UUID,
ADD COLUMN IF NOT EXISTS following_id UUID,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT timezone('utc'::text, now());

-- Make sure foreign keys reference public.profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.constraint_schema = kcu.constraint_schema
        WHERE tc.table_schema = 'public' AND tc.table_name = 'follows' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'follower_id'
    ) THEN
        ALTER TABLE public.follows ADD CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.constraint_schema = kcu.constraint_schema
        WHERE tc.table_schema = 'public' AND tc.table_name = 'follows' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'following_id'
    ) THEN
        ALTER TABLE public.follows ADD CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Indexes for follows (only create if columns exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='follows' AND column_name='follower_id') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='follows' AND column_name='following_id') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);';
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns c1
        JOIN information_schema.columns c2 ON c1.table_schema=c2.table_schema AND c1.table_name=c2.table_name
        WHERE c1.table_schema='public' AND c1.table_name='follows' AND c1.column_name='follower_id' AND c2.column_name='following_id'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_follows_follower_following ON public.follows(follower_id, following_id);';
    END IF;
END $$;

-- MESSAGES: align to existing messages table. If you want a direct sender->receiver model, add receiver_id;
-- otherwise keep existing conversation-based messages. We'll add receiver_id only if missing.
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID,
    sender_id UUID,
    content TEXT,
    message_type public.message_type DEFAULT 'text'::public.message_type, -- keep existing enum if present
    file_url TEXT,
    reply_to_message_id UUID,
    created_at timestamptz DEFAULT timezone('utc'::text, now())
);

-- Add columns that your script expected but may be missing
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_id UUID,
ADD COLUMN IF NOT EXISTS receiver_id UUID,
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT timezone('utc'::text, now());

-- Add foreign key for sender -> profiles if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'messages' AND c.contype = 'f' AND EXISTS (
            SELECT 1 FROM unnest(c.conkey) WITH ORDINALITY AS cols(col, idx)
            JOIN pg_attribute a ON a.attnum = cols.col AND a.attrelid = t.oid
            WHERE a.attname = 'sender_id'
        )
    ) THEN
        ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    -- receiver_id FK only if receiver_id column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='receiver_id')
    AND NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'messages' AND c.contype = 'f' AND EXISTS (
            SELECT 1 FROM unnest(c.conkey) WITH ORDINALITY AS cols(col, idx)
            JOIN pg_attribute a ON a.attnum = cols.col AND a.attrelid = t.oid
            WHERE a.attname = 'receiver_id'
        )
    ) THEN
        ALTER TABLE public.messages ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Indexes for messages: ensure columns exist before creating index
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='sender_id') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='receiver_id') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);';
    END IF;
    -- conversation index
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='conversation_id') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='created_at') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);';
    END IF;
END $$;

-- LIKES: create table if missing and align constraints
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    post_id UUID,
    comment_id UUID,
    created_at timestamptz DEFAULT timezone('utc'::text, now())
);

-- Ensure columns exist
ALTER TABLE public.likes ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS post_id UUID,
ADD COLUMN IF NOT EXISTS comment_id UUID,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT timezone('utc'::text, now());

-- FK user_id -> public.profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'likes' AND c.contype = 'f' AND EXISTS (
            SELECT 1 FROM unnest(c.conkey) WITH ORDINALITY AS cols(col, idx)
            JOIN pg_attribute a ON a.attnum = cols.col AND a.attrelid = t.oid
            WHERE a.attname = 'user_id'
        )
    ) THEN
        ALTER TABLE public.likes ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enforce that exactly one of post_id or comment_id is set (if desired)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conrelid = 'public.likes'::regclass AND contype = 'c' AND conname = 'likes_one_target_check'
    ) THEN
        ALTER TABLE public.likes ADD CONSTRAINT likes_one_target_check CHECK ( ((post_id IS NOT NULL)::int + (comment_id IS NOT NULL)::int) = 1 );
    END IF;
END $$;

-- Use partial unique indexes to enforce uniqueness only when target is present
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='likes' AND column_name='user_id')
    AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='likes' AND column_name='post_id') THEN
        EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS ux_likes_user_post ON public.likes(user_id, post_id) WHERE post_id IS NOT NULL;';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='likes' AND column_name='user_id')
    AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='likes' AND column_name='comment_id') THEN
        EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS ux_likes_user_comment ON public.likes(user_id, comment_id) WHERE comment_id IS NOT NULL;';
    END IF;
END $$;

-- COMMENTS: create or align to existing comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    post_id UUID NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id UUID,
    created_at timestamptz DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS post_id UUID,
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS parent_comment_id UUID,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT timezone('utc'::text, now());

-- Foreign keys: user -> profiles, post -> posts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'comments' AND c.contype = 'f' AND EXISTS (
            SELECT 1 FROM unnest(c.conkey) WITH ORDINALITY AS cols(col, idx)
            JOIN pg_attribute a ON a.attnum = cols.col AND a.attrelid = t.oid
            WHERE a.attname = 'user_id'
        )
    ) THEN
        ALTER TABLE public.comments ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'comments' AND c.contype = 'f' AND EXISTS (
            SELECT 1 FROM unnest(c.conkey) WITH ORDINALITY AS cols(col, idx)
            JOIN pg_attribute a ON a.attnum = cols.col AND a.attrelid = t.oid
            WHERE a.attname = 'post_id'
        )
    ) THEN
        ALTER TABLE public.comments ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Indexes for likes and comments (create only if columns exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='likes' AND column_name='user_id') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_likes_user ON public.likes(user_id);';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='likes' AND column_name='post_id') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_likes_post ON public.likes(post_id);';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='likes' AND column_name='comment_id') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_likes_comment ON public.likes(comment_id);';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='comments' AND column_name='user_id') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments(user_id);';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='comments' AND column_name='post_id') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='comments' AND column_name='created_at') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at);';
    END IF;
END $$;

-- Final validation statements (non-failing selects)
SELECT
    (SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('follows','messages','likes','comments')) AS tables_present,
    (SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='receiver_id') AS messages_has_receiver;

--- end of script ---