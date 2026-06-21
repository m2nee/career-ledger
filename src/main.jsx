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

const STORAGE_KEY = 'career-ledger-events-v5';
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
  '행사 기획': { responsibility: '행사 기획', summary: '행사 콘셉트 및 운영 방향 기획' },
  '운영계획 수립': { responsibility: '운영계획 수립', summary: '행사 운영계획 수립 및 실행 체계 정리' },
  '제안서 작성': { responsibility: '제안서 작성', summary: '제안서 구성 및 실행 전략 문서화' },
  '예산 관리': { responsibility: '예산 관리', summary: '행사 예산 계획 및 집행 관리' },
  '사전등록 운영': { responsibility: '사전등록 운영', summary: '사전등록 프로세스 설계 및 운영' },
  '참가자 관리': { responsibility: '참가자 관리', summary: '참가자 등록 체계 구축 및 관리' },
  '연사 관리': { responsibility: '연사 관리', summary: '연사 커뮤니케이션 및 발표 준비 관리' },
  '협력사 관리': { responsibility: '협력사 관리', summary: '협력사 및 운영인력 관리' },
  '홍보 운영': { responsibility: '홍보 운영', summary: '행사 홍보 채널 운영 및 참여 유도' },
  '현장 총괄 운영': { responsibility: '현장 총괄 운영', summary: '행사 현장 운영 총괄' },
  '등록데스크 운영': { responsibility: '등록데스크 운영', summary: '참가자 등록데스크 운영 및 현장 응대 관리' },
  'VIP 의전': { responsibility: 'VIP 의전 지원', summary: 'VIP 의전 동선 및 현장 응대 관리' },
  '무대 운영': { responsibility: '무대 운영', summary: '무대 진행 큐시트 및 현장 전환 관리' },
  '콘솔 운영': { responsibility: '콘솔 운영', summary: '콘솔 운영 및 현장 진행 신호 관리' },
  '동선 관리': { responsibility: '동선 관리', summary: '참가자 및 주요 인사 동선 관리' },
  '시나리오 작성': { responsibility: '시나리오 작성', summary: '행사 시나리오 및 진행 흐름 설계' },
  '발표자료 관리': { responsibility: '발표자료 관리', summary: '발표자료 취합, 검수 및 현장 반영 관리' },
  '프로그램 운영': { responsibility: '프로그램 운영', summary: '세부 프로그램 운영 및 시간표 관리' },
  'AV 운영': { responsibility: 'AV 운영', summary: 'AV 장비 운영 및 현장 기술 지원' },
  '생중계 운영': { responsibility: '생중계 운영', summary: '생중계 운영 및 송출 품질 관리' },
  '시스템 운영': { responsibility: '시스템 운영', summary: '행사 운영 시스템 세팅 및 현장 관리' },
  '공간 조성': { responsibility: '공간 조성', summary: '행사 공간 구성 및 현장 조성 관리' },
  '전시 운영': { responsibility: '전시 운영', summary: '전시 공간 운영 및 참가자 관람 흐름 관리' },
  '부대행사 운영': { responsibility: '부대행사 운영', summary: '부대행사 프로그램 운영 및 현장 관리' },
  '결과보고서 작성': { responsibility: '결과보고서 작성', summary: '행사 결과보고서 작성 및 성과 정리' },
  '정산 관리': { responsibility: '정산 관리', summary: '행사 정산 자료 취합 및 비용 관리' },
};

const eventKnowledgeProfiles = [
  {
    keywords: ['함상토론회'],
    type: '정책 토론 행사',
    purposeAction: '해양안보와 국방 현안을 논의하기 위해',
    background: '군, 산, 학, 연 관계자가 주요 안보 이슈를 공유하고 발전 방향을 모색하기 위해 마련되는 자리',
    programs: ['정책 토론', '전문가 발표', '안보 현안 공유', '관계기관 교류'],
    feature: '함정 또는 해군 관련 공간의 상징성을 활용해 해양안보 의제를 집중적으로 다루는 행사',
  },
  {
    keywords: ['허준축제'],
    type: '지역 문화축제',
    purposeAction: '조선시대 의학자 허준 선생의 업적을 기리고 한의학 및 건강 문화를 알리기 위해',
    background: '지역 역사문화 자원과 건강 콘텐츠를 시민 참여형 축제로 확장하기 위해 개최되는 행사',
    programs: ['전시', '체험 프로그램', '공연', '건강 문화 콘텐츠'],
    feature: '한의학, 건강, 역사문화 콘텐츠를 결합한 시민 참여형 축제',
  },
  {
    keywords: ['장애경제인대회', '장애인경제인대회'],
    type: '성과 공유 및 교류 행사',
    purposeAction: '장애인기업의 성장과 경제활동 활성화를 지원하고 우수 성과를 공유하기 위해',
    background: '장애경제인의 경쟁력 강화와 정책적 지원 기반을 확산하기 위해 마련되는 행사',
    programs: ['유공자 포상', '정책 발표', '기업 교류', '우수 사례 공유'],
    feature: '장애인기업의 성과를 조명하고 경제활동 참여 확대를 도모하는 행사',
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

function inferEventType(eventName) {
  const name = eventName.replace(/\s/g, '');
  const profile = getKnowledgeProfile(eventName);
  if (profile) return profile.type;

  const rules = [
    ['토론회', '토론회'],
    ['포럼', '포럼'],
    ['세미나', '세미나'],
    ['컨퍼런스', '컨퍼런스'],
    ['축제', '축제'],
    ['페스티벌', '축제'],
    ['시상식', '시상식'],
    ['대회', '대회'],
    ['어워드', '시상식'],
    ['박람회', '박람회'],
    ['전시', '전시'],
    ['워크숍', '워크숍'],
    ['교육', '교육'],
  ];
  return rules.find(([keyword]) => name.includes(keyword))?.[1] || '행사';
}

function getKnowledgeProfile(eventName) {
  const compactName = eventName.replace(/\s/g, '');
  return eventKnowledgeProfiles.find((profile) => profile.keywords.some((keyword) => compactName.includes(keyword)));
}

function buildTaskTags(tasks) {
  return tasks.map((task) => `#${task.replace(/\s/g, '')}`).slice(0, 8);
}

function buildPortfolioResponsibilities(tasks) {
  if (tasks.length === 0) return ['행사 운영'];
  return tasks.map((task) => taskPhraseMap[task]?.responsibility || task);
}

function buildCareerSummary(source) {
  const tasks = getTaskList(source);
  const summaries = tasks.map((task) => taskPhraseMap[task]?.summary || `${task} 운영`).slice(0, 8);
  const roleSummary = {
    '메인 PM': '행사 기획 및 운영 총괄',
    '서브 PM': '메인 PM 협업 기반 세부 운영 관리',
    '현장 운영 지원': '현장 운영 지원 및 참가자 응대 관리',
  }[source.participationLevel];

  return [...new Set([roleSummary, ...summaries])].slice(0, 8);
}

function buildSearchQueries(source) {
  const eventName = source.eventName.trim();
  const client = source.client.trim();
  const year = getSourceYear(source);
  return [
    [eventName, client].filter(Boolean).join(' '),
    eventName,
    [eventName, year].filter(Boolean).join(' '),
  ].filter((query, index, queries) => query && queries.indexOf(query) === index);
}

function flattenRelatedTopics(topics = []) {
  return topics.flatMap((item) => {
    if (item.Text) return [{ text: item.Text, url: item.FirstURL || '' }];
    if (item.Topics) return flattenRelatedTopics(item.Topics);
    return [];
  });
}

function scoreSearchCandidate(candidate, source) {
  const text = candidate.text || '';
  const compactText = text.replace(/\s/g, '');
  const compactName = source.eventName.replace(/\s/g, '');
  const year = getSourceYear(source);
  const infoKeywords = ['목적', '개최', '주최', '주관', '프로그램', '정책', '축제', '대회', '토론', '포럼', '행사', '참여', '지원', '문화', '교류'];
  let score = 0;

  if (compactText.includes(compactName)) score += 5;
  if (source.client && compactText.includes(source.client.replace(/\s/g, ''))) score += 3;
  if (year && compactText.includes(year)) score += 2;
  infoKeywords.forEach((keyword) => {
    if (text.includes(keyword)) score += 1;
  });
  if (text.length > 80) score += 1;
  if (text.length > 180) score += 1;
  return score;
}

function normalizeSearchText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/\([^)]*동음이의어[^)]*\)/g, '')
    .trim();
}

function topicParticle(text) {
  const last = text.trim().charCodeAt(text.trim().length - 1);
  if (last < 0xac00 || last > 0xd7a3) return '은';
  return (last - 0xac00) % 28 === 0 ? '는' : '은';
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
      score: scoreSearchCandidate(candidate, source),
    }))
    .filter((candidate) => candidate.score >= 3)
    .sort((a, b) => b.score - a.score);
}

async function searchEventInfo(source) {
  if (!source.eventName || !window.fetch) return null;

  for (const query of buildSearchQueries(source)) {
    try {
      const candidates = await fetchSearchCandidates(query, source);
      if (candidates.length > 0) {
        return candidates[0];
      }
    } catch {
      // Ignore individual query failures and continue through the fallback priority.
    }
  }

  return null;
}

function buildProfileOverview(source, profile, isTemporary) {
  const host = source.client ? `${source.client} 등 관련 기관` : '관련 기관';
  const venueText = source.venue ? ` ${source.venue}에서 진행되는` : '';
  const prefix = isTemporary ? '입력된 행사명과 알려진 행사 성격을 바탕으로 보면, ' : '';

  return `${prefix}${source.eventName}${topicParticle(source.eventName)} ${profile.purposeAction} 개최되는 ${profile.type}이다. ${host}이 참여하는 이 행사는 ${profile.background}이며, ${profile.programs.join(', ')} 등을 통해 주요 의제와 성과를 공유한다.${venueText} 행사로서 ${profile.feature}라는 특징을 가진다.`;
}

function buildInputBasedOverview(source, eventType) {
  const profile = getKnowledgeProfile(source.eventName);
  if (profile) return buildProfileOverview(source, profile, true);

  const dateText = formatEventDate(source);
  const hostText = source.client ? `${source.client}가 추진하는` : '발주처와 운영 주체가 마련한';
  const venueText = source.venue ? `${source.venue}에서 열리는` : '지정된 장소에서 열리는';
  const datePart = dateText ? `${dateText} ` : '';
  const scaleText = source.participantScale ? ` 약 ${source.participantScale}명 규모의 참가자를 대상으로` : ' 참가자와 주요 관계자를 대상으로';

  return `${source.eventName}은 ${hostText} ${eventType} 성격의 행사로, ${datePart}${venueText} 프로젝트이다. 공개 검색 결과를 확인하지 못한 상태이므로 세부 목적과 개최 배경은 추가 검증이 필요하지만, 입력 정보상${scaleText} 프로그램 운영, 현장 동선, 관계자 커뮤니케이션이 함께 요구되는 행사로 정리할 수 있다.`;
}

function buildSearchBasedOverview(source, searchResult, eventType) {
  const profile = getKnowledgeProfile(source.eventName);
  if (profile) return buildProfileOverview(source, profile, false);

  const text = searchResult.text;
  const compactName = source.eventName.replace(/\s/g, '');
  const firstUsefulSentence = text
    .split(/(?<=[.!?。]|다\.|요\.)\s+/)
    .map((sentence) => sentence.trim())
    .find((sentence) => sentence.length > 35 && !sentence.replace(/\s/g, '').startsWith(compactName));
  const evidence = firstUsefulSentence || text.slice(0, 220);
  const hostText = source.client ? `${source.client}와 관련된` : '공개 자료에서 확인되는';
  const venueText = source.venue ? ` 입력된 개최 장소는 ${source.venue}이며,` : '';

  return `${source.eventName}은 ${hostText} ${eventType} 성격의 행사로, ${evidence} ${venueText} 행사 목적과 주요 내용을 바탕으로 관계자 참여, 프로그램 운영, 현장 경험 설계가 함께 요구되는 프로젝트로 이해할 수 있다.`;
}

async function generateAi(source) {
  const eventType = inferEventType(source.eventName);
  const tasks = getTaskList(source);
  const searchResult = await searchEventInfo(source);
  const overviewSource = searchResult ? 'search' : 'input';
  const eventOverview = searchResult ? buildSearchBasedOverview(source, searchResult, eventType) : buildInputBasedOverview(source, eventType);
  const responsibilities = buildPortfolioResponsibilities(tasks);
  const careerSummary = buildCareerSummary(source);

  return {
    eventOverview,
    overviewSource,
    searchQuery: searchResult?.query || buildSearchQueries(source)[0] || '',
    searchUrl: searchResult?.url || '',
    eventType,
    taskTags: buildTaskTags(tasks),
    responsibilities,
    careerSummary,
    portfolioText: [...responsibilities, ...careerSummary].map((item) => `- ${item}`).join('\n'),
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
  return project.ai.careerSummary?.[0] || project.ai.responsibilities?.[0] || '포트폴리오 문구 생성';
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
    navigator.clipboard?.writeText(selectedProject.ai.portfolioText || selectedProject.ai.careerSummary?.join('\n') || '');
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
        <ProjectDetail project={selectedProject} copied={copied} onCopy={copyPortfolioText} onDelete={requestDelete} onEdit={startEdit} />
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
          <p>행사명을 조사하고, 사실 입력을 포트폴리오 문구로 정리합니다.</p>
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
          <input value={form.eventName} onChange={(event) => onChange('eventName', event.target.value)} placeholder="예: 제22회 함상토론회" required />
        </label>

        <div className="field-row two">
          <label>
            발주처
            <input value={form.client} onChange={(event) => onChange('client', event.target.value)} placeholder="예: 해군본부" required />
          </label>
          <label>
            행사 장소
            <input value={form.venue} onChange={(event) => onChange('venue', event.target.value)} placeholder="예: 부산 해군작전기지 마라도함" required />
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
          <input type="number" min="0" value={form.participantScale} onChange={(event) => onChange('participantScale', event.target.value)} placeholder="예: 300" />
          <span className="field-help">정확한 수치가 아니어도 됩니다. 대략적인 규모를 입력해주세요.</span>
        </label>

        <p className="generation-note">
          <Search size={16} />
          행사명+발주처, 행사명, 행사명+개최연도 순서로 공개 정보를 찾아 행사 개요를 생성합니다.
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

function ProjectDetail({ project, copied, onCopy, onDelete, onEdit }) {
  const sourceLabel = project.ai.overviewSource === 'search' ? '검색 기반 개요' : '입력 기반 임시 개요';

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
        <ResultBlock title="행사 개요">
          <span className={`source-badge ${project.ai.overviewSource === 'search' ? 'source-search' : 'source-input'}`}>{sourceLabel}</span>
          <p>{project.ai.eventOverview}</p>
          {project.ai.searchQuery && <p className="search-query">검색어: {project.ai.searchQuery}</p>}
          {project.ai.searchUrl && (
            <a className="source-link" href={project.ai.searchUrl} target="_blank" rel="noreferrer">
              검색 출처 보기
            </a>
          )}
        </ResultBlock>
        <ResultBlock title="행사유형">
          <div className="tag-row">
            <span>{project.ai.eventType}</span>
          </div>
        </ResultBlock>
        <ResultBlock title="담당업무">
          <ul className="portfolio-list">
            {(project.ai.responsibilities || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </ResultBlock>
        <ResultBlock title="업무 태그">
          <div className="tag-row skill-tags">
            {(project.ai.taskTags || []).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </ResultBlock>
        <ResultBlock title="경력 요약">
          <ul className="portfolio-list strong-list">
            {(project.ai.careerSummary || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </ResultBlock>
      </article>
    </section>
  );
}

function ResultBlock({ title, children }) {
  return (
    <section className="result-block">
      <h3>{title}</h3>
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
