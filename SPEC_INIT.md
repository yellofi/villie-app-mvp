# Villie — 하이퍼로컬 시니어 육아 돌봄 매칭 앱 요구 명세서

> AI 코딩 에이전트(Claude, Cursor 등)가 컨텍스트 오염 없이 즉각 개발에 착수할 수 있도록 설계된 기능 명세 및 기술 가이드라인.
>
> **최종 업데이트:** 2026-05-23 — 구현 방식 6개 항목 결정 반영 완료

---

## 1. 프로젝트 개요

### 1.1 제품 정의

- **제품명:** Villie (빌리)
- **핵심 가치:** 물리적 거리에 기반한 유저 간 **신뢰도(Reputation)** 를 정량화하여, 안심하고 아이를 맡길 수 있는 동네 시니어와 부모를 연결하는 돌봄 매칭 플랫폼.

### 1.2 북극성 지표 (North Star Metric)

- 주간 활성 동네 인증 유저 수 (WAU, 부모 및 시니어)
- 주간 돌봄 매칭 성사 수 및 완료 후 평판 피드백(리뷰) 작성률

---

## 2. 핵심 UI/UX 및 작동 원리

### 2.1 의도된 마찰 (Intentional Friction): 신원 및 동네 인증

| 항목 | 내용 |
|------|------|
| UX | 가입 시 부모/시니어 역할 선택. 글 작성(부모) 및 지원(시니어) 전 GPS 기반 동네 인증 필수. 시니어의 경우 추가 신원 인증(선택적 자격증 등) 뱃지 부여. |
| 작동 원리 | 카카오 로컬 API 혹은 자체 GeoIP를 통한 위경도 → 법정동 맵핑. |

### 2.2 공간 인덱싱 (Spatial Indexing)

| 항목 | 내용 |
|------|------|
| UX | 부모: "우리 동네 반경 N km 내 활동 가능한 시니어" 우선 노출. 시니어: "내 주변 도보 이동 가능한 돌봄 요청글" 우선 노출. |
| 작동 원리 | PostgreSQL PostGIS `ST_DWithin` 활용 공간 인덱싱 적용 (단순 `WHERE` 절 대신). |

### 2.3 다차원 실시간 평판 알고리즘 (Multi-dimensional Reputation Engine)

| 항목 | 내용 |
|------|------|
| UX | 전체 평점 + [영유아 / 유치원생 / 초등학생] 연령대별 세부 평점을 직관적 아이콘과 함께 제공. |
| 작동 원리 | 돌봄 완료 후 부모 리뷰 데이터 기반으로, 해당 아이의 연령대 카테고리 스코어를 독립 가중 연산하여 시니어 프로필 DB에 동기 트랜잭션으로 업데이트. |

### 2.4 피드 정렬 알고리즘

시니어에게 노출되는 돌봄 요청 피드는 다음 우선순위로 정렬한다:

```
1순위: 부스트 게시글 (boosted_until > NOW())
2순위: 급구 게시글 (is_urgent = true)
3순위: 거리 가까운 순 (ST_Distance ASC)
4순위: 최신 순 (created_at DESC)
```

---

## 3. 기능 요구사항 명세 (Functional Requirements)

### [P0] 온보딩 및 역할 기반 프로필

- **REQ-001:** 유저는 가입 시 `[부모(구인)]` 또는 `[시니어(구직)]` 역할을 선택한다.
- **REQ-002:** 시니어 프로필에는 전체 평점 및 연령대별 세부 평점(영유아, 유아, 초등 등)이 노출되어야 한다.

### [P0] 위치 기반 돌봄 요청 피드 (Care Request Geo-Feed)

- **REQ-003:** 부모는 새 돌봄 요청글 작성 시 다음 항목을 필수 입력한다.
  - 대상 연령 (`INFANT` / `TODDLER` / `ELEMENTARY`)
  - 돌봄 희망 시간 (`schedule_time` — 참고용 초안, 실제 일정은 채팅 협의로 확정)
  - 시급 (급여)
  - 업무 범위 체크리스트 (예: 하원, 간식 챙기기, 목욕 등)
  - 급구 여부 (`is_urgent`) — 선택

- **REQ-004:** 피드는 유저가 인증한 동네 코드를 기준으로 반경 내 요청글만 노출하며, 시니어 화면에서는 시급 및 시간 정보가 태그 형태로 강조되어야 한다. 급구 게시글에는 🚨 뱃지를 표시한다.

### [P0] 지원 및 매칭 플로우

- **REQ-005:** 시니어는 요청글에서 `지원하기` 버튼을 눌러 지원한다. 이때 `applications` 테이블에 레코드가 생성되며, 부모는 해당 시니어의 상세 프로필(연령별 평점)을 열람할 수 있다.
- **REQ-005-1:** 시니어는 지원 시 간단한 소개 메시지를 함께 전송할 수 있다 (`applications.message`).
- **REQ-006:** 부모는 지원자 목록 화면에서 특정 시니어를 `[수락하기]`로 확정한다. 수락 시:
  - `applications.status` → `ACCEPTED`
  - 해당 요청글의 나머지 지원 → `REJECTED` (자동 처리)
  - `match_chats` 레코드 생성 (채팅방 개설)
  - `care_requests.status` → `MATCHED`
- **REQ-006-1:** 채팅방 내에서 부모와 시니어는 실제 확정 일정을 협의하며, 합의된 내용은 `match_chats.agreed_schedule`에 저장한다.

### [P0] 다차원 평판 피드백 시스템 (Reputation Engine)

- **REQ-007:** 부모가 채팅방 내 `돌봄 완료하기` 버튼을 누르면 `care_requests.status` → `COMPLETED` 로 변경되고, 평가 팝업이 노출된다.
- **REQ-008:** 평가는 해당 아동의 연령대 기준 만족도(1~5점) 및 정성적 뱃지(시간 약속을 잘 지켜요, 아이를 진심으로 예뻐해요 등)로 구성된다.
- **REQ-008-1:** 리뷰 등록 시 동기 트랜잭션으로 `senior_profiles`의 해당 연령대 점수 및 `total_score`를 즉시 업데이트한다.

### [P1] 부스트 (상단 노출) 기능

- **REQ-009:** 부모는 캐시 아이템을 사용하여 게시글을 피드 최상단에 노출시킬 수 있다 (`boosted_until` 만료 시각 설정).
- **REQ-009-1:** 부스트 + 급구 조합 시 시급은 시장 평균 대비 높게 설정하도록 UI에서 권장 가이드를 제공한다.

---

## 4. 데이터베이스 엔티티 구조 (Confirmed MVP Schema)

> PostgreSQL + PostGIS 기반. 아래 스키마가 확정 버전이며 AI 에이전트는 이를 기준으로 마이그레이션을 수행한다.

```sql
-- Extension 활성화
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

-- 2. 시니어 상세 프로필 (연령대별 평점 관리)
CREATE TABLE senior_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_score NUMERIC(3, 2) DEFAULT 0.00,
    score_infant NUMERIC(3, 2) DEFAULT 0.00,      -- 영유아 (0~3세)
    score_toddler NUMERIC(3, 2) DEFAULT 0.00,     -- 유아 (4~7세)
    score_elementary NUMERIC(3, 2) DEFAULT 0.00,  -- 초등학생
    verified_badges TEXT[]                         -- 신원/보육교사 자격증 등
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
--    schedule_time: 부모가 원하는 희망 일정 (참고용 초안, 실제 확정은 채팅 협의)
CREATE TABLE care_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    target_age VARCHAR(20) NOT NULL CHECK (target_age IN ('INFANT', 'TODDLER', 'ELEMENTARY')),
    hourly_wage INT NOT NULL,
    schedule_time VARCHAR(100) NOT NULL,   -- 희망 일정 초안 (예: "월, 수 16:00~19:00")
    tasks TEXT[] NOT NULL,                 -- 업무 범위 체크리스트
    is_urgent BOOLEAN DEFAULT false,       -- 급구 여부 (🚨 뱃지 + 피드 상단 노출 우선)
    boosted_until TIMESTAMPTZ DEFAULT NULL, -- 캐시 부스트 만료 시각 (NULL = 부스트 없음)
    status VARCHAR(20) DEFAULT 'RECRUITING' CHECK (status IN ('RECRUITING', 'MATCHED', 'COMPLETED')),
    b_code VARCHAR(10) NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. 지원 테이블 (채팅 개설 전 단계)
--    시니어가 지원 → 부모가 목록에서 수락 → match_chats 생성
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES care_requests(id) ON DELETE CASCADE,
    senior_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
    message TEXT,  -- 시니어의 지원 소개 메시지 (선택)
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (request_id, senior_id)  -- 중복 지원 방지
);

-- 6. 채팅방 테이블 (수락 이후에만 생성)
--    agreed_schedule: 채팅 협의로 확정된 실제 돌봄 일정
CREATE TABLE match_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES care_requests(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES users(id),
    senior_id UUID REFERENCES users(id),
    agreed_schedule TEXT,  -- 채팅으로 협의된 최종 확정 일정
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
    reviewer_id UUID REFERENCES users(id),  -- 부모
    reviewee_id UUID REFERENCES users(id),  -- 시니어
    target_age VARCHAR(20) NOT NULL CHECK (target_age IN ('INFANT', 'TODDLER', 'ELEMENTARY')),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_badges TEXT[],
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 4.1 인덱스

```sql
-- 공간 인덱스 (필수)
CREATE INDEX idx_care_requests_location ON care_requests USING GIST (location);
CREATE INDEX idx_user_locations_location ON user_locations USING GIST (location);

-- 피드 정렬 성능
CREATE INDEX idx_care_requests_feed ON care_requests (boosted_until DESC NULLS LAST, is_urgent DESC, created_at DESC);

-- 채팅 조회 성능
CREATE INDEX idx_chat_messages_chat_id ON chat_messages (chat_id, created_at DESC);

-- 미읽음 메시지 조회
CREATE INDEX idx_chat_messages_unread ON chat_messages (chat_id, is_read) WHERE is_read = false;

-- 지원 목록 조회
CREATE INDEX idx_applications_request ON applications (request_id, status);
```

### 4.2 핵심 쿼리 패턴

```sql
-- 시니어 피드: 반경 3km 이내 모집중 게시글 (부스트→급구→거리→최신 순)
SELECT
    id, title, hourly_wage, schedule_time, target_age, is_urgent,
    ST_Distance(location, ST_MakePoint(:lng, :lat)::geography) AS distance
FROM care_requests
WHERE
    ST_DWithin(location, ST_MakePoint(:lng, :lat)::geography, 3000)
    AND status = 'RECRUITING'
ORDER BY
    (boosted_until > NOW()) DESC,
    is_urgent DESC,
    distance ASC,
    created_at DESC;

-- 채팅방 미읽음 뱃지 카운트
SELECT chat_id, COUNT(*) AS unread_count
FROM chat_messages
WHERE chat_id = :chat_id
  AND sender_id != :my_id
  AND is_read = false
GROUP BY chat_id;
```

---

## 5. 확정된 구현 결정사항 (Decision Log)

> 설계 과정에서 검토 후 확정된 항목. AI 에이전트는 이 결정을 번복하지 않는다.

| # | 항목 | 결정 | 이유 |
|---|------|------|------|
| D-01 | 채팅 메시지 테이블 | `is_read` + `read_at` 포함 | 미읽음 뱃지 UI 필수 |
| D-02 | `schedule_time` | `VARCHAR` 유지 (희망 초안) | 실제 일정은 채팅 협의로 확정. 구조화 불필요 |
| D-03 | 지원-채팅 분리 | `applications` 테이블 별도 생성 | 채팅 전 부모의 지원자 목록 비교 UX 확보 |
| D-04 | 매칭 플로우 | 지원 → 목록 확인 → 수락 → 채팅 | 채팅 선 개설 시 변수 과다, 정합성 복잡 |
| D-05 | 완료 트리거 | 부모 수동 `완료하기` 버튼 | MVP 단순성 우선. Phase 2에서 자동화 예정 |
| D-06 | 로그인 수단 | SMS OTP (Phase 1) | 전화번호 = 신원 확인 수단. 어르신 접근성 확보 |
| D-07 | 급구/부스트 | `is_urgent`, `boosted_until` 컬럼 추가 | 피드 상단 노출 및 캐시 수익화 기반 |
| D-08 | 평점 업데이트 | 리뷰 등록 시 동기 트랜잭션 | MVP 단순성 우선. Phase 2에서 비동기 전환 |

---

## 5-1. 기술 부채 / 미완료 TODO

> 의도적으로 임시 처리한 항목. 유저 테스트 전 반드시 해소해야 함.

| # | 항목 | 현재 상태 | 해야 할 일 | 우선순위 |
|---|------|-----------|------------|----------|
| TD-01 | SMS OTP 실제 발송 | Supabase `Enable phone confirmations` **OFF** — OTP 없이 즉시 인증됨 | Twilio 계정 생성 후 Account SID / Auth Token / Messaging Service SID 입력, 토글 ON으로 복원. `PhoneInputScreen`의 분기 로직도 원복 필요 | **유저 테스트 전 필수** |
| TD-02 | 세션 영속성 | `persistSession: true`이지만 스토리지 어댑터 없음 — 앱 재시작 시 로그아웃됨 | `AsyncStorage` 설치 후 `supabase.ts`에 storage 어댑터 연결, `App.tsx`에 `onAuthStateChange` 리스너 추가 | **Supabase 연결 시 즉시** |
| TD-03 | 동네 인증 | "건너뛰기" 버튼으로 임시 통과 | GPS → 법정동 코드(`b_code`) 추출 후 `user_locations` 테이블 upsert | 핵심 기능, 조기 구현 권장 |
| TD-04 | 신규/재방문 유저 분기 | OTP 인증 후 항상 `RoleSelect`로 이동 | `users` 테이블 조회 → 프로필 있으면 피드로, 없으면 온보딩으로 분기 | **Supabase 연결 시 즉시** |

---

## 6. 단계별 확장 시나리오 및 인프라 로드맵

| Phase | 단계 | 내용 |
|-------|------|------|
| **Phase 1** | MVP | Supabase + PostGIS. SMS OTP 인증. 수동 완료 트리거. |
| **Phase 2** | Scale-up | AWS EKS MSA 전환. 카카오 OAuth 추가 (D-06 확장). 완료 자동 알림+확인 도입 (D-05 확장). 채팅 메시지 타입 확장 (TEXT→IMAGE/SYSTEM). SQS 푸시 알림 비동기 처리. |
| **Phase 3** | AI Trust | DINOv2 기반 자격증 위변조 탐지. GPT-4o 기반 채팅 이상 징후 감지. LLM 리뷰 키워드 → 평판 뱃지 자동 매핑. |

### 주요 확장 경로 (A → C)

```
로그인:    SMS OTP → (카카오 OAuth Provider 추가) → 멀티 프로바이더
완료 트리거: 수동 버튼 → (Edge Function + 푸시 알림) → 자동 알림 + 부모 확인
메시지:    TEXT only → (type + metadata 컬럼 추가) → IMAGE / SYSTEM 메시지 지원
평점 업데이트: 동기 트랜잭션 → (SQS 도입) → 비동기 배치 재연산
```

---

## 7. AI 코딩 에이전트 개발 가이드라인

- **Schema Priority:** `posts`가 아닌 `care_requests` 기반으로 UI와 비즈니스 로직을 구축할 것.
- **매칭 플로우:** `applications` → 수락 → `match_chats` 순서를 반드시 준수할 것. 채팅방을 지원 즉시 생성하지 않는다.
- **schedule_time 처리:** `care_requests.schedule_time`은 희망 초안으로만 표시. 실제 확정 일정은 `match_chats.agreed_schedule`을 사용.
- **Review Aggregation:** 리뷰 작성 시 동기 트랜잭션으로 `senior_profiles`의 해당 연령대 점수와 `total_score`를 함께 업데이트할 것.
- **Location Query:** 피드 조회 시 `ST_DWithin` 사용. 원시 좌표를 클라이언트에 노출하지 말 것. 거리는 `"도보 N분"` 또는 `"N km 이내"` 포맷으로 가공 후 응답.
- **Feed Sort:** 반드시 `boosted_until → is_urgent → distance → created_at` 4단계 정렬을 준수할 것.
- **Type Safety:** `target_age`, `user_type`, `status` 필드는 TypeScript `const` 또는 `enum`으로 엄격히 타입 매핑할 것.
- **No Over-engineering:** MVP 단계에서 분산 락, Saga Pattern 구현 금지. 데이터 정합성은 PostgreSQL FK + CHECK 제약으로 해결.
