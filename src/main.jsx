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
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'career-ledger-events-v3';
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

function getTaskList(source) {
  return [...source.tasks, source.customTask?.trim()].filter(Boolean).filter((task) => task !== '기타');
}

function inferEventType(eventName) {
  const name = eventName.replace(/\s/g, '');
  const rules = [
    ['토론회', '토론회'],
    ['포럼', '포럼'],
    ['세미나', '세미나'],
    ['컨퍼런스', '컨퍼런스'],
    ['축제', '축제'],
    ['페스티벌', '축제'],
    ['시상식', '시상식'],
    ['대회', '시상식'],
    ['어워드', '시상식'],
    ['박람회', '박람회'],
    ['전시', '전시'],
    ['워크숍', '워크숍'],
    ['교육', '교육'],
  ];
  return rules.find(([keyword]) => name.includes(keyword))?.[1] || '행사';
}

function buildTaskTags(tasks) {
  return tasks.map((task) => `#${task.replace(/\s/g, '')}`).slice(0, 8);
}

function buildCareerSentence(source) {
  const tasks = getTaskList(source);
  const taskText = tasks.length ? tasks.join(', ') : '행사 운영';

  if (source.participationLevel === '메인 PM') {
    return `${taskText}을 중심으로 행사 운영 전반을 총괄하며 발주처 요구사항과 현장 실행 흐름을 조율하였다.`;
  }

  if (source.participationLevel === '서브 PM') {
    return `${taskText}을 담당하며 메인 PM과 협업해 사전 준비부터 현장 운영까지 실행 품질을 안정적으로 지원하였다.`;
  }

  return `${taskText}을 수행하며 현장 운영 흐름을 지원하고 참가자와 주요 관계자의 행사 경험을 안정적으로 관리하였다.`;
}

function mockGenerateAi(source) {
  const eventType = inferEventType(source.eventName);
  const tasks = getTaskList(source);
  const dateText = formatEventDate(source);
  const scaleText = source.participantScale ? ` 약 ${source.participantScale}명 규모로` : '';

  return {
    eventOverview: `${source.eventName}은 ${source.client || '발주처'}가 주관한 ${eventType} 성격의 행사로, ${dateText} ${source.venue}에서 진행되었다. ${scaleText} 운영된 이 행사는 참가자와 관계자가 한 공간에서 목적에 맞는 프로그램을 경험하도록 설계되었다. ${source.participationLevel} 역할로 참여하며 행사 목적, 장소 조건, 운영 동선을 고려한 실행 경험을 축적했다.`,
    eventType,
    taskTags: buildTaskTags(tasks),
    careerSentence: buildCareerSentence(source),
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

function App() {
  const [ownerId] = useState(getOwnerId);
  const [projects, setProjects] = useState(() => loadProjects(ownerId));
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [copied, setCopied] = useState(false);
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

  function submitProject(event) {
    event.preventDefault();
    const source = {
      ...form,
      eventName: form.eventName.trim(),
      client: form.client.trim(),
      venue: form.venue.trim(),
      dateEnd: form.isMultiDay ? form.dateEnd : '',
      customTask: form.tasks.includes('기타') ? form.customTask.trim() : '',
      participantScale: form.participantScale === '' ? '' : Number(form.participantScale),
    };
    const ai = mockGenerateAi(source);

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
      resetForm();
      setSelectedId(editingId);
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

  function copyCareerSentence() {
    if (!selectedProject) return;
    navigator.clipboard?.writeText(selectedProject.ai.careerSentence);
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
        <ProjectDetail project={selectedProject} copied={copied} onCopy={copyCareerSentence} onDelete={requestDelete} onEdit={startEdit} />
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
          <p>사실만 입력하면 AI가 행사 경험을 경력 자산으로 정리합니다.</p>
        </section>
      </header>

      <InsightDashboard insights={insights} />

      <section className="content-grid">
        <ProjectForm form={form} editingId={editingId} onChange={updateForm} onToggleTask={toggleTask} onSubmit={submitProject} onCancelEdit={resetForm} />
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

function ProjectForm({ form, editingId, onChange, onToggleTask, onSubmit, onCancelEdit }) {
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

        <div className="form-actions">
          {editingId && (
            <button className="ghost-button" type="button" onClick={onCancelEdit}>
              취소
            </button>
          )}
          <button className="primary-button" type="submit">
            <Plus size={18} />
            {editingId ? '수정 저장' : '저장하고 AI 결과 보기'}
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
                <p>{project.ai.careerSentence}</p>
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
            <dt>담당업무</dt>
            <dd>{getTaskList(project.source).join(', ') || '미입력'}</dd>
          </div>
        </dl>
      </article>

      <article className="panel ai-panel">
        <div className="detail-heading">
          <div className="section-title">
            <p>AI Generated</p>
            <h2>AI 경력 자산화 결과</h2>
          </div>
          <button className="ghost-button" onClick={onCopy}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? '복사됨' : '경력 문장 복사'}
          </button>
        </div>
        <ResultBlock title="행사 개요">{project.ai.eventOverview}</ResultBlock>
        <ResultBlock title="행사유형">
          <div className="tag-row">
            <span>{project.ai.eventType}</span>
          </div>
        </ResultBlock>
        <ResultBlock title="업무 태그">
          <div className="tag-row skill-tags">
            {project.ai.taskTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </ResultBlock>
        <ResultBlock title="경력 문장">
          <p className="portfolio-sentence">{project.ai.careerSentence}</p>
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
