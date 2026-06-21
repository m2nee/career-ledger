# Career Ledger v0.4

Career Ledger는 사용자가 행사/프로젝트의 사실만 입력하면 행사 정보를 조사하고, 포트폴리오 및 경력기술서에 활용 가능한 문구로 정리해주는 React 기반 MVP입니다.

## 핵심 방향

- 최소한의 입력으로 최대한의 결과를 만든다.
- 사용자는 행사명, 발주처, 장소, 날짜, 참여수준, 담당업무 같은 사실만 입력한다.
- AI 생성 로직은 행사 개요, 행사유형, 담당업무 문구, 업무 태그, 경력 요약을 만든다.
- 자기소개서식 서술보다 포트폴리오/경력기술서형 명사 문구를 우선한다.

## 행사 개요 생성 방식

행사명 입력 시 공개 검색을 먼저 시도합니다.

검색 우선순위:

1. `행사명 + 발주처`
2. `행사명`
3. `행사명 + 개최연도`

검색 성공 시:

- `[검색 기반 개요]`로 표시합니다.
- 검색어와 가능한 경우 출처 URL을 함께 저장합니다.
- 행사 목적, 개최 배경, 행사 성격, 주요 프로그램, 주최/주관 정보, 행사 특징을 이해할 수 있는 문장형 개요를 생성합니다.

검색 실패 시:

- `[입력 기반 임시 개요]`로 명확히 표시합니다.
- 행사명, 발주처, 장소, 날짜, 행사유형 추정값을 바탕으로 임시 개요를 생성합니다.
- 허준축제, 장애경제인대회, 함상토론회처럼 성격이 비교적 명확한 행사명은 내장 지식 프로필로 임시 개요 품질을 보강합니다.

## 데이터 구조

사용자 입력값과 AI 생성값을 분리했습니다.

```js
{
  id: "event-id",
  ownerId: "local-browser-owner-id",
  createdAt: "ISO timestamp",
  updatedAt: "ISO timestamp",
  source: {
    eventName: "행사명",
    client: "발주처",
    venue: "행사 장소",
    dateStart: "2026-06-11",
    dateEnd: "2026-06-13",
    isMultiDay: true,
    participationLevel: "메인 PM | 서브 PM | 현장 운영 지원",
    tasks: ["참가자 관리", "등록데스크 운영"],
    customTask: "",
    participantScale: 300
  },
  ai: {
    eventOverview: "행사 개요",
    overviewSource: "search | input",
    searchQuery: "검색어",
    searchUrl: "검색 결과 URL",
    eventType: "정책 토론 행사",
    taskTags: ["#참가자관리", "#등록데스크운영"],
    responsibilities: ["참가자 관리", "등록데스크 운영"],
    careerSummary: ["참가자 등록 체계 구축 및 관리"],
    portfolioText: "- 참가자 관리\n- 참가자 등록 체계 구축 및 관리"
  }
}
```

## 구현된 기능

- 행사 저장, 목록 표시, 상세 보기
- 행사 수정, 삭제, 전체 초기화
- 삭제/초기화 확인 모달
- 단일 날짜 및 기간 행사 입력
- 참여수준 라디오 버튼
- 담당업무 그룹별 체크박스와 기타 직접 입력
- Career Insights: 총 프로젝트 수, 메인 PM 건수, 서브 PM 건수, 누적 참가자 수, 최대 규모 행사, 연도별 프로젝트 수, 행사유형별 분포
- AI 결과: 행사 개요, 행사유형, 담당업무, 업무 태그, 경력 요약
- 포트폴리오 문구 복사
- 브라우저/기기별 localStorage 분리 저장

## 로컬 실행

```bash
npm install
npm run dev -- --host 0.0.0.0
```

## Vercel 배포

Vercel에서 GitHub Repository를 Import하면 CLI 인증 없이 배포할 수 있습니다.

- Framework preset: `Vite`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

`vercel.json`에 Vite 빌드 설정과 SPA fallback rewrite가 포함되어 있습니다.

## 저장 방식

현재 프로젝트는 browser `localStorage`의 `career-ledger-events-v5` 키에 저장됩니다.

- 같은 브라우저에서는 새로고침 후에도 데이터가 유지됩니다.
- PC와 모바일, 다른 브라우저는 서로 데이터를 공유하지 않습니다.
- 최초 접속 시 샘플/테스트 데이터가 자동 생성되지 않습니다.
- 브라우저 사이트 데이터 삭제 또는 시크릿 모드 종료 시 데이터가 사라질 수 있습니다.
- 향후 Supabase Auth 또는 Google Login을 붙일 때 `ownerId`를 실제 사용자 ID로 대체하면 됩니다.

## 다음 개발 우선순위

1. Supabase Edge Function 또는 서버 API 기반 검색 보강
2. OpenAI API 기반 실제 개요/문구 생성
3. Supabase DB와 인증 연동
4. 포트폴리오/경력기술서 내보내기
5. 행사유형별 문구 템플릿 고도화
