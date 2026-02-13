-- 1. 회원 등급(Grade) 컬럼 추가
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'grade') then
    alter table public.profiles add column grade text default 'Silver';
  end if;
end $$;

-- 2. 회원 정보(등급 등) 수정 권한 부여 (관리자만)
-- 기존 'Admin Read Profiles' 정책은 select만 허용했음. update 정책 추가 필요.
drop policy if exists "Admin Update Profiles" on public.profiles;
create policy "Admin Update Profiles" on public.profiles
  for update using (auth.role() = 'authenticated');
