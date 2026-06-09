-- ================================================================
-- RPC: 위치 기반 피드 조회
-- 4단계 정렬: boosted_until → is_urgent → distance → created_at
-- lat/lng가 NULL이면 전체 RECRUITING 반환 (TD-03 해결 전 개발용)
-- ================================================================

CREATE OR REPLACE FUNCTION get_care_feed(
  p_lat  FLOAT8  DEFAULT NULL,
  p_lng  FLOAT8  DEFAULT NULL,
  p_radius_meters INT DEFAULT 3000
)
RETURNS TABLE (
  id              UUID,
  parent_id       UUID,
  title           VARCHAR,
  target_age      VARCHAR,
  hourly_wage     INT,
  schedule_time   VARCHAR,
  tasks           TEXT[],
  is_urgent       BOOLEAN,
  boosted_until   TIMESTAMPTZ,
  status          VARCHAR,
  b_code          VARCHAR,
  created_at      TIMESTAMPTZ,
  distance_meters FLOAT8
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    id,
    parent_id,
    title,
    target_age,
    hourly_wage,
    schedule_time,
    tasks,
    is_urgent,
    boosted_until,
    status,
    b_code,
    created_at,
    CASE
      WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL
        THEN ST_Distance(location, ST_MakePoint(p_lng, p_lat)::geography)
      ELSE NULL
    END AS distance_meters
  FROM care_requests
  WHERE
    status = 'RECRUITING'
    AND (
      p_lat IS NULL OR p_lng IS NULL
      OR ST_DWithin(location, ST_MakePoint(p_lng, p_lat)::geography, p_radius_meters)
    )
  ORDER BY
    (boosted_until > NOW()) DESC NULLS LAST,
    is_urgent DESC,
    CASE
      WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL
        THEN ST_Distance(location, ST_MakePoint(p_lng, p_lat)::geography)
      ELSE 0
    END ASC,
    created_at DESC
  LIMIT 50;
$$;
