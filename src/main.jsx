import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Copy,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'career-ledger-projects-v1';
const participationLevels = ['리드', '서브', '지원'];

const starterProjects = [
  {
    id: 'seed-1',
    createdAt: '2026-06-21T09:00:00.000Z',
    source: {
      dateMode: 'period',
      dateValue: '2024.03 - 2024.11',
      projectName: '신규 브랜드 런칭 캠페인',
      client: '오로라 스튜디오',
      participationLevel: '리드',
      note: '브랜드 메시지 정리 / 런칭 콘텐츠 운영 / 성과 리포트',
      participantScale: 12,
    },
  },
  {
    id: 'seed-2',
    createdAt: '2026-06-21T09:05:00.000Z',
    source: {
      dateMode: 'month',
      dateValue: '2025.02',
      projectName: '파트너 교육 운영 개선',
      client: '넥스트랩',
      participationLevel: '서브',
      note: '교육자료 개편, 신청 흐름 정리, 만족도 설문 분석',
      participantScale: 38,
    },
  },
].map((project) => ({ ...project, ai: mockTranslate(project.source) }));

const emptyForm = {
  dateMode: 'year',
  dateValue: '',
  projectName: '',
  client: '',
  participationLevel: '리드',
  note: '',
  participantScale: '',
};

function loadProjects() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return starterProjects;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : starterProjects;
  } catch {
    return starterProjects;
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
  const [projects, setProjects] = useState(loadProjects);
  const [form, setForm] = useState(emptyForm);
  const [selectedId, setSelectedId] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
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
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      source,
      ai: mockTranslate(source),
    };
    setProjects((current) => [project, ...current]);
    setSelectedId(project.id);
    setForm(emptyForm);
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
        <ProjectDetail project={selectedProject} copied={copied} onCopy={copyPortfolioSentence} />
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
        <ProjectList projects={sortedProjects} onSelect={setSelectedId} />
      </section>
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

function ProjectList({ projects, onSelect }) {
  return (
    <section className="panel">
      <div className="section-title">
        <p>Recent Projects</p>
        <h2>프로젝트 목록</h2>
      </div>
      <div className="project-list">
        {projects.map((project) => (
          <button className="project-card" key={project.id} onClick={() => onSelect(project.id)}>
            <span className="project-meta">
              <span>{project.source.dateValue}</span>
              <strong className={`level-pill level-${project.source.participationLevel}`}>{project.source.participationLevel}</strong>
            </span>
            <strong>{project.source.projectName}</strong>
            <span>{project.source.client || '발주처 미입력'}</span>
            <p>{project.ai.portfolioSentence}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function ProjectDetail({ project, copied, onCopy }) {
  return (
    <section className="detail-layout">
      <article className="panel">
        <div className="section-title">
          <p>Source Data</p>
          <h1>{project.source.projectName}</h1>
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

createRoot(document.getElementById('root')).render(<App />);
