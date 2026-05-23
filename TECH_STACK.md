# Villie — 기술 스택 및 아키텍처 가이드라인

> AI 코딩 에이전트가 개발 환경을 구축하고 비즈니스 로직을 구현할 때 준수해야 할 프레임워크 및 의존성 스펙 정의.

---

## 1. 아키텍처 기조

| 원칙 | 내용 |
|------|------|
| Real-time & Geo-awareness | 위경도 기반 저지연 공간 쿼리 및 실시간 채팅 파이프라인 확보 |
| Trust & Verification Layer | 시니어 프로필 다차원 평판 연산 + AI 기반 서류/자격증 위변조 검증 모듈 고려 |
| Incremental Decoupling | MVP는 Monolithic DB로 속도 확보, 도메인 간 결합도를 낮춰 향후 MSA 전환 용이하게 설계 |

---

## 2. 레이어별 기술 스택

### 2.1 프론트엔드

> 하이퍼로컬 서비스 특성상 GPS, 푸시 알림, 카메라/앨범 등 Native 기능 제어 필수 → 크로스 플랫폼 채택.

| 항목 | 스택 | 선정 이유 |
|------|------|-----------|
| Framework | **React Native (Expo)** | Fast Refresh 기반 빠른 UI 프로토타이핑, Expo SDK로 Native API 무설정 제어 |
| Server State | **TanStack Query v5** | 매칭 피드·시니어 평점 캐싱 및 Optimistic Update 처리 |
| Local State | **Zustand** | 모달·필터 팝업 등 로컬 UI 상태를 경량화 분리 |
| Styling | **NativeWind v4** (Tailwind CSS) | 유틸리티 퍼스트 기반 빠른 레이아웃, 크로스 플랫폼 일관성 |
| Map / Geo-UI | **React Native Maps** | Google Maps / Apple Maps SDK wrapper |

### 2.2 백엔드 & 데이터베이스 (MVP Phase)

> 초기 인프라 비용 최소화 + 개발 가속을 위해 BaaS + 관계형 DB 조합 선택.

| 항목 | 스택 | 비고 |
|------|------|------|
| Core Platform | **Supabase** | BaaS |
| Database | **PostgreSQL v15+** | PostGIS 확장 필수 활성화 |
| Geo Query | `ST_DWithin`, `ST_Distance` | GIST spatial index 필수 적용 |
| Auth | **Supabase Auth** | 역할 기반 Row-Level Security 정책 수립 |
| Realtime | **Supabase Realtime** | WebSocket 기반 1:1 채팅 메시지 동기화 |
| Storage | **Supabase Storage** | 자격증 파일, 프로필 이미지 업로드 버킷 |

### 2.3 확장 아키텍처 (Scale-up Phase)

> 트래픽 확장 및 AI 모듈 연동 시점에 이식할 백엔드 스택. 에이전트는 이 구조로의 마이그레이션을 염두에 두고 코드를 작성한다.

| 항목 | 스택 | 선정 이유 |
|------|------|-----------|
| Backend Engine | **NestJS / TypeScript** | 구조적 안정성, DI 패턴으로 도메인 모듈화 용이 |
| Message Queue | **AWS SQS** | 리뷰 이벤트 → 시니어 평점 비동기 재연산 배치 파이프라인 |
| Pub/Sub Cache | **Redis Pub/Sub** | 대규모 푸시 알림 인큐잉 처리 |

### 2.4 AI Trust Layer (Phase 3)

> 시니어 프로필 신뢰성 보장을 위해 코어 시스템과 비동기로 격리된 AI 서브시스템 구성.

| 항목 | 스택 | 태스크 |
|------|------|--------|
| Runtime | **Python 3.10+ (FastAPI / Ray)** | AI 파이프라인 서빙 |
| CV Model | **DINOv2** (Vision Foundation Model) | 보육교사 자격증·신분증 위변조 탐지, Zero-shot Image Classification |
| NLP Model | **GPT-4o API** 또는 경량 로컬 LLM | 채팅 사기 패턴 탐지, 텍스트 리뷰 키워드 임베딩 → 평판 뱃지 자동 매핑 |

---

## 3. 핵심 데이터 플로우

### 3.1 위치 기반 쿼리 최적화 (PostGIS)

```sql
-- 대규모 공간 데이터를 위한 GIST 인덱스 (필수)
CREATE INDEX idx_care_requests_location ON care_requests USING GIST (location);

-- 특정 유저 위경도 반경 3km 이내의 RECRUITING 상태 돌봄글 조회
SELECT
    id,
    title,
    hourly_wage,
    ST_Distance(location, ST_MakePoint(127.0276, 37.4979)::geography) AS distance
FROM care_requests
WHERE
    ST_DWithin(location, ST_MakePoint(127.0276, 37.4979)::geography, 3000)
    AND status = 'RECRUITING'
ORDER BY distance ASC, created_at DESC;
```

### 3.2 로컬 개발 환경 세팅

```bash
# Docker 기반 PostGIS 컨테이너 구동 (또는 docker-compose up -d 사용)
docker run --name villie-postgres \
  -e POSTGRES_USER=villie_admin \
  -e POSTGRES_PASSWORD=villie_secure_pass \
  -e POSTGRES_DB=villie_db \
  -p 5432:5432 \
  -d postgis/postgis:15-3.3

# 백엔드 의존성 설치
cd backend
npm init -y
npm install @supabase/supabase-js dotenv
npm install -D typescript @types/node ts-node nodemon

# 프론트엔드 Expo 스캐폴딩
cd ../frontend
npx create-expo-app@latest . --template blank
npx expo install expo-location expo-image-picker
```

---

## 4. AI 에이전트 제약 조건

| 제약 | 내용 |
|------|------|
| **No Over-engineering** | MVP 단계에서 분산 락(Distributed Lock), Saga Pattern 등 복잡한 분산 트랜잭션 구현 금지. 데이터 정합성은 PostgreSQL 내부 트랜잭션 + FK 제약 수준으로 단순 해결. |
| **Type Safety** | `care_requests.target_age` (`INFANT`, `TODDLER`, `ELEMENTARY`)는 프론트·백엔드 모두 엄격한 Enum 또는 TypeScript 리터럴 타입으로 상호 매핑 강제. |
| **Privacy Defensiveness** | 유저 위경도 좌표(`location`)를 클라이언트에 Raw 형태로 직접 노출 금지. 거리 연산은 서버 내 PostGIS 함수로 처리하여 `"N km 이내"`, `"도보 N분 거리"` 형태의 가공 문자열로만 응답. |
