-- ================================================================
-- Villie MVP 초기 스키마
-- 결정 로그: SPEC_INIT.md 섹션 5 참조
-- ================================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. 통합 유저 테이블
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('PARENT', 'SENIOR')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 시니어 상세 프로필 (연령대별 평점)
CREATE TABLE senior_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_score NUMERIC(3, 2) DEFAULT 0.00,
    score_infant NUMERIC(3, 2) DEFAULT 0.00,
    score_toddler NUMERIC(3, 2) DEFAULT 0.00,
    score_elementary NUMERIC(3, 2) DEFAULT 0.00,
    verified_badges TEXT[]
);

-- 3. 유저 위치 인증 테이블
CREATE TABLE user_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    b_code VARCHAR(10) NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 돌봄 요청 게시물 테이블
--    schedule_time: 희망 초안 (VARCHAR). 실제 확정 일정은 match_chats.agreed_schedule
--    is_urgent: 급구 표시 + 피드 상단 우선 노출
--    boosted_until: 캐시 아이템으로 결제한 상단 노출 만료 시각
CREATE TABLE care_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    target_age VARCHAR(20) NOT NULL CHECK (target_age IN ('INFANT', 'TODDLER', 'ELEMENTARY')),
    hourly_wage INT NOT NULL,
    schedule_time VARCHAR(100) NOT NULL,
    tasks TEXT[] NOT NULL,
    is_urgent BOOLEAN DEFAULT false,
    boosted_until TIMESTAMPTZ DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'RECRUITING' CHECK (status IN ('RECRUITING', 'MATCHED', 'COMPLETED')),
    b_code VARCHAR(10) NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. 지원 테이블
--    시니어 지원 → 부모 목록 확인 → 수락 → match_chats 생성 순서
--    채팅방은 수락 이후에만 생성됨
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES care_requests(id) ON DELETE CASCADE,
    senior_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
    message TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (request_id, senior_id)
);

-- 6. 채팅방 테이블 (수락 이후에만 생성)
--    agreed_schedule: 채팅으로 협의된 최종 확정 일정 (schedule_time과 다름)
CREATE TABLE match_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES care_requests(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES users(id),
    senior_id UUID REFERENCES users(id),
    agreed_schedule TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. 채팅 메시지 테이블
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES match_chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. 평판/리뷰 테이블
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_chat_id UUID REFERENCES match_chats(id),
    reviewer_id UUID REFERENCES users(id),
    reviewee_id UUID REFERENCES users(id),
    target_age VARCHAR(20) NOT NULL CHECK (target_age IN ('INFANT', 'TODDLER', 'ELEMENTARY')),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_badges TEXT[],
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- 인덱스
-- ================================================================

-- 공간 인덱스 (필수 - ST_DWithin 성능)
CREATE INDEX idx_care_requests_location ON care_requests USING GIST (location);
CREATE INDEX idx_user_locations_location ON user_locations USING GIST (location);

-- 피드 정렬 인덱스 (boosted_until → is_urgent → created_at)
CREATE INDEX idx_care_requests_feed
    ON care_requests (boosted_until DESC NULLS LAST, is_urgent DESC, created_at DESC);

-- 채팅 메시지 조회
CREATE INDEX idx_chat_messages_chat ON chat_messages (chat_id, created_at DESC);

-- 미읽음 메시지 부분 인덱스
CREATE INDEX idx_chat_messages_unread ON chat_messages (chat_id) WHERE is_read = false;

-- 지원 목록 조회
CREATE INDEX idx_applications_request ON applications (request_id, status);
