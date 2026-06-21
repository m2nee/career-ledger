import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
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

const taskGroups = [
  { title: '기획', items: ['행사 기획', '운영계획 수립', '제안서 작성', '예산 관리'] },
  { title: '사전 준비', items: ['사전등록 운영', '참가자 관리', '연사 관리', '협력사 관리', '홍보 운영'] },
  { title: '현장 운영', items: ['현장 총괄 운영', '등록데스크 운영', 'VIP 의전', '무대 운영', '콘솔 운영', '동선 관리'] },
  { title: '콘텐츠', items: ['시나리오 작성', '발표자료 관리', '프로그램 운영'] },
  { title: '기술 운영', items: ['AV 운영', '생중계 운영', '시스템 운영'] },
  { title: '공간 운영', items: ['공간 조성', '전시 운영', '부대행사 운영'] },
  { title: '사후 관리', items: ['결과보고서 작성', '정산 관리'] },
  { title: '기타', items: ['기타'] },
];

const taskPhraseMap = {
  '행사 기획': { responsibility: '행사 기획', summary: '행사 기획 및 운영 방향 수립' },
  '운영계획 수립': { responsibility: '운영계획 수립', summary: '운영계획 수립 및 실행 체계 정리' },
  '제안서 작성': { responsibility: '제안서 작성', summary: '제안서 작성 및 실행 전략 문서화' },
  '예산 관리': { responsibility: '예산 관리', summary: '예산 계획 및 집행 관리' },
  '사전등록 운영': { responsibility: '사전등록 운영', summary: '사전등록 프로세스 운영' },
  '참가자 관리': { responsibility: '참가자 관리', summary: '참가자 등록 체계 구축 및 관리' },
  '연사 관리': { responsibility: '연사 관리', summary: '연사 커뮤니케이션 및 발표 준비 관리' },
  '협력사 관리': { responsibility: '협력사 관리', summary: '협력사 및 운영인력 관리' },
  '홍보 운영': { responsibility: '홍보 운영', summary: '홍보 채널 운영 및 참여 유도' },
  '현장 총괄 운영': { responsibility: '현장 총괄 운영', summary: '현장 운영 총괄' },
  '등록데스크 운영': { responsibility: '등록데스크 운영', summary: '등록데스크 운영 및 현장 응대 관리' },
  'VIP 의전': { responsibility: 'VIP 의전 지원', summary: 'VIP 의전 및 동선 관리' },
  '무대 운영': { responsibility: '무대 운영', summary: '무대 진행 및 큐시트 관리' },
  '콘솔 운영': { responsibility: '콘솔 운영', summary: '콘솔 운영 및 현장 진행 신호 관리' },
  '동선 관리': { responsibility: '동선 관리', summary: '참가자 및 주요 인사 동선 관리' },
  '시나리오 작성': { responsibility: '시나리오 작성', summary: '행사 시나리오 및 진행 흐름 설계' },
  '발표자료 관리': { responsibility: '발표자료 관리', summary: '발표자료 취합 및 현장 반영 관리' },
  '프로그램 운영': { responsibility: '프로그램 운영', summary: '세부 프로그램 운영 및 시간표 관리' },
  'AV 운영': { responsibility: 'AV 운영', summary: 'AV 장비 운영 및 기술 지원' },
  '생중계 운영': { responsibility: '생중계 운영', summary: '생중계 운영 및 송출 품질 관리' },
  '시스템 운영': { responsibility: '시스템 운영', summary: '운영 시스템 세팅 및 현장 관리' },
  '공간 조성': { responsibility: '공간 조성', summary: '행사 공간 구성 및 조성 관리' },
  '전시 운영': { responsibility: '전시 운영', summary: '전시 공간 운영 및 관람 흐름 관리' },
  '부대행사 운영': { responsibility: '부대행사 운영', summary: '부대행사 프로그램 운영' },
  '결과보고서 작성': { responsibility: '결과보고서 작성', summary: '결과보고서 작성 및 성과 정리' },
  '정산 관리': { responsibility: '정산 관리', summary: '정산 자료 취합 및 비용 관리' },
};

const responsibilityPriority = [
  '행사 기획',
  '운영계획 수립',
  '현장 총괄 운영',
  '사전등록 운영',
  '참가자 관리',
  '연사 관리',
  '협력사 관리',
  'VIP 의전',
  '등록데스크 운영',
  '프로그램 운영',
  '콘솔 운영',
  '생중계 운영',
  '결과보고서 작성',
  '정산 관리',
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
  dateStart: '',
  dateEnd: '',
  isMultiDay: false,
  participationLevel: '메인 PM',
  tasks: [],
  customTask: '',
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
    return parsed.filter((project) => project.ownerId === ownerId && project.source?.eventName);
  } catch {
    return [];
  }
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
  const match = project.source.dateStart?.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

function getSourceYear(source) {
  const match = source.dateStart?.match(/\d{4}/);
  return match ? match[0] : '';
}

function getTaskList(source) {
  return [...source.tasks, source.customTask?.trim()].filter(Boolean).filter((task) => task !== '기타');
}

function getKnowledgeProfile(eventName) {
  const compactName = eventName.replace(/\s/g, '');
  return eventKnowledgeProfiles.find((profile) => profile.keywords.some((keyword) => compactName.includes(keyword)));
}

function inferEventType(sourceOrName) {
  const eventName = typeof sourceOrName === 'string' ? sourceOrName : sourceOrName.eventName;
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
    const indexA = responsibilityPriority.indexOf(a);
    const indexB = responsibilityPriority.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  return sorted.slice(0, 7).map((task) => taskPhraseMap[task]?.responsibility || task);
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

  if (tasks.includes('생중계 운영')) characteristics.push('온라인 송출');
  if (tasks.includes('VIP 의전')) characteristics.push('VIP 참석');
  if (tasks.some((task) => ['전시 운영', '공간 조성', '부대행사 운영'].includes(task))) characteristics.push('공간 운영');
  if (tasks.some((task) => ['사전등록 운영', '참가자 관리', '등록데스크 운영'].includes(task))) characteristics.push('참가자 관리');

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

  if (hasAny(['사전등록 운영', '참가자 관리', '등록데스크 운영'])) {
    roles.push('사전등록, 참가자 관리 및 현장 등록 운영 수행.');
  }

  if (hasAny(['협력사 관리', '연사 관리', 'VIP 의전'])) {
    roles.push('발주처, 협력사, 연사 및 주요 참석자 간 운영 협업 관리.');
  }

  if (hasAny(['무대 운영', '콘솔 운영', 'AV 운영', '생중계 운영', '시스템 운영'])) {
    roles.push('무대·기술·송출 흐름에 맞춘 현장 진행 관리.');
  }

  if (hasAny(['공간 조성', '전시 운영', '부대행사 운영', '동선 관리'])) {
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

  if (hasAny(['사전등록 운영', '참가자 관리', '등록데스크 운영'])) {
    outcomes.push('등록·참가자 관리 체계를 통합 운영하는 실무 역량 강화.');
  }

  if (hasAny(['협력사 관리', '연사 관리', 'VIP 의전'])) {
    outcomes.push('주요 이해관계자 응대 및 운영 협업 역량 강화.');
  }

  if (hasAny(['무대 운영', '콘솔 운영', 'AV 운영', '생중계 운영', '시스템 운영'])) {
    outcomes.push('현장 진행과 기술 운영을 병행하는 복합 행사 대응 역량 강화.');
  }

  if (hasAny(['결과보고서 작성', '정산 관리'])) {
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
  return [
    [eventName, client, year].filter(Boolean).join(' '),
    [eventName, year].filter(Boolean).join(' '),
    [eventName, venue].filter(Boolean).join(' '),
    [client, eventName].filter(Boolean).join(' '),
    [eventName, client].filter(Boolean).join(' '),
    eventName,
  ].filter((query, index, queries) => query && queries.indexOf(query) === index);
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

function scoreSearchCandidate(candidate, source) {
  const text = `${candidate.title || ''} ${candidate.text || ''}`;
  const compactText = text.replace(/\s/g, '');
  const compactName = source.eventName.replace(/\s/g, '');
  const compactClient = source.client.replace(/\s/g, '');
  const compactVenue = source.venue.replace(/\s/g, '');
  const year = getSourceYear(source);
  const infoKeywords = ['목적', '개최', '주최', '주관', '프로그램', '아젠다', '정책', '축제', '대회', '토론', '포럼', '행사', '참석', '참여', '지원', '문화', '교류', '발표', '장소'];
  let score = 0;
  const nameMatched = compactName.length >= 2 && compactText.includes(compactName);
  const clientMatched = compactClient.length >= 2 && compactText.includes(compactClient);
  const venueMatched = compactVenue.length >= 2 && compactText.includes(compactVenue);
  const yearMatched = Boolean(year && compactText.includes(year));

  if (nameMatched) score += 6;
  if (clientMatched) score += 3;
  if (venueMatched) score += 2;
  if (yearMatched) score += 2;
  infoKeywords.forEach((keyword) => {
    if (text.includes(keyword)) score += 1;
  });
  if (text.length > 80) score += 1;

  return {
    score,
    nameMatched,
    clientMatched,
    venueMatched,
    yearMatched,
    isReliable: nameMatched && score >= 8,
  };
}

async function fetchSearchCandidates(query, source) {
  const endpoint = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(4500) });
  if (!response.ok) return [];
  const data = await response.json();
  const candidates = [
    { text: data.AbstractText, url: data.AbstractURL || '', title: data.Heading || source.eventName },
    ...flattenRelatedTopics(data.RelatedTopics),
  ].filter((candidate) => candidate.text && normalizeSearchText(candidate.text).length > 40);

  return candidates
    .map((candidate) => ({
      ...candidate,
      query,
      text: normalizeSearchText(candidate.text),
      title: candidate.title || source.eventName,
      ...scoreSearchCandidate(candidate, source),
    }))
    .filter((candidate) => candidate.isReliable)
    .sort((a, b) => b.score - a.score);
}

async function searchEventInfo(source) {
  if (!source.eventName || !window.fetch) return null;

  for (const query of buildSearchQueries(source)) {
    try {
      const candidates = await fetchSearchCandidates(query, source);
      if (candidates.length > 0) return candidates[0];
    } catch {
      // Continue to the next query when browser/network restrictions block a request.
    }
  }

  return null;
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

function buildSearchOverviewBullets(source, searchResult, eventType) {
  const profile = getKnowledgeProfile(source.eventName);
  if (profile) return buildProfileOverviewBullets(profile);

  const text = `${searchResult.title || ''} ${searchResult.text || ''}`;
  const signals = buildSearchSignals(text);
  const agenda = signals.find((signal) => signal.includes('논의') || signal.includes('공유')) || `${eventType} 주요 아젠다 공유`;
  const programSignals = signals.filter((signal) => signal !== agenda).slice(0, 2);
  const program = programSignals.length > 0 ? `${programSignals.join(', ')} 운영` : '발표, 토론, 교류 프로그램 운영';
  const audience = includesAny(text, ['전문가', '관계자', '기관', '기업', '시민', '참가자'])
    ? '전문가, 관계기관 및 참가자 대상 프로그램 구성'
    : `${source.client || '관계기관'} 및 참가자 대상 프로그램 구성`;

  return [
    `${agenda}를 중심으로 한 ${eventType}`,
    audience,
    program,
  ].slice(0, 3);
}

async function generateAi(source) {
  const eventType = inferEventType(source);
  const tasks = getTaskList(source);
  const searchResult = await searchEventInfo(source);
  const overviewSource = searchResult ? 'search' : 'input';
  const eventOverview = searchResult ? buildSearchOverviewBullets(source, searchResult, eventType) : buildInputOverviewBullets(source, eventType);
  const eventCharacteristics = analyzeEventCharacteristics(source, eventType, searchResult);
  const responsibilities = buildPortfolioResponsibilities(tasks);
  const keyRoles = buildKeyRoles(source, eventType, eventCharacteristics);
  const outcomes = buildOutcomes(source, eventType, eventCharacteristics);

  return {
    eventOverview,
    overviewSource,
    searchQuery: searchResult?.query || buildSearchQueries(source)[0] || '',
    searchUrl: searchResult?.url || '',
    searchSourceName: searchResult?.title || '',
    eventType,
    eventCharacteristics,
    taskTags: buildTaskTags(tasks),
    responsibilities,
    keyRoles,
    outcomes,
    portfolioText: [...responsibilities, ...keyRoles, ...outcomes].map((item) => `- ${item}`).join('\n'),
  };
}

function buildInsights(projects) {
  const totalScale = projects.reduce((sum, project) => sum + Number(project.source.participantScale || 0), 0);
  const largest = [...projects].sort((a, b) => Number(b.source.participantScale || 0) - Number(a.source.participantScale || 0))[0];
  const yearly = projects.reduce((acc, project) => {
    const year = getProjectYear(project) || '미입력';
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});
  const types = projects.reduce((acc, project) => {
    const type = project.ai.eventType || '행사';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return {
    total: projects.length,
    mainPm: projects.filter((project) => project.source.participationLevel === '메인 PM').length,
    subPm: projects.filter((project) => project.source.participationLevel === '서브 PM').length,
    totalScale,
    largestEvent: largest?.source.participantScale ? `${largest.source.eventName} (${largest.source.participantScale}명)` : '아직 없음',
    yearly,
    types,
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
  return [...(ai.responsibilities || []), ...(ai.keyRoles || ai.careerSummary || []), ...(ai.outcomes || [])].map((item) => `- ${item}`).join('\n');
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
      dateEnd: form.isMultiDay ? form.dateEnd : '',
      customTask: form.tasks.includes('기타') ? form.customTask.trim() : '',
      participantScale: form.participantScale === '' ? '' : Number(form.participantScale),
    };
    const ai = await generateAi(source);

    if (editingId) {
      setProjects((current) =>
        current.map((project) =>
          project.id === editingId
            ? {
                ...project,
                source,
                ai,
                updatedAt: new Date().toISOString(),
              }
            : project,
        ),
      );
      setSelectedId(editingId);
      resetForm();
      setIsGenerating(false);
      return;
    }

    const project = {
      id: createId('event'),
      ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source,
      ai,
    };

    setProjects((current) => [project, ...current]);
    setSelectedId(project.id);
    setForm(emptyForm);
    setIsGenerating(false);
  }

  function startEdit(project) {
    setEditingId(project.id);
    setSelectedId(null);
    setForm(project.source);
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
    const fallbackText = [...(ai.responsibilities || []), ...(ai.keyRoles || ai.careerSummary || []), ...(ai.outcomes || [])].join('\n');
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
        <InsightCard icon={<BriefcaseBusiness />} label="총 프로젝트 수" value={insights.total} />
        <InsightCard icon={<TrendingUp />} label="메인 PM 수행 건수" value={insights.mainPm} />
        <InsightCard icon={<Sparkles />} label="서브 PM 수행 건수" value={insights.subPm} />
        <InsightCard icon={<Users />} label="누적 참가자 수" value={`${insights.totalScale}명`} />
        <InsightCard icon={<CalendarDays />} label="최대 규모 행사" value={insights.largestEvent} />
      </section>
      <section className="insight-breakdown">
        <Breakdown title="연도별 프로젝트 수" items={insights.yearly} emptyText="아직 연도별 데이터가 없습니다." />
        <Breakdown title="행사유형별 분포" items={insights.types} emptyText="아직 행사유형 데이터가 없습니다." />
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
  const needsCustomTask = form.tasks.includes('기타');

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
                    <label className="choice-pill" key={task}>
                      <input type="checkbox" checked={form.tasks.includes(task)} onChange={() => onToggleTask(task)} />
                      {task}
                    </label>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </fieldset>

        {needsCustomTask && (
          <label>
            기타 담당업무
            <input value={form.customTask} onChange={(event) => onChange('customTask', event.target.value)} placeholder="직접 입력" />
          </label>
        )}

        <label>
          참가규모
          <input type="number" min="0" value={form.participantScale} onChange={(event) => onChange('participantScale', event.target.value)} placeholder="참가규모 입력" />
          <span className="field-help">정확한 수치가 아니어도 됩니다. 대략적인 규모를 입력해주세요.</span>
        </label>

        <p className="generation-note">
          <Search size={16} />
          행사명+발주처+개최연도 기준으로 먼저 검색하고, 결과가 없으면 입력 기반 임시 개요를 생성합니다.
        </p>

        <div className="form-actions">
          {editingId && (
            <button className="ghost-button" type="button" onClick={onCancelEdit} disabled={isGenerating}>
              취소
            </button>
          )}
          <button className="primary-button" type="submit" disabled={isGenerating}>
            <Plus size={18} />
            {isGenerating ? 'AI 검색 및 생성 중' : editingId ? '수정 저장' : '저장하고 AI 결과 보기'}
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
                  <strong className={`level-pill ${getLevelClass(project.source.participationLevel)}`}>{project.source.participationLevel}</strong>
                </span>
                <strong>{project.source.eventName}</strong>
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
  const sourceLabel = project.ai.overviewSource === 'search' ? '검색 기반 개요' : '입력 기반 임시 개요';
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
            <h1>{project.source.eventName}</h1>
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
            <dd>{formatEventDate(project.source)}</dd>
          </div>
          <div>
            <dt>발주처</dt>
            <dd>{project.source.client}</dd>
          </div>
          <div>
            <dt>행사 장소</dt>
            <dd>{project.source.venue}</dd>
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
            <dt>담당업무 원본</dt>
            <dd>{getTaskList(project.source).join(', ') || '미입력'}</dd>
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
              <span className={`source-badge ${project.ai.overviewSource === 'search' ? 'source-search' : 'source-input'}`}>{sourceLabel}</span>
              <ul className="overview-list">
                {(Array.isArray(project.ai.eventOverview) ? project.ai.eventOverview : [project.ai.eventOverview]).slice(0, 3).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {project.ai.searchQuery && <p className="search-query">검색어: {project.ai.searchQuery}</p>}
              {project.ai.searchSourceName && <p className="search-query">출처: {project.ai.searchSourceName}</p>}
              {project.ai.searchUrl && (
                <a className="source-link" href={project.ai.searchUrl} target="_blank" rel="noreferrer">
                  검색 출처 보기
                </a>
              )}
            </>
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
