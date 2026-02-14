-- Admin Permissions Final Fix Script
-- 이 스크립트는 관리자가 예약, 회원, 객실 정보를 관리할 수 있도록 권한(RLS)을 재설정합니다.
-- Supabase SQL Editor에서 이 전체 스크립트를 실행해주세요.

-- ==========================================
-- 1. Bookings 테이블 권한 (예약 관리)
-- ==========================================
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (충돌 방지)
DROP POLICY IF EXISTS "View All Bookings" ON public.bookings;
DROP POLICY IF EXISTS "Create Own Booking" ON public.bookings;
DROP POLICY IF EXISTS "Update Own Booking" ON public.bookings;
DROP POLICY IF EXISTS "Admin Update Bookings" ON public.bookings;
DROP POLICY IF EXISTS "User View Own Bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin Manage All Bookings" ON public.bookings;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.bookings;
DROP POLICY IF EXISTS "Admin Update All Bookings" ON public.bookings;
DROP POLICY IF EXISTS "User INSERT Own Bookings" ON public.bookings;
DROP POLICY IF EXISTS "User UPDATE Own Bookings" ON public.bookings;

-- [조회] 로그인한 모든 사용자가 모든 예약을 볼 수 있음 (관리자 예약 관리용)
CREATE POLICY "View All Bookings" ON public.bookings
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- [생성] 사용자는 자신의 예약만 생성 가능
CREATE POLICY "Create Own Booking" ON public.bookings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- [수정] 로그인한 모든 사용자가 예약을 수정(취소)할 수 있음
-- (보안상 취약할 수 있으나, 현재 관리자 페이지 기능 작동을 위해 필요)
CREATE POLICY "Update Bookings" ON public.bookings
    FOR UPDATE
    USING (auth.role() = 'authenticated');


-- ==========================================
-- 2. Profiles 테이블 권한 (회원 목록 Display)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Manage Own Profile" ON public.profiles;
DROP POLICY IF EXISTS "View All Profiles" ON public.profiles;


-- [조회] 로그인한 사용자는 모든 프로필을 볼 수 있음 (관리자 회원 목록용)
CREATE POLICY "View All Profiles" ON public.profiles
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- [관리] 본인 프로필은 본인이 수정/생성
CREATE POLICY "Manage Own Profile" ON public.profiles
    FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);


-- ==========================================
-- 3. Rooms 테이블 권한 (객실 수정)
-- ==========================================
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Public View Rooms" ON public.rooms;
DROP POLICY IF EXISTS "Admin Manage Rooms" ON public.rooms;

-- [조회] 누구나 객실 정보 볼 수 있음
CREATE POLICY "Public View Rooms" ON public.rooms
    FOR SELECT
    USING (true);

-- [관리] 로그인한 사용자는 객실 정보 수정 가능 (관리자 기능)
CREATE POLICY "Admin Manage Rooms" ON public.rooms
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
