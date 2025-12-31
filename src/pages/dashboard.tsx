import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyToken } from "../auth";
import "../components/dashboard.css";

type Repo = {
  id: number;
  name: string;
};

type Issue = {
  id: number;
  number: number;
  title: string;
  body: string;
  difficulty: "Beginner" | "Moderate" | "Professional";
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = verifyToken();

  // LEFT PANEL
  const [repoUrl, setRepoUrl] = useState("");
  const [repositories, setRepositories] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);

  // MIDDLE PANEL
  const [issues, setIssues] = useState<Issue[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // RIGHT PANEL
  const [solution, setSolution] = useState<string>("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  // Load repositories on login
  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    const res = await fetch("http://localhost:8000/repositories");
    const data = await res.json();
    setRepositories(data);
  };

  const fetchIssues = async (repoId: number, filter: string | null = null) => {
    let url = `http://localhost:8000/issues?repo_id=${repoId}`;
    if (filter) url += `&difficulty=${filter}`;
    const res = await fetch(url);
    setIssues(await res.json());
  };

  const analyzeRepo = async () => {
    if (!repoUrl) return;
    setLoading(true);

    await fetch(
      `http://localhost:8000/analyze?repo_url=${encodeURIComponent(repoUrl)}`,
      { method: "POST" }
    );

    await fetchRepositories();
    setRepoUrl("");
    setLoading(false);
  };

  const handleRepoClick = (repo: Repo) => {
    setSelectedRepo(repo);
    setSelectedIssue(null);
    setSolution("");
    fetchIssues(repo.id, difficultyFilter);
  };

  const handleIssueClick = async (issue: Issue) => {
  setSelectedIssue(issue);
  setSolution("Thinking...");

  const res = await fetch(
    `http://localhost:8000/solutions/${issue.id}`
  );

  const data = await res.json();

  const formatted = data.steps
    .map(
      (s: any) =>
        `Step ${s.step}: ${s.title}\n` +
        `• Explanation: ${s.explanation}\n` +
        `• File: ${s.file}\n` +
        `• Action: ${s.action}\n` +
        `• Verify: ${s.verification}\n`
    )
    .join("\n");

  setSolution(formatted);
};


  if (!user) return null;

  return (
    <div className="dashboard-container">
      {/* TOP BAR */}
      <div className="top-bar">
        <div className="logo">OCTOPUS</div>
        <div className="avatar">
          <img src={(user as any)?.avatar} />
        </div>
      </div>

      <div className="dashboard-content">
        {/* LEFT PANEL */}
        <div className="glass-card repo-panel">
          <h3>Repository Analyzer</h3>

          <input
            className="solver-input"
            placeholder="Paste GitHub repo URL..."
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />

          <button className="solve-btn" onClick={analyzeRepo} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Repository"}
          </button>

          <h3 style={{ marginTop: 20 }}>Your Repositories</h3>

          {repositories.map((repo) => (
            <button
              key={repo.id}
              className={`repo-btn ${
                selectedRepo?.id === repo.id ? "active" : ""
              }`}
              onClick={() => handleRepoClick(repo)}
            >
              {repo.name}
            </button>
          ))}
        </div>

        {/* MIDDLE PANEL */}
        <div className="glass-card middle-panel">
          <div className="middle-panel-content">
            {!selectedRepo && <p>Select a repository to view issues</p>}

            {selectedRepo && !selectedIssue && (
              <>
                <h3>Issues</h3>

                <div className="filter-bar">
                  {["Beginner", "Moderate", "Professional"].map((d) => (
                    <button
                      key={d}
                      className={difficultyFilter === d ? "active" : ""}
                      onClick={() => {
                        setDifficultyFilter(d);
                        fetchIssues(selectedRepo.id, d);
                      }}
                    >
                      {d}
                    </button>
                  ))}
                  <button
                    className={!difficultyFilter ? "active" : ""}
                    onClick={() => {
                      setDifficultyFilter(null);
                      fetchIssues(selectedRepo.id);
                    }}
                  >
                    All
                  </button>
                </div>

                <div className="issues-list">
                  {issues.map((issue) => (
                    <div
                      key={issue.id}
                      className="issue-card"
                      onClick={() => handleIssueClick(issue)}
                    >
                      <h4>
                        #{issue.number} — {issue.title}
                      </h4>
                      <span
                        className={`badge ${issue.difficulty.toLowerCase()}`}
                      >
                        {issue.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {selectedIssue && (
              <>
                <button
                  className="back-btn"
                  onClick={() => setSelectedIssue(null)}
                >
                  ← Back
                </button>

                <h3>{selectedIssue.title}</h3>

                <span
                  className={`badge ${selectedIssue.difficulty.toLowerCase()}`}
                >
                  {selectedIssue.difficulty}
                </span>

                <p style={{ marginTop: 15 }}>{selectedIssue.body}</p>
              </>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="glass-card solver-panel">
          <h3>AI Solution</h3>

          {!selectedIssue ? (
            <p>Select an issue to get AI solution</p>
          ) : (
            <pre style={{ whiteSpace: "pre-wrap" }}>{solution}</pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
