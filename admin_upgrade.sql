-- 1. profiles 테이블에 관리자 여부 컬럼 추가
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. 기존 관리자 계정 권한 부여
UPDATE public.profiles
SET is_admin = TRUE
WHERE id IN (
    SELECT id FROM auth.users WHERE email IN ('dimplekiller@daum.net', 'sokchovac@naver.com')
);

-- 3. 관리자 확인 헬퍼 함수 (RPC에서 사용)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_is_admin BOOLEAN;
BEGIN
  -- 현재 로그인한 사용자의 is_admin 값을 가져옴
  SELECT is_admin INTO current_is_admin
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(current_is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 회원 삭제 RPC (관리자 전용)
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- 관리자 권한 체크
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION '접근 거부: 관리자만 회원을 삭제할 수 있습니다.';
  END IF;

  -- 1) 예약 정보 삭제 (Cascade 설정이 안되어 있을 경우를 대비해 명시적 삭제)
  DELETE FROM public.bookings WHERE user_id = target_user_id;
  
  -- 2) 프로필 삭제
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  -- 3) 인증 계정 삭제 (auth.users)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 관리자 권한 변경 RPC (관리자 전용)
CREATE OR REPLACE FUNCTION public.toggle_admin_role(target_user_id UUID, new_is_admin BOOLEAN)
RETURNS VOID AS $$
BEGIN
  -- 관리자 권한 체크
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION '접근 거부: 관리자만 권한을 변경할 수 있습니다.';
  END IF;

  UPDATE public.profiles
  SET is_admin = new_is_admin
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
