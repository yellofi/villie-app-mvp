-- ================================================================
-- Row Level Security 정책
-- ================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE senior_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- users: 본인 프로필만 수정 가능, 조회는 모두 가능
CREATE POLICY "users_select" ON users FOR SELECT USING (true);
CREATE POLICY "users_update" ON users FOR UPDATE USING (auth.uid() = id);

-- senior_profiles: 조회 모두 가능, 수정은 본인만
CREATE POLICY "senior_profiles_select" ON senior_profiles FOR SELECT USING (true);
CREATE POLICY "senior_profiles_update" ON senior_profiles FOR UPDATE USING (auth.uid() = user_id);

-- user_locations: 본인 것만 read/write
CREATE POLICY "user_locations_own" ON user_locations
    USING (auth.uid() = user_id);

-- care_requests: 조회는 모두 가능, 작성/수정은 본인(parent)만
CREATE POLICY "care_requests_select" ON care_requests FOR SELECT USING (true);
CREATE POLICY "care_requests_insert" ON care_requests FOR INSERT
    WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "care_requests_update" ON care_requests FOR UPDATE
    USING (auth.uid() = parent_id);

-- applications: 본인 지원 or 해당 게시글 parent만
CREATE POLICY "applications_select" ON applications FOR SELECT
    USING (
        auth.uid() = senior_id
        OR auth.uid() = (SELECT parent_id FROM care_requests WHERE id = request_id)
    );
CREATE POLICY "applications_insert" ON applications FOR INSERT
    WITH CHECK (auth.uid() = senior_id);
CREATE POLICY "applications_update" ON applications FOR UPDATE
    USING (auth.uid() = (SELECT parent_id FROM care_requests WHERE id = request_id));

-- match_chats: 해당 채팅방 참여자만
CREATE POLICY "match_chats_select" ON match_chats FOR SELECT
    USING (auth.uid() = parent_id OR auth.uid() = senior_id);

-- chat_messages: 해당 채팅방 참여자만
CREATE POLICY "chat_messages_select" ON chat_messages FOR SELECT
    USING (
        auth.uid() IN (
            SELECT parent_id FROM match_chats WHERE id = chat_id
            UNION
            SELECT senior_id FROM match_chats WHERE id = chat_id
        )
    );
CREATE POLICY "chat_messages_insert" ON chat_messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- reviews: 조회는 모두, 작성은 reviewer(부모)만
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);
