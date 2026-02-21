import { useMemo, useState } from "react";
import { applyToJob } from "../api";

function normalizeGitHubRepoUrl(rawUrl) {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    const isHttp = parsed.protocol === "http:" || parsed.protocol === "https:";
    const isGitHubHost = /^(www\.)?github\.com$/i.test(parsed.hostname);

    if (!isHttp || !isGitHubHost) {
      return null;
    }

    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length < 2) {
      return null;
    }

    const owner = segments[0];
    const repo = segments[1].replace(/\.git$/i, "");
    if (!owner || !repo) {
      return null;
    }

    return `https://github.com/${owner}/${repo}`;
  } catch {
    return null;
  }
}

export default function JobItem({ job, candidate, candidateReady }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const normalizedRepoUrl = useMemo(() => normalizeGitHubRepoUrl(repoUrl), [repoUrl]);
  const repoUrlIsValid = Boolean(normalizedRepoUrl);
  const hasRepoInput = Boolean(repoUrl.trim());

  const canSubmit = useMemo(() => {
    return Boolean(candidateReady && repoUrlIsValid);
  }, [candidateReady, repoUrlIsValid]);

  async function handleSubmit() {
    if (!candidateReady) {
      setStatus({
        state: "error",
        message: "Primero cargá los datos de candidato con tu email.",
      });
      return;
    }

    if (!candidate?.uuid || !candidate?.candidateId || !candidate?.applicationId) {
      setStatus({
        state: "error",
        message:
          "No se encontraron credenciales completas (uuid/candidateId/applicationId). Recargá el email.",
      });
      return;
    }

    if (!repoUrlIsValid) {
      setStatus({
        state: "error",
        message: "Ingresá una URL válida de GitHub con formato usuario/repositorio.",
      });
      return;
    }

    setStatus({ state: "loading", message: "" });
    try {
      const body = {
        uuid: candidate.uuid,
        applicationId: candidate.applicationId,
        jobId: job.id,
        candidateId: candidate.candidateId,
        repoUrl: normalizedRepoUrl,
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
          onChange={(e) => {
            setRepoUrl(e.target.value);
            if (status.state !== "idle") {
              setStatus({ state: "idle", message: "" });
            }
          }}
          aria-label={`URL del repo para ${job.title}`}
        />
        <button className="button" onClick={handleSubmit} disabled={!canSubmit || status.state === "loading"}>
          {status.state === "loading" ? "Submitting..." : "Submit"}
        </button>
      </div>

      {!candidateReady ? (
        <div className="hint">Primero cargá tu candidato con el email (arriba).</div>
      ) : null}

      {hasRepoInput && !repoUrlIsValid ? (
        <div className="hint warningHint">
          Usá una URL de repo GitHub válida, por ejemplo:
          https://github.com/tu-usuario/tu-repo
        </div>
      ) : null}
      {repoUrlIsValid && repoUrl.trim() !== normalizedRepoUrl ? (
        <div className="hint">Se enviará: {normalizedRepoUrl}</div>
      ) : null}

      {status.state === "error" ? (
        <div className="error" role="alert">
          Error: {status.message}
        </div>
      ) : null}
      {status.state === "success" ? (
        <div className="success" aria-live="polite">
          {status.message}
        </div>
      ) : null}
    </div>
  );
}
