# Career Ledger v0.6

Career Ledger는 행사 기록을 경력 자산으로 전환하는 React 기반 MVP입니다. 사용자는 행사 사실만 입력하고, 앱은 행사 개요와 포트폴리오용 담당업무 및 경력요약을 생성합니다.

## 핵심 방향

- 행사 기록 앱이 아니라 포트폴리오 작성 도구
- 행사 개요는 3~5초 안에 이해 가능한 3개 bullet
- 담당업무는 핵심 업무만 최대 5~7개 노출
- 경력요약은 의미가 겹치지 않는 최대 3개 문장
- 전체 선택값은 `source.tasks`에 저장하고, 화면 표시용 핵심 업무는 `ai.responsibilities`에 별도 생성

## 검색 기반 개요

검색 우선순위:

1. `행사명 + 발주처 + 개최연도`
2. `행사명 + 발주처`
3. `행사명`
4. `행사명 + 개최연도`

검색 성공 시 `[검색 기반 개요]`로 표시합니다.

검색 실패 시 `[입력 기반 임시 개요]`로 표시합니다. `[입력 기반 AI 개요]` 표현은 사용하지 않습니다.

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

### 경력요약

- 행사 기획부터 현장 운영까지 전 과정 총괄
- 참가자 등록 체계 구축 및 운영
- 발주처·협력사·연사 간 운영 협업 관리

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
    tasks: ["행사 기획", "참가자 관리", "VIP 의전"],
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
    taskTags: ["#행사기획", "#참가자관리", "#VIP의전"],
    responsibilities: ["행사 기획", "참가자 관리", "VIP 의전 지원"],
    careerSummary: [
      "행사 기획부터 현장 운영까지 전 과정 총괄",
      "참가자 등록 체계 구축 및 운영",
      "발주처·협력사·연사 간 운영 협업 관리"
    ],
    portfolioText: "- 행사 기획\n- 참가자 관리\n- 행사 기획부터 현장 운영까지 전 과정 총괄"
  }
}
```

## 구현된 기능

- 행사 저장, 목록 표시, 상세 보기
- 행사 수정, 삭제, 전체 초기화
- 단일 날짜 및 기간 행사 입력
- 참여수준 라디오 버튼
- 담당업무 그룹별 체크박스와 기타 직접 입력
- 검색 기반/입력 기반 임시 개요 구분
- 핵심 담당업무 추출
- 반복을 줄인 경력요약 생성
- Career Insights 표시
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
