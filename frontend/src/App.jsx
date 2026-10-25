
import { useMemo, useState } from "react";
import axios from "axios";
import {
  FileText,
  Upload,
  Sparkles,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  Target,
  RefreshCw,
  GraduationCap,
  BriefcaseBusiness,
  Award,
  Code2,
  TrendingUp,
  Lightbulb,
  BarChart3,
  PieChart as PieChartIcon,
  ChevronRight,
  X,
  Layers,
  Trophy,
  BookOpen,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://resumeiq-api-lrdy.onrender.com"
    : "http://127.0.0.1:8000");

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const SKILL_GROUPS = [
  {
    key: "programming_languages",
    label: "Programming Languages",
    color: "#6366f1",
  },
  {
    key: "databases_and_vector_stores",
    label: "Databases & Vector Stores",
    color: "#0ea5e9",
  },
  {
    key: "ai_and_machine_learning",
    label: "AI & Machine Learning",
    color: "#8b5cf6",
  },
  {
    key: "frameworks_and_tools",
    label: "Frameworks & Tools",
    color: "#10b981",
  },
];

const CHART_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#f97316",
];

function getText(value, fallback = "") {
  if (value === null || value === undefined) return fallback;

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => getText(item)).filter(Boolean).join(", ");
  }

  if (typeof value === "object") {
    const preferredKeys = [
      "name",
      "title",
      "degree",
      "role",
      "description",
      "organization",
      "institution",
      "skill",
      "certificate",
      "technology",
      "text",
    ];

    for (const key of preferredKeys) {
      if (value[key] !== null && value[key] !== undefined) {
        return getText(value[key]);
      }
    }
  }

  return fallback;
}

function toList(value) {
  if (value === null || value === undefined || value === "") {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function normalizeSkills(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => getText(item))
      .filter((item) => item.trim());
  }

  if (typeof value === "string") {
    return value
      .split(/[,\n;|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap(normalizeSkills);
  }

  return [];
}

function getTechnicalSkills(analysis) {
  const skills = analysis?.technical_skills;

  if (Array.isArray(skills) || typeof skills === "string") {
    return [
      {
        key: "general",
        label: "Technical Skills",
        color: "#6366f1",
        items: normalizeSkills(skills),
      },
    ];
  }

  if (skills && typeof skills === "object") {
    return SKILL_GROUPS.map((group) => ({
      ...group,
      items: normalizeSkills(skills[group.key]),
    }));
  }

  return [];
}

function getRecommendationCategory(text) {
  const value = text.toLowerCase();

  if (/project|portfolio|implementation/.test(value)) {
    return "Projects";
  }

  if (/experience|internship|work history|responsibilit/.test(value)) {
    return "Experience";
  }

  if (/skill|technology|technical|tool|programming/.test(value)) {
    return "Technical Skills";
  }

  if (/format|layout|ats|keyword|structure|readability/.test(value)) {
    return "Resume Presentation";
  }

  return "Other Recommendations";
}

function getErrorMessage(error, fallback) {
  if (error.code === "ECONNABORTED") {
    return "The request took too long. Please try again.";
  }

  return (
    error.response?.data?.detail ||
    error.response?.data?.message ||
    error.message ||
    fallback
  );
}

function EmptyState({ icon: Icon = FileText, message }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={23} />
      </div>
      <p>{message}</p>
    </div>
  );
}

function SectionHeading({ icon: Icon, title, subtitle, count }) {
  return (
    <div className="section-heading">
      <div className="section-heading-icon">
        <Icon size={19} />
      </div>

      <div className="section-heading-copy">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {count !== undefined && (
        <span className="count-badge">{count}</span>
      )}
    </div>
  );
}

function SkillGroup({ title, items, color }) {
  return (
    <div className="skill-group">
      <div className="skill-group-title">
        <span
          className="skill-dot"
          style={{ backgroundColor: color }}
        />
        <h4>{title}</h4>
        <span className="skill-count">{items.length}</span>
      </div>

      {items.length > 0 ? (
        <div className="skill-tags">
          {items.map((skill, index) => (
            <span
              className="skill-tag"
              key={`${skill}-${index}`}
              style={{ "--skill-color": color }}
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="muted-text small-text">
          No skills available in this category.
        </p>
      )}
    </div>
  );
}

function DetailList({ items, renderItem, emptyMessage }) {
  if (!items.length) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="detail-list">
      {items.map((item, index) => (
        <div className="detail-item" key={`detail-${index}`}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [showExtractedText, setShowExtractedText] = useState(false);

  const skillGroups = useMemo(
    () => getTechnicalSkills(analysis),
    [analysis]
  );

  const allSkills = useMemo(
    () => [...new Set(skillGroups.flatMap((group) => group.items))],
    [skillGroups]
  );

  const skillChartData = useMemo(
    () =>
      skillGroups
        .map((group) => ({
          category: group.label,
          count: group.items.length,
          fill: group.color,
        }))
        .filter((item) => item.count > 0),
    [skillGroups]
  );

  const scoreInfo = analysis?.resume_score;
  const scoreRaw =
    typeof scoreInfo === "object"
      ? scoreInfo?.score
      : scoreInfo;

  const maxScoreRaw =
    typeof scoreInfo === "object"
      ? scoreInfo?.max_score
      : 100;

  const maxScore = Number(maxScoreRaw);
  const score = Number(scoreRaw);

  const hasScore =
    scoreRaw !== null &&
    scoreRaw !== undefined &&
    scoreRaw !== "" &&
    Number.isFinite(score) &&
    Number.isFinite(maxScore) &&
    maxScore > 0;

  const safeScore = hasScore
    ? Math.max(0, Math.min(score, maxScore))
    : 0;

  const scorePercent = hasScore
    ? Math.round((safeScore / maxScore) * 100)
    : 0;

  const scoreChartData = [
    { name: "Score", value: safeScore },
    { name: "Remaining", value: Math.max(0, maxScore - safeScore) },
  ];

  const education = toList(analysis?.education);
  const experience = toList(analysis?.experience);
  const projects = toList(analysis?.projects);
  const certifications = toList(analysis?.certifications);
  const awards = toList(analysis?.awards);
  const strengths = toList(analysis?.strengths);
  const skillsToImprove = toList(analysis?.skills_to_improve);
  const suggestions = toList(analysis?.improvement_suggestions);

  const recommendations = useMemo(() => {
    const combined = [
      ...skillsToImprove.map((item) => ({
        text: getText(item),
        source: "Skills to improve",
      })),
      ...suggestions.map((item) => ({
        text: getText(item),
        source: "Improvement suggestions",
      })),
    ].filter((item) => item.text.trim());

    return combined;
  }, [analysis]);

  const improvementChartData = useMemo(() => {
    const counts = {};

    recommendations.forEach((item) => {
      const category = getRecommendationCategory(item.text);
      counts[category] = (counts[category] || 0) + 1;
    });

    return Object.entries(counts).map(([category, count]) => ({
      category,
      count,
    }));
  }, [recommendations]);

  const professionalSummary = getText(
    analysis?.professional_summary
  );

  const overallFeedback = getText(analysis?.overall_feedback);

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    setError("");
    setFile(null);
    setExtractedText("");
    setAnalysis(null);
    setShowExtractedText(false);

    if (!selectedFile) return;

    const isAllowedType =
      /\.(pdf|txt)$/i.test(selectedFile.name);

    if (!isAllowedType) {
      setError("Please select a PDF or TXT file.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size must be 5 MB or less.");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
  }

  async function handleExtract(event) {
    event?.preventDefault();

    if (!file) {
      setError("Please select a resume first.");
      return;
    }

    setLoading(true);
    setError("");
    setExtractedText("");
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_URL}/api/extract`,
        formData,
        { timeout: 60000 }
      );

      const text =
        response.data?.extracted_text ??
        response.data?.text ??
        "";

      if (typeof text !== "string" || !text.trim()) {
        throw new Error(
          "No readable text was extracted. Try another PDF or TXT file."
        );
      }

      setExtractedText(text);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Could not extract the resume. Check your backend."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze() {
    if (!extractedText.trim()) {
      setError("Extract the resume before analyzing it.");
      return;
    }

    setAnalyzing(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/analyze`,
        { resume_text: extractedText },
        { timeout: 90000 }
      );

      const data = response.data?.analysis ?? response.data;

      if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("The backend returned an invalid analysis.");
      }

      setAnalysis(data);

      // Bring the dashboard into view after analysis.
      window.setTimeout(() => {
        document
          .getElementById("analytics-dashboard")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Resume analysis failed. Please try again."
        )
      );
    } finally {
      setAnalyzing(false);
    }
  }

  function resetApp() {
    setFile(null);
    setExtractedText("");
    setAnalysis(null);
    setError("");
    setShowExtractedText(false);

    const input = document.getElementById("resume-file");
    if (input) input.value = "";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const hasAnalysis = Boolean(analysis);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a href="#home" className="brand">
          <span className="brand-mark">
            <BrainCircuit size={25} />
          </span>

          <span>
            <strong>ResumeIQ</strong>
            <small>Resume Intelligence</small>
          </span>
        </a>

        <div className="topbar-right">
          <span className="status-pill">
            <span className="status-dot" />
            Gemini AI
          </span>

          <button
            className="icon-button"
            onClick={resetApp}
            title="Start a new analysis"
            aria-label="Start a new analysis"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      <main id="home" className="main-container">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow">
              <Sparkles size={15} />
              AI-POWERED RESUME ANALYTICS
            </div>

            <h1>
              Understand your resume.
              <br />
              <span>Improve your next opportunity.</span>
            </h1>

            <p>
              Upload your resume to discover your skills, explore
              your professional profile, and get actionable
              recommendations powered by Gemini.
            </p>

            <div className="hero-features">
              <span>
                <CheckCircle2 size={16} />
                Skill analysis
              </span>

              <span>
                <CheckCircle2 size={16} />
                Visual insights
              </span>

              <span>
                <CheckCircle2 size={16} />
                Improvement tips
              </span>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />

            <div className="art-card art-card-main">
              <div className="art-card-icon">
                <FileText size={28} />
              </div>
              <div className="art-lines">
                <span />
                <span />
                <span />
              </div>
              <div className="art-mini-chart">
                <i style={{ height: "36%" }} />
                <i style={{ height: "65%" }} />
                <i style={{ height: "48%" }} />
                <i style={{ height: "88%" }} />
                <i style={{ height: "72%" }} />
              </div>
            </div>

            <div className="art-floating-badge">
              <TrendingUp size={18} />
              <span>Smart insights</span>
            </div>

            <div className="art-sparkle sparkle-one">✦</div>
            <div className="art-sparkle sparkle-two">✧</div>
          </div>
        </section>

        <section className="upload-panel">
          <div className="upload-panel-heading">
            <div>
              <h2>Analyze your resume</h2>
              <p>Start with a PDF or plain-text resume.</p>
            </div>

            <span className="step-label">STEP 01</span>
          </div>

          <form onSubmit={handleExtract}>
            <label
              htmlFor="resume-file"
              className={`upload-dropzone ${
                file ? "has-file" : ""
              }`}
            >
              <input
                id="resume-file"
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                onChange={handleFileChange}
              />

              <span className="upload-icon">
                {file ? (
                  <CheckCircle2 size={27} />
                ) : (
                  <Upload size={27} />
                )}
              </span>

              {file ? (
                <>
                  <strong>{file.name}</strong>
                  <span>
                    {(file.size / 1024).toFixed(1)} KB · Ready to
                    extract
                  </span>
                </>
              ) : (
                <>
                  <strong>Drop your resume here or browse files</strong>
                  <span>PDF or TXT · Maximum file size 5 MB</span>
                </>
              )}
            </label>

            <div className="upload-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={!file || loading}
              >
                {loading ? (
                  <>
                    <LoaderCircle className="spin" size={18} />
                    Extracting...
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    Extract Resume
                  </>
                )}
              </button>

              {file && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetApp}
                >
                  <X size={17} />
                  Clear
                </button>
              )}
            </div>
          </form>

          {error && (
            <div className="error-message" role="alert">
              <AlertCircle size={19} />
              <span>{error}</span>
            </div>
          )}

          {extractedText && (
            <div className="extraction-success">
              <div className="extraction-heading">
                <div className="success-icon">
                  <CheckCircle2 size={20} />
                </div>

                <div className="extraction-copy">
                  <strong>Resume extracted successfully</strong>
                  <span>
                    {extractedText.length.toLocaleString()} characters
                    extracted
                  </span>
                </div>

                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    setShowExtractedText((current) => !current)
                  }
                >
                  {showExtractedText ? "Hide text" : "View text"}
                  <ChevronRight
                    size={16}
                    className={
                      showExtractedText ? "rotate-down" : ""
                    }
                  />
                </button>
              </div>

              {showExtractedText && (
                <pre className="extracted-text">
                  {extractedText}
                </pre>
              )}

              <div className="analyze-row">
                <div>
                  <span className="step-label">STEP 02</span>
                  <strong>Turn your resume into insights</strong>
                  <p>
                    Gemini will analyze the extracted resume text.
                  </p>
                </div>

                <button
                  type="button"
                  className="primary-button analyze-button"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <LoaderCircle className="spin" size={18} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Analyze Resume
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>

        {analyzing && (
          <div className="analysis-loading">
            <div className="loading-orb">
              <BrainCircuit size={31} />
            </div>

            <h3>Analyzing your professional profile</h3>
            <p>
              Gemini is processing your resume and generating
              personalized insights.
            </p>

            <div className="loading-progress">
              <span />
            </div>
          </div>
        )}

        {hasAnalysis && !analyzing && (
          <section
            id="analytics-dashboard"
            className="dashboard-section"
          >
            <div className="dashboard-title-row">
              <div>
                <div className="eyebrow">
                  <BarChart3 size={15} />
                  YOUR ANALYTICS
                </div>

                <h2>Resume intelligence dashboard</h2>
                <p>
                  Your results are based on the resume analyzed by
                  Gemini. Missing information is shown explicitly.
                </p>
              </div>

              <button
                className="secondary-button"
                onClick={resetApp}
              >
                <RefreshCw size={16} />
                New analysis
              </button>
            </div>

            <div className="kpi-grid">
              <article className="kpi-card score-kpi">
                <div className="kpi-top">
                  <span>Resume Score</span>
                  <span className="kpi-icon purple">
                    <Target size={19} />
                  </span>
                </div>

                <div className="kpi-value">
                  {hasScore ? `${scorePercent}%` : "—"}
                </div>

                <p>
                  {hasScore
                    ? `${safeScore} out of ${maxScore}`
                    : "Score not provided"}
                </p>
              </article>

              <article className="kpi-card">
                <div className="kpi-top">
                  <span>Technical Skills</span>
                  <span className="kpi-icon blue">
                    <Code2 size={19} />
                  </span>
                </div>

                <div className="kpi-value">{allSkills.length}</div>
                <p>Unique skills extracted</p>
              </article>

              <article className="kpi-card">
                <div className="kpi-top">
                  <span>Projects</span>
                  <span className="kpi-icon green">
                    <Layers size={19} />
                  </span>
                </div>

                <div className="kpi-value">{projects.length}</div>
                <p>Projects identified</p>
              </article>

              <article className="kpi-card">
                <div className="kpi-top">
                  <span>Recommendations</span>
                  <span className="kpi-icon orange">
                    <Lightbulb size={19} />
                  </span>
                </div>

                <div className="kpi-value">
                  {recommendations.length}
                </div>

                <p>Improvement items returned</p>
              </article>
            </div>

            <div className="analytics-grid">
              <article className="dashboard-card score-card">
                <SectionHeading
                  icon={Target}
                  title="Resume score"
                  subtitle="Score returned by Gemini"
                />

                {hasScore ? (
                  <>
                    <div className="score-chart-wrap">
                      <ResponsiveContainer width="100%" height={245}>
                        <PieChart>
                          <Pie
                            data={scoreChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={76}
                            outerRadius={96}
                            startAngle={90}
                            endAngle={-270}
                            stroke="none"
                            paddingAngle={2}
                          >
                            <Cell fill="#6366f1" />
                            <Cell fill="#e9eaf2" />
                          </Pie>

                          <Tooltip
                            formatter={(value, name) => [
                              value,
                              name,
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="score-center">
                        <strong>{scorePercent}%</strong>
                        <span>Resume score</span>
                      </div>
                    </div>

                    <div className="score-footer">
                      <span>
                        <i className="legend-dot purple-dot" />
                        Score: {safeScore}
                      </span>

                      <span>
                        <i className="legend-dot gray-dot" />
                        Remaining: {maxScore - safeScore}
                      </span>
                    </div>

                    {getText(scoreInfo?.reason) && (
                      <p className="score-reason">
                        {getText(scoreInfo.reason)}
                      </p>
                    )}
                  </>
                ) : (
                  <EmptyState
                    icon={Target}
                    message="Gemini did not return a valid numeric score."
                  />
                )}
              </article>

              <article className="dashboard-card skills-chart-card">
                <SectionHeading
                  icon={BarChart3}
                  title="Skills distribution"
                  subtitle="Number of skills extracted per category"
                />

                {skillChartData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={255}>
                      <BarChart
                        data={skillChartData}
                        margin={{
                          top: 10,
                          right: 10,
                          left: -20,
                          bottom: 15,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#ececf3"
                        />

                        <XAxis
                          dataKey="category"
                          tick={{ fontSize: 10, fill: "#777b90" }}
                          angle={-16}
                          textAnchor="end"
                          interval={0}
                          height={58}
                        />

                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 11, fill: "#777b90" }}
                        />

                        <Tooltip
                          formatter={(value) => [
                            value,
                            "Skills",
                          ]}
                          contentStyle={{
                            borderRadius: 12,
                            border: "1px solid #ececf3",
                          }}
                        />

                        <Bar
                          dataKey="count"
                          name="Skills"
                          radius={[7, 7, 0, 0]}
                          maxBarSize={55}
                        >
                          {skillChartData.map((item, index) => (
                            <Cell
                              key={`${item.category}-${index}`}
                              fill={item.fill}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>

                    <p className="chart-footnote">
                      Counts indicate extracted skill entries, not
                      proficiency levels.
                    </p>
                  </>
                ) : (
                  <EmptyState
                    icon={Code2}
                    message="No technical skill categories were returned."
                  />
                )}
              </article>

              <article className="dashboard-card skills-breakdown-card">
                <SectionHeading
                  icon={PieChartIcon}
                  title="Skill category breakdown"
                  subtitle="Share of extracted skill entries"
                />

                {skillChartData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={235}>
                      <PieChart>
                        <Pie
                          data={skillChartData}
                          dataKey="count"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={88}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {skillChartData.map((item, index) => (
                            <Cell
                              key={`${item.category}-${index}`}
                              fill={item.fill}
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          formatter={(value, name) => [
                            `${value} skills`,
                            name,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="chart-legend">
                      {skillChartData.map((item) => (
                        <div
                          className="chart-legend-item"
                          key={item.category}
                        >
                          <span
                            className="legend-dot"
                            style={{ background: item.fill }}
                          />

                          <span>{item.category}</span>
                          <strong>{item.count}</strong>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState
                    icon={PieChartIcon}
                    message="Skill distribution will appear when skills are available."
                  />
                )}
              </article>

              <article className="dashboard-card improvement-chart-card">
                <SectionHeading
                  icon={TrendingUp}
                  title="Improvement priorities"
                  subtitle="Recommendations grouped by topic"
                />

                {improvementChartData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={245}>
                      <BarChart
                        data={improvementChartData}
                        layout="vertical"
                        margin={{
                          top: 6,
                          right: 18,
                          left: 15,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="#ececf3"
                        />

                        <XAxis
                          type="number"
                          allowDecimals={false}
                          tick={{
                            fontSize: 11,
                            fill: "#777b90",
                          }}
                        />

                        <YAxis
                          type="category"
                          dataKey="category"
                          width={128}
                          tick={{
                            fontSize: 10,
                            fill: "#777b90",
                          }}
                        />

                        <Tooltip
                          formatter={(value) => [
                            value,
                            "Recommendations",
                          ]}
                        />

                        <Bar
                          dataKey="count"
                          fill="#f59e0b"
                          radius={[0, 7, 7, 0]}
                          maxBarSize={28}
                        />
                      </BarChart>
                    </ResponsiveContainer>

                    <p className="chart-footnote">
                      Bars count Gemini recommendations in each topic.
                      They do not represent severity or guaranteed
                      hiring impact.
                    </p>
                  </>
                ) : (
                  <EmptyState
                    icon={TrendingUp}
                    message="No improvement recommendations were returned."
                  />
                )}
              </article>
            </div>

            <article className="dashboard-card summary-card">
              <SectionHeading
                icon={BookOpen}
                title="Professional summary"
                subtitle="Your profile, summarized by Gemini"
              />

              {professionalSummary ? (
                <p className="summary-text">{professionalSummary}</p>
              ) : (
                <EmptyState
                  icon={BookOpen}
                  message="No professional summary was returned."
                />
              )}
            </article>

            <article className="dashboard-card all-skills-card">
              <SectionHeading
                icon={Code2}
                title="Technical skills"
                subtitle="Skills grouped by the backend analysis"
                count={allSkills.length}
              />

              {skillGroups.length > 0 &&
              skillGroups.some((group) => group.items.length > 0) ? (
                <div className="skill-groups-grid">
                  {skillGroups.map((group) => (
                    <SkillGroup
                      key={group.key}
                      title={group.label}
                      items={group.items}
                      color={group.color}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Code2}
                  message="No technical skills are available to display."
                />
              )}
            </article>

            <div className="details-grid">
              <article className="dashboard-card">
                <SectionHeading
                  icon={GraduationCap}
                  title="Education"
                  subtitle="Academic qualifications"
                  count={education.length}
                />

                <DetailList
                  items={education}
                  emptyMessage="No education details were returned."
                  renderItem={(item) => (
                    <>
                      <h4>
                        {getText(
                          item?.degree ?? item?.title ?? item?.name,
                          "Education"
                        )}
                      </h4>

                      <p>
                        {getText(
                          item?.institution,
                          "Institution not specified"
                        )}
                      </p>

                      <div className="metadata-row">
                        {getText(item?.duration) && (
                          <span>{getText(item.duration)}</span>
                        )}

                        {getText(item?.grade) && (
                          <span>{getText(item.grade)}</span>
                        )}
                      </div>
                    </>
                  )}
                />
              </article>

              <article className="dashboard-card">
                <SectionHeading
                  icon={BriefcaseBusiness}
                  title="Experience"
                  subtitle="Internships and work experience"
                  count={experience.length}
                />

                <DetailList
                  items={experience}
                  emptyMessage="No experience details were returned."
                  renderItem={(item) => (
                    <>
                      <h4>
                        {getText(
                          item?.role ?? item?.title,
                          "Experience"
                        )}
                      </h4>

                      <p>
                        {getText(
                          item?.organization,
                          "Organization not specified"
                        )}
                      </p>

                      {getText(item?.duration) && (
                        <span className="metadata-chip">
                          {getText(item.duration)}
                        </span>
                      )}

                      {toList(item?.responsibilities).length > 0 && (
                        <ul className="detail-bullets">
                          {toList(item.responsibilities).map(
                            (responsibility, index) => (
                              <li key={index}>
                                {getText(responsibility)}
                              </li>
                            )
                          )}
                        </ul>
                      )}
                    </>
                  )}
                />
              </article>
            </div>

            <article className="dashboard-card projects-card">
              <SectionHeading
                icon={Layers}
                title="Projects"
                subtitle="Projects identified in your resume"
                count={projects.length}
              />

              {projects.length > 0 ? (
                <div className="project-grid">
                  {projects.map((project, index) => (
                    <div
                      className="project-item"
                      key={`project-${index}`}
                    >
                      <div className="project-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <h4>
                        {getText(
                          project?.name ?? project?.title,
                          "Project"
                        )}
                      </h4>

                      <p>
                        {getText(
                          project?.description,
                          "No project description was returned."
                        )}
                      </p>

                      {getText(project?.technologies) && (
                        <div className="project-tech">
                          <span>Technologies</span>
                          <p>{getText(project.technologies)}</p>
                        </div>
                      )}

                      {getText(project?.outcome) && (
                        <div className="project-outcome">
                          <CheckCircle2 size={15} />
                          {getText(project.outcome)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Layers}
                  message="No projects were identified in the analysis."
                />
              )}
            </article>

            <div className="details-grid">
              <article className="dashboard-card">
                <SectionHeading
                  icon={CheckCircle2}
                  title="Strengths"
                  subtitle="Positive points identified by Gemini"
                  count={strengths.length}
                />

                {strengths.length > 0 ? (
                  <ul className="insight-list strengths-list">
                    {strengths.map((item, index) => (
                      <li key={index}>
                        <CheckCircle2 size={17} />
                        <span>{getText(item)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    icon={CheckCircle2}
                    message="No strengths were returned."
                  />
                )}
              </article>

              <article className="dashboard-card">
                <SectionHeading
                  icon={Target}
                  title="Skills to improve"
                  subtitle="Areas identified for further development"
                  count={skillsToImprove.length}
                />

                {skillsToImprove.length > 0 ? (
                  <ul className="insight-list improve-list">
                    {skillsToImprove.map((item, index) => (
                      <li key={index}>
                        <Target size={17} />
                        <span>{getText(item)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    icon={Target}
                    message="No specific skills to improve were returned."
                  />
                )}
              </article>
            </div>

            <article className="dashboard-card recommendations-card">
              <SectionHeading
                icon={Lightbulb}
                title="Actionable recommendations"
                subtitle="Suggestions to help improve your resume"
                count={suggestions.length}
              />

              {suggestions.length > 0 ? (
                <div className="recommendation-list">
                  {suggestions.map((item, index) => (
                    <div
                      className="recommendation-item"
                      key={index}
                    >
                      <span className="recommendation-number">
                        {index + 1}
                      </span>

                      <p>{getText(item)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Lightbulb}
                  message="No additional recommendations were returned."
                />
              )}
            </article>

            <div className="details-grid">
              <article className="dashboard-card">
                <SectionHeading
                  icon={Award}
                  title="Certifications"
                  subtitle="Courses and credentials"
                  count={certifications.length}
                />

                {certifications.length > 0 ? (
                  <ul className="simple-item-list">
                    {certifications.map((item, index) => (
                      <li key={index}>
                        <Award size={17} />
                        <span>{getText(item)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    icon={Award}
                    message="No certifications were returned."
                  />
                )}
              </article>

              <article className="dashboard-card">
                <SectionHeading
                  icon={Trophy}
                  title="Awards and achievements"
                  subtitle="Recognitions found in the resume"
                  count={awards.length}
                />

                {awards.length > 0 ? (
                  <ul className="simple-item-list">
                    {awards.map((item, index) => (
                      <li key={index}>
                        <Trophy size={17} />
                        <span>{getText(item)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    icon={Trophy}
                    message="No awards or achievements were returned."
                  />
                )}
              </article>
            </div>

            <article className="feedback-card">
              <div className="feedback-icon">
                <Sparkles size={24} />
              </div>

              <div>
                <h3>Overall feedback</h3>

                {overallFeedback ? (
                  <p>{overallFeedback}</p>
                ) : (
                  <p>
                    Gemini did not return overall feedback for this
                    analysis. Review the available sections above.
                  </p>
                )}
              </div>
            </article>

            <p className="dashboard-disclaimer">
              ResumeIQ provides AI-generated resume insights. Skill
              counts are not proficiency measurements, and the resume
              score is not a prediction of hiring success. Review AI
              suggestions before making changes to your resume.
            </p>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <a href="#home" className="footer-brand">
          <BrainCircuit size={19} />
          ResumeIQ
        </a>

        <span>AI-powered resume intelligence</span>
        <span>Built with React, FastAPI & Gemini</span>
      </footer>
    </div>
  );
}

export default App;
