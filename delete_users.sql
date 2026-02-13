-- Supabase SQL Editor에서 이 스크립트를 실행하세요.
-- 외래 키 제약 조건(Foreign Key Constraints)으로 인해 삭제되지 않는 사용자들을 강제로 삭제합니다.

-- 1. 먼저 예약 테이블(bookings)에서 해당 사용자의 예약 기록을 삭제합니다.
DELETE FROM public.bookings 
WHERE user_id IN (
    '47eb44b5-bf72-401a-837e-92623596217b', -- 홍경민 (bbbb4344@nave.com)
    'a56009df-1eed-4d6d-93cb-7cf69c19681e', -- 홍경민 (bbbb4344@naver.com)
    '96535380-47a0-4a6b-bd6f-341ec1225417'  -- 속초비케이션 (sokchovac@naver.com)
);

-- 2. 프로필 테이블(profiles)에서 해당 사용자의 프로필을 삭제합니다. (오류 발생 원인 해결)
DELETE FROM public.profiles
WHERE id IN (
    '47eb44b5-bf72-401a-837e-92623596217b',
    'a56009df-1eed-4d6d-93cb-7cf69c19681e',
    '96535380-47a0-4a6b-bd6f-341ec1225417'
);

-- 3. 사용자 테이블(auth.users)에서 해당 사용자를 삭제합니다.
DELETE FROM auth.users 
WHERE id IN (
    '47eb44b5-bf72-401a-837e-92623596217b',
    'a56009df-1eed-4d6d-93cb-7cf69c19681e',
    '96535380-47a0-4a6b-bd6f-341ec1225417'
);

-- 실행 결과 확인 (선택 사항)
-- SELECT * FROM auth.users WHERE id IN ('47eb44b5-bf72-401a-837e-92623596217b', 'a56009df-1eed-4d6d-93cb-7cf69c19681e', '96535380-47a0-4a6b-bd6f-341ec1225417');
