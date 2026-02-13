-- Supabase Storage 'room_images' 버킷 생성 및 권한 설정 스크립트

-- 1. 'room_images' 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('room_images', 'room_images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 권한 설정 (RLS)

-- 기존 정책 삭제 (충돌 방지)
DROP POLICY IF EXISTS "Public View Rooms" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Rooms" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Rooms" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Rooms" ON storage.objects;

-- (1) 누구나 파일 보기 (Public Read)
CREATE POLICY "Public View Rooms" ON storage.objects
  FOR SELECT
  USING ( bucket_id = 'room_images' );

-- (2) 관리자(로그인한 사용자)만 파일 업로드/수정/삭제
CREATE POLICY "Admin Upload Rooms" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'room_images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Admin Update Rooms" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'room_images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Admin Delete Rooms" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'room_images' AND
    auth.role() = 'authenticated'
  );
