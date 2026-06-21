import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Copy,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'career-ledger-projects-v2';
const LEGACY_STORAGE_KEY = 'career-ledger-projects-v1';
const OWNER_KEY = 'career-ledger-owner-id';
const participationLevels = ['리드', '서브', '지원'];

const emptyForm = {
  dateMode: 'year',
  dateValue: '',
  projectName: '',
  client: '',
  participationLevel: '리드',
  note: '',
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

function normalizeProject(project, ownerId) {
  if (!project?.source || project.id?.startsWith('seed-')) return null;
  return {
    ...project,
    ownerId: project.ownerId || ownerId,
    ai: project.ai || mockTranslate(project.source),
  };
}

function loadProjects(ownerId) {
  const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((project) => normalizeProject(project, ownerId))
      .filter(Boolean)
      .filter((project) => project.ownerId === ownerId);
  } catch {
    return [];
  }
}

function mockTranslate(source) {
  const rawWords = source.note
    .split(/[,\n/]+/)
    .map((word) => word.trim())
    .filter(Boolean);
  const keywords = Array.from(new Set(rawWords)).slice(0, 5);
  const scaleText = source.participantScale ? `${source.participantScale}명 규모` : '선택 규모';

  return {
    recognizedKeywords: keywords.length ? keywords : ['기획', '협업', '실행'],
    summary: `${source.client || '내부/외부 고객'}의 ${source.projectName || '프로젝트'}에서 ${source.participationLevel} 역할로 참여한 경험입니다.`,
    responsibilities: [
      `${source.note || '핵심 업무'}를 경력 서술에 적합한 실행 단위로 정리`,
      `${scaleText}의 이해관계자 또는 참여자 흐름을 고려한 운영 지원`,
      `${source.dateValue || '기록 기간'} 동안 프로젝트 맥락과 결과를 구조화`,
    ],
    skillTags: buildSkillTags(source.note, source.participationLevel),
    portfolioSentence: `${source.projectName || '프로젝트'}에서 ${source.participationLevel}로 참여해 ${source.note || '주요 과업'}을 수행하며 실행력과 협업 역량을 증명했습니다.`,
  };
}

function buildSkillTags(note, level) {
  const base = level === '리드' ? ['리딩', '문제정의'] : level === '서브' ? ['협업', '운영개선'] : ['실행지원', '문서화'];
  const text = note.toLowerCase();
  const inferred = [
    ['분석', '데이터 분석'],
    ['리포트', '성과 정리'],
    ['콘텐츠', '콘텐츠 기획'],
    ['교육', '교육 운영'],
    ['브랜드', '브랜딩'],
    ['설문', '사용자 피드백'],
  ]
    .filter(([needle]) => text.includes(needle))
    .map(([, tag]) => tag);

  return Array.from(new Set([...base, ...inferred])).slice(0, 6);
}

function getProjectYear(project) {
  const match = project.source.dateValue.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

function App() {
  const [ownerId] = useState(getOwnerId);
  const [projects, setProjects] = useState(() => loadProjects(ownerId));
  const [form, setForm] = useState(emptyForm);
  const [selectedId, setSelectedId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }, [projects]);

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => getProjectYear(b) - getProjectYear(a) || new Date(b.createdAt) - new Date(a.createdAt)),
    [projects],
  );

  const selectedProject = projects.find((project) => project.id === selectedId);
  const insights = useMemo(() => {
    const countByLevel = (level) => projects.filter((project) => project.source.participationLevel === level).length;
    const totalScale = projects.reduce((sum, project) => sum + Number(project.source.participantScale || 0), 0);
    return {
      total: projects.length,
      lead: countByLevel('리드'),
      sub: countByLevel('서브'),
      support: countByLevel('지원'),
      scale: totalScale,
      recent: sortedProjects[0]?.source.projectName || '아직 없음',
    };
  }, [projects, sortedProjects]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submitProject(event) {
    event.preventDefault();
    const source = {
      ...form,
      projectName: form.projectName.trim(),
      client: form.client.trim(),
      note: form.note.trim(),
      participantScale: form.participantScale === '' ? '' : Number(form.participantScale),
    };
    const project = {
      id: createId('project'),
      ownerId,
      createdAt: new Date().toISOString(),
      source,
      ai: mockTranslate(source),
    };
    setProjects((current) => [project, ...current]);
    setSelectedId(project.id);
    setForm(emptyForm);
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
    }

    if (confirmAction?.type === 'reset') {
      setProjects([]);
      setSelectedId(null);
    }

    setConfirmAction(null);
  }

  function copyPortfolioSentence() {
    if (!selectedProject) return;
    navigator.clipboard?.writeText(selectedProject.ai.portfolioSentence);
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
        <ProjectDetail project={selectedProject} copied={copied} onCopy={copyPortfolioSentence} onDelete={requestDelete} />
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
            프로젝트 추가
          </a>
        </nav>
        <section className="hero-copy">
          <p className="eyebrow">AI Career Memory</p>
          <h1>잊혀지는 경험을 자산으로.</h1>
          <p>경력을 기록하고, 정리하고, 성장시키다.</p>
        </section>
      </header>

      <section className="insight-grid" aria-label="Career Insights">
        <InsightCard icon={<BriefcaseBusiness />} label="총 프로젝트 수" value={insights.total} />
        <InsightCard icon={<TrendingUp />} label="리드 프로젝트 수" value={insights.lead} />
        <InsightCard icon={<Sparkles />} label="서브 프로젝트 수" value={insights.sub} />
        <InsightCard icon={<Check />} label="지원 프로젝트 수" value={insights.support} />
        <InsightCard icon={<Users />} label="누적 참가규모" value={`${insights.scale}명`} />
        <InsightCard icon={<CalendarDays />} label="최근 프로젝트" value={insights.recent} wide />
      </section>

      <section className="content-grid">
        <ProjectForm form={form} onChange={updateForm} onSubmit={submitProject} />
        <ProjectList projects={sortedProjects} onSelect={setSelectedId} onDelete={requestDelete} onReset={requestReset} />
      </section>

      <ConfirmModal action={confirmAction} onCancel={() => setConfirmAction(null)} onConfirm={confirmPendingAction} />
    </main>
  );
}

function InsightCard({ icon, label, value, wide = false }) {
  return (
    <article className={`insight-card ${wide ? 'wide' : ''}`}>
      <span className="icon-badge">{React.cloneElement(icon, { size: 19 })}</span>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function ProjectForm({ form, onChange, onSubmit }) {
  return (
    <section className="panel form-panel" id="add-project">
      <div className="section-title">
        <p>Project Input</p>
        <h2>새 프로젝트 저장</h2>
      </div>
      <form onSubmit={onSubmit}>
        <div className="field-row two">
          <label>
            날짜 형식
            <select value={form.dateMode} onChange={(event) => onChange('dateMode', event.target.value)}>
              <option value="year">연도</option>
              <option value="month">연월</option>
              <option value="day">연월일</option>
              <option value="period">기간</option>
            </select>
          </label>
          <label>
            날짜/기간
            <input
              value={form.dateValue}
              onChange={(event) => onChange('dateValue', event.target.value)}
              placeholder="예: 2025 또는 2025.03 - 2025.06"
              required
            />
          </label>
        </div>
        <label>
          프로젝트명
          <input value={form.projectName} onChange={(event) => onChange('projectName', event.target.value)} placeholder="예: 채용 브랜딩 리뉴얼" required />
        </label>
        <label>
          발주처
          <input value={form.client} onChange={(event) => onChange('client', event.target.value)} placeholder="예: 사내 HR팀, 고객사명" />
        </label>
        <div className="field-row two">
          <label>
            참여수준
            <select value={form.participationLevel} onChange={(event) => onChange('participationLevel', event.target.value)}>
              {participationLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
          <label>
            참가규모
            <input
              type="number"
              min="0"
              value={form.participantScale}
              onChange={(event) => onChange('participantScale', event.target.value)}
              placeholder="선택 입력"
            />
          </label>
        </div>
        <label>
          한줄메모
          <textarea
            value={form.note}
            onChange={(event) => onChange('note', event.target.value)}
            placeholder="슬래시/콤마/줄바꿈/문장 모두 가능"
            rows="5"
            required
          />
        </label>
        <button className="primary-button" type="submit">
          <Plus size={18} />
          저장하고 AI 번역 보기
        </button>
      </form>
    </section>
  );
}

function ProjectList({ projects, onSelect, onDelete, onReset }) {
  return (
    <section className="panel">
      <div className="section-title list-title">
        <div>
          <p>Recent Projects</p>
          <h2>프로젝트 목록</h2>
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
          <strong>아직 저장된 프로젝트가 없습니다.</strong>
          <p>새 프로젝트를 저장하면 이 브라우저에만 목록과 Career Insights가 기록됩니다.</p>
        </div>
      ) : (
        <div className="project-list">
          {projects.map((project) => (
            <article className="project-card" key={project.id}>
              <button className="project-open" onClick={() => onSelect(project.id)}>
                <span className="project-meta">
                  <span>{project.source.dateValue}</span>
                  <strong className={`level-pill level-${project.source.participationLevel}`}>{project.source.participationLevel}</strong>
                </span>
                <strong>{project.source.projectName}</strong>
                <span>{project.source.client || '발주처 미입력'}</span>
                <p>{project.ai.portfolioSentence}</p>
              </button>
              <button className="delete-button" onClick={() => onDelete(project.id)} aria-label={`${project.source.projectName} 삭제`}>
                <Trash2 size={16} />
                삭제
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ProjectDetail({ project, copied, onCopy, onDelete }) {
  return (
    <section className="detail-layout">
      <article className="panel">
        <div className="detail-heading">
          <div className="section-title">
            <p>Source Data</p>
            <h1>{project.source.projectName}</h1>
          </div>
          <button className="ghost-button danger-soft" onClick={() => onDelete(project.id)}>
            <Trash2 size={18} />
            삭제
          </button>
        </div>
        <dl className="source-list">
          <div>
            <dt>날짜/기간</dt>
            <dd>{project.source.dateValue}</dd>
          </div>
          <div>
            <dt>발주처</dt>
            <dd>{project.source.client || '미입력'}</dd>
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
            <dt>한줄메모</dt>
            <dd>{project.source.note}</dd>
          </div>
        </dl>
      </article>

      <article className="panel ai-panel">
        <div className="detail-heading">
          <div className="section-title">
            <p>AI Translation</p>
            <h2>경력 문장 변환 결과</h2>
          </div>
          <button className="ghost-button" onClick={onCopy}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? '복사됨' : '복사'}
          </button>
        </div>
        <ResultBlock title="인식된 키워드">
          <div className="tag-row">
            {project.ai.recognizedKeywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </ResultBlock>
        <ResultBlock title="프로젝트 요약">{project.ai.summary}</ResultBlock>
        <ResultBlock title="담당업무">
          <ul>
            {project.ai.responsibilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </ResultBlock>
        <ResultBlock title="역량 태그">
          <div className="tag-row skill-tags">
            {project.ai.skillTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </ResultBlock>
        <ResultBlock title="포트폴리오 문장">
          <p className="portfolio-sentence">{project.ai.portfolioSentence}</p>
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
