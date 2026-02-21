import { useMemo, useState } from "react";
import { applyToJob } from "../api";

export default function JobItem({ job, candidate }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [status, setStatus] = useState({ state: "idle", message: "" }); 

  const canSubmit = useMemo(() => {
    return Boolean(candidate?.uuid && candidate?.candidateId && repoUrl.trim());
  }, [candidate, repoUrl]);

  async function handleSubmit() {
    setStatus({ state: "loading", message: "" });
    try {
      const body = {
        uuid: candidate.uuid,
        jobId: job.id,
        candidateId: candidate.candidateId,
        repoUrl: repoUrl.trim(),
      };

      const res = await applyToJob(body);

      if (res?.ok === true) {
        setStatus({ state: "success", message: "Postulación enviada (ok: true)." });
      } else {
        
        setStatus({ state: "success", message: "Postulación enviada (respuesta 200)." });
      }
    } catch (e) {
      setStatus({ state: "error", message: e.message || "Error desconocido." });
    }
  }

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <div className="title">{job.title}</div>
          <div className="subtitle">Job ID: {job.id}</div>
        </div>
      </div>

      <div className="row">
        <input
          className="input"
          placeholder="https://github.com/tu-usuario/tu-repo"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />
        <button className="button" onClick={handleSubmit} disabled={!canSubmit || status.state === "loading"}>
          {status.state === "loading" ? "Submitting..." : "Submit"}
        </button>
      </div>

      {!candidate?.uuid || !candidate?.candidateId ? (
        <div className="hint">Primero cargá tu candidato con el email (arriba).</div>
      ) : null}

      {status.state === "error" ? <div className="error">Error: {status.message}</div> : null}
      {status.state === "success" ? <div className="success">{status.message}</div> : null}
    </div>
  );
}