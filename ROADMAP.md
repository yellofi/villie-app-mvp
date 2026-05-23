# Villie — Phase 전환 로드맵

> 각 Phase는 이전 Phase의 코드베이스를 파괴하지 않고 확장하는 방식으로 설계한다.
> Monorepo(pnpm workspaces + Turborepo) 구조를 기반으로 패키지를 추가/교체한다.

---

## 레포 구조 (Monorepo 확정)

```
villie-app/
├── packages/
│   ├── shared/          # 공유 타입 · 상수 · 유틸 (Phase 1~3 공통)
│   ├── mobile/          # Expo React Native 앱 (Phase 1~3 공통)
│   └── backend/         # Phase 1: 얇은 Supabase 클라이언트 래퍼
│                        # Phase 2: NestJS로 전면 교체
├── supabase/
│   ├── migrations/      # DB 스키마 버전 관리
│   └── functions/       # Edge Functions (Phase 1 서버리스 로직)
├── docker-compose.yaml  # 로컬 개발용 PostGIS
├── turbo.json
└── package.json         # pnpm workspace root
```

---

## Phase 1 — MVP (현재)

**목표:** 핵심 매칭 플로우 검증. 인프라 비용 최소화.

### 스택
| 레이어 | 기술 |
|--------|------|
| Frontend | React Native (Expo) + NativeWind v4 |
| State | TanStack Query v5 + Zustand |
| Backend | Supabase BaaS (Auth · DB · Realtime · Storage) |
| DB | PostgreSQL 15 + PostGIS (Supabase 관리형) |
| Auth | Supabase Auth — SMS OTP |
| Realtime | Supabase Realtime (WebSocket) |

### 로컬 개발
```bash
docker-compose up -d   # PostGIS 로컬 컨테이너
```

### 이 Phase에서 확정된 결정 (변경 금지)
- `applications` 테이블 → 채팅 이전 단계 지원 관리
- `schedule_time VARCHAR` → 희망 초안, 실제 일정은 채팅 협의
- 완료 트리거 → 부모 수동 버튼
- 평점 업데이트 → 동기 트랜잭션

---

## Phase 1 → Phase 2 전환 조건

아래 지표 중 하나라도 충족되면 전환 검토:

- WAU 1,000명 초과
- 동시 채팅 연결 500개 초과 (Supabase Realtime 한계)
- 월 Supabase 비용 $200 초과
- AI 자격증 검증 모듈 연동 요구 발생

---

## Phase 2 — Scale-up

**목표:** 트래픽 대응 + AI 모듈 연동 준비. MSA 전환.

### 추가/변경되는 것

| 항목 | Phase 1 | Phase 2 |
|------|---------|---------|
| Backend | Supabase BaaS | **NestJS (TypeScript)** on AWS EKS |
| Auth | Supabase Auth SMS OTP | SMS OTP + **카카오 OAuth** 추가 |
| Realtime | Supabase Realtime | **Redis Pub/Sub** (채팅) |
| 알림 | 없음 | **AWS SQS** + Expo Push Notifications |
| 완료 트리거 | 수동 버튼 | 자동 알림 + 부모 확인 (Edge Function) |
| 메시지 타입 | TEXT only | TEXT + **IMAGE + SYSTEM** 메시지 |
| 평점 업데이트 | 동기 트랜잭션 | **SQS 비동기 배치** |

### packages/backend 전환 방법
```
Phase 1: packages/backend/src/supabase-client.ts  (얇은 래퍼)
Phase 2: packages/backend/src/main.ts             (NestJS 엔트리포인트)
         packages/matching-service/               (MSA 분리)
         packages/chat-service/
```
- `packages/shared` 타입은 그대로 재사용
- `packages/mobile`은 API 엔드포인트 URL만 환경변수로 교체

### 추가 인프라
```yaml
# docker-compose.yaml에 추가
services:
  redis:
    image: redis:7-alpine
  backend:
    build: ./packages/backend
    depends_on: [villie-db, redis]
```

---

## Phase 3 — AI Trust Layer

**목표:** 시니어 신원 신뢰도 자동화. 플랫폼 안전망 강화.

### 추가되는 AI 서브시스템 (코어와 비동기 격리)

| 모듈 | 기술 | 역할 |
|------|------|------|
| 자격증 검증 | Python FastAPI + DINOv2 | 보육교사 자격증·신분증 위변조 탐지, Zero-shot 분류 |
| 채팅 안전망 | GPT-4o API | 채팅 내 사기·이상 징후 감지 |
| 리뷰 분석 | GPT-4o API | 텍스트 리뷰 → 평판 뱃지 자동 매핑 |

### 패키지 추가
```
packages/
└── ai-trust/            # Python FastAPI (Ray 서빙)
    ├── cert_validator/  # DINOv2 기반 자격증 검증
    └── chat_monitor/    # LLM 기반 채팅 모니터링
```

### DB 변경 (비파괴적 추가)
```sql
-- senior_profiles에 AI 검증 결과 컬럼 추가
ALTER TABLE senior_profiles
  ADD COLUMN ai_cert_verified BOOLEAN DEFAULT false,
  ADD COLUMN ai_verified_at TIMESTAMPTZ;
```

---

## 확장 경로 요약

```
로그인     SMS OTP ──────────────────────► + 카카오 OAuth
완료트리거  수동 버튼 ─────────────────────► 자동 알림 + 확인
메시지     TEXT only ────────────────────► + IMAGE / SYSTEM
평점       동기 트랜잭션 ─────────────────► SQS 비동기 배치
백엔드     Supabase BaaS ────────────────► NestJS + EKS
채팅       Supabase Realtime ────────────► Redis Pub/Sub
신원인증   수동 뱃지 ───────────────────► AI 자동 검증
```
