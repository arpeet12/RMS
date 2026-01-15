<!-- .github/copilot-instructions.md - Project-specific guidance for AI coding agents -->

# Manpower — Copilot Instructions

Summary

- This is a Spring Boot (Java 17) + React frontend project. Backend code is under `src/main/java/com/manpower`; server-side views are Thymeleaf templates in `src/main/resources/templates`. The React SPA lives in `react-frontend/` and is built with `react-scripts` + Tailwind.

Key build & dev commands

- Backend (Windows): `mvnw.cmd spring-boot:run` or `mvnw.cmd package` then run the jar from `target/`.
- Backend (Unix): `./mvnw spring-boot:run` or `./mvnw package`.
- Frontend (dev): `cd react-frontend && npm install && npm start` (dev server on :3000). See [react-frontend/REACT_SETUP.md](react-frontend/REACT_SETUP.md) for details.
- Frontend (prod build): `cd react-frontend && npm run build` — built files appear in `react-frontend/build/` and the project currently serves server-side static templates; the build may be copied into `src/main/resources/static/` for production.

Architecture notes (why/how)

- Server: Spring Boot app exposes REST endpoints under `/api/*` (controllers in `src/main/java/.../api`), and also serves Thymeleaf templates located at `src/main/resources/templates/` for non-SPA pages.
- Frontend: React app is an SPA that calls backend REST APIs. Environment variable `REACT_APP_API_URL` is used in development to point at backend (see `react-frontend/REACT_SETUP.md`).
- File uploads: Stored under `uploads/` (e.g., `uploads/candidates/`). Back-end code handles multipart uploads and file serving — be careful when proposing changes that touch file paths/permissions.

Project-specific conventions & patterns

- Auth: Spring Security session-based auth; React checks authenticated user via `/api/auth/current-user` and uses `withCredentials: true`. See `react-frontend/src/contexts/AuthContext.js` and `src/main/java/.../security` for security config.
- Templates: Many pages exist as server-side Thymeleaf templates in `src/main/resources/templates/` (used for admin/candidate flows). If you change routes or API contracts, update corresponding templates.
- Uploads and IDs: Uploaded files are organized by entity id (see `uploads/candidates/<id>/documents`). Avoid reworking storage paths without syncing DB and front-end references.
- Frontend structure: `react-frontend/src/pages/` holds route pages; `services/api.js` centralizes HTTP calls. Prefer updating `services/api.js` when changing endpoints.

Important files to inspect when modifying behavior

- Backend: `pom.xml`, `src/main/resources/application.properties`, `src/main/java/com/manpower/**` (controllers, services, repositories)
- Frontend: `react-frontend/package.json`, `react-frontend/src/services/api.js`, `react-frontend/src/contexts/AuthContext.js`, `react-frontend/src/pages/`
- DB / infra: `create_database.sql`, `uploads/` directory structure

Testing & debugging tips

- Backend unit tests live under `test/` — run `mvnw.cmd test` (Windows) or `./mvnw test` (Unix).
- To debug integration issues between React and backend: run backend on :8080 and front-end dev server on :3000, set `REACT_APP_API_URL=http://localhost:8080` in `react-frontend/.env` and confirm CORS config.

What to avoid changing lightly

- Spring Security configuration and session/auth flow — React depends on session-based endpoints and `/api/auth/current-user`.
- File storage layout under `uploads/` and any code that constructs paths from IDs.

If you modify or add API endpoints

- Update `react-frontend/src/services/api.js` (or add a new service) and corresponding calls in `react-frontend/src/pages/`.
- Update any Thymeleaf templates under `src/main/resources/templates/` if the endpoint is consumed by server-rendered pages.

How I merged existing docs

- I used the repo's `REACT_SETUP.md` and `HELP.md` for concrete commands and API list; keep those files up-to-date when changing scripts or endpoints.

Questions for maintainers

- Which environment (dev/staging/production) should the React build be copied into `src/main/resources/static/` automatically? Who maintains that deployment step?
- Is session-based auth still required for new API endpoints, or can we introduce token-based auth for API-only routes?

If anything here is incorrect or incomplete, tell me which area to expand (build, auth, uploads, templates, or frontend routing) and I'll update the instructions.
