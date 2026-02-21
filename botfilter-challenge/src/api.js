const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });


  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!res.ok) {
    const message =
      (data && (data.message || data.error || data.details)) ||
      (typeof data === "string" ? data : null) ||
      `Request failed (${res.status})`;
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