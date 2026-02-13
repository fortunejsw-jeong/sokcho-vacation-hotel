-- RLS(보안) 정책 설정 스크립트
-- 이 코드를 실행하면 로그인한 관리자가 데이터를 수정할 수 있게 됩니다.

-- 1. 객실 (Rooms) 테이블 권한
alter table public.rooms enable row level security;

-- 누구나 객실 정보는 볼 수 있음 (메인 페이지용)
drop policy if exists "Public Read Rooms" on public.rooms;
create policy "Public Read Rooms" on public.rooms
  for select using (true);

-- 로그인한 사용자(관리자)는 객실 정보를 수정할 수 있음
drop policy if exists "Admin Update Rooms" on public.rooms;
create policy "Admin Update Rooms" on public.rooms
  for update using (auth.role() = 'authenticated');

-- 2. 사이트 설정 (Site Config) 테이블 권한
alter table public.site_config enable row level security;

-- 누구나 설정(배너 등)을 볼 수 있음
drop policy if exists "Public Read Config" on public.site_config;
create policy "Public Read Config" on public.site_config
  for select using (true);

-- 로그인한 사용자는 설정을 수정/추가할 수 있음
drop policy if exists "Admin ALL Config" on public.site_config;
create policy "Admin ALL Config" on public.site_config
  for all using (auth.role() = 'authenticated');

-- 3. 회원 (Profiles) 테이블 권한
alter table public.profiles enable row level security;

-- 로그인한 사용자는 회원 목록을 볼 수 있음
drop policy if exists "Admin Read Profiles" on public.profiles;
create policy "Admin Read Profiles" on public.profiles
  for select using (auth.role() = 'authenticated');

-- 4. 예약 (Bookings) 테이블 권한
alter table public.bookings enable row level security;

-- 사용자: 자신의 예약만 생성/조회
drop policy if exists "User Create Own Bookings" on public.bookings;
create policy "User Create Own Bookings" on public.bookings
  for insert with check (auth.uid() = user_id);

drop policy if exists "User View Own Bookings" on public.bookings;
create policy "User View Own Bookings" on public.bookings
  for select using (auth.uid() = user_id);

-- 관리자: 모든 예약 조회 및 수정 (로그인한 경우)
drop policy if exists "Admin Manage All Bookings" on public.bookings;
create policy "Admin Manage All Bookings" on public.bookings
  for all using (auth.role() = 'authenticated');
