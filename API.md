# URL Shortener API

Redirection service for shortened URLs stored in Cloudflare KV. Track clicks with geolocation data.

**Base URL:** `https://dev.mattr.art`

---

## Authentication

Protected endpoints require the `X-Auth-Key` header.

```bash
X-Auth-Key: your-api-key
```

Set `API_KEY` in `wrangler.jsonc`:
```toml
[env.production]
vars = { API_KEY = "your-secret-key" }
```

---

## Endpoints

### Redirect

**GET** `/:urlId`

Redirects to the stored URL and logs click data.

| Status | Description |
|--------|-------------|
| 302 | Redirect to destination URL |
| 404 | URL ID not found |

**Response Headers:**
- `Location: <redirect-url>`

**Click Data Logged:**
```json
{
  "IP": "192.0.2.1",
  "timestamp": "2026-04-25T12:00:00.000Z",
  "latitude": "37.7749",
  "longitude": "-122.4194",
  "country": "US",
  "city": "San Francisco",
  "region": "CA",
  "postalCode": "94105",
  "ISP": "Cloudflare"
}
```

```bash
curl -L https://dev.mattr.art/abc1234
# -> 302 redirect to https://example.com
```

---

### Create URL

**POST** `/api/create`

**Headers:**
```
X-Auth-Key: your-api-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "url": "https://example.com/path",
  "id": "custom-id"  // optional, auto-generated if omitted
}
```

| Status | Description |
|--------|-------------|
| 201 | Created successfully |
| 400 | Missing `url` or invalid JSON |
| 401 | Unauthorized |
| 409 | ID already exists |

```bash
# Auto-generate ID
curl -X POST https://dev.mattr.art/api/create \
  -H "X-Auth-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com"}'
# Response: {"message":"Created","id":"a1b2c3d4"}

# Custom ID
curl -X POST https://dev.mattr.art/api/create \
  -H "X-Auth-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "id": "ex"}'
# Response: {"message":"Created","id":"ex"}
```

URLs without protocol get `https://` prepended.

---

### Read URL Data

**GET** `/api/read/:urlId`

Retrieves a single URL's data and click history.

| Status | Description |
|--------|-------------|
| 200 | JSON with id, url, totalClicks, clicks |
| 404 | URL ID not found |

```bash
curl https://dev.mattr.art/api/read/ex
```

**Response:**
```json
{
  "id": "ex",
  "url": "https://example.com",
  "totalClicks": 5,
  "clicks": [
    {
      "IP": "192.0.2.1",
      "timestamp": "2026-04-25T12:00:00.000Z",
      "latitude": "37.7749",
      "longitude": "-122.4194",
      "country": "US",
      "city": "San Francisco",
      "region": "CA",
      "postalCode": "94105",
      "ISP": "Cloudflare"
    }
  ]
}
```

---

### List All URLs

**GET** `/api/read`

Lists all shortened URLs with pagination.

**Headers:**
```
X-Auth-Key: your-api-key
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `cursor` | string | - | Pagination cursor |
| `limit` | number | 10 | Results per page |

| Status | Description |
|--------|-------------|
| 200 | JSON with items, cursor, hasMore |
| 401 | Unauthorized |

```bash
# First page
curl "https://dev.mattr.art/api/read?limit=10" \
  -H "X-Auth-Key: $API_KEY"

# Next page
curl "https://dev.mattr.art/api/read?cursor=xyz&limit=10" \
  -H "X-Auth-Key: $API_KEY"
```

**Response:**
```json
{
  "items": [
    {
      "id": "abc123",
      "url": "https://example.com",
      "clicks": [...]
    }
  ],
  "cursor": "next-cursor",
  "hasMore": true
}
```

---

### Delete URL

**DELETE** `/api/:urlId`

Removes a shortened URL.

| Status | Description |
|--------|-------------|
| 200 | Deleted |
| 400 | Missing ID |
| 401 | Unauthorized |

```bash
curl -X DELETE https://dev.mattr.art/api/ex \
  -H "X-Auth-Key: $API_KEY"
# Response: Deleted
```

---

## Error Responses

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Missing url | POST /api/create without url |
| 400 | Invalid JSON | Malformed request body |
| 400 | Missing id | Delete without urlId |
| 401 | Unauthorized | Missing or invalid X-Auth-Key |
| 404 | Key not found | URL ID doesn't exist |
| 409 | ID already exists | Custom ID already in use |

---

## CORS

All endpoints support CORS for any origin.

---
