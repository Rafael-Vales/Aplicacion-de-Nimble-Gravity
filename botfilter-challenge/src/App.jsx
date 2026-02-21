import { useEffect, useMemo, useState } from "react";
import { getCandidateByEmail, getJobs } from "./api";
import JobItem from "./components/JobItem";
import "./styles.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function App() {
  const [email, setEmail] = useState("");
  const [candidate, setCandidate] = useState(null);
  const [candidateState, setCandidateState] = useState({
    loading: false,
    error: "",
  });
  const [jobs, setJobs] = useState([]);
  const [jobsState, setJobsState] = useState({ loading: true, error: "" });

  const normalizedEmail = useMemo(() => email.trim(), [email]);
  const isEmailValid = useMemo(
    () => EMAIL_REGEX.test(normalizedEmail),
    [normalizedEmail]
  );

  useEffect(() => {
    let isActive = true;

    (async () => {
      try {
        const list = await getJobs();
        if (!isActive) {
          return;
        }
        setJobs(Array.isArray(list) ? list : []);
        setJobsState({ loading: false, error: "" });
      } catch (e) {
        if (!isActive) {
          return;
        }
        setJobsState({
          loading: false,
          error: e.message || "No se pudieron cargar los jobs.",
        });
      }
    })();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleLoadCandidate() {
    if (!isEmailValid) {
      setCandidateState({
        loading: false,
        error: "Ingresá un email válido para obtener tus datos de candidato.",
      });
      setCandidate(null);
      return;
    }

    setCandidateState({ loading: true, error: "" });
    setCandidate(null);

    try {
      const data = await getCandidateByEmail(normalizedEmail);
      setCandidate(data);
      setCandidateState({ loading: false, error: "" });
    } catch (e) {
      setCandidateState({
        loading: false,
        error: e.message || "No se pudo cargar el candidato.",
      });
    }
  }

  async function handleRefreshJobs() {
    setJobsState({ loading: true, error: "" });

    try {
      const list = await getJobs();
      setJobs(Array.isArray(list) ? list : []);
      setJobsState({ loading: false, error: "" });
    } catch (e) {
      setJobsState({
        loading: false,
        error: e.message || "No se pudieron cargar los jobs.",
      });
    }
  }

  const candidateReady = Boolean(
    candidate?.uuid && candidate?.candidateId && candidate?.applicationId
  );

  return (
    <div className="container">
      <header className="header">
        <span className="chip">Nimble Gravity Challenge</span>
        <h1>Candidate Job Submit Console</h1>
        <p className="muted introText">
          Cargá tus datos de candidato, elegí una posición y enviá tu repo
          desde la misma interfaz.
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLoadCandidate();
              }
            }}
            aria-label="Email de candidato"
          />
          <button
            className="button"
            onClick={handleLoadCandidate}
            disabled={!normalizedEmail || candidateState.loading}
          >
            {candidateState.loading ? "Loading..." : "Load candidate"}
          </button>
        </div>
        {!candidateState.loading && normalizedEmail && !isEmailValid ? (
          <div className="hint warningHint">
            El formato del email parece inválido.
          </div>
        ) : null}

        {candidateState.error ? (
          <div className="error" role="alert">
            Error: {candidateState.error}
          </div>
        ) : null}

        {candidate ? (
          <div className="candidateBox" aria-live="polite">
            <div>
              <b>uuid:</b> {candidate.uuid}
            </div>
            <div>
              <b>candidateId:</b> {candidate.candidateId}
            </div>
            <div>
              <b>applicationId:</b> {candidate.applicationId}
            </div>
            <div>
              <b>email:</b> {candidate.email}
            </div>
            <div>
              <b>name:</b> {candidate.firstName} {candidate.lastName}
            </div>
          </div>
        ) : (
          <div className="hint">
            Cargá tu email para obtener `uuid`, `candidateId` y `applicationId`
            antes de enviar.
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panelTitle row between">
          <span>Step 3 & 4 — Listado de posiciones</span>
          <button
            className="button secondary"
            type="button"
            onClick={handleRefreshJobs}
            disabled={jobsState.loading}
          >
            {jobsState.loading ? "Refreshing..." : "Refresh list"}
          </button>
        </div>

        {jobsState.loading ? <div className="hint">Cargando posiciones...</div> : null}
        {jobsState.error ? (
          <div className="error" role="alert">
            Error: {jobsState.error}
          </div>
        ) : null}

        {!jobsState.loading && !jobsState.error && jobs.length === 0 ? (
          <div className="hint">No hay posiciones para mostrar.</div>
        ) : null}

        <div className="list">
          {jobs.map((job) => (
            <JobItem
              key={job.id}
              job={job}
              candidate={candidate}
              candidateReady={candidateReady}
            />
          ))}
        </div>
      </section>

      
    </div>
  );
}
