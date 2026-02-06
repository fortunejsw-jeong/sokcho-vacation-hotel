-- 객실 이미지 URL 업데이트 스크립트
-- Supabase SQL Editor에서 실행해주세요.

UPDATE public.rooms SET image_url = 'images/room-double.jpg' WHERE type = 'standard_double';
UPDATE public.rooms SET image_url = 'images/room-twin.jpg' WHERE type = 'standard_twin';
UPDATE public.rooms SET image_url = 'images/room-dining.jpg' WHERE type = 'dining';
UPDATE public.rooms SET image_url = 'images/room-movie-dining.jpg' WHERE type = 'movie_dining';
UPDATE public.rooms SET image_url = 'images/room-movie.jpg' WHERE type = 'movie';
UPDATE public.rooms SET image_url = 'images/room-play.jpg' WHERE type = 'play';
UPDATE public.rooms SET image_url = 'images/room-kids.jpg' WHERE type = 'kids';
UPDATE public.rooms SET image_url = 'images/room-business.jpg' WHERE type = 'business';
UPDATE public.rooms SET image_url = 'images/room-wellness.jpg' WHERE type = 'wellness';
