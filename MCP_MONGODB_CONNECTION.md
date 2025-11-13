# MongoDB MCP Connection Guide

## Overview

The Confirmly platform has a built-in MCP (Model Context Protocol) server that provides controlled, auditable database access. This guide explains how to connect and use it.

---

## What is MCP?

MCP (Model Context Protocol) is a protocol for controlled, auditable database access. It provides:
- **Read-only queries** with automatic PII masking
- **Controlled write operations** with audit logging
- **Security** through API key authentication
- **Audit trails** for all database access

---

## Current Implementation

The MCP server is already implemented in the API at:
- **Location:** `apps/api/src/mcp/`
- **Files:**
  - `server.ts` - MCP route handlers
  - `middleware/auth.ts` - Authentication middleware
  - `handlers/read.ts` - Read operation handler
  - `handlers/write.ts` - Write operation handler
  - `utils/mask-pii.ts` - PII masking utilities

---

## Setup Requirements

### 1. Environment Variables

Add these to `apps/api/.env`:

```env
# MongoDB Connection (Required)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/confirmly
# OR for local:
# MONGO_URI=mongodb://localhost:27017/confirmly

# MCP API Key (Required for MCP access)
MCP_API_KEY=your-secure-random-api-key-here

# JWT Secret (Already should exist)
JWT_SECRET=your-jwt-secret
```

### 2. Generate MCP API Key

Generate a secure random API key:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 3. MongoDB Connection

#### Option A: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Create database user
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/database`
5. Add to `.env` as `MONGO_URI`

#### Option B: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use: `mongodb://localhost:27017/confirmly`
4. Add to `.env` as `MONGO_URI`

---

## MCP Endpoints

### Base URL
- **Local:** `http://localhost:4000`
- **Production:** `https://api.confirmly.io`

### Authentication
All MCP endpoints require API key authentication:
```
Authorization: Bearer <MCP_API_KEY>
```

---

### 1. Read Endpoint

**GET** `/mcp/read`

Read-only queries with automatic PII masking.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `collection` | string | Yes | Collection name: `orders`, `merchants`, or `users` |
| `id` | string | No | Document ID (for single document) |
| `merchantId` | string | No | Filter by merchant ID |
| `limit` | number | No | Max results (1-100, default: 10) |
| `skip` | number | No | Skip results (pagination) |
| `fields` | string | No | Comma-separated field names to return |

#### Example Requests

```bash
# Get all orders for a merchant
curl -X GET "http://localhost:4000/mcp/read?collection=orders&merchantId=123&limit=20" \
  -H "Authorization: Bearer your-mcp-api-key"

# Get single order
curl -X GET "http://localhost:4000/mcp/read?collection=orders&id=order123" \
  -H "Authorization: Bearer your-mcp-api-key"

# Get users with specific fields
curl -X GET "http://localhost:4000/mcp/read?collection=users&fields=name,email,role" \
  -H "Authorization: Bearer your-mcp-api-key"
```

#### Response Format

```json
{
  "success": true,
  "data": [
    {
      "_id": "order123",
      "orderNumber": "ORD-001",
      "status": "pending",
      "amount": 1000,
      "customerPhone": "***-***-1234",  // PII masked
      "customerEmail": "c***@example.com"  // PII masked
    }
  ],
  "count": 1,
  "limit": 10,
  "skip": 0
}
```

---

### 2. Write Endpoint

**POST** `/mcp/write`

Controlled write operations with audit logging.

#### Request Body

```json
{
  "collection": "orders",
  "action": "create|update|delete",
  "data": {
    // Document data (for create/update)
  },
  "filters": {
    // Query filters (for update/delete)
  }
}
```

#### Example Requests

```bash
# Create document
curl -X POST "http://localhost:4000/mcp/write" \
  -H "Authorization: Bearer your-mcp-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "orders",
    "action": "create",
    "data": {
      "orderNumber": "ORD-001",
      "status": "pending",
      "amount": 1000
    }
  }'

# Update document
curl -X POST "http://localhost:4000/mcp/write" \
  -H "Authorization: Bearer your-mcp-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "orders",
    "action": "update",
    "filters": { "_id": "order123" },
    "data": { "status": "confirmed" }
  }'

# Delete document
curl -X POST "http://localhost:4000/mcp/write" \
  -H "Authorization: Bearer your-mcp-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "orders",
    "action": "delete",
    "filters": { "_id": "order123" }
  }'
```

#### Response Format

```json
{
  "success": true,
  "data": {
    "_id": "order123",
    // ... document data
  },
  "auditLogId": "audit123"
}
```

---

## PII Masking

The MCP server automatically masks PII (Personally Identifiable Information) in read operations:

- **Phone numbers:** `+91-***-***-1234`
- **Email addresses:** `c***@example.com`
- **Addresses:** `*** Street, City`
- **Names:** `J*** D***` (for non-admin users)

Full PII is only returned for:
- Super admin users
- The document owner (for their own data)

---

## Audit Logging

All MCP operations are logged to the `EventLog` collection:

```javascript
{
  type: 'mcp_access',
  payload: {
    method: 'GET',
    url: '/mcp/read',
    collection: 'orders',
    query: { ... }
  },
  actor: {
    id: 'user123',
    role: 'admin'
  },
  timestamp: '2024-01-01T00:00:00Z'
}
```

---

## Testing MCP Connection

### 1. Check API Health

```bash
curl http://localhost:4000/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 2. Test MCP Read

```bash
curl -X GET "http://localhost:4000/mcp/read?collection=orders&limit=1" \
  -H "Authorization: Bearer your-mcp-api-key"
```

### 3. View API Documentation

Open in browser: `http://localhost:4000/docs`

Navigate to MCP endpoints section.

---

## Using MCP with External Tools

### Cursor/VS Code MCP Integration

If you're using Cursor or VS Code with MCP support:

1. **Configure MCP Server:**
   ```json
   {
     "mcpServers": {
       "confirmly": {
         "url": "http://localhost:4000/mcp",
         "apiKey": "your-mcp-api-key"
       }
     }
   }
   ```

2. **Use MCP Commands:**
   - Read data: `mcp confirmly read orders`
   - Write data: `mcp confirmly write orders create {...}`

### Python Client

```python
import requests

MCP_URL = "http://localhost:4000/mcp"
MCP_API_KEY = "your-mcp-api-key"

headers = {
    "Authorization": f"Bearer {MCP_API_KEY}"
}

# Read orders
response = requests.get(
    f"{MCP_URL}/read",
    params={"collection": "orders", "limit": 10},
    headers=headers
)
orders = response.json()["data"]
```

### Node.js Client

```javascript
const axios = require('axios');

const MCP_URL = 'http://localhost:4000/mcp';
const MCP_API_KEY = 'your-mcp-api-key';

async function readOrders() {
  const response = await axios.get(`${MCP_URL}/read`, {
    params: { collection: 'orders', limit: 10 },
    headers: { Authorization: `Bearer ${MCP_API_KEY}` }
  });
  return response.data.data;
}
```

---

## Security Best Practices

1. **Keep API Key Secret**
   - Never commit `MCP_API_KEY` to version control
   - Use environment variables
   - Rotate keys regularly

2. **Use HTTPS in Production**
   - Always use HTTPS for MCP endpoints
   - Never send API keys over HTTP

3. **Limit Access**
   - Only grant MCP access to trusted tools/users
   - Use different API keys for different environments

4. **Monitor Audit Logs**
   - Regularly review `EventLog` collection
   - Set up alerts for suspicious activity

---

## Troubleshooting

### Error: "MCP_API_KEY not configured"
- **Solution:** Set `MCP_API_KEY` in `apps/api/.env`

### Error: "MongoDB connection failed"
- **Solution:** Check `MONGO_URI` in `.env` and verify MongoDB is running

### Error: "Unauthorized"
- **Solution:** Verify API key is correct and included in `Authorization` header

### Error: "Collection not allowed"
- **Solution:** MCP only allows access to `orders`, `merchants`, and `users` collections

---

## Next Steps

1. ✅ Set up MongoDB connection (Atlas or local)
2. ✅ Generate and set `MCP_API_KEY`
3. ✅ Test MCP endpoints via API docs
4. ✅ Integrate MCP with your tools
5. ✅ Monitor audit logs

---

**For more information, see:**
- `apps/api/src/mcp/server.ts` - MCP server implementation
- `CODEBASE_AUDIT_REPORT.md` - Complete codebase audit
- API Documentation: `http://localhost:4000/docs`

