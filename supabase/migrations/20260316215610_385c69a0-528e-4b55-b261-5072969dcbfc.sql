CREATE OR REPLACE FUNCTION public.create_tenant_onboarding(
  _name text,
  _cnpj text DEFAULT NULL,
  _phone text DEFAULT NULL,
  _address text DEFAULT NULL,
  _slug text DEFAULT NULL,
  _city text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _current_user uuid := auth.uid();
  _tenant_id uuid;
  _email text;
  _display_name text;
  _existing_tenant_id uuid;
BEGIN
  IF _current_user IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  SELECT tenant_id INTO _existing_tenant_id
  FROM public.profiles
  WHERE user_id = _current_user;

  IF _existing_tenant_id IS NOT NULL THEN
    RAISE EXCEPTION 'Usuário já possui revenda vinculada';
  END IF;

  INSERT INTO public.tenants (name, cnpj, phone, address, slug, city)
  VALUES (_name, _cnpj, _phone, _address, _slug, _city)
  RETURNING id INTO _tenant_id;

  _email := COALESCE(auth.jwt() ->> 'email', '');
  _display_name := COALESCE(auth.jwt() -> 'user_metadata' ->> 'name', NULLIF(_email, ''), 'Usuário');

  IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = _current_user) THEN
    UPDATE public.profiles
    SET tenant_id = _tenant_id
    WHERE user_id = _current_user;
  ELSE
    INSERT INTO public.profiles (user_id, name, email, tenant_id)
    VALUES (_current_user, _display_name, _email, _tenant_id);
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_current_user, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN _tenant_id;
END;
$$;