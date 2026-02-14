-- rooms 테이블의 RLS 정책 수정
-- 기존 정책이 있다면 삭제하고 새로 생성 (업데이트 권한 부여)

-- 1. 기존 정책 삭제 (이름이 다를 수 있으므로 확인 필요하지만, 보통 새로 만들면 됨)
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON "public"."rooms";

-- 2. 새 정책 생성: 인증된 사용자는 rooms 테이블의 모든 컬럼을 업데이트할 수 있음
-- (관리자 페이지는 어차피 admin.js에서 이메일/DB체크로 보호되므로, RLS는 authenticated로 설정)
CREATE POLICY "Enable update for authenticated users only"
ON "public"."rooms"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. 혹시 insert 권한도 필요할 수 있으므로 추가
CREATE POLICY "Enable insert for authenticated users only"
ON "public"."rooms"
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. Select는 이미 public 설정되어 있을 수 있으나 확실히 하기 위해
CREATE POLICY "Enable read access for all users"
ON "public"."rooms"
FOR SELECT
USING (true);
