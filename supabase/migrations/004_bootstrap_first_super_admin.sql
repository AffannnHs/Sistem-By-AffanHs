CREATE OR REPLACE FUNCTION public.bootstrap_first_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID;
  has_admin BOOLEAN;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.role IN ('ADMIN', 'SUPER_ADMIN')
      AND u.status = 'ACTIVE'
  ) INTO has_admin;

  IF has_admin THEN
    RETURN FALSE;
  END IF;

  UPDATE public.users
  SET role = 'SUPER_ADMIN',
      status = 'ACTIVE',
      approved_at = NOW(),
      updated_at = NOW()
  WHERE id = uid;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_first_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_super_admin() TO authenticated;
