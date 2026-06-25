import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  Copy,
  Edit3,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'career-ledger-events-v6';
const OWNER_KEY = 'career-ledger-owner-id';

const participationLevels = ['메인 PM', '서브 PM', '현장 운영 지원'];

const categoryGroups = [
  { label: '회의/토론형', items: ['컨퍼런스', '포럼', '심포지엄', '세미나', '토론회', '간담회', '워크숍'] },
  { label: '공식행사형', items: ['기념식', '개회식', '폐회식', '준공식', '선포식', '발대식'] },
  { label: '시상/평가형', items: ['시상식', '심사평가회', '성과발표회', '공모전'] },
  { label: '전시/홍보형', items: ['전시회', '박람회', '체험행사'] },
  { label: '교류형', items: ['상담회', '네트워킹', '국제교류행사'] },
  { label: '문화형', items: ['축제', '공연', '문화행사'] },
  { label: '교육형', items: ['교육', '연수', '설명회'] },
  { label: '기타', items: ['기타'] },
];

const categoryOptions = categoryGroups.flatMap((group) => group.items);

const legacyCategoryAliases = {
  '정책포럼/컨퍼런스': '컨퍼런스',
  국제교류: '국제교류행사',
  '심사/평가': '심사평가회',
  시상식: '시상식',
  '전시/박람회': '전시회',
  '교육/연수': '교육',
  '위원회/회의': '간담회',
  기업행사: '네트워킹',
  야외축제: '축제',
};

const taskGroups = [
  {
    title: '행사 기획',
    items: [
      { id: 'proposal', label: '제안서 작성' },
      { id: 'program_planning', label: '프로그램 기획' },
      { id: 'operation_plan', label: '실행계획안 작성' },
      { id: 'layout', label: '행사장 도면 제작' },
      { id: 'scenario', label: '시나리오 작성' },
      { id: 'budget', label: '예산 관리' },
    ],
  },
  {
    title: '참가자 관리',
    items: [
      { id: 'pre_registration', label: '사전등록 운영' },
      { id: 'participant', label: '참석자 관리' },
      { id: 'speaker', label: '연사 관리' },
      { id: 'homepage', label: '홈페이지 운영' },
      { id: 'notification', label: '안내메일/문자 발송' },
      { id: 'participant_db', label: '참석자 DB 관리' },
    ],
  },
  {
    title: '행사 운영',
    items: [
      { id: 'registration', label: '등록데스크 운영' },
      { id: 'stage', label: '무대 운영' },
      { id: 'console', label: '콘솔 운영' },
      { id: 'protocol', label: 'VIP 의전' },
      { id: 'onsite', label: '현장 운영' },
      { id: 'streaming', label: '온라인 송출 운영' },
      { id: 'shuttle', label: '셔틀 운영' },
    ],
  },
  {
    title: '운영 지원',
    items: [
      { id: 'materials', label: '제작물 관리' },
      { id: 'vendor', label: '협력업체 관리' },
      { id: 'av', label: '시스템/AV 운영' },
      { id: 'space', label: '공간 조성' },
      { id: 'staff', label: '현장 인력 관리' },
      { id: 'safety', label: '안전 관리' },
    ],
  },
  {
    title: '사후 관리',
    items: [
      { id: 'report', label: '결과보고서 작성' },
      { id: 'survey', label: '만족도 조사 관리' },
      { id: 'statement', label: '산출내역서 작성' },
      { id: 'settlement', label: '정산 관리' },
      { id: 'archive', label: '결과자료 취합 및 배포' },
    ],
  },
];

const commonTasks = taskGroups.flatMap((group) => group.items);
const taskById = Object.fromEntries(commonTasks.map((task) => [task.id, task]));
const legacyTaskAliases = {
  '제안서 작성': 'proposal',
  '프로그램 기획': 'program_planning',
  '운영계획 수립': 'operation_plan',
  '실행계획안 작성': 'operation_plan',
  '행사장 도면 제작': 'layout',
  '시나리오 작성': 'scenario',
  'MC 시나리오 작성': 'scenario',
  '예산 관리': 'budget',
  '사전등록 운영': 'pre_registration',
  '등록데스크 운영': 'registration',
  '참가자 관리': 'participant',
  '참석자 관리': 'participant',
  '참석자 DB 관리': 'participant_db',
  '현장 총괄 운영': 'onsite',
  현장운영: 'onsite',
  '현장 운영': 'onsite',
  '연사 관리': 'speaker',
  연사관리: 'speaker',
  'VIP 의전': 'protocol',
  의전: 'protocol',
  '무대 운영': 'stage',
  '콘솔 운영': 'console',
  '협력사 관리': 'vendor',
  '협력업체 관리': 'vendor',
  'AV 운영': 'av',
  '시스템 운영': 'av',
  '시스템석/AV 운영': 'av',
  '시스템/AV 운영': 'av',
  '생중계 운영': 'streaming',
  '온라인 플랫폼 운영': 'streaming',
  '온라인 송출 운영': 'streaming',
  '홈페이지 운영': 'homepage',
  '안내메일/문자 발송': 'notification',
  '셔틀 운영': 'shuttle',
  '제작물 관리': 'materials',
  '공간 조성': 'space',
  '현장 인력 관리': 'staff',
  '안전 관리': 'safety',
  '결과보고서 작성': 'report',
  '만족도 조사 관리': 'survey',
  '산출내역서 작성': 'statement',
  '정산 관리': 'settlement',
  '결과자료 취합 및 배포': 'archive',
};

const taskPhraseMap = {
  proposal: { responsibility: '제안서 작성', summary: '제안서 작성 및 실행 전략 문서화' },
  program_planning: { responsibility: '프로그램 기획', summary: '프로그램 기획 및 구성안 정리' },
  operation_plan: { responsibility: '실행계획안 작성', summary: '실행계획안 작성 및 운영 체계 정리' },
  layout: { responsibility: '행사장 도면 제작', summary: '행사장 배치 및 도면 제작' },
  scenario: { responsibility: '시나리오 작성', summary: '행사 시나리오 및 진행 흐름 설계' },
  budget: { responsibility: '예산 관리', summary: '예산 계획 및 집행 관리' },
  pre_registration: { responsibility: '사전등록 운영', summary: '사전등록 프로세스 운영' },
  registration: { responsibility: '등록데스크 운영', summary: '등록데스크 운영 및 현장 응대 관리' },
  participant: { responsibility: '참석자 관리', summary: '참석자 등록 체계 구축 및 관리' },
  speaker: { responsibility: '연사 관리', summary: '연사 커뮤니케이션 및 발표 준비 관리' },
  homepage: { responsibility: '홈페이지 운영', summary: '행사 홈페이지 운영 및 정보 관리' },
  notification: { responsibility: '안내메일/문자 발송', summary: '참석자 안내 커뮤니케이션 관리' },
  participant_db: { responsibility: '참석자 DB 관리', summary: '참석자 DB 정리 및 운영 관리' },
  stage: { responsibility: '무대 운영', summary: '무대 진행 및 큐시트 관리' },
  console: { responsibility: '콘솔 운영', summary: '콘솔 운영 및 현장 진행 신호 관리' },
  protocol: { responsibility: 'VIP 의전', summary: 'VIP 의전 및 동선 관리' },
  onsite: { responsibility: '현장 운영', summary: '현장 운영 총괄' },
  streaming: { responsibility: '온라인 송출 운영', summary: '온라인 송출 운영 및 품질 관리' },
  shuttle: { responsibility: '셔틀 운영', summary: '참석자 이동 및 셔틀 운영 관리' },
  materials: { responsibility: '제작물 관리', summary: '제작물 제작 및 현장 반영 관리' },
  vendor: { responsibility: '협력업체 관리', summary: '협력업체 및 운영인력 관리' },
  av: { responsibility: '시스템/AV 운영', summary: '시스템 및 AV 운영 관리' },
  space: { responsibility: '공간 조성', summary: '행사 공간 구성 및 조성 관리' },
  staff: { responsibility: '현장 인력 관리', summary: '현장 인력 배치 및 운영 관리' },
  safety: { responsibility: '안전 관리', summary: '안전 운영 기준 및 현장 리스크 관리' },
  report: { responsibility: '결과보고서 작성', summary: '결과보고서 작성 및 성과 정리' },
  survey: { responsibility: '만족도 조사 관리', summary: '만족도 조사 운영 및 결과 정리' },
  statement: { responsibility: '산출내역서 작성', summary: '산출내역서 작성 및 증빙 정리' },
  settlement: { responsibility: '정산 관리', summary: '정산 자료 취합 및 비용 관리' },
  archive: { responsibility: '결과자료 취합 및 배포', summary: '결과자료 취합 및 관계자 배포' },
};

const responsibilityPriority = [
  'proposal',
  'program_planning',
  'operation_plan',
  'layout',
  'scenario',
  'budget',
  'pre_registration',
  'participant',
  'speaker',
  'homepage',
  'notification',
  'participant_db',
  'registration',
  'stage',
  'console',
  'protocol',
  'onsite',
  'streaming',
  'shuttle',
  'materials',
  'vendor',
  'av',
  'space',
  'staff',
  'safety',
  'report',
  'survey',
  'statement',
  'settlement',
  'archive',
];

const eventKnowledgeProfiles = [
  {
    keywords: ['함상토론회'],
    type: '정책 토론 행사',
    characteristics: ['국방', '해양안보', '함정', '보안 환경', 'VIP 참석'],
    overviewBullets: [
      '해양안보 및 국방 현안 논의를 위한 정책 토론 행사',
      '군·산·학·연 관계자 참여',
      '전문가 발표, 패널토론, 관계기관 네트워킹 진행',
    ],
    keyRoles: [
      '해군작전기지 내 함정 공간에서 진행된 정책 토론 행사 운영.',
      '사전등록, 참가자 관리, VIP 의전 및 현장 운영 전반 수행.',
      '군 관계기관 및 협력사 간 운영 협업 관리.',
    ],
    outcomes: [
      '보안 환경과 제한된 출입 절차를 고려한 행사 운영 경험 확보.',
      'VIP 의전 및 관계기관 협업 역량 강화.',
    ],
  },
  {
    keywords: ['허준축제'],
    type: '지역 문화축제',
    characteristics: ['지역축제', '공연', '체험 프로그램', '시민 참여형 행사'],
    overviewBullets: [
      '허준 선생의 업적과 한의학·건강 문화를 알리는 지역 문화축제',
      '시민 참여형 전시, 체험, 공연 프로그램 운영',
      '지역 역사문화 자원과 건강 콘텐츠 결합',
    ],
    keyRoles: [
      '시민 참여형 지역축제 프로그램 운영.',
      '공연, 체험, 전시 콘텐츠 중심의 현장 운영 및 참가자 동선 관리.',
      '방문객 응대와 협력사 운영을 포함한 축제 현장 관리.',
    ],
    outcomes: [
      '시민 참여형 축제 운영 경험 확보.',
      '공연·체험 프로그램과 현장 동선을 통합 관리하는 운영 역량 강화.',
    ],
  },
  {
    keywords: ['장애경제인대회', '장애인경제인대회'],
    type: '성과 공유 및 교류 행사',
    characteristics: ['시상식', '정부기관', '포상', '기업 교류', '정책 발표'],
    overviewBullets: [
      '장애인기업 성과 공유 및 경제활동 활성화 지원 행사',
      '우수 장애경제인 포상 및 정책 발표 진행',
      '기업 교류 및 우수사례 공유 프로그램 운영',
    ],
    keyRoles: [
      '정부기관 및 장애인기업 관계자가 참여한 시상·정책 행사 운영.',
      '포상 프로그램, 참가자 관리, 현장 진행 및 관계자 응대 수행.',
      '기업 교류와 정책 발표 흐름에 맞춘 운영 협업 관리.',
    ],
    outcomes: [
      '시상식 및 정책행사 운영 경험 확보.',
      '포상 프로그램과 현장 운영을 병행하며 공식 행사 대응 역량 강화.',
    ],
  },
  {
    keywords: ['KERIS', '케리스', '교육학술정보원'],
    type: '학술행사',
    characteristics: ['교육', '연구성과 공유', '다중 트랙 세션', '온라인 송출', '학술행사'],
    overviewBullets: [
      'KERIS 연구성과 공유 및 미래교육 방향 논의를 위한 심포지엄',
      '교육 분야 전문가 및 관계기관 참여',
      '기조강연, 연구성과 발표 및 다중 트랙 세션 운영',
    ],
    keyRoles: [
      '다중 트랙 세션 기반 학술행사 운영.',
      '제작물 관리, 홈페이지 운영, 사전등록자 관리 및 온라인 송출 운영 지원.',
      '세션별 진행 흐름 및 행사 운영 전반 관리.',
    ],
    outcomes: [
      '다중 세션 기반 컨퍼런스 운영 경험 확보.',
      '등록·제작물·온라인 송출을 통합 관리하며 복합 행사 운영 역량 강화.',
    ],
  },
];

const emptyForm = {
  eventName: '',
  client: '',
  venue: '',
  category: categoryOptions[0],
  dateStart: '',
  dateEnd: '',
  isMultiDay: false,
  participationLevel: '메인 PM',
  tasks: [],
  specialTasks: '',
  participantScale: '',
};

function createId(prefix) {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getOwnerId() {
  const saved = localStorage.getItem(OWNER_KEY);
  if (saved) return saved;
  const ownerId = createId('local-user');
  localStorage.setItem(OWNER_KEY, ownerId);
  return ownerId;
}

function loadProjects(ownerId) {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeProject).filter((project) => project.ownerId === ownerId && project.source?.eventName);
  } catch {
    return [];
  }
}

function normalizeTaskId(task) {
  if (!task) return '';
  if (taskById[task]) return task;
  return legacyTaskAliases[task] || '';
}

function normalizeTaskIds(tasks = []) {
  return [...new Set(tasks.map(normalizeTaskId).filter(Boolean))];
}

function normalizeCategory(category) {
  if (!category) return categoryOptions[0];
  if (categoryOptions.includes(category)) return category;
  return legacyCategoryAliases[category] || categoryOptions[0];
}

function getTaskLabel(taskIdOrLabel) {
  return taskById[taskIdOrLabel]?.label || taskIdOrLabel;
}

function parseSpecialTasks(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean).join('\n');
  return String(value || '').trim();
}

function getSpecialTaskList(source = {}) {
  return parseSpecialTasks(source.specialTasks)
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getCommonTaskLabels(source = {}) {
  return normalizeTaskIds(source.tasks || []).map(getTaskLabel);
}

function buildPeriod(source) {
  return {
    start: source.dateStart || '',
    end: source.isMultiDay ? source.dateEnd || '' : '',
    isMultiDay: Boolean(source.isMultiDay),
    label: formatEventDate(source),
  };
}

function normalizeSource(source = {}, project = {}) {
  const dateStart = source.dateStart || project.period?.start || '';
  const dateEnd = source.dateEnd || project.period?.end || '';
  const isMultiDay = source.isMultiDay ?? Boolean(dateEnd);
  const specialTasks = parseSpecialTasks(source.specialTasks || project.specialTasks || source.customTask || '');

  return {
    ...emptyForm,
    ...source,
    eventName: source.eventName || project.title || '',
    client: source.client || project.client || '',
    venue: source.venue || '',
    category: normalizeCategory(source.category || project.category),
    dateStart,
    dateEnd,
    isMultiDay,
    tasks: normalizeTaskIds(source.tasks || project.tasks || []),
    specialTasks,
    customTask: '',
  };
}

function normalizeProject(project) {
  const source = normalizeSource(project.source, project);
  const ai = project.ai || {};
  const overview = project.overview || ai.eventOverview || [];
  const eventFeatures = ai.eventFeatures || project.eventFeatures || [];
  const operationPoints = ai.operationPoints || project.operationPoints || ai.responsibilities || [];
  const overviewSource = project.overviewSource || ai.overviewSource || 'input';
  const year = project.year || getSourceYear(source);
  const roleType = project.roleType || source.participationLevel;

  return {
    ...project,
    id: project.id || createId('event'),
    title: project.title || source.eventName,
    client: project.client || source.client,
    year,
    roleType,
    period: project.period || buildPeriod(source),
    category: normalizeCategory(project.category || source.category),
    tasks: normalizeTaskIds(project.tasks || source.tasks || []),
    specialTasks: parseSpecialTasks(project.specialTasks || source.specialTasks),
    overview,
    eventFeatures,
    operationPoints,
    overviewSource,
    researchStatus: project.researchStatus || ai.researchStatus || (overviewSource === 'search' ? 'verified' : overviewSource),
    researchResults: project.researchResults || ai.researchResults || [],
    searchAttemptedQueries: project.searchAttemptedQueries || ai.searchAttemptedQueries || [],
    searchProvider: project.searchProvider || ai.searchProvider || '',
    searchFailureReason: project.searchFailureReason || ai.searchFailureReason || '',
    searchAttemptDiagnostics: project.searchAttemptDiagnostics || ai.searchAttemptDiagnostics || [],
    createdAt: project.createdAt || new Date().toISOString(),
    updatedAt: project.updatedAt || project.createdAt || new Date().toISOString(),
    source,
    ai: {
      ...ai,
      eventOverview: ai.eventOverview || overview,
      eventFeatures,
      operationPoints,
      overviewSource,
    },
  };
}

function buildProjectRecord({ id, ownerId, source, ai, createdAt }) {
  return {
    id,
    ownerId,
    title: source.eventName,
    client: source.client,
    year: getSourceYear(source),
    roleType: source.participationLevel,
    period: buildPeriod(source),
    category: source.category,
    tasks: source.tasks,
    specialTasks: source.specialTasks,
    overview: ai.eventOverview,
    eventFeatures: ai.eventFeatures || [],
    operationPoints: ai.operationPoints || [],
    overviewSource: ai.overviewSource,
    researchStatus: ai.researchStatus,
    researchResults: ai.researchResults || [],
    searchAttemptedQueries: ai.searchAttemptedQueries || [],
    searchProvider: ai.searchProvider || '',
    searchFailureReason: ai.searchFailureReason || '',
    searchAttemptDiagnostics: ai.searchAttemptDiagnostics || [],
    createdAt,
    updatedAt: new Date().toISOString(),
    source,
    ai,
  };
}

function formatDate(date) {
  if (!date) return '';
  return date.replaceAll('-', '.');
}

function formatEventDate(source) {
  if (source.isMultiDay && source.dateEnd) return `${formatDate(source.dateStart)} ~ ${formatDate(source.dateEnd)}`;
  return formatDate(source.dateStart);
}

function getProjectYear(project) {
  const match = String(project.year || project.period?.start || project.source.dateStart || '').match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

function getSourceYear(source) {
  const match = source.dateStart?.match(/\d{4}/);
  return match ? match[0] : '';
}

function getTaskList(source) {
  return [...getCommonTaskLabels(source), ...getSpecialTaskList(source)];
}

function getKnowledgeProfile(eventName) {
  const compactName = eventName.replace(/\s/g, '');
  return eventKnowledgeProfiles.find((profile) => profile.keywords.some((keyword) => compactName.includes(keyword)));
}

function inferEventType(sourceOrName) {
  const eventName = typeof sourceOrName === 'string' ? sourceOrName : sourceOrName.eventName;
  if (typeof sourceOrName !== 'string' && sourceOrName.category && sourceOrName.category !== '기타') return sourceOrName.category;
  const sourceText =
    typeof sourceOrName === 'string'
      ? sourceOrName
      : `${sourceOrName.eventName} ${sourceOrName.client} ${sourceOrName.venue} ${getTaskList(sourceOrName).join(' ')}`;
  const name = sourceText.replace(/\s/g, '');
  const profile = getKnowledgeProfile(eventName);
  if (profile) return profile.type;

  const rules = [
    ['정책토론회', '정책 토론회'],
    ['함상토론회', '정책 토론회'],
    ['토론회', '정책 토론회'],
    ['심포지엄', '학술 심포지엄'],
    ['국제회의', '국제회의'],
    ['국제컨퍼런스', '국제회의'],
    ['총회', '국제회의'],
    ['학술대회', '학술행사'],
    ['포럼', '포럼'],
    ['세미나', '세미나'],
    ['컨퍼런스', '컨퍼런스'],
    ['축제', '축제'],
    ['페스티벌', '축제'],
    ['시상식', '시상식'],
    ['포상', '시상식'],
    ['어워드', '시상식'],
    ['대회', '시상·교류 행사'],
    ['박람회', '박람회'],
    ['전시회', '전시회'],
    ['전시', '전시회'],
    ['워크숍', '워크숍'],
    ['워크샵', '워크숍'],
    ['교육', '교육 프로그램'],
  ];
  return rules.find(([keyword]) => name.includes(keyword))?.[1] || '행사';
}

function buildTaskTags(tasks) {
  return tasks.map((task) => `#${task.replace(/\s/g, '')}`).slice(0, 8);
}

function buildPortfolioResponsibilities(tasks) {
  if (tasks.length === 0) return ['행사 운영'];
  const sorted = [...tasks].sort((a, b) => {
    const indexA = responsibilityPriority.indexOf(normalizeTaskId(a) || a);
    const indexB = responsibilityPriority.indexOf(normalizeTaskId(b) || b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  return sorted.slice(0, 7).map((task) => {
    const taskId = normalizeTaskId(task);
    return taskPhraseMap[taskId]?.responsibility || getTaskLabel(task);
  });
}

function getUniqueLimited(items, limit) {
  return [...new Set(items.filter(Boolean))].slice(0, limit);
}

function analyzeEventCharacteristics(source, eventType, searchResult) {
  const tasks = getTaskList(source);
  const profile = getKnowledgeProfile(source.eventName);
  const text = `${source.eventName} ${source.client} ${source.venue} ${eventType} ${searchResult?.text || ''}`;
  const compactText = text.replace(/\s/g, '');
  const characteristics = [...(profile?.characteristics || [])];
  const addWhen = (keywords, values) => {
    if (keywords.some((keyword) => compactText.includes(keyword.replace(/\s/g, '')))) {
      characteristics.push(...values);
    }
  };

  addWhen(['함상', '해군', '국방', '안보', '군'], ['국방', '해양안보', '보안 환경']);
  addWhen(['심포지엄', '학술', '컨퍼런스', '포럼', '세미나', '교육', '연구'], ['학술행사', '연구성과 공유', '다중 트랙 세션']);
  addWhen(['축제', '페스티벌', '문화'], ['지역축제', '공연', '시민 참여형 행사']);
  addWhen(['시상', '포상', '어워드'], ['시상식', '포상']);
  addWhen(['대회', '정책'], ['정책 발표', '관계기관 협업']);

  if (tasks.some((task) => ['온라인 플랫폼 운영', '생중계 운영', '온라인 송출 운영'].includes(task))) characteristics.push('온라인 송출');
  if (tasks.some((task) => ['의전', 'VIP 의전'].includes(task))) characteristics.push('VIP 참석');
  if (tasks.some((task) => ['전시 운영', '공간 조성', '부대행사 운영', '행사장 도면 제작'].includes(task))) characteristics.push('공간 운영');
  if (tasks.some((task) => ['사전등록 운영', '참석자 관리', '참가자 관리', '등록데스크 운영', '참석자 DB 관리'].includes(task))) characteristics.push('참가자 관리');

  if (characteristics.length === 0) characteristics.push(eventType, '현장 운영', '관계자 협업');
  return getUniqueLimited(characteristics, 6);
}

function buildFallbackKeyRoles(source, eventType, characteristics) {
  const tasks = getTaskList(source);
  const responsibilities = buildPortfolioResponsibilities(tasks);
  const hasAny = (items) => tasks.some((task) => items.includes(task));
  const context = characteristics.slice(0, 2).join('·') || eventType;
  const roleText = {
    '메인 PM': `${context} 특성을 반영한 ${eventType} 운영 총괄.`,
    '서브 PM': `${context} 특성을 고려한 ${eventType} 세부 운영 관리.`,
    '현장 운영 지원': `${context} 환경에 맞춘 ${eventType} 현장 운영 지원.`,
  }[source.participationLevel];
  const roles = [roleText];

  if (hasAny(['사전등록 운영', '참석자 관리', '참가자 관리', '등록데스크 운영', '참석자 DB 관리'])) {
    roles.push('사전등록, 참가자 관리 및 현장 등록 운영 수행.');
  }

  if (hasAny(['협력업체 관리', '협력사 관리', '연사관리', '연사 관리', '의전', 'VIP 의전', '현장 인력 관리'])) {
    roles.push('발주처, 협력사, 연사 및 주요 참석자 간 운영 협업 관리.');
  }

  if (hasAny(['무대 운영', '콘솔 운영', 'AV 운영', '시스템석/AV 운영', '시스템/AV 운영', '생중계 운영', '온라인 플랫폼 운영', '온라인 송출 운영', '시스템 운영'])) {
    roles.push('무대·기술·송출 흐름에 맞춘 현장 진행 관리.');
  }

  if (hasAny(['공간 조성', '전시 운영', '부대행사 운영', '동선 관리', '행사장 도면 제작', '셔틀 운영', '제작물 관리'])) {
    roles.push('행사 공간 구성, 전시·부대행사 및 참가자 동선 운영.');
  }

  if (roles.length === 1 && responsibilities.length > 0) {
    roles.push(`${responsibilities.slice(0, 3).join(', ')} 중심 운영 수행.`);
  }

  return getUniqueLimited(roles, 3);
}

function buildFallbackOutcomes(source, eventType, characteristics) {
  const tasks = getTaskList(source);
  const hasAny = (items) => tasks.some((task) => items.includes(task));
  const characteristicsText = characteristics.slice(0, 2).join('·') || eventType;
  const outcomes = [`${characteristicsText} 기반 ${eventType} 운영 경험 확보.`];

  if (hasAny(['사전등록 운영', '참석자 관리', '참가자 관리', '등록데스크 운영', '참석자 DB 관리'])) {
    outcomes.push('등록·참가자 관리 체계를 통합 운영하는 실무 역량 강화.');
  }

  if (hasAny(['협력업체 관리', '협력사 관리', '연사관리', '연사 관리', '의전', 'VIP 의전', '현장 인력 관리'])) {
    outcomes.push('주요 이해관계자 응대 및 운영 협업 역량 강화.');
  }

  if (hasAny(['무대 운영', '콘솔 운영', 'AV 운영', '시스템석/AV 운영', '시스템/AV 운영', '생중계 운영', '온라인 플랫폼 운영', '온라인 송출 운영', '시스템 운영'])) {
    outcomes.push('현장 진행과 기술 운영을 병행하는 복합 행사 대응 역량 강화.');
  }

  if (hasAny(['결과보고서 작성', '정산 관리', '산출내역서 작성', '만족도 조사 관리', '결과자료 취합 및 배포'])) {
    outcomes.push('운영 결과 정리 및 사후 관리 프로세스 수행 경험 확보.');
  }

  return getUniqueLimited(outcomes, 3);
}

function buildKeyRoles(source, eventType, characteristics) {
  const profile = getKnowledgeProfile(source.eventName);
  if (profile?.keyRoles?.length) return profile.keyRoles.slice(0, 3);
  return buildFallbackKeyRoles(source, eventType, characteristics);
}

function buildOutcomes(source, eventType, characteristics) {
  const profile = getKnowledgeProfile(source.eventName);
  if (profile?.outcomes?.length) return profile.outcomes.slice(0, 3);
  return buildFallbackOutcomes(source, eventType, characteristics);
}

function buildSearchQueries(source) {
  const eventName = source.eventName.trim();
  const client = source.client.trim();
  const venue = source.venue.trim();
  const year = getSourceYear(source);
  const compactClient = client
    .replace(/\([^)]*\)/g, '')
    .replace(/주식회사|재단법인|사단법인|기관|센터|본부|청|부|처$/g, '')
    .trim();
  const baseQueries = [
    [eventName, client, year].filter(Boolean).join(' '),
    [eventName, client].filter(Boolean).join(' '),
    [eventName, year].filter(Boolean).join(' '),
    [eventName, '보도자료'].filter(Boolean).join(' '),
    [eventName, '개최'].filter(Boolean).join(' '),
    [eventName, '공지'].filter(Boolean).join(' '),
    [eventName, compactClient, year].filter(Boolean).join(' '),
    [eventName, compactClient].filter(Boolean).join(' '),
    [eventName, venue].filter(Boolean).join(' '),
    [client, eventName].filter(Boolean).join(' '),
    eventName,
  ];

  return baseQueries
    .map((query) => query.replace(/\s+/g, ' ').trim())
    .filter((query, index, queries) => query && queries.indexOf(query) === index);
}

function flattenRelatedTopics(topics = []) {
  return topics.flatMap((item) => {
    if (item.Text) return [{ text: item.Text, url: item.FirstURL || '' }];
    if (item.Topics) return flattenRelatedTopics(item.Topics);
    return [];
  });
}

function normalizeSearchText(text) {
  return text.replace(/\s+/g, ' ').replace(/\[[^\]]+\]/g, '').trim();
}

function getDomainName(url = '') {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

const searchConfig = {
  serperApiKey: import.meta.env.VITE_SERPER_API_KEY || '',
  tavilyApiKey: import.meta.env.VITE_TAVILY_API_KEY || '',
};

function getSearchEnvDiagnostics() {
  return {
    mode: import.meta.env.MODE,
    dev: Boolean(import.meta.env.DEV),
    prod: Boolean(import.meta.env.PROD),
    hasTavilyKey: Boolean(import.meta.env.VITE_TAVILY_API_KEY),
    hasSerperKey: Boolean(import.meta.env.VITE_SERPER_API_KEY),
    exposedSearchEnvKeys: Object.keys(import.meta.env).filter((key) => key.includes('TAVILY') || key.includes('SERPER')),
  };
}

console.info('[Career Ledger] search env diagnostics', getSearchEnvDiagnostics());

function scoreSearchCandidate(candidate, source) {
  const text = `${candidate.title || ''} ${candidate.text || ''}`;
  const title = candidate.title || '';
  const snippet = candidate.text || '';
  const compactText = text.replace(/\s/g, '');
  const compactTitle = title.replace(/\s/g, '');
  const compactSnippet = snippet.replace(/\s/g, '');
  const compactName = source.eventName.replace(/\s/g, '');
  const compactClient = source.client.replace(/\s/g, '');
  const compactVenue = source.venue.replace(/\s/g, '');
  const year = getSourceYear(source);
  const infoKeywords = ['목적', '개최', '주최', '주관', '프로그램', '아젠다', '정책', '축제', '대회', '토론', '포럼', '행사', '참석', '참여', '지원', '문화', '교류', '발표', '장소'];
  let score = 0;
  const nameTokens = compactName
    .split(/제?\d+회|202\d|20\d{2}|[·ㆍ\-_]/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2);
  const titleMatched = compactName.length >= 2 && compactTitle.includes(compactName);
  const snippetMatched = compactName.length >= 2 && compactSnippet.includes(compactName);
  const tokenMatched = nameTokens.some((token) => compactText.includes(token));
  const nameMatched = titleMatched || snippetMatched || tokenMatched;
  const clientMatched = compactClient.length >= 2 && compactText.includes(compactClient);
  const venueMatched = compactVenue.length >= 2 && compactText.includes(compactVenue);
  const yearMatched = Boolean(year && compactText.includes(year));

  if (titleMatched) score += 6;
  if (snippetMatched) score += 5;
  if (!titleMatched && !snippetMatched && tokenMatched) score += 3;
  if (clientMatched) score += 3;
  if (venueMatched) score += 2;
  if (yearMatched) score += 2;
  infoKeywords.forEach((keyword) => {
    if (text.includes(keyword)) score += 1;
  });
  if (text.length > 80) score += 1;

  const hasSnippet = normalizeSearchText(snippet).length >= 24;
  const isReliable = nameMatched && hasSnippet && score >= 5;
  const exclusionReasons = [];
  if (!nameMatched) exclusionReasons.push('titleMismatch');
  if (!snippetMatched && !tokenMatched) exclusionReasons.push('snippetMismatch');
  if (!hasSnippet) exclusionReasons.push('snippetTooShort');
  if (score < 5) exclusionReasons.push('scoreTooLow');

  return {
    score,
    nameMatched,
    titleMatched,
    snippetMatched,
    tokenMatched,
    clientMatched,
    venueMatched,
    yearMatched,
    isReliable,
    exclusionReasons,
  };
}

async function fetchSearchCandidates(query, source) {
  const endpoint = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(4500) });
  if (!response.ok) throw new Error(`DuckDuckGo request failed: ${response.status}`);
  const data = await response.json();
  const candidates = [
    { text: data.AbstractText, url: data.AbstractURL || '', title: data.Heading || source.eventName },
    ...flattenRelatedTopics(data.RelatedTopics),
  ].filter((candidate) => candidate.text && normalizeSearchText(candidate.text).length > 40);

  const scored = candidates.map((candidate) => ({
      ...candidate,
      query,
      snippet: normalizeSearchText(candidate.text),
      url: candidate.url || '',
      text: normalizeSearchText(candidate.text),
      title: candidate.title || source.eventName,
      provider: 'duckduckgo',
      ...scoreSearchCandidate(candidate, source),
    }));
  const filtered = scored.filter((candidate) => candidate.isReliable).sort((a, b) => b.score - a.score);
  return {
    provider: 'duckduckgo',
    rawResultCount: candidates.length,
    filteredResultCount: filtered.length,
    candidates: filtered,
    rejected: scored.filter((candidate) => !candidate.isReliable).slice(0, 5),
  };
}

async function fetchSerperCandidates(query, source) {
  if (!searchConfig.serperApiKey) {
    return { provider: 'serper', rawResultCount: 0, filteredResultCount: 0, candidates: [], rejected: [], skipped: 'missingApiKey' };
  }
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': searchConfig.serperApiKey,
    },
    body: JSON.stringify({
      q: query,
      gl: 'kr',
      hl: 'ko',
      num: 5,
    }),
    signal: AbortSignal.timeout(5500),
  });
  if (!response.ok) throw new Error(`Serper request failed: ${response.status}`);
  const data = await response.json();
  const raw = data.organic || [];
  const scored = raw.map((item) => ({
      title: item.title || source.eventName,
      text: normalizeSearchText(item.snippet || ''),
      snippet: normalizeSearchText(item.snippet || ''),
      url: item.link || '',
      query,
      provider: 'serper',
      ...scoreSearchCandidate({ title: item.title, text: item.snippet }, source),
    }));
  const filtered = scored.filter((candidate) => candidate.text && candidate.isReliable).sort((a, b) => b.score - a.score);
  return {
    provider: 'serper',
    rawResultCount: raw.length,
    filteredResultCount: filtered.length,
    candidates: filtered,
    rejected: scored.filter((candidate) => !candidate.isReliable).slice(0, 5),
  };
}

async function fetchTavilyCandidates(query, source) {
  if (!searchConfig.tavilyApiKey) {
    return { provider: 'tavily', rawResultCount: 0, filteredResultCount: 0, candidates: [], rejected: [], skipped: 'missingApiKey' };
  }
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: searchConfig.tavilyApiKey,
      query,
      search_depth: 'basic',
      max_results: 5,
      include_answer: false,
    }),
    signal: AbortSignal.timeout(5500),
  });
  if (!response.ok) throw new Error(`Tavily request failed: ${response.status}`);
  const data = await response.json();
  const raw = data.results || [];
  const scored = raw.map((item) => ({
      title: item.title || source.eventName,
      text: normalizeSearchText(item.content || ''),
      snippet: normalizeSearchText(item.content || ''),
      url: item.url || '',
      query,
      provider: 'tavily',
      ...scoreSearchCandidate({ title: item.title, text: item.content }, source),
    }));
  const filtered = scored.filter((candidate) => candidate.text && candidate.isReliable).sort((a, b) => b.score - a.score);
  return {
    provider: 'tavily',
    rawResultCount: raw.length,
    filteredResultCount: filtered.length,
    candidates: filtered,
    rejected: scored.filter((candidate) => !candidate.isReliable).slice(0, 5),
  };
}

async function fetchSearchCandidatesByProvider(query, source) {
  if (searchConfig.serperApiKey) return fetchSerperCandidates(query, source);
  if (searchConfig.tavilyApiKey) return fetchTavilyCandidates(query, source);
  return fetchSearchCandidates(query, source);
}

function getActiveSearchProvider() {
  if (searchConfig.serperApiKey) return 'serper';
  if (searchConfig.tavilyApiKey) return 'tavily';
  return 'duckduckgo';
}

function getProviderSelectionReason() {
  if (searchConfig.serperApiKey) return 'serperKeyDetected';
  if (searchConfig.tavilyApiKey) return 'tavilyKeyDetected';
  return 'noSearchApiKeyDetected';
}

async function searchEventInfo(source) {
  const attemptedQueries = buildSearchQueries(source);
  if (!source.eventName || !window.fetch) {
    return {
      status: 'not_found',
      query: attemptedQueries[0] || '',
      results: [],
      attemptedQueries,
    };
  }

  const collected = [];
  const seen = new Set();
  const provider = getActiveSearchProvider();
  const attemptDiagnostics = [];

  console.info('[Career Ledger] search config', {
    provider,
    providerSelectionReason: getProviderSelectionReason(),
    ...getSearchEnvDiagnostics(),
  });

  for (const query of attemptedQueries) {
    try {
      const attempt = await fetchSearchCandidatesByProvider(query, source);
      const candidates = attempt.candidates || [];
      const rejected = (attempt.rejected || []).map((candidate) => ({
        title: candidate.title,
        score: candidate.score,
        exclusionReasons: candidate.exclusionReasons,
        titleMatched: candidate.titleMatched,
        snippetMatched: candidate.snippetMatched,
        tokenMatched: candidate.tokenMatched,
      }));
      attemptDiagnostics.push({
        query,
        provider: attempt.provider || provider,
        rawResultCount: attempt.rawResultCount || 0,
        filteredResultCount: attempt.filteredResultCount || 0,
        rejected,
      });
      console.info('[Career Ledger] search attempt', {
        provider: attempt.provider || provider,
        query,
        providerSelectionReason: getProviderSelectionReason(),
        hasTavilyKey: Boolean(searchConfig.tavilyApiKey),
        hasSerperKey: Boolean(searchConfig.serperApiKey),
        rawResultCount: attempt.rawResultCount || 0,
        filteredResultCount: attempt.filteredResultCount || 0,
        rejected,
      });
      candidates.forEach((candidate) => {
        const key = candidate.url || `${candidate.title}-${candidate.text}`;
        if (seen.has(key)) return;
        seen.add(key);
        collected.push({
          title: candidate.title,
          snippet: candidate.snippet || candidate.text,
          url: candidate.url,
          query,
          score: candidate.score,
          provider: candidate.provider || 'duckduckgo',
          domain: getDomainName(candidate.url),
        });
      });
      if (collected.length >= 5) break;
    } catch (error) {
      attemptDiagnostics.push({
        query,
        provider,
        rawResultCount: 0,
        filteredResultCount: 0,
        error: error?.message || 'unknown error',
      });
      console.info('[Career Ledger] search attempt failed', {
        provider,
        query,
        providerSelectionReason: getProviderSelectionReason(),
        hasTavilyKey: Boolean(searchConfig.tavilyApiKey),
        hasSerperKey: Boolean(searchConfig.serperApiKey),
        message: error?.message || 'unknown error',
      });
      // Continue to the next query when browser/network restrictions block a request.
    }
  }

  const results = collected.sort((a, b) => b.score - a.score).slice(0, 5);
  const failureReason =
    results.length > 0
      ? ''
      : attemptDiagnostics.some((attempt) => attempt.rawResultCount > 0)
        ? 'allResultsFilteredOut'
        : attemptDiagnostics.some((attempt) => attempt.error)
          ? 'apiError'
          : 'noRawResults';
  console.info('[Career Ledger] search summary', {
    provider,
    providerSelectionReason: getProviderSelectionReason(),
    ...getSearchEnvDiagnostics(),
    attemptedQueries,
    attempts: attemptDiagnostics,
    collected: results.length,
    failureReason,
  });

  return {
    status: results.length >= 3 ? 'verified' : results.length > 0 ? 'insufficient' : 'not_found',
    query: results[0]?.query || attemptedQueries[0] || '',
    results,
    attemptedQueries,
    provider,
    attemptDiagnostics,
    failureReason,
  };
}

function buildProfileOverviewBullets(profile) {
  return profile.overviewBullets.slice(0, 3);
}

function buildInputOverviewBullets(source, eventType) {
  const profile = getKnowledgeProfile(source.eventName);
  if (profile) return buildProfileOverviewBullets(profile);

  const tasks = getTaskList(source);
  const text = `${source.eventName} ${source.client} ${source.venue} ${tasks.join(' ')}`;
  const has = (keywords) => includesAny(text, keywords);
  const host = source.client || '관계기관';
  let purpose = `${host} 주요 의제와 운영 현안을 공유하는 ${eventType}`;
  let agenda = '참석자 및 관계기관 대상 핵심 주제 공유';
  let program = '발표, 교류 및 현장 프로그램 운영';

  if (has(['KERIS', '케리스', '교육학술정보원', '교육', '연구', '학술', '심포지엄'])) {
    purpose = `${source.client || '교육 분야'} 연구성과 공유 및 미래교육 방향 논의를 위한 ${eventType}`;
    agenda = '교육 분야 전문가 및 관계기관 참여';
    program = has(['생중계', '유튜브', '홈페이지', '다중', '트랙'])
      ? '기조강연, 연구성과 발표 및 다중 트랙 세션 운영'
      : '기조강연, 연구성과 발표 및 세션 프로그램 운영';
  } else if (has(['함상', '해군', '국방', '안보'])) {
    purpose = '해양안보 및 국방 현안 논의를 위한 정책 토론 행사';
    agenda = '군·산·학·연 관계자 참여';
    program = '전문가 발표, 패널토론 및 관계기관 네트워킹 진행';
  } else if (has(['장애', '경제인', '기업', '포상', '시상'])) {
    purpose = '장애인기업 성과 공유 및 경제활동 활성화 지원 행사';
    agenda = '우수 장애경제인 포상 및 정책 의제 공유';
    program = '정책 발표, 기업 교류 및 우수사례 공유 프로그램 운영';
  } else if (has(['축제', '페스티벌', '문화', '공연', '체험'])) {
    purpose = '지역 문화 콘텐츠와 시민 참여 확대를 위한 축제';
    agenda = '지역 주민 및 방문객 대상 문화·체험 프로그램 운영';
    program = '공연, 전시, 체험 및 부대행사 운영';
  } else if (has(['국제', '회의', '컨퍼런스'])) {
    purpose = '국내외 전문가와 관계기관이 참여하는 국제회의';
    agenda = '산업·정책 의제 공유 및 글로벌 교류';
    program = '기조연설, 세션 발표, 패널토론 및 네트워킹 운영';
  } else if (has(['전시', '박람회', '부스'])) {
    purpose = '산업 정보와 주요 콘텐츠를 소개하는 전시·박람회';
    agenda = '참가기업, 관계기관 및 방문객 대상 전시 콘텐츠 공유';
    program = '전시 부스, 상담, 부대행사 및 현장 관람 동선 운영';
  } else if (has(['워크숍', '워크샵'])) {
    purpose = '실무 역량 강화와 과제 논의를 위한 워크숍';
    agenda = '참가자 대상 교육, 토론 및 실행 과제 공유';
    program = '강의, 그룹 활동, 실습 및 결과 공유 프로그램 운영';
  }

  return [
    purpose,
    agenda,
    program,
  ];
}

function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function buildSearchSignals(text) {
  const signals = [];

  if (includesAny(text, ['정책', '현안', '안보', '국방'])) signals.push('정책·현안 논의');
  if (includesAny(text, ['성과', '우수사례', '사례'])) signals.push('성과 및 우수사례 공유');
  if (includesAny(text, ['시상', '포상', '유공'])) signals.push('시상·포상 프로그램');
  if (includesAny(text, ['교육', '연구', '학술'])) signals.push('교육·연구 의제 공유');
  if (includesAny(text, ['축제', '문화', '공연', '체험'])) signals.push('문화·체험 프로그램');
  if (includesAny(text, ['기업', '교류', '네트워킹'])) signals.push('기업 교류 및 네트워킹');
  if (includesAny(text, ['발표', '강연', '세션', '토론', '패널'])) signals.push('발표·토론 세션');
  if (includesAny(text, ['전시', '부스'])) signals.push('전시·부스 운영');
  if (includesAny(text, ['참석', '참여', '대상'])) signals.push('관계자 및 참석 대상 참여');

  return getUniqueLimited(signals, 4);
}

const categoryDraftGuides = {
  컨퍼런스: {
    purpose: '주요 의제 공유와 산업·정책 논의를 위한 컨퍼런스',
    features: ['기조강연 및 세션 중심 구성', '전문가·관계기관 참여', '발표 및 네트워킹 프로그램 운영'],
    operation: ['세션 운영 관리', '연사 및 발표자료 관리', '참가자 등록 체계 운영'],
  },
  포럼: {
    purpose: '주요 현안과 발전 방향을 논의하는 포럼',
    features: ['의제 중심 발표 및 토론 구성', '전문가·기관 관계자 참여', '정책·사업 방향 공유'],
    operation: ['발표 및 토론 진행 관리', '연사·패널 운영', '참가자 및 관계기관 응대'],
  },
  심포지엄: {
    purpose: '전문 분야 지식과 성과를 공유하는 심포지엄',
    features: ['학술·전문 주제 중심 세션', '연구성과 및 사례 발표', '전문가 교류 프로그램 운영'],
    operation: ['세션별 진행 관리', '연사 및 발표자료 관리', '등록·안내 운영'],
  },
  세미나: {
    purpose: '전문 지식 전달과 실무 정보 공유를 위한 세미나',
    features: ['강연 및 질의응답 중심 구성', '참가자 대상 정보 제공', '소규모 집중형 프로그램 운영'],
    operation: ['강연 진행 관리', '참가자 안내 및 등록 운영', '자료 배포 및 현장 응대'],
  },
  토론회: {
    purpose: '주요 현안에 대한 의견 수렴과 논의를 위한 토론회',
    features: ['발제 및 토론 중심 구성', '전문가·이해관계자 참여', '의제별 의견 공유'],
    operation: ['발제자·토론자 운영', '토론 진행 흐름 관리', '참가자 안내 및 현장 운영'],
  },
  간담회: {
    purpose: '관계자 의견 공유와 협의를 위한 간담회',
    features: ['소규모 관계자 중심 운영', '현안 공유 및 의견 수렴', '기관·참석자 간 교류'],
    operation: ['참석자 의전 및 응대', '회의 진행 지원', '자료 및 좌석 운영'],
  },
  워크숍: {
    purpose: '실무 역량 강화와 과제 논의를 위한 워크숍',
    features: ['교육·토의·실습형 프로그램 구성', '참가자 참여 중심 운영', '결과 공유 및 피드백 진행'],
    operation: ['분임토의 및 실습 운영', '참가자 관리', '결과자료 취합'],
  },
  기념식: {
    purpose: '기관·사업의 의미와 성과를 공식적으로 기념하는 행사',
    features: ['공식 의전과 기념 프로그램 중심 구성', '주요 내빈 및 관계자 참석', '기념사·축사·세리머니 운영'],
    operation: ['VIP 의전', '무대 및 큐시트 운영', '참석자 동선 관리'],
  },
  개회식: {
    purpose: '행사 또는 사업의 시작을 공식적으로 알리는 개회 행사',
    features: ['개회사·축사 등 공식 순서 운영', '주요 내빈 및 참가자 참석', '본 행사 시작 전 의전 중심 구성'],
    operation: ['공식 순서 진행 관리', 'VIP 의전', '무대 및 현장 운영'],
  },
  폐회식: {
    purpose: '행사 종료와 주요 성과를 정리하는 폐회 행사',
    features: ['성과 공유 및 마무리 세리머니 구성', '참가자·관계자 참석', '시상 또는 결과 발표 연계 가능'],
    operation: ['폐회 순서 진행 관리', '참석자 안내', '결과자료 및 현장 정리'],
  },
  준공식: {
    purpose: '시설·공간의 완공을 공식적으로 알리는 준공 행사',
    features: ['준공 경과 공유 및 기념 세리머니', '기관·지역 관계자 참석', '현장 투어 또는 기념 프로그램 운영'],
    operation: ['세리머니 진행 관리', 'VIP 의전 및 동선 관리', '현장 안전 및 공간 운영'],
  },
  선포식: {
    purpose: '정책·비전·사업 방향을 공식적으로 발표하는 선포 행사',
    features: ['비전 발표 및 선언 프로그램 구성', '기관·관계자 참여', '공식 메시지 전달 중심 운영'],
    operation: ['선포 세리머니 운영', '무대 및 발표 진행 관리', '참석자·언론 응대'],
  },
  발대식: {
    purpose: '조직·사업·프로그램의 출범을 알리는 발대 행사',
    features: ['출범 선언 및 위촉·다짐 프로그램 구성', '참여자 결속과 역할 공유', '공식 의전 중심 운영'],
    operation: ['위촉 및 선언 순서 운영', '참석자 관리', '무대 및 현장 진행 관리'],
  },
  시상식: {
    purpose: '우수 성과를 선정·포상하고 사례를 공유하는 시상 행사',
    features: ['수상자 발표 및 포상 프로그램 구성', '기관·기업·관계자 참석', '성과 공유와 교류 중심 운영'],
    operation: ['수상자 동선 및 시상 순서 관리', 'VIP 의전', '무대 및 큐시트 운영'],
  },
  심사평가회: {
    purpose: '사업·기업·과제의 우수성과 적합성을 심사·평가하는 행사',
    features: ['심사 기준에 따른 평가 절차 운영', '참가기업·심사위원·운영기관 참여', '선정·인증·평가 결과 도출 중심'],
    operation: ['심사위원 운영', '참가기업 응대', '평가자료 및 현장 운영 관리'],
  },
  성과발표회: {
    purpose: '사업 추진 결과와 우수 사례를 공유하는 성과 발표 행사',
    features: ['성과 발표 및 사례 공유 중심 구성', '사업 참여자·기관 관계자 참석', '향후 확산 방향 논의 가능'],
    operation: ['발표자 및 자료 관리', '세션 진행 운영', '참가자 안내 및 현장 관리'],
  },
  공모전: {
    purpose: '우수 아이디어·작품·사업 모델을 발굴하고 평가하는 공모 행사',
    features: ['접수·심사·선정 절차 기반 운영', '참가자 및 심사위원 참여', '수상작 발표 또는 전시 연계 가능'],
    operation: ['접수 및 심사 운영', '참가자 응대', '결과 발표 및 시상 운영'],
  },
  전시회: {
    purpose: '제품·사업·콘텐츠를 전시하고 관람객에게 홍보하는 행사',
    features: ['전시 부스 및 관람 동선 구성', '참가기업·기관 홍보 운영', '현장 상담 또는 체험 프로그램 연계'],
    operation: ['전시 부스 운영 관리', '공간 조성 및 동선 관리', '참가기업·관람객 응대'],
  },
  박람회: {
    purpose: '산업·정책·서비스 정보를 종합적으로 소개하는 박람회',
    features: ['다수 부스와 현장 프로그램 구성', '기업·기관·방문객 참여', '홍보·상담·체험 프로그램 운영'],
    operation: ['부스 및 공간 운영', '참가기업 관리', '관람객 안내 및 현장 대응'],
  },
  체험행사: {
    purpose: '참가자가 직접 경험하고 이해할 수 있도록 구성된 체험형 행사',
    features: ['참여형 프로그램 중심 운영', '현장 안내와 안전 관리 중요', '콘텐츠 체험 및 피드백 수집 가능'],
    operation: ['체험 프로그램 운영', '참가자 안내 및 안전 관리', '현장 동선 관리'],
  },
  상담회: {
    purpose: '기업·기관·참가자 간 상담과 매칭을 지원하는 행사',
    features: ['사전 매칭 또는 현장 상담 중심 구성', '기업·바이어·관계기관 참여', '비즈니스 교류 및 후속 협의 연계'],
    operation: ['상담 일정 및 매칭 관리', '참가기업 응대', '상담장 운영 및 현장 안내'],
  },
  네트워킹: {
    purpose: '참가자 간 교류와 협업 기회 확대를 위한 네트워킹 행사',
    features: ['교류 중심 프로그램 구성', '기관·기업·전문가 참여', '관계 형성과 후속 협업 기반 마련'],
    operation: ['참석자 응대 및 교류 동선 관리', '프로그램 진행 지원', 'VIP 및 주요 관계자 의전'],
  },
  국제교류행사: {
    purpose: '국내외 관계자 간 협력과 교류를 확대하는 국제교류 행사',
    features: ['해외 참가자 또는 기관 참여', '통역·의전·국제 커뮤니케이션 중요', '교류 프로그램 및 공식 일정 운영'],
    operation: ['해외 참가자 응대', '통역 및 의전 운영', '국제 일정 및 현장 동선 관리'],
  },
  축제: {
    purpose: '지역·문화 콘텐츠를 시민과 공유하는 참여형 축제',
    features: ['공연·체험·전시 등 복합 프로그램 구성', '시민·방문객 참여 중심', '현장 안전과 동선 관리 중요'],
    operation: ['공연 및 체험 프로그램 운영', '방문객 안내 및 안전 관리', '협력업체 및 현장 인력 관리'],
  },
  공연: {
    purpose: '무대 콘텐츠를 관객에게 제공하는 공연 행사',
    features: ['무대·음향·조명 등 기술 운영 중요', '관객 입장과 좌석 관리 필요', '큐시트 기반 진행'],
    operation: ['무대 및 큐시트 운영', '관객 안내 및 현장 관리', '시스템/AV 운영 관리'],
  },
  문화행사: {
    purpose: '문화 콘텐츠를 소개하고 참여 경험을 제공하는 행사',
    features: ['공연·전시·체험 프로그램 연계', '시민·방문객 참여 중심', '콘텐츠별 현장 운영 필요'],
    operation: ['프로그램별 현장 운영', '참가자 동선 및 안내 관리', '공간 조성 및 제작물 관리'],
  },
  교육: {
    purpose: '참가자 역량 강화와 정보 전달을 위한 교육 행사',
    features: ['강의·실습·질의응답 중심 구성', '교육 대상자 관리 중요', '자료 배포 및 출결 관리 가능'],
    operation: ['교육장 운영', '참가자 출결 및 안내 관리', '강사 및 교육자료 관리'],
  },
  연수: {
    purpose: '조직·참가자의 역량 개발과 교류를 위한 연수 행사',
    features: ['교육·토의·네트워킹 프로그램 연계', '참가자 일정 관리 중요', '숙박·이동 등 부대 운영 가능'],
    operation: ['연수 일정 운영', '참가자 관리', '강사·장소·이동 동선 관리'],
  },
  설명회: {
    purpose: '사업·정책·서비스 정보를 대상자에게 안내하는 설명회',
    features: ['정보 전달과 질의응답 중심 구성', '참석 대상자 안내 중요', '자료 배포 및 현장 응대 필요'],
    operation: ['발표 및 질의응답 운영', '참석자 안내 및 등록 관리', '자료 배포 및 현장 응대'],
  },
  기타: {
    purpose: '사용자 입력 정보를 기반으로 정리한 행사',
    features: ['행사 성격과 목적은 사용자 확인 필요', '운영 범위와 참석 대상 확인 필요', '포트폴리오용 문구 직접 보완 권장'],
    operation: ['현장 운영 관리', '참가자 응대', '운영 자료 정리'],
  },
};

function buildResearchPrompt(source, research) {
  return [
    `행사명: ${source.eventName}`,
    `발주기관: ${source.client}`,
    `개최연도: ${getSourceYear(source) || '미입력'}`,
    `사용자 지정 행사 성격: ${normalizeCategory(source.category)}`,
    '규칙: 사용자 지정 행사 성격을 최우선으로 사용하고, 검색 결과에 포함된 정보만 참고해 포트폴리오용 초안을 작성한다.',
    ...research.results.map((result, index) => `${index + 1}. ${result.title}\n${result.snippet}\n${result.url}`),
  ].join('\n\n');
}

function pickSearchFact(text, groups, fallback = '') {
  const found = groups.find(({ keywords }) => includesAny(text, keywords));
  return found?.value || fallback;
}

function getCategoryGuide(eventType) {
  return categoryDraftGuides[eventType] || categoryDraftGuides.기타;
}

function buildOperationPoints(source, eventType) {
  const guide = getCategoryGuide(eventType);
  const selected = buildPortfolioResponsibilities(getTaskList(source)).slice(0, 5);
  const special = getSpecialTaskList(source).slice(0, 3);
  return getUniqueLimited([...guide.operation, ...selected, ...special], 5);
}

function buildDraftOverview(source, research, eventType) {
  const text = research.results.map((result) => `${result.title} ${result.snippet}`).join(' ');
  const guide = getCategoryGuide(eventType);
  const host = source.client || '발주기관';
  const venueText = source.venue ? `${source.venue}에서 운영되는 ` : '';
  const isSearchBased = research.status === 'verified';
  const evidencePurpose = pickSearchFact(
    text,
    [
      { keywords: ['심사', '평가', '선정', '인증', '우수기업', '공모'], value: '우수 대상 발굴과 평가 절차 운영' },
      { keywords: ['시상', '포상', '유공'], value: '우수 성과 선정 및 포상' },
      { keywords: ['전시', '박람회', '부스'], value: '콘텐츠 전시와 홍보 운영' },
      { keywords: ['상담', '매칭', '바이어'], value: '참가자·기업 간 상담과 교류 지원' },
      { keywords: ['교육', '연수', '설명'], value: '대상자 교육과 정보 전달' },
      { keywords: ['공연', '축제', '문화', '체험'], value: '문화 콘텐츠와 참여 프로그램 운영' },
      { keywords: ['기념', '선포', '발대', '준공'], value: '공식 메시지 전달과 의전 프로그램 운영' },
      { keywords: ['정책', '현안', '토론', '포럼', '컨퍼런스'], value: '주요 의제 공유와 관계자 논의' },
    ],
    '',
  );
  const audience = pickSearchFact(
    text,
    [
      { keywords: ['전문가', '관계자', '기관'], value: '전문가, 관계기관 및 행사 관계자 참여' },
      { keywords: ['기업', '경제인'], value: '기업 및 산업 관계자 참여' },
      { keywords: ['시민', '주민', '방문객'], value: '시민 및 방문객 참여' },
      { keywords: ['학생', '교원', '교육'], value: '교육 분야 관계자 및 참가자 참여' },
      { keywords: ['심사위원', '평가위원'], value: '심사위원 및 평가 대상자 참여' },
    ],
    '',
  );
  const program = pickSearchFact(
    text,
    [
      { keywords: ['심사', '평가', '선정', '인증'], value: '심사·평가 및 선정 절차 운영' },
      { keywords: ['시상', '포상'], value: '시상 및 포상 프로그램 운영' },
      { keywords: ['상담', '매칭'], value: '상담 매칭 및 교류 프로그램 운영' },
      { keywords: ['전시', '부스'], value: '전시 부스 및 현장 관람 프로그램 운영' },
      { keywords: ['공연', '체험'], value: '공연, 체험 및 부대 프로그램 운영' },
      { keywords: ['발표', '강연', '기조'], value: '강연 및 발표 프로그램 운영' },
      { keywords: ['토론', '패널', '세션'], value: '세션 및 의제 공유 프로그램 운영' },
    ],
    '',
  );

  const overview = [
    `${source.eventName}는 ${host}의 ${evidencePurpose || guide.purpose}입니다.`,
    `${venueText}${eventType} 성격에 맞춰 ${program || guide.features[0]}을 중심으로 구성됩니다.`,
    audience ? `${audience}를 고려한 운영 초안입니다.` : '',
  ].filter(Boolean).slice(0, 3);

  const features = getUniqueLimited(
    [
      ...(isSearchBased ? buildSearchSignals(text) : []),
      ...(program ? [program] : []),
      ...(audience ? [audience] : []),
      ...guide.features,
    ],
    3,
  );

  return {
    eventOverview: overview,
    eventFeatures: features,
    operationPoints: buildOperationPoints(source, eventType),
  };
}

async function generateAi(source) {
  const eventType = normalizeCategory(source.category) || inferEventType(source);
  const tasks = getTaskList(source);
  const research = await searchEventInfo(source);
  const hasVerifiedResearch = research.status === 'verified';
  const overviewSource = hasVerifiedResearch ? 'search' : research.status === 'insufficient' ? 'insufficient' : 'not_found';
  const draft = buildDraftOverview(source, research, eventType);
  const eventOverview =
    research.status === 'insufficient'
      ? ['검색 결과가 부족하여 사용자 입력과 행사 성격을 기준으로 일반 초안을 생성했습니다.', ...draft.eventOverview].slice(0, 3)
      : research.status === 'not_found'
        ? ['공식 자료를 찾지 못해 사용자 입력과 행사 성격을 기준으로 임시 초안을 생성했습니다.', ...draft.eventOverview].slice(0, 3)
        : draft.eventOverview;
  const eventCharacteristics = analyzeEventCharacteristics(source, eventType, { text: research.results.map((result) => result.snippet).join(' ') });
  const responsibilities = buildPortfolioResponsibilities(tasks);
  const keyRoles = buildKeyRoles(source, eventType, eventCharacteristics);
  const outcomes = buildOutcomes(source, eventType, eventCharacteristics);

  return {
    eventOverview,
    overviewSource,
    searchQuery: research.query || buildSearchQueries(source)[0] || '',
    searchUrl: research.results[0]?.url || '',
    searchSourceName: research.results[0]?.title || '',
    researchStatus: research.status,
    researchResults: research.results,
    researchPrompt: hasVerifiedResearch ? buildResearchPrompt(source, research) : '',
    searchAttemptedQueries: research.attemptedQueries || [],
    searchProvider: research.provider || '',
    searchFailureReason: research.failureReason || '',
    searchAttemptDiagnostics: research.attemptDiagnostics || [],
    eventType,
    eventCharacteristics,
    eventFeatures: draft.eventFeatures,
    operationPoints: draft.operationPoints,
    taskTags: buildTaskTags(tasks),
    responsibilities,
    keyRoles,
    outcomes,
    portfolioText: [...eventOverview, ...draft.eventFeatures, ...draft.operationPoints, ...responsibilities, ...keyRoles, ...outcomes].map((item) => `- ${item}`).join('\n'),
  };
}

function buildInsights(projects) {
  const yearly = projects.reduce((acc, project) => {
    const year = getProjectYear(project) || '미입력';
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});
  const uniqueClients = new Set(projects.map((project) => (project.client || project.source.client || '').trim()).filter(Boolean));

  return {
    total: projects.length,
    uniqueClients: uniqueClients.size,
    mainPm: projects.filter((project) => project.source.participationLevel === '메인 PM').length,
    subPm: projects.filter((project) => project.source.participationLevel === '서브 PM').length,
    yearly,
  };
}

function getLevelClass(level) {
  if (level === '메인 PM') return 'level-main';
  if (level === '서브 PM') return 'level-sub';
  return 'level-support';
}

function getCardSummary(project) {
  return project.ai.keyRoles?.[0] || project.ai.outcomes?.[0] || project.ai.careerSummary?.[0] || project.ai.responsibilities?.[0] || '포트폴리오 문구 생성';
}

function normalizeEditableLines(value) {
  return value
    .split('\n')
    .map((line) => line.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean);
}

function stringifyEditableValue(value) {
  if (Array.isArray(value)) return value.join('\n');
  return value || '';
}

function buildPortfolioTextFromAi(ai) {
  return [
    ...(ai.eventOverview || []),
    ...(ai.eventFeatures || []),
    ...(ai.operationPoints || []),
    ...(ai.responsibilities || []),
    ...(ai.keyRoles || ai.careerSummary || []),
    ...(ai.outcomes || []),
  ]
    .map((item) => `- ${item}`)
    .join('\n');
}

function App() {
  const [ownerId] = useState(getOwnerId);
  const [projects, setProjects] = useState(() => loadProjects(ownerId));
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => getProjectYear(b) - getProjectYear(a) || new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)),
    [projects],
  );

  const selectedProject = projects.find((project) => project.id === selectedId);
  const insights = useMemo(() => buildInsights(projects), [projects]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleTask(task) {
    setForm((current) => {
      const exists = current.tasks.includes(task);
      return {
        ...current,
        tasks: exists ? current.tasks.filter((item) => item !== task) : [...current.tasks, task],
      };
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submitProject(event) {
    event.preventDefault();
    setIsGenerating(true);

    const source = {
      ...form,
      eventName: form.eventName.trim(),
      client: form.client.trim(),
      venue: form.venue.trim(),
      category: normalizeCategory(form.category),
      dateEnd: form.isMultiDay ? form.dateEnd : '',
      tasks: normalizeTaskIds(form.tasks),
      specialTasks: parseSpecialTasks(form.specialTasks),
      participantScale: form.participantScale === '' ? '' : Number(form.participantScale),
    };
    const ai = await generateAi(source);

    if (editingId) {
      setProjects((current) =>
        current.map((project) =>
          project.id === editingId
            ? buildProjectRecord({
                id: project.id,
                ownerId: project.ownerId,
                source,
                ai,
                createdAt: project.createdAt,
              })
            : project,
        ),
      );
      setSelectedId(editingId);
      resetForm();
      setIsGenerating(false);
      return;
    }

    const project = buildProjectRecord({
      id: createId('event'),
      source,
      ai,
      ownerId,
      createdAt: new Date().toISOString(),
    });

    setProjects((current) => [project, ...current]);
    setSelectedId(project.id);
    setForm(emptyForm);
    setIsGenerating(false);
  }

  function startEdit(project) {
    setEditingId(project.id);
    setSelectedId(null);
    setForm(normalizeSource(project.source, project));
    window.setTimeout(() => document.getElementById('add-project')?.scrollIntoView({ behavior: 'smooth' }), 0);
  }

  function requestDelete(projectId) {
    setConfirmAction({ type: 'delete', projectId });
  }

  function requestReset() {
    setConfirmAction({ type: 'reset' });
  }

  function updateProjectAi(projectId, patch, editedField) {
    setProjects((current) =>
      current.map((project) => {
        if (project.id !== projectId) return project;
        const manualEdits = editedField
          ? {
              ...(project.ai.manualEdits || {}),
              [editedField]: new Date().toISOString(),
            }
          : project.ai.manualEdits || {};
        const ai = {
          ...project.ai,
          ...patch,
          manualEdits,
          manuallyEditedAt: new Date().toISOString(),
        };
        return {
          ...project,
          overview: ai.eventOverview || project.overview,
          eventFeatures: ai.eventFeatures || project.eventFeatures || [],
          operationPoints: ai.operationPoints || project.operationPoints || [],
          overviewSource: ai.overviewSource || project.overviewSource,
          ai: {
            ...ai,
            portfolioText: buildPortfolioTextFromAi(ai),
          },
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  }

  function confirmPendingAction() {
    if (confirmAction?.type === 'delete') {
      setProjects((current) => current.filter((project) => project.id !== confirmAction.projectId));
      if (selectedId === confirmAction.projectId) setSelectedId(null);
      if (editingId === confirmAction.projectId) resetForm();
    }

    if (confirmAction?.type === 'reset') {
      setProjects([]);
      setSelectedId(null);
      resetForm();
    }

    setConfirmAction(null);
  }

  function copyPortfolioText() {
    if (!selectedProject) return;
    const ai = selectedProject.ai;
    const fallbackText = buildPortfolioTextFromAi(ai);
    navigator.clipboard?.writeText(ai.portfolioText || fallbackText || '');
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  if (selectedProject) {
    return (
      <main className="app-shell">
        <button className="ghost-button back-button" onClick={() => setSelectedId(null)}>
          <ArrowLeft size={18} />
          목록으로
        </button>
        <ProjectDetail
          project={selectedProject}
          copied={copied}
          onCopy={copyPortfolioText}
          onDelete={requestDelete}
          onEdit={startEdit}
          onUpdateAi={updateProjectAi}
        />
        <ConfirmModal action={confirmAction} onCancel={() => setConfirmAction(null)} onConfirm={confirmPendingAction} />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <nav className="topbar">
          <div className="brand">
            <span className="brand-mark">
              <BriefcaseBusiness size={21} />
            </span>
            <span>Career Ledger</span>
          </div>
          <a className="top-action" href="#add-project">
            <Plus size={18} />
            행사 추가
          </a>
        </nav>
        <section className="hero-copy">
          <p className="eyebrow">AI Career Memory</p>
          <h1>잊혀지는 경험을 자산으로.</h1>
          <p>행사 정보를 짧게 정리하고, 경력 문구로 바로 전환합니다.</p>
        </section>
      </header>

      <InsightDashboard insights={insights} />

      <section className="content-grid">
        <ProjectForm
          form={form}
          editingId={editingId}
          isGenerating={isGenerating}
          onChange={updateForm}
          onToggleTask={toggleTask}
          onSubmit={submitProject}
          onCancelEdit={resetForm}
        />
        <ProjectList projects={sortedProjects} onSelect={setSelectedId} onDelete={requestDelete} onEdit={startEdit} onReset={requestReset} />
      </section>

      <ConfirmModal action={confirmAction} onCancel={() => setConfirmAction(null)} onConfirm={confirmPendingAction} />
    </main>
  );
}

function InsightDashboard({ insights }) {
  return (
    <>
      <section className="insight-grid" aria-label="Career Insights">
        <InsightCard icon={<BriefcaseBusiness />} label="누적 행사 운영 건수" value={insights.total} />
        <InsightCard icon={<Users />} label="누적 발주처 수" value={insights.uniqueClients} />
        <InsightCard icon={<TrendingUp />} label="메인 PM 건수" value={insights.mainPm} />
        <InsightCard icon={<Sparkles />} label="서브 PM 건수" value={insights.subPm} />
      </section>
      <section className="insight-breakdown">
        <Breakdown title="연도별 행사 건수" items={insights.yearly} emptyText="아직 연도별 데이터가 없습니다." />
      </section>
    </>
  );
}

function InsightCard({ icon, label, value }) {
  return (
    <article className="insight-card">
      <span className="icon-badge">{React.cloneElement(icon, { size: 19 })}</span>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Breakdown({ title, items, emptyText }) {
  const entries = Object.entries(items).sort(([a], [b]) => String(b).localeCompare(String(a)));

  return (
    <article className="panel mini-panel">
      <div className="section-title">
        <p>Career Insights</p>
        <h2>{title}</h2>
      </div>
      {entries.length === 0 ? (
        <p className="muted-text">{emptyText}</p>
      ) : (
        <div className="breakdown-list">
          {entries.map(([label, count]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{count}건</strong>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function ProjectForm({ form, editingId, isGenerating, onChange, onToggleTask, onSubmit, onCancelEdit }) {
  return (
    <section className="panel form-panel" id="add-project">
      <div className="section-title">
        <p>Event Facts</p>
        <h2>{editingId ? '행사 정보 수정' : '새 행사 저장'}</h2>
      </div>
      <form onSubmit={onSubmit}>
        <label>
          행사명
          <input value={form.eventName} onChange={(event) => onChange('eventName', event.target.value)} placeholder="행사명 입력" required />
        </label>

        <div className="field-row two">
          <label>
            발주처
            <input value={form.client} onChange={(event) => onChange('client', event.target.value)} placeholder="발주처 입력" required />
          </label>
          <label>
            행사 장소
            <input value={form.venue} onChange={(event) => onChange('venue', event.target.value)} placeholder="행사 장소 입력" required />
          </label>
        </div>

        <label>
          행사 성격
          <select value={form.category} onChange={(event) => onChange('category', event.target.value)} required>
            {categoryGroups.map((group) => (
              <optgroup label={group.label} key={group.label}>
                {group.items.map((category) => (
                  <option value={category} key={category}>
                    {category}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <div className="field-row two">
          <label>
            행사 시작일
            <input type="date" value={form.dateStart} onChange={(event) => onChange('dateStart', event.target.value)} required />
          </label>
          <label className={!form.isMultiDay ? 'disabled-field' : ''}>
            행사 종료일
            <input type="date" value={form.dateEnd} min={form.dateStart} onChange={(event) => onChange('dateEnd', event.target.value)} disabled={!form.isMultiDay} required={form.isMultiDay} />
          </label>
        </div>

        <label className="check-line">
          <input type="checkbox" checked={form.isMultiDay} onChange={(event) => onChange('isMultiDay', event.target.checked)} />
          기간 행사입니다
        </label>

        <fieldset>
          <legend>참여수준</legend>
          <div className="radio-grid">
            {participationLevels.map((level) => (
              <label className="choice-pill" key={level}>
                <input type="radio" name="participationLevel" value={level} checked={form.participationLevel === level} onChange={(event) => onChange('participationLevel', event.target.value)} />
                {level}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>담당업무</legend>
          <div className="task-groups">
            {taskGroups.map((group) => (
              <section className="task-group" key={group.title}>
                <h3>{group.title}</h3>
                <div className="task-grid">
                  {group.items.map((task) => (
                    <label className="choice-pill" key={task.id}>
                      <input type="checkbox" checked={form.tasks.includes(task.id)} onChange={() => onToggleTask(task.id)} />
                      {task.label}
                    </label>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </fieldset>

        <label>
          특수 업무
          <textarea
            value={form.specialTasks}
            onChange={(event) => onChange('specialTasks', event.target.value)}
            placeholder="예: 해외연사 대응, 통역 운영, VIP 의전, 보안 출입 통제, 국제행사 운영, 전시 운영, 온라인 생중계"
          />
          <span className="field-help">체크박스로 표현하기 어려운 세부 업무를 줄바꿈으로 입력해주세요.</span>
        </label>

        <label>
          참가규모
          <input type="number" min="0" value={form.participantScale} onChange={(event) => onChange('participantScale', event.target.value)} placeholder="참가규모 입력" />
          <span className="field-help">정확한 수치가 아니어도 됩니다. 대략적인 규모를 입력해주세요.</span>
        </label>

        <p className="generation-note">
          <Search size={16} />
          행사 성격을 기준으로 검색 결과와 입력 정보를 조합해 수정 가능한 포트폴리오 초안을 생성합니다.
        </p>

        <div className="form-actions">
          {editingId && (
            <button className="ghost-button" type="button" onClick={onCancelEdit} disabled={isGenerating}>
              취소
            </button>
          )}
          <button className="primary-button" type="submit" disabled={isGenerating}>
            <Plus size={18} />
            {isGenerating ? '포트폴리오 초안 생성 중' : editingId ? '수정 저장' : '포트폴리오 초안 생성'}
          </button>
        </div>
      </form>
    </section>
  );
}

function ProjectList({ projects, onSelect, onDelete, onEdit, onReset }) {
  return (
    <section className="panel">
      <div className="section-title list-title">
        <div>
          <p>Recent Events</p>
          <h2>행사 목록</h2>
        </div>
        {projects.length > 0 && (
          <button className="ghost-button danger-soft compact-button" onClick={onReset}>
            <RotateCcw size={16} />
            전체 초기화
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <BriefcaseBusiness size={26} />
          <strong>아직 저장된 행사가 없습니다.</strong>
          <p>행사 사실만 입력하면 이 브라우저에만 목록과 Career Insights가 기록됩니다.</p>
        </div>
      ) : (
        <div className="project-list">
          {projects.map((project) => (
            <article className="project-card" key={project.id}>
              <button className="project-open" onClick={() => onSelect(project.id)}>
                <span className="project-meta">
                  <span>{formatEventDate(project.source)}</span>
                  <strong className={`level-pill ${getLevelClass(project.source.participationLevel)}`}>{project.category || project.source.category}</strong>
                </span>
                <strong>{project.title || project.source.eventName}</strong>
                <span>
                  <MapPin size={14} />
                  {project.source.venue}
                </span>
                <p>{getCardSummary(project)}</p>
              </button>
              <div className="card-actions">
                <button className="ghost-button compact-button" onClick={() => onEdit(project)}>
                  <Edit3 size={16} />
                  수정
                </button>
                <button className="delete-button" onClick={() => onDelete(project.id)} aria-label={`${project.source.eventName} 삭제`}>
                  <Trash2 size={16} />
                  삭제
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ProjectDetail({ project, copied, onCopy, onDelete, onEdit, onUpdateAi }) {
  const sourceLabel =
    project.ai.overviewSource === 'search'
      ? '검색 기반 생성'
      : project.ai.overviewSource === 'insufficient'
        ? '검색 결과 부족 · 일반 초안'
        : project.ai.overviewSource === 'not_found'
          ? '공식 자료 없음 · 입력 기반 임시 초안'
          : '입력 기반 임시 개요';
  const sourceClass = project.ai.overviewSource === 'search' ? 'source-search' : project.ai.overviewSource === 'insufficient' ? 'source-warning' : 'source-input';
  const keyRoles = project.ai.keyRoles || project.ai.careerSummary || [];
  const outcomes = project.ai.outcomes || [];
  const [editingField, setEditingField] = useState(null);
  const [draft, setDraft] = useState('');

  function startAiEdit(field, value) {
    setEditingField(field);
    setDraft(stringifyEditableValue(value));
  }

  function cancelAiEdit() {
    setEditingField(null);
    setDraft('');
  }

  function saveAiEdit(field) {
    const patch = field === 'eventType' ? { eventType: draft.trim() || '행사' } : { [field]: normalizeEditableLines(draft) };
    onUpdateAi(project.id, patch, field);
    cancelAiEdit();
  }

  function renderTextEditor(field) {
    return (
      <div className="ai-editor">
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={field === 'eventType' ? 2 : 5} />
        <div className="edit-actions">
          <button className="ghost-button compact-button" type="button" onClick={cancelAiEdit}>
            취소
          </button>
          <button className="primary-button compact-button" type="button" onClick={() => saveAiEdit(field)}>
            <Check size={16} />
            저장
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="detail-layout">
      <article className="panel">
        <div className="detail-heading">
          <div className="section-title">
            <p>Source Data</p>
            <h1>{project.title || project.source.eventName}</h1>
          </div>
          <div className="detail-actions">
            <button className="ghost-button" onClick={() => onEdit(project)}>
              <Edit3 size={18} />
              수정
            </button>
            <button className="ghost-button danger-soft" onClick={() => onDelete(project.id)}>
              <Trash2 size={18} />
              삭제
            </button>
          </div>
        </div>
        <dl className="source-list">
          <div>
            <dt>행사 날짜</dt>
            <dd>{project.period?.label || formatEventDate(project.source)}</dd>
          </div>
          <div>
            <dt>발주처</dt>
            <dd>{project.client || project.source.client}</dd>
          </div>
          <div>
            <dt>행사 장소</dt>
            <dd>{project.source.venue}</dd>
          </div>
          <div>
            <dt>행사 성격</dt>
            <dd>{project.category || project.source.category}</dd>
          </div>
          <div>
            <dt>참여수준</dt>
            <dd>{project.source.participationLevel}</dd>
          </div>
          <div>
            <dt>참가규모</dt>
            <dd>{project.source.participantScale ? `${project.source.participantScale}명` : '미입력'}</dd>
          </div>
          <div className="full">
            <dt>공통 업무</dt>
            <dd>{getCommonTaskLabels(project.source).join(', ') || '미입력'}</dd>
          </div>
          <div className="full">
            <dt>특수 업무</dt>
            <dd>{getSpecialTaskList(project.source).join(', ') || '미입력'}</dd>
          </div>
        </dl>
      </article>

      <article className="panel ai-panel">
        <div className="detail-heading">
          <div className="section-title">
            <p>AI Generated</p>
            <h2>포트폴리오형 결과</h2>
          </div>
          <button className="ghost-button" onClick={onCopy}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? '복사됨' : '포트폴리오 문구 복사'}
          </button>
        </div>
        <ResultBlock
          title="행사 개요"
          manuallyEdited={project.ai.manualEdits?.eventOverview}
          onEdit={() => startAiEdit('eventOverview', Array.isArray(project.ai.eventOverview) ? project.ai.eventOverview : [project.ai.eventOverview])}
        >
          {editingField === 'eventOverview' ? (
            renderTextEditor('eventOverview')
          ) : (
            <>
              <span className={`source-badge ${sourceClass}`}>{sourceLabel}</span>
              <ul className="overview-list">
                {(Array.isArray(project.ai.eventOverview) ? project.ai.eventOverview : [project.ai.eventOverview]).slice(0, 3).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {project.ai.searchQuery && <p className="search-query">검색어: {project.ai.searchQuery}</p>}
              {project.ai.searchProvider && <p className="search-query">검색 provider: {project.ai.searchProvider}</p>}
              {project.ai.searchFailureReason && <p className="search-query">검색 실패 이유: {project.ai.searchFailureReason}</p>}
              {project.ai.searchAttemptedQueries?.length > 0 && (
                <details className="attempted-query-list">
                  <summary>시도한 검색어 {project.ai.searchAttemptedQueries.length}개</summary>
                  <ol>
                    {project.ai.searchAttemptedQueries.map((query) => (
                      <li key={query}>{query}</li>
                    ))}
                  </ol>
                </details>
              )}
              {project.ai.researchResults?.length > 0 && (
                <div className="source-list-mini">
                  <strong>참고 출처</strong>
                  <ul>
                    {project.ai.researchResults.slice(0, 5).map((result) => (
                      <li key={`${result.title}-${result.url}`}>
                        {result.url ? (
                          <a href={result.url} target="_blank" rel="noreferrer">
                            {result.title || result.domain || '검색 결과'}
                          </a>
                        ) : (
                          <span>{result.title || '검색 결과'}</span>
                        )}
                        {result.provider && <small> · {result.provider}</small>}
                        {result.snippet && <p>{result.snippet}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </ResultBlock>
        <ResultBlock title="행사 특징" manuallyEdited={project.ai.manualEdits?.eventFeatures} onEdit={() => startAiEdit('eventFeatures', project.ai.eventFeatures || [])}>
          {editingField === 'eventFeatures' ? (
            renderTextEditor('eventFeatures')
          ) : (
            <ul className="portfolio-list">
              {(project.ai.eventFeatures || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </ResultBlock>
        <ResultBlock title="운영 포인트" manuallyEdited={project.ai.manualEdits?.operationPoints} onEdit={() => startAiEdit('operationPoints', project.ai.operationPoints || [])}>
          {editingField === 'operationPoints' ? (
            renderTextEditor('operationPoints')
          ) : (
            <ul className="portfolio-list">
              {(project.ai.operationPoints || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </ResultBlock>
        <ResultBlock title="행사유형" manuallyEdited={project.ai.manualEdits?.eventType} onEdit={() => startAiEdit('eventType', project.ai.eventType)}>
          {editingField === 'eventType' ? renderTextEditor('eventType') : <p className="event-type-text">{project.ai.eventType || '행사'}</p>}
        </ResultBlock>
        <ResultBlock title="담당업무" manuallyEdited={project.ai.manualEdits?.responsibilities} onEdit={() => startAiEdit('responsibilities', project.ai.responsibilities || [])}>
          {editingField === 'responsibilities' ? (
            renderTextEditor('responsibilities')
          ) : (
            <ul className="portfolio-list">
              {(project.ai.responsibilities || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </ResultBlock>
        <ResultBlock title="주요 역할" manuallyEdited={project.ai.manualEdits?.keyRoles} onEdit={() => startAiEdit('keyRoles', keyRoles)}>
          {editingField === 'keyRoles' ? (
            renderTextEditor('keyRoles')
          ) : (
            <div className="summary-lines">
              {keyRoles.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          )}
        </ResultBlock>
        <ResultBlock title="업무 성과" manuallyEdited={project.ai.manualEdits?.outcomes} onEdit={() => startAiEdit('outcomes', outcomes)}>
          {editingField === 'outcomes' ? (
            renderTextEditor('outcomes')
          ) : (
            <div className="summary-lines">
              {outcomes.length > 0 ? (
                outcomes.map((item) => <p key={item}>{item}</p>)
              ) : (
                <p className="muted-text">수정 저장 시 행사 특성 기반 업무 성과가 새로 생성됩니다.</p>
              )}
            </div>
          )}
        </ResultBlock>
      </article>
    </section>
  );
}

function ResultBlock({ title, children, onEdit, manuallyEdited }) {
  return (
    <section className="result-block">
      <div className="result-block-heading">
        <div className="result-title-row">
          <h3>{title}</h3>
          {manuallyEdited && <span className="manual-badge">직접 수정됨</span>}
        </div>
        {onEdit && (
          <button className="ghost-button mini-button" type="button" onClick={onEdit}>
            <Edit3 size={14} />
            수정
          </button>
        )}
      </div>
      <div>{children}</div>
    </section>
  );
}

function ConfirmModal({ action, onCancel, onConfirm }) {
  if (!action) return null;

  const isReset = action.type === 'reset';
  const title = isReset ? '전체 데이터를 초기화할까요?' : '프로젝트 삭제';
  const message = isReset
    ? '저장된 모든 프로젝트와 AI 생성 결과를 삭제하시겠습니까? 삭제 후 되돌릴 수 없습니다.'
    : '이 프로젝트를 삭제하시겠습니까? 삭제 후 되돌릴 수 없습니다.';

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <span className="modal-icon">
          <AlertTriangle size={22} />
        </span>
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="ghost-button" onClick={onCancel}>
            취소
          </button>
          <button className="danger-button" onClick={onConfirm}>
            {isReset ? '전체 초기화' : '삭제'}
          </button>
        </div>
      </section>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
