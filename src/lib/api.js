const API_BASE = "https://dev.mattr.art";

const getAuthHeaders = () => {
  const key = localStorage.getItem("api_key");
  return key ? { "X-Auth-Key": key } : {};
};

export async function verifyApiKey(key) {
  const res = await fetch(`${API_BASE}/auth/verify`, {
    headers: { "X-Auth-Key": key },
  });
  const data = await res.json();
  return data.valid === true;
}

export async function createUrl(url, customId = null) {
  const res = await fetch(`${API_BASE}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(customId ? { url, id: customId } : { url }),
  });
  return res.json();
}

export async function listUrls(cursor = null, limit = 10) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`${API_BASE}/read?${params}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getUrlData(urlId) {
  const headers = getAuthHeaders();
  if (Object.keys(headers).length === 0) {
    return { error: "Not logged in", clicks: [] };
  }
  const res = await fetch(`${API_BASE}/read/${urlId}`, { headers });
  const text = await res.text();
  if (text === "Unauthorized" || text === "Key not found") {
    return { error: "Not authorized", clicks: [] };
  }
  try {
    return JSON.parse(text);
  } catch {
    return { error: text, clicks: [] };
  }
}

export async function deleteUrl(urlId) {
  const res = await fetch(`${API_BASE}/delete/${urlId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return res.text();
}

export function getShortUrl(urlId) {
  return `${API_BASE}/${urlId}`;
}