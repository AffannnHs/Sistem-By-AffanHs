CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS group_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_lat DOUBLE PRECISION;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_lng DOUBLE PRECISION;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'MEMBER';
ALTER TABLE public.users ALTER COLUMN status SET DEFAULT 'PENDING';

CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  address TEXT,
  location TEXT,
  description TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  reporter_name TEXT,
  trigger_source TEXT,
  triggered_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.iot_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  group_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  mqtt_topic TEXT,
  status TEXT NOT NULL DEFAULT 'OFFLINE',
  signal INTEGER,
  last_ping_at TIMESTAMPTZ,
  last_triggered_at TIMESTAMPTZ,
  triggers_today INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.map_settings (
  user_id UUID PRIMARY KEY,
  preset_area TEXT,
  map_style TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_settings ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.iot_devices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.map_settings TO authenticated;

CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.status = 'ACTIVE'
      AND u.role IN ('ADMIN', 'SUPER_ADMIN')
  );
$$;

DROP POLICY IF EXISTS alerts_admin_all ON public.alerts;
CREATE POLICY alerts_admin_all
  ON public.alerts
  FOR ALL
  TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS chat_admin_all ON public.chat_messages;
CREATE POLICY chat_admin_all
  ON public.chat_messages
  FOR ALL
  TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS chat_sender_insert ON public.chat_messages;
CREATE POLICY chat_sender_insert
  ON public.chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS iot_admin_all ON public.iot_devices;
CREATE POLICY iot_admin_all
  ON public.iot_devices
  FOR ALL
  TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS map_settings_own ON public.map_settings;
CREATE POLICY map_settings_own
  ON public.map_settings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS map_settings_admin_all ON public.map_settings;
CREATE POLICY map_settings_admin_all
  ON public.map_settings
  FOR ALL
  TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
  WHEN undefined_object THEN
    NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
  WHEN undefined_object THEN
    NULL;
END $$;
