const API_BASE = "https://dev.mattr.art";

const getAuthHeaders = () => {
  const key = localStorage.getItem("api_key");
  return key ? { "X-Auth-Key": key } : {};
};

export async function verifyApiKey(key) {
  const res = await fetch(`${API_BASE}/api/verify`);
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    return data.valid === true;
  } catch {
    return false;
  }
}

export async function createUrl(url, customId = null) {
  const res = await fetch(`${API_BASE}/api/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(customId ? { url, id: customId } : { url }),
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

export async function listUrls(cursor = null, limit = 10) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`${API_BASE}/api/read?${params}`, {
    headers: getAuthHeaders(),
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text, items: [] };
  }
}

export async function getUrlData(urlId) {
  const headers = getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/read/${urlId}`, { headers });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function deleteUrl(urlId) {
  const res = await fetch(`${API_BASE}/api/delete/${urlId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

export function getShortUrl(urlId) {
  return `${API_BASE}/${urlId}`;
}