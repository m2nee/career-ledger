# Career Ledger v0.5

Career Ledger는 행사/프로젝트의 사실 입력을 바탕으로 행사 정보를 조사하고, 포트폴리오 및 경력기술서에 활용 가능한 결과로 정리하는 React 기반 MVP입니다.

## 출력 원칙

- 행사 개요는 3개 bullet 이내로 간결하게 표시합니다.
- 담당업무는 키워드형으로 표시합니다.
- 경력요약은 이력서/경력기술서에 붙일 수 있는 1~3개 짧은 문장으로 표시합니다.
- 긴 설명문, 자기소개서식 표현, 반복 문구를 피합니다.

## 출력 구조

1. 행사 개요
   - 행사 목적
   - 주요 주제 또는 아젠다
   - 주요 프로그램

2. 담당업무
   - 행사 기획
   - 참가자 관리
   - VIP 의전 지원

3. 경력요약
   - 행사 기획부터 현장 운영까지 전 과정 총괄.
   - 참가자 등록 체계 구축 및 관리 담당.
   - VIP 의전 및 운영인력 관리 수행.

## 검색 기반 개요

검색 우선순위:

1. `행사명 + 발주처 + 개최연도`
2. `행사명 + 발주처`
3. `행사명`
4. `행사명 + 개최연도`

검색 성공 시 `[검색 기반 개요]`로 표시합니다.

검색 실패 시 `[입력 기반 임시 개요]`로 표시하며, 입력 정보와 행사명 기반 내장 프로필을 사용해 임시 개요를 생성합니다.

## 데이터 구조

```js
{
  id: "event-id",
  ownerId: "local-browser-owner-id",
  source: {
    eventName: "행사명",
    client: "발주처",
    venue: "행사 장소",
    dateStart: "2026-06-11",
    dateEnd: "",
    isMultiDay: false,
    participationLevel: "메인 PM",
    tasks: ["참가자 관리", "VIP 의전"],
    customTask: "",
    participantScale: 300
  },
  ai: {
    eventOverview: [
      "해양안보 및 국방 현안 논의를 위한 정책 토론 행사",
      "군·산·학·연 관계자 참여",
      "전문가 발표, 패널토론, 관계기관 네트워킹 진행"
    ],
    overviewSource: "search | input",
    searchQuery: "제22회 함상토론회 해군본부 2026",
    searchUrl: "",
    eventType: "정책 토론 행사",
    taskTags: ["#참가자관리", "#VIP의전"],
    responsibilities: ["참가자 관리", "VIP 의전 지원"],
    careerSummary: [
      "행사 기획부터 현장 운영까지 전 과정 총괄.",
      "참가자 등록 체계 구축 및 관리 담당."
    ],
    portfolioText: "- 참가자 관리\n- VIP 의전 지원\n- 행사 기획부터 현장 운영까지 전 과정 총괄."
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
- Career Insights 표시
- 검색 기반/입력 기반 개요 구분
- 포트폴리오 문구 복사
- 브라우저/기기별 localStorage 분리 저장

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
- 향후 Supabase Auth 또는 Google Login을 붙일 때 `ownerId`를 실제 사용자 ID로 대체하면 됩니다.
