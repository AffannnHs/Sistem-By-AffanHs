CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users me
    WHERE me.id = auth.uid()
      AND me.role IN ('ADMIN', 'SUPER_ADMIN')
      AND me.status = 'ACTIVE'
  );
$$;

REVOKE ALL ON FUNCTION public.is_active_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_admin() TO authenticated;

DROP POLICY IF EXISTS users_admin_select_all ON public.users;
DROP POLICY IF EXISTS users_admin_update_all ON public.users;

CREATE POLICY users_admin_select_all ON public.users
  FOR SELECT TO authenticated
  USING (public.is_active_admin());

CREATE POLICY users_admin_update_all ON public.users
  FOR UPDATE TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

