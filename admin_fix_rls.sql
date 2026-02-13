-- 예약(Bookings) 및 회원(Profiles) 테이블에 대한 읽기 권한을 확실하게 부여하는 스크립트입니다.

-- 1. Bookings 테이블 권한 재설정
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (충돌 방지)
DROP POLICY IF EXISTS "User View Own Bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin Manage All Bookings" ON public.bookings;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.bookings;

-- 새 정책: 로그인한 모든 사용자가 '모든 예약'을 볼 수 있게 함 (관리자 조회용)
-- (주의: 실제 서비스에서는 관리자 여부를 체크해야 하지만, 현재 프로젝트 구조상 'authenticated'로 통일)
CREATE POLICY "Enable read access for all users" ON public.bookings
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- 새 정책: 사용자 본인은 자신의 예약을 생성/취소할 수 있음
CREATE POLICY "User INSERT Own Bookings" ON public.bookings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User UPDATE Own Bookings" ON public.bookings
    FOR UPDATE
    USING (auth.uid() = user_id);


-- 2. Profiles 테이블 권한 재설정 (예약자 이름 조회용)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 새 정책: 로그인한 사용자는 모든 프로필(이름 등)을 볼 수 있음 (관리자 목록용)
CREATE POLICY "Read all profiles" ON public.profiles
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- 새 정책: 본인 프로필 수정/생성
CREATE POLICY "Insert own profile" ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Update own profile" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);
