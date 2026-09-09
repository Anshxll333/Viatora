-- ==============================================================================
-- VIATORA DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Phase 2A Migration Script
-- ==============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  passport_number TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Existing projects need this migration because CREATE TABLE IF NOT EXISTS does not add columns.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS passport_number TEXT UNIQUE;

CREATE SEQUENCE IF NOT EXISTS public.passport_number_sequence START WITH 1;

WITH missing_passports AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS sequence_number
  FROM public.profiles
  WHERE passport_number IS NULL
)
UPDATE public.profiles AS profiles
SET passport_number =
  'VIA · ' || LPAD(missing_passports.sequence_number::TEXT, 4, '0') ||
  ' · ' || EXTRACT(YEAR FROM profiles.created_at)::TEXT
FROM missing_passports
WHERE profiles.id = missing_passports.id;

SELECT setval(
  'public.passport_number_sequence',
  GREATEST(
    COALESCE((
      SELECT MAX(SPLIT_PART(passport_number, ' · ', 2)::BIGINT)
      FROM public.profiles
      WHERE passport_number ~ '^VIA · [0-9]{4,} · [0-9]{4}$'
    ), 0),
    COALESCE((SELECT last_value FROM public.passport_number_sequence), 0)
  ) + 1,
  false
);

-- 2. DESTINATIONS TABLE
CREATE TABLE IF NOT EXISTS public.destinations (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  country_code TEXT NOT NULL,
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),
  description TEXT,
  stamp TEXT,
  tint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed static destinations data
INSERT INTO public.destinations (id, slug, city, country, country_code, description, stamp, tint)
VALUES
  ('jaipur', 'jaipur', 'Jaipur', 'India', 'IN', 'The Pink City, known for Amber Fort, Hawa Mahal and royal heritage.', '/stamps/Rajasthan/Jaipur.png', 'oklch(0.62 0.15 30)'),
  ('udaipur', 'udaipur', 'Udaipur', 'India', 'IN', 'The City of Lakes, famous for Lake Pichola and its romantic palaces.', '/stamps/Rajasthan/Udaipur.png', 'oklch(0.6 0.12 230)'),
  ('jodhpur', 'jodhpur', 'Jodhpur', 'India', 'IN', 'The Blue City, dominated by the magnificent Mehrangarh Fort.', '/stamps/Rajasthan/Jodhpur.png', 'oklch(0.55 0.12 240)'),
  ('jaisalmer', 'jaisalmer', 'Jaisalmer', 'India', 'IN', 'The Golden City rising from the Thar Desert, centered around its historic fort.', '/stamps/Rajasthan/Jaisalmer.png', 'oklch(0.65 0.14 70)'),
  ('pushkar', 'pushkar', 'Pushkar', 'India', 'IN', 'A spiritual desert town surrounding the sacred Pushkar Lake.', '/stamps/Rajasthan/Pushkar.png', 'oklch(0.6 0.1 50)'),
  ('mount-abu', 'mount-abu', 'Mount Abu', 'India', 'IN', 'Rajasthan’s hill station, known for Nakki Lake, viewpoints and Dilwara Temples.', '/stamps/Rajasthan/MountAbu.png', 'oklch(0.58 0.09 160)'),
  ('rishikesh', 'rishikesh', 'Rishikesh', 'India', 'IN', 'Spiritual river town, yoga, rafting and gateway to the Himalayas.', '/stamps/Uttarakhand/Rishikesh.png', 'oklch(0.6 0.12 180)'),
  ('mussoorie', 'mussoorie', 'Mussoorie', 'India', 'IN', 'A Himalayan hill station known for mountain views and colonial charm.', '/stamps/Uttarakhand/Mussoorie.png', 'oklch(0.55 0.1 140)'),
  ('haridwar', 'haridwar', 'Haridwar', 'India', 'IN', 'Sacred Ghat city where the Ganges descends to the plains.', '/stamps/Uttarakhand/Haridwar.png', 'oklch(0.58 0.11 200)'),
  ('kedarnath', 'kedarnath', 'Kedarnath', 'India', 'IN', 'A dramatic Himalayan pilgrimage destination surrounded by towering mountains.', '/stamps/Uttarakhand/Kedarnath.png', 'oklch(0.52 0.09 30)'),
  ('auli', 'auli', 'Auli', 'India', 'IN', 'A Himalayan ski destination with panoramic mountain views.', '/stamps/Uttarakhand/Auli.png', 'oklch(0.62 0.13 60)'),
  ('valley-of-flowers', 'valley-of-flowers', 'Valley of Flowers', 'India', 'IN', 'A Himalayan national park famous for alpine flowers and mountain trekking.', '/stamps/Uttarakhand/Flowers.png', 'oklch(0.65 0.14 120)')
ON CONFLICT (id) DO UPDATE SET
  city = EXCLUDED.city,
  country = EXCLUDED.country,
  country_code = EXCLUDED.country_code,
  description = EXCLUDED.description,
  stamp = EXCLUDED.stamp,
  tint = EXCLUDED.tint;

-- 3. USER STAMPS TABLE
CREATE TABLE IF NOT EXISTS public.user_stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id TEXT NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_destination_unique UNIQUE (user_id, destination_id)
);

-- 4. MEMORIES TABLE
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id TEXT NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  visited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_memory_destination_unique UNIQUE (user_id, destination_id)
);

-- 5. MEMORY PHOTOS TABLE
CREATE TABLE IF NOT EXISTS public.memory_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx ON public.profiles (LOWER(username));
CREATE INDEX IF NOT EXISTS idx_user_stamps_user_id ON public.user_stamps(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stamps_dest_id ON public.user_stamps(destination_id);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON public.memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_dest_id ON public.memories(destination_id);
CREATE INDEX IF NOT EXISTS idx_memory_photos_memory_id ON public.memory_photos(memory_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_photos ENABLE ROW LEVEL SECURITY;

-- Destinations: Read-only for authenticated and public users
DROP POLICY IF EXISTS "Allow public read access on destinations" ON public.destinations;
DROP POLICY IF EXISTS "Allow write access on destinations" ON public.destinations;
DROP POLICY IF EXISTS "Allow update access on destinations" ON public.destinations;
CREATE POLICY "Allow public read access on destinations"
  ON public.destinations FOR SELECT
  USING (true);

-- Profiles: Users can read and manage ONLY their own profile.
-- This isolates usernames, full names, passport numbers, and creation dates.
DROP POLICY IF EXISTS "Allow public read access on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to select own profile" ON public.profiles;
CREATE POLICY "Allow users to select own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow individual update access on profiles" ON public.profiles;
CREATE POLICY "Allow individual update access on profiles"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow individual insert access on profiles" ON public.profiles;
CREATE POLICY "Allow individual insert access on profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User Stamps: Users can manage only their own stamps
DROP POLICY IF EXISTS "Allow users to select their own stamps" ON public.user_stamps;
CREATE POLICY "Allow users to select their own stamps"
  ON public.user_stamps FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to insert their own stamps" ON public.user_stamps;
CREATE POLICY "Allow users to insert their own stamps"
  ON public.user_stamps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own stamps" ON public.user_stamps;
CREATE POLICY "Allow users to update their own stamps"
  ON public.user_stamps FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own stamps" ON public.user_stamps;
CREATE POLICY "Allow users to delete their own stamps"
  ON public.user_stamps FOR DELETE
  USING (auth.uid() = user_id);

-- Memories: Users can manage only their own memories
DROP POLICY IF EXISTS "Allow users to select their own memories" ON public.memories;
CREATE POLICY "Allow users to select their own memories"
  ON public.memories FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to insert their own memories" ON public.memories;
CREATE POLICY "Allow users to insert their own memories"
  ON public.memories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own memories" ON public.memories;
CREATE POLICY "Allow users to update their own memories"
  ON public.memories FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own memories" ON public.memories;
CREATE POLICY "Allow users to delete their own memories"
  ON public.memories FOR DELETE
  USING (auth.uid() = user_id);

-- Memory Photos: Users can manage photos belonging to their memories
DROP POLICY IF EXISTS "Allow users to select their memory photos" ON public.memory_photos;
CREATE POLICY "Allow users to select their memory photos"
  ON public.memory_photos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.memories
    WHERE memories.id = memory_photos.memory_id
      AND memories.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Allow users to insert their memory photos" ON public.memory_photos;
CREATE POLICY "Allow users to insert their memory photos"
  ON public.memory_photos FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.memories
    WHERE memories.id = memory_photos.memory_id
      AND memories.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Allow users to update their memory photos" ON public.memory_photos;
CREATE POLICY "Allow users to update their memory photos"
  ON public.memory_photos FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.memories
    WHERE memories.id = memory_photos.memory_id
      AND memories.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Allow users to delete their memory photos" ON public.memory_photos;
CREATE POLICY "Allow users to delete their memory photos"
  ON public.memory_photos FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.memories
    WHERE memories.id = memory_photos.memory_id
      AND memories.user_id = auth.uid()
  ));

-- ==============================================================================
-- AUTOMATED TRIGGER FOR NEW USER SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_passport_number TEXT;
  attempts INTEGER := 0;
  success BOOLEAN := FALSE;
BEGIN
  -- Loop to handle potential passport_number collisions if the sequence is out of sync
  WHILE NOT success AND attempts < 10 LOOP
    BEGIN
      new_passport_number := 'VIA · ' || LPAD(nextval('public.passport_number_sequence')::TEXT, 4, '0') || ' · ' || to_char(NOW(), 'YYYY');
      
      INSERT INTO public.profiles (id, full_name, username, avatar_url, passport_number)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        new_passport_number
      );
      
      success := TRUE;
    EXCEPTION WHEN unique_violation THEN
      -- If the conflict is on the primary key (id), profile already exists
      IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
        success := TRUE;
      -- If the conflict is on the username, abort
      ELSIF SQLERRM LIKE '%username%' THEN
        RAISE EXCEPTION 'Username already taken';
      -- Otherwise, it's likely a passport_number collision. Loop will retry.
      ELSE
        attempts := attempts + 1;
      END IF;
    END;
  END LOOP;

  IF NOT success THEN
    RAISE EXCEPTION 'Failed to generate a unique passport number after % attempts', attempts;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- SECURE USERNAME AVAILABILITY CHECK
-- ==============================================================================
-- This function allows checking if a username is taken without exposing profile data.
-- It runs with SECURITY DEFINER to bypass RLS, but only returns a boolean.
CREATE OR REPLACE FUNCTION public.check_username_available(requested_username text)
RETURNS boolean AS $$
DECLARE
  is_available boolean;
BEGIN
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE LOWER(username) = LOWER(requested_username)
  ) INTO is_available;
  
  RETURN is_available;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
