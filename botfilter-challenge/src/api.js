const API_FALLBACK_BASE_URL =
  "https://botfilter-h5ddh6dye8exb7ha.centralus-01.azurewebsites.net";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || API_FALLBACK_BASE_URL).replace(
  /\/$/,
  ""
);

function getErrorMessage(data, status) {
  if (!data) {
    return `Request failed (${status})`;
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.message || data.error || data.details || data.title) {
    return data.message || data.error || data.details || data.title;
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.join(" | ");
  }

  if (data.errors && typeof data.errors === "object") {
    const nestedErrors = Object.values(data.errors)
      .flat()
      .map((value) => String(value))
      .filter(Boolean);

    if (nestedErrors.length > 0) {
      return nestedErrors.join(" | ");
    }
  }

  return `Request failed (${status})`;
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new Error("No se pudo conectar con la API. Revisá tu conexión e intentá de nuevo.");
  }

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!res.ok) {
    const message = getErrorMessage(data, res.status);
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export async function getCandidateByEmail(email) {
  const qs = new URLSearchParams({ email });
  return request(`/api/candidate/get-by-email?${qs.toString()}`, { method: "GET" });
}

export async function getJobs() {
  return request(`/api/jobs/get-list`, { method: "GET" });
}

export async function applyToJob(payload) {
  return request(`/api/candidate/apply-to-job`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
