# Teacher Administration API

REST API for teacher-student administration built with Node.js, TypeScript, Express 5, and MySQL.

## Hosted API

| | URL |
|---|---|
| **API base** | https://teacher-admin-api-production.up.railway.app |
| **Swagger UI** | https://teacher-admin-api-production.up.railway.app/api-docs |

The API is deployed on [Railway](https://railway.app). Use the Swagger UI to explore and try all endpoints interactively without any local setup.

## Tech Stack

- **Runtime:** Node.js 18+, TypeScript
- **Framework:** Express 5
- **Database:** MySQL 8 (via `mysql2`)
- **Docs:** Swagger UI (OpenAPI 3.0)
- **Testing:** Jest

## Requirements

- Node.js 18+
- Docker (for MySQL)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start MySQL**
   ```bash
   docker compose up -d
   ```
   This starts MySQL 8 on port 3306 and auto-applies `src/db/schema.sql` on first boot. Data persists across restarts via a Docker volume.

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   The defaults in `.env.example` match the Docker setup — no edits needed:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=teacher_admin
   PORT=3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   The API will be available at `http://localhost:3000`.

   > **API Docs (Swagger UI):** `http://localhost:3000/api-docs` — try all endpoints interactively from the browser.

### MySQL commands

```bash
docker compose up -d                           # start (detached)
docker compose down                            # stop (data persists)
docker compose down -v && docker compose up -d # wipe data and reset schema
```

## Running Tests

```bash
npm test
```

All 48 unit tests run without a database connection (services and controllers are tested with mocked dependencies).

## API Endpoints

### POST /api/register

Register one or more students to a teacher. Idempotent — registering an already-registered student has no effect.

**Request:**
```json
{
  "teacher": "teacherken@gmail.com",
  "students": ["studentjon@gmail.com", "studenthon@gmail.com"]
}
```

**Success:** `204 No Content`

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"teacher":"teacherken@gmail.com","students":["studentjon@gmail.com","studenthon@gmail.com"]}'
```

---

### GET /api/commonstudents

Retrieve students registered to **all** of the specified teachers.

**Query params:** One or more `teacher=` parameters.

**Success:** `200 OK`
```json
{ "students": ["commonstudent1@gmail.com", "commonstudent2@gmail.com"] }
```

```bash
# Single teacher
curl "http://localhost:3000/api/commonstudents?teacher=teacherken%40gmail.com"

# Multiple teachers (intersection)
curl "http://localhost:3000/api/commonstudents?teacher=teacherken%40gmail.com&teacher=teacherjoe%40gmail.com"
```

---

### POST /api/suspend

Suspend a student.

**Request:**
```json
{ "student": "studentmary@gmail.com" }
```

**Success:** `204 No Content`

```bash
curl -X POST http://localhost:3000/api/suspend \
  -H "Content-Type: application/json" \
  -d '{"student":"studentmary@gmail.com"}'
```

---

### POST /api/retrievefornotifications

Retrieve students who can receive a notification from a teacher. Recipients must:
- **Not** be suspended, **and**
- Be registered to the teacher **or** @mentioned in the notification text

**Request:**
```json
{
  "teacher": "teacherken@gmail.com",
  "notification": "Hello students! @studentagnes@gmail.com @studentmiche@gmail.com"
}
```

**Success:** `200 OK`
```json
{ "recipients": ["studentbob@gmail.com", "studentagnes@gmail.com", "studentmiche@gmail.com"] }
```

```bash
curl -X POST http://localhost:3000/api/retrievefornotifications \
  -H "Content-Type: application/json" \
  -d '{"teacher":"teacherken@gmail.com","notification":"Hello @studentagnes@gmail.com"}'
```

---

## Error Responses

All endpoints return errors in this format with an appropriate HTTP status code:

```json
{ "message": "Meaningful error message" }
```

| Status | Cause |
|--------|-------|
| 400 | Missing or invalid request fields |
| 404 | Student not found (suspend endpoint) |
| 500 | Unexpected server error |
