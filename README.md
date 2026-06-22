# Career Ledger v0.12

Career Ledger는 MICE PM의 행사 경험을 구조화하고 포트폴리오 작성 시간을 줄이는 React 기반 MVP입니다. 이번 버전은 AI 고도화보다 행사 데이터 구조 안정화와 KPI 확장 기반을 우선합니다.

## 핵심 방향

- 행사 기록 앱이 아니라 포트폴리오 작성 도구
- 행사 개요는 3~5초 안에 이해 가능한 3개 bullet
- 담당업무는 핵심 업무만 최대 5~7개 노출
- 주요 역할은 행사 특성과 참여수준을 반영한 최대 3개 문장
- 업무 성과는 확보한 경험과 역량 중심의 최대 3개 문장
- 행사 성격은 사용자가 직접 선택
- 공통 업무는 id 기반 `tasks` 배열로 저장
- 특수 업무는 `specialTasks`에 여러 줄 텍스트로 저장
- AI 생성 결과는 상세 화면에서 직접 수정 가능
- AI는 초안을 제공하고 사용자 수정본을 최종본으로 간주

## 검색 기반 개요

검색 우선순위:

1. `행사명 + 발주처 + 개최연도`
2. `행사명 + 발주처`
3. `행사명 + 개최연도`
4. `행사명 + 보도자료`
5. `행사명 + 개최`
6. `행사명 + 공지`
7. `행사명 + 축약 발주처 + 개최연도`
8. `행사명 + 축약 발주처`
9. `행사명 + 행사장소`
10. `발주처 + 행사명`
11. `행사명`

모든 검색어를 순차적으로 재시도하며, 상세 화면의 `시도한 검색어` 목록과 브라우저 console에서 확인할 수 있습니다.

검색 결과가 행사명과 충분히 일치하고 3건 이상 수집될 때만 `[검색 기반 생성]`으로 표시합니다.

검색 결과가 1~2건이면 `[검색 결과 부족]`으로 표시하고 개요 초안을 확정 생성하지 않습니다.

검색 결과가 없으면 `[공식 자료 없음]`으로 표시하고 가짜 개요를 생성하지 않습니다.

검색 결과는 다음 구조로 저장됩니다.

```js
researchStatus: "verified | insufficient | not_found",
searchAttemptedQueries: ["행사명 발주처 2026", "행사명 보도자료"],
researchResults: [
  {
    title: "검색 결과 제목",
    snippet: "검색 결과 요약",
    url: "https://...",
    domain: "example.org"
  }
],
researchPrompt: "검색 결과에 포함된 정보만 사용하도록 구성한 개요 생성 입력값"
```

## AI 결과 수정

상세 화면에서 다음 항목을 직접 수정할 수 있습니다.

- 행사 개요
- 행사유형
- 담당업무 표시 문구
- 주요 역할
- 업무 성과

수정된 내용은 현재 프로젝트의 `ai` 데이터에 저장되며 새로고침 후에도 유지됩니다.
AI 재생성 버튼은 제공하지 않습니다. 사용자가 직접 수정한 결과를 최종 포트폴리오 문구로 관리하는 흐름을 우선합니다.

## 출력 구조

### 행사 개요

- 해양안보 및 국방 현안 논의를 위한 정책 토론 행사
- 군·산·학·연 관계자 참여
- 전문가 발표, 패널토론, 네트워킹 진행

### 담당업무

- 행사 기획
- 사전등록 운영
- 참가자 관리
- 현장 총괄 운영
- 콘솔 운영
- 결과보고서 작성

### 주요 역할

- 해군작전기지 내 함정 공간에서 진행된 정책 토론 행사 운영.
- 사전등록, 참가자 관리, VIP 의전 및 현장 운영 전반 수행.
- 군 관계기관 및 협력사 간 운영 협업 관리.

### 업무 성과

- 보안 환경과 제한된 출입 절차를 고려한 행사 운영 경험 확보.
- VIP 의전 및 관계기관 협업 역량 강화.

## 데이터 구조

```js
{
  id: "event-id",
  ownerId: "local-browser-owner-id",
  source: {
    eventName: "행사명",
    client: "발주처",
    venue: "행사 장소",
    category: "정책포럼/컨퍼런스",
    dateStart: "2026-06-11",
    dateEnd: "",
    isMultiDay: false,
    participationLevel: "메인 PM",
    tasks: ["registration", "participant", "protocol"],
    specialTasks: "RFID 카드 사전 분류\n해군기지 출입정보 취합",
    participantScale: 300
  },
  title: "행사명",
  client: "발주처",
  period: {
    start: "2026-06-11",
    end: "",
    isMultiDay: false,
    label: "2026.06.11"
  },
  category: "정책포럼/컨퍼런스",
  tasks: ["registration", "participant", "protocol"],
  specialTasks: "RFID 카드 사전 분류\n해군기지 출입정보 취합",
  overview: [
    "해양안보 및 국방 현안 논의를 위한 정책 토론 행사",
    "군·산·학·연 관계자 참여",
    "전문가 발표, 패널토론, 관계기관 네트워킹 진행"
  ],
  overviewSource: "search | input",
  ai: {
    eventOverview: [
      "해양안보 및 국방 현안 논의를 위한 정책 토론 행사",
      "군·산·학·연 관계자 참여",
      "전문가 발표, 패널토론, 관계기관 네트워킹 진행"
    ],
    overviewSource: "search | input",
    searchQuery: "제22회 함상토론회 해군본부 2026",
    searchUrl: "",
    searchSourceName: "",
    researchStatus: "verified",
    researchResults: [
      {
        title: "검색 결과 제목",
        snippet: "검색 결과 요약",
        url: "https://example.org",
        domain: "example.org"
      }
    ],
    researchPrompt: "행사명, 발주기관, 개최연도, 검색 결과를 포함한 개요 생성 입력값",
    eventType: "정책 토론 행사",
    eventCharacteristics: ["국방", "해양안보", "함정", "보안 환경", "VIP 참석"],
    taskTags: ["#행사기획", "#참가자관리", "#VIP의전"],
    responsibilities: ["행사 기획", "참가자 관리", "VIP 의전 지원"],
    keyRoles: [
      "해군작전기지 내 함정 공간에서 진행된 정책 토론 행사 운영.",
      "사전등록, 참가자 관리, VIP 의전 및 현장 운영 전반 수행.",
      "군 관계기관 및 협력사 간 운영 협업 관리."
    ],
    outcomes: [
      "보안 환경과 제한된 출입 절차를 고려한 행사 운영 경험 확보.",
      "VIP 의전 및 관계기관 협업 역량 강화."
    ],
    manualEdits: {
      eventOverview: "2026-06-21T00:00:00.000Z",
      responsibilities: "2026-06-21T00:00:00.000Z",
      keyRoles: "2026-06-21T00:00:00.000Z",
      outcomes: "2026-06-21T00:00:00.000Z"
    },
    manuallyEditedAt: "2026-06-21T00:00:00.000Z",
    portfolioText: "- 행사 기획\n- 참가자 관리\n- 해군작전기지 내 함정 공간에서 진행된 정책 토론 행사 운영."
  }
}
```

## 구현된 기능

- 행사 저장, 목록 표시, 상세 보기
- 행사 수정, 삭제, 전체 초기화
- 행사 성격 직접 선택
- 공통 업무 id 기반 체크박스 저장
- 특수 업무 여러 줄 직접 입력
- 단일 날짜 및 기간 행사 입력
- 참여수준 라디오 버튼
- 검색 기반/입력 기반 임시 개요 구분
- 검색 기반 생성/검색 결과 부족/공식 자료 없음 상태 구분
- 검색 결과 3~5건의 제목, 요약, URL 저장 및 상세 화면 표시
- 검색 결과에 포함된 정보만 기반으로 행사 개요 초안 생성
- 행사명, 발주처, 연도, 장소 기반 검색 쿼리 강화
- 검색 실패 시 행사명, 발주처, 장소, 담당업무 기반 개요 초안 생성
- 정책 토론회, 학술 심포지엄, 국제회의, 시상식, 전시회, 박람회, 포럼, 축제, 컨퍼런스, 워크숍 등 행사유형 자동 분류
- 핵심 담당업무 추출
- 행사 특성 분석 기반 주요 역할 생성
- 경험과 역량 중심 업무 성과 생성
- AI 생성 결과 직접 수정 및 저장
- 직접 수정된 항목에 `직접 수정됨` 표시
- Career Insights 표시
- 포트폴리오 문구 복사
- 브라우저/기기별 localStorage 분리 저장
- 기존 한글 업무명 기반 localStorage 데이터 호환 로딩

## 로컬 실행

```bash
npm install
npm run dev -- --host 0.0.0.0
```

## Vercel 배포 설정

- Framework preset: `Vite`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

## 저장 방식

현재 프로젝트는 browser `localStorage`의 `career-ledger-events-v6` 키에 저장됩니다.

- 같은 브라우저에서는 새로고침 후에도 데이터가 유지됩니다.
- PC와 모바일, 다른 브라우저는 서로 데이터를 공유하지 않습니다.
- 최초 접속 시 샘플/테스트 데이터가 자동 생성되지 않습니다.
