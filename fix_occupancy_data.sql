-- 객실 인원 정보 일괄 수정 스크립트

-- 1. 스탠다드 더블: 2명 / 2명
UPDATE public.rooms 
SET base_occupancy = 2, max_occupancy = 2 
WHERE name = '스탠다드 더블';

-- 2. 스탠다드 트윈: 2명 / 3명
UPDATE public.rooms 
SET base_occupancy = 2, max_occupancy = 3 
WHERE name = '스탠다드 트윈';

-- 3. 그 외 모든 객실: 2명 / 4명 (다이닝 룸, 무비, 키즈 등)
UPDATE public.rooms 
SET base_occupancy = 2, max_occupancy = 4 
WHERE name NOT IN ('스탠다드 더블', '스탠다드 트윈');

-- 확인용 쿼리
SELECT name, base_occupancy, max_occupancy FROM public.rooms ORDER BY price;
