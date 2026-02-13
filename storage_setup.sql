-- Supabase Storage 'banners' 버킷 생성 및 권한 설정 스크립트

-- 1. 'banners' 버킷 생성 (이미 존재하면 무시)
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 권한 설정 (RLS)

-- 기존 정책 삭제 (충돌 방지)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;

-- (1) 누구나 파일 보기 (Public Read)
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING ( bucket_id = 'banners' );

-- (2) 관리자(로그인한 사용자)만 파일 업로드 (Insert)
CREATE POLICY "Admin Upload" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'banners' AND
    auth.role() = 'authenticated'
  );

-- (3) 관리자(로그인한 사용자)만 파일 수정/삭제 (Update/Delete)
CREATE POLICY "Admin Update" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'banners' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Admin Delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'banners' AND
    auth.role() = 'authenticated'
  );
