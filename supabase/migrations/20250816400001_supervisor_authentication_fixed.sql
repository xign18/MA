-- Supervisor Authentication System Migration (Fixed Version)
-- This migration adds proper authentication for supervisors with company-based access control

-- =====================================================
-- 1. EXTEND SUPERVISOR PROFILES FOR AUTHENTICATION
-- =====================================================

-- Add authentication fields to supervisor_profiles
ALTER TABLE supervisor_profiles 
ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash text,
ADD COLUMN IF NOT EXISTS last_login timestamptz,
ADD COLUMN IF NOT EXISTS login_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until timestamptz,
ADD COLUMN IF NOT EXISTS password_reset_token text,
ADD COLUMN IF NOT EXISTS password_reset_expires timestamptz,
ADD COLUMN IF NOT EXISTS created_by_admin_id uuid,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'supervisor' CHECK (role IN ('supervisor', 'admin'));

-- =====================================================
-- 2. CREATE SUPERVISOR AUTHENTICATION FUNCTIONS
-- =====================================================

-- Function to create supervisor account (fixed parameters)
CREATE OR REPLACE FUNCTION create_supervisor_account(
  p_name text,
  p_email text,
  p_phone text,
  p_username text,
  p_password text,
  p_company_id uuid,
  p_created_by_admin_id text
)
RETURNS json AS $$
DECLARE
  v_supervisor_id uuid;
  v_result json;
  v_admin_id uuid;
BEGIN
  -- Validate inputs
  IF p_name IS NULL OR trim(p_name) = '' THEN
    RETURN json_build_object('success', false, 'error', 'Name is required');
  END IF;
  
  IF p_email IS NULL OR trim(p_email) = '' THEN
    RETURN json_build_object('success', false, 'error', 'Email is required');
  END IF;
  
  IF p_password IS NULL OR length(p_password) < 6 THEN
    RETURN json_build_object('success', false, 'error', 'Password must be at least 6 characters');
  END IF;
  
  IF p_company_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Company ID is required');
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM supervisor_profiles WHERE email = p_email) THEN
    RETURN json_build_object('success', false, 'error', 'Email already exists');
  END IF;

  -- Check if username already exists (if provided)
  IF p_username IS NOT NULL AND p_username != '' AND EXISTS (SELECT 1 FROM supervisor_profiles WHERE username = p_username) THEN
    RETURN json_build_object('success', false, 'error', 'Username already exists');
  END IF;

  -- Convert admin ID if provided
  IF p_created_by_admin_id IS NOT NULL AND p_created_by_admin_id != '' THEN
    v_admin_id := p_created_by_admin_id::uuid;
  END IF;

  -- Create supervisor profile
  INSERT INTO supervisor_profiles (
    name, email, phone, username, company_id, 
    created_by_admin_id, role, is_active, password_hash
  ) VALUES (
    p_name, p_email, 
    CASE WHEN p_phone = '' THEN NULL ELSE p_phone END,
    CASE WHEN p_username = '' THEN NULL ELSE p_username END, 
    p_company_id,
    v_admin_id,
    'supervisor', true, p_password
  )
  RETURNING id INTO v_supervisor_id;

  -- Return success with supervisor info
  SELECT json_build_object(
    'success', true,
    'supervisor_id', v_supervisor_id,
    'message', 'Supervisor account created successfully'
  ) INTO v_result;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Failed to create supervisor account: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate supervisor
CREATE OR REPLACE FUNCTION authenticate_supervisor(
  p_login text, -- Can be email, username, or phone
  p_password text
)
RETURNS json AS $$
DECLARE
  v_supervisor supervisor_profiles%ROWTYPE;
  v_company companies%ROWTYPE;
  v_result json;
BEGIN
  -- Find supervisor by email, username, or phone
  SELECT * INTO v_supervisor
  FROM supervisor_profiles 
  WHERE (email = p_login OR username = p_login OR phone = p_login)
    AND is_active = true;

  -- Check if supervisor exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Invalid credentials'
    );
  END IF;

  -- Check if account is locked
  IF v_supervisor.locked_until IS NOT NULL AND v_supervisor.locked_until > now() THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Account is temporarily locked. Please try again later.'
    );
  END IF;

  -- Simple password check (in production, use proper hashing)
  IF v_supervisor.password_hash IS NULL OR v_supervisor.password_hash = p_password THEN
    -- Get company information
    SELECT * INTO v_company FROM companies WHERE id = v_supervisor.company_id;

    -- Update last login and reset login attempts
    UPDATE supervisor_profiles 
    SET 
      last_login = now(),
      login_attempts = 0,
      locked_until = NULL
    WHERE id = v_supervisor.id;

    -- Return success with supervisor and company info
    RETURN json_build_object(
      'success', true,
      'supervisor', json_build_object(
        'id', v_supervisor.id,
        'name', v_supervisor.name,
        'email', v_supervisor.email,
        'phone', v_supervisor.phone,
        'username', v_supervisor.username,
        'company_id', v_supervisor.company_id,
        'role', v_supervisor.role
      ),
      'company', json_build_object(
        'id', v_company.id,
        'name', v_company.name,
        'code', v_company.code
      )
    );
  ELSE
    -- Increment login attempts
    UPDATE supervisor_profiles 
    SET 
      login_attempts = COALESCE(login_attempts, 0) + 1,
      locked_until = CASE 
        WHEN COALESCE(login_attempts, 0) + 1 >= 5 THEN now() + interval '15 minutes'
        ELSE NULL
      END
    WHERE id = v_supervisor.id;

    RETURN json_build_object(
      'success', false, 
      'error', 'Invalid credentials'
    );
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Authentication failed: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset supervisor password (fixed parameters)
CREATE OR REPLACE FUNCTION reset_supervisor_password(
  p_supervisor_id uuid,
  p_new_password text,
  p_admin_id text
)
RETURNS json AS $$
BEGIN
  -- Validate password
  IF p_new_password IS NULL OR length(p_new_password) < 6 THEN
    RETURN json_build_object('success', false, 'error', 'Password must be at least 6 characters');
  END IF;

  -- Update password (in production, hash the password)
  UPDATE supervisor_profiles 
  SET 
    password_hash = p_new_password,
    login_attempts = 0,
    locked_until = NULL,
    password_reset_token = NULL,
    password_reset_expires = NULL,
    updated_at = now()
  WHERE id = p_supervisor_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Supervisor not found');
  END IF;

  RETURN json_build_object('success', true, 'message', 'Password reset successfully');

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Failed to reset password: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. CREATE INDEXES FOR AUTHENTICATION
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_supervisor_profiles_auth_user_id ON supervisor_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_supervisor_profiles_username ON supervisor_profiles(username);
CREATE INDEX IF NOT EXISTS idx_supervisor_profiles_login_lookup ON supervisor_profiles(email, username, phone);
CREATE INDEX IF NOT EXISTS idx_supervisor_profiles_active_role ON supervisor_profiles(is_active, role);

-- =====================================================
-- 4. UPDATE EXISTING SUPERVISOR PROFILES
-- =====================================================

-- Set default passwords for existing supervisors (temporary - should be changed)
UPDATE supervisor_profiles 
SET 
  username = CASE 
    WHEN email IS NOT NULL THEN split_part(email, '@', 1)
    ELSE 'supervisor_' || id::text
  END,
  password_hash = 'password123', -- Default password - should be changed
  role = 'supervisor'
WHERE username IS NULL;

-- =====================================================
-- 5. VERIFICATION QUERY
-- =====================================================

-- Test the authentication system
-- SELECT authenticate_supervisor('john@abc-transport.com', 'password123');
-- SELECT authenticate_supervisor('sarah@xyz-logistics.com', 'password123');
