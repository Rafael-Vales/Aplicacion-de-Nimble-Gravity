import { useEffect, useState } from "react";
import { getCandidateByEmail, getJobs } from "./api";
import JobItem from "./components/JobItem";
import "./styles.css";

export default function App() {
  const [email, setEmail] = useState("");
  const [candidate, setCandidate] = useState(null);

  const [candidateState, setCandidateState] = useState({ loading: false, error: "" });

  const [jobs, setJobs] = useState([]);
  const [jobsState, setJobsState] = useState({ loading: true, error: "" });

  useEffect(() => {
    (async () => {
      setJobsState({ loading: true, error: "" });
      try {
        const list = await getJobs();
        setJobs(Array.isArray(list) ? list : []);
        setJobsState({ loading: false, error: "" });
      } catch (e) {
        setJobsState({ loading: false, error: e.message || "No se pudieron cargar los jobs." });
      }
    })();
  }, []);

  async function handleLoadCandidate() {
    setCandidateState({ loading: true, error: "" });
    setCandidate(null);

    try {
      const data = await getCandidateByEmail(email.trim());
      setCandidate(data);
      setCandidateState({ loading: false, error: "" });
    } catch (e) {
      setCandidateState({ loading: false, error: e.message || "No se pudo cargar el candidato." });
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>BotFilter — Job Apply Challenge</h1>
        <p className="muted">
          1) Cargá tu candidato por email · 2) Elegí un job · 3) Pegá tu repo URL · 4) Submit
        </p>
      </header>

      <section className="panel">
        <div className="panelTitle">Step 2 — Obtener tus datos de candidato</div>
        <div className="row">
          <input
            className="input"
            placeholder="tu-email@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="button" onClick={handleLoadCandidate} disabled={!email.trim() || candidateState.loading}>
            {candidateState.loading ? "Loading..." : "Load candidate"}
          </button>
        </div>

        {candidateState.error ? <div className="error">Error: {candidateState.error}</div> : null}

        {candidate ? (
          <div className="candidateBox">
            <div><b>uuid:</b> {candidate.uuid}</div>
            <div><b>candidateId:</b> {candidate.candidateId}</div>
            <div><b>email:</b> {candidate.email}</div>
            <div><b>name:</b> {candidate.firstName} {candidate.lastName}</div>
          </div>
        ) : (
          <div className="hint">Cargá tu email para obtener uuid y candidateId.</div>
        )}
      </section>

      <section className="panel">
        <div className="panelTitle">Step 3 & 4 — Listado de posiciones</div>

        {jobsState.loading ? <div className="hint">Cargando posiciones...</div> : null}
        {jobsState.error ? <div className="error">Error: {jobsState.error}</div> : null}

        {!jobsState.loading && !jobsState.error && jobs.length === 0 ? (
          <div className="hint">No hay posiciones para mostrar.</div>
        ) : null}

        <div className="list">
          {jobs.map((job) => (
            <JobItem key={job.id} job={job} candidate={candidate} />
          ))}
        </div>
      </section>

      <footer className="footer muted">
        Tip: si algo falla, mirá el mensaje en pantalla (sale del body del error).
      </footer>
    </div>
  );
}