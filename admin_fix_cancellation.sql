-- 예약 취소 권한 수정 스크립트
-- 관리자가 다른 사람의 예약을 '취소'하려면 UPDATE 권한이 필요합니다.

-- 1. Bookings 테이블의 UPDATE 정책 추가
-- 기존 'User UPDATE Own Bookings'는 본인 것만 수정 가능하므로, 관리자용 정책을 추가합니다.

DROP POLICY IF EXISTS "Admin Update All Bookings" ON public.bookings;

CREATE POLICY "Admin Update All Bookings" ON public.bookings
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- 참고: 현재 시스템은 로그인한 사용자를 관리자로 간주하여 권한을 부여하고 있습니다.
-- 실제 운영 시에는 auth.uid()를 관리자 ID 목록과 비교하거나 custom claim을 사용해야 합니다.
