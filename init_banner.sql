-- 배너 설정을 초기화하는 스크립트
-- 이 스크립트를 실행하면 '15% 할인 배너'가 사이트에 적용됩니다.

INSERT INTO public.site_config (key, value)
VALUES
    ('event_banner_show', 'true'),
    ('event_banner_img', 'images/banner_promotion_15off.png') -- 방금 생성된 이미지
ON CONFLICT (key)
DO UPDATE SET value = EXCLUDED.value;
