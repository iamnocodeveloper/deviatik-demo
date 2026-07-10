-- Habit Tracker: habits + completions with RLS
-- Applied to the InsForge project linked via `.insforge/project.json`.

-- Trigger function: ensures NEW.user_id is always filled from auth.uid()
-- before the WITH CHECK policy runs. This avoids a known RLS edge case
-- where DEFAULT auth.uid() and WITH CHECK auth.uid() can disagree.
CREATE OR REPLACE FUNCTION public.set_user_id_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Helper used by the habit_completions INSERT policy to avoid recursion.
-- SECURITY DEFINER bypasses RLS on the parent habits row.
CREATE OR REPLACE FUNCTION public.habit_owned_by(p_habit_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.habits
    WHERE id = p_habit_id AND user_id = p_user_id
  );
$$;

REVOKE ALL ON FUNCTION public.set_user_id_on_insert() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_user_id_on_insert() TO authenticated;
REVOKE ALL ON FUNCTION public.habit_owned_by(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.habit_owned_by(uuid, uuid) TO authenticated;

CREATE TABLE public.habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  description text CHECK (description IS NULL OR char_length(description) <= 500),
  color text NOT NULL DEFAULT '#0ea5e9',
  icon text NOT NULL DEFAULT 'circle',
  frequency text NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
  days_of_week int[] NOT NULL DEFAULT '{}',
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT habits_days_of_week_check CHECK (
    (frequency = 'weekly' AND cardinality(days_of_week) BETWEEN 1 AND 7)
    OR (frequency = 'daily' AND days_of_week = '{}')
  )
);

CREATE INDEX habits_user_id_idx ON public.habits (user_id);
CREATE INDEX habits_user_id_archived_idx ON public.habits (user_id, archived);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY habits_select_own ON public.habits
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY habits_insert_own ON public.habits
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY habits_update_own ON public.habits
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY habits_delete_own ON public.habits
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER habits_set_user_id
  BEFORE INSERT ON public.habits
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id_on_insert();

CREATE TRIGGER habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TABLE public.habit_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id uuid NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  completed_on date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT habit_completions_unique_per_day UNIQUE (user_id, habit_id, completed_on)
);

CREATE INDEX habit_completions_user_idx ON public.habit_completions (user_id);
CREATE INDEX habit_completions_habit_completed_idx ON public.habit_completions (habit_id, completed_on DESC);
CREATE INDEX habit_completions_user_completed_idx ON public.habit_completions (user_id, completed_on DESC);

ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY habit_completions_select_own ON public.habit_completions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY habit_completions_insert_own ON public.habit_completions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.habit_owned_by(habit_id, auth.uid())
  );

CREATE POLICY habit_completions_delete_own ON public.habit_completions
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER habit_completions_set_user_id
  BEFORE INSERT ON public.habit_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id_on_insert();

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habits TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.habit_completions TO authenticated;