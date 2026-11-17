# Nestify — Technical Report

> **Document purpose:** Engineering-oriented description of Nestify's problem domain, architecture, implementation, technology choices, security model, and operational considerations.
>
> **Repository basis:** This report is grounded in the repository README, package manifests, source layout, Express application bootstrap, and server entry point on the `main` branch. Where an exact database schema or runtime behavior is not visible from those artifacts, it is identified as a logical model or a recommendation rather than asserted as implemented fact.

## 1. Executive Summary

Nestify is a full-stack cloud-drive and file-sharing application. It gives authenticated users a place to upload and organize files, create folders, search content, preview or download assets, and share files or a drive with access controls. Its documented product goals include Google OAuth, JWT-backed sessions, owner/edit/view permissions, public share links, and Supabase-backed database and object storage.

The repository is organized as two JavaScript applications:

- **Client:** React 19, Vite, React Router, Axios, and Tailwind CSS.
- **Server:** Node.js with Express 5, modular route/controller/middleware layers, Supabase JavaScript client, and PostgreSQL-related dependencies.
- **Managed data services:** Supabase provides PostgreSQL and object storage; exact schema, bucket policies, and Row Level Security configuration are environment/project configuration and are not defined by the visible application bootstrap.

The architecture is a conventional browser-to-REST-to-managed-services design. The browser handles navigation and interactive UI; the API is responsible for validation, authentication, authorization, file metadata operations, and orchestration of storage/database requests.

## 2. Problem Statement

Users need a centralized way to store and retrieve digital files while retaining an understandable folder hierarchy and selectively sharing content. A useful cloud-drive workflow must address more than file upload:

1. **Organization:** Users need folders, file movement, renaming, deletion, and search.
2. **Access control:** Private content must be isolated by user; collaboration requires differentiated owner, editor, and viewer capabilities.
3. **Sharing:** Users need links for individual files and, where supported, a read-only shared drive or folder experience.
4. **Large-object handling:** File bytes should be stored in object storage rather than placed in relational rows; metadata and ownership relationships belong in a database.
5. **Usability:** The application needs a responsive dashboard, previews/downloads, upload interactions, and clear asynchronous feedback.
6. **Security and lifecycle:** Authentication, authorization, token handling, share-link controls, and expiry/revocation must be designed as part of the service rather than delegated to UI hiding.

Nestify addresses these needs with an integrated web client, an Express API, Supabase-managed data services, and share-specific endpoints and views.

## 3. Goals and Scope

### 3.1 Product goals documented by the project

- Google OAuth authentication and JWT-based application sessions.
- Protected routes and API permission checks.
- File upload, preview, download, search, and storage usage visibility.
- Folder creation, rename, delete, and movement of files.
- Individual file sharing with generated links.
- Read-only drive sharing.
- Owner/edit/view access concepts.
- Supabase PostgreSQL and storage buckets.

### 3.2 Non-goals / not established by inspected repository artifacts

The repository documentation mentions future enhancements such as version history, recycle-bin restore, real-time collaboration, upload progress, and offline synchronization. These should be treated as future work, not current guarantees. Exact quotas, encryption-at-rest configuration, malware scanning, versioning policy, service-level objectives, and compliance posture are not specified by the visible source/documentation.

## 4. Solution Approach

Nestify separates concerns into three principal parts:

1. **Presentation layer:** A React single-page application renders public, authenticated, and shared-content experiences. React Router supports route-level navigation; a shared authentication context and protected-route component coordinate session-aware UI. Axios and the Supabase client are available to the client for API/service integration.
2. **Application/API layer:** An Express application mounts routes for authentication, folders, files, sharing, drive sharing, and search. Controllers implement request workflows, while middleware handles identity and permission checks. CORS is restricted to the configured frontend origin (with a deployed frontend fallback); JSON and URL-encoded bodies are parsed centrally.
3. **Data and object layer:** Supabase is the managed backend for PostgreSQL and object storage. Relational metadata describes users, folders, files, permissions, and share references, while file payloads are stored in buckets. The API mediates operations so application-level ownership and sharing rules can be enforced consistently.

This split avoids coupling the browser directly to privileged database/storage operations and keeps file metadata queries separate from binary object storage.

## 5. High-Level Design (HLD)

### 5.1 System context

```text
+-------------------+        HTTPS / REST        +---------------------------+
| Browser           | <------------------------> | Nestify API               |
| React SPA         |                             | Node.js + Express         |
| React Router      |                             | Routes -> Middleware      |
| Auth/UI state     |                             | -> Controllers             |
+---------+---------+                             +-------------+-------------+
          |                                                     |
          | Google OAuth / configured auth flow                  | Supabase SDK / SQL
          v                                                     v
+-------------------+                             +---------------------------+
| Google Identity   |                             | Supabase                  |
| OAuth provider    |                             | PostgreSQL + Storage      |
+-------------------+                             | file objects + metadata   |
                                                  +---------------------------+
```

The precise OAuth callback/session exchange is implemented within the auth routes and client auth flow; this diagram describes the logical integration and not a claim that the browser directly owns provider credentials.

### 5.2 Main runtime components

| Component | Responsibility |
|---|---|
| React client | Dashboard, file/folder views, login/signup/auth completion, profile, and public shared-content pages. |
| Authentication context | Shared client-side identity/session state and auth-related UI coordination. |
| Protected route | Prevents unauthenticated access to private client routes; API authorization remains authoritative. |
| Express app | Middleware setup, CORS/body parsing, route mounting, and health response. |
| Route modules | HTTP endpoint definitions grouped by authentication, file, folder, search, and sharing domains. |
| Controllers | Request-level application operations and integration with data/storage services. |
| Authentication middleware | Validates/establishes identity for protected requests. |
| Permission middleware | Checks access rights before restricted operations. |
| Supabase client configuration | Central service client used by the API to access Supabase. |
| PostgreSQL | Durable metadata and relational records. |
| Supabase Storage | File binary/object persistence. |

### 5.3 Request lifecycle

For a typical protected operation:

1. The user initiates an action in the React UI.
2. The client sends an HTTP request to the API, including the configured session/token credentials.
3. Express applies CORS and request parsing, then dispatches to the domain route.
4. Authentication middleware verifies the caller. Permission middleware checks ownership or the relevant share role where applicable.
5. A controller validates input and invokes Supabase/database/storage operations.
6. The API returns a JSON result or a controlled error response; the client updates its state and reports the result to the user.

## 6. Architecture and Repository Structure

The inspected repository uses a client/server layout, with domain modules under `server/src` and page/component/context modules under `client/src`.

```text
Nestify/
├── client/
│   ├── src/
│   │   ├── components/       # Shared UI, including protected-route/navigation components
│   │   ├── context/           # Shared client state, including authentication context
│   │   ├── pages/             # Dashboard, login, shared views, profile, etc.
│   │   ├── utils/             # Client utilities
│   │   ├── App.jsx            # Application routing/composition
│   │   └── main.jsx           # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/            # Supabase client configuration
│   │   ├── controllers/       # File/folder/search/share/drive-share workflows
│   │   ├── middlewares/       # Authentication and permission checks
│   │   ├── routes/            # HTTP route definitions by domain
│   │   └── app.js             # Express app, middleware, route mounting, health endpoint
│   ├── server.js              # Environment loading and HTTP server startup
│   └── package.json
└── README.md
```

The server uses ES modules (`"type": "module"`). The entry point loads environment variables with `dotenv`, starts Express on `PORT` (default `5000`), and enables Morgan request logging in development. The application bootstrap mounts `/auth`, `/folders`, `/files`, `/share`, and `/search`; both file-share and drive-share routers are mounted under `/share`.

## 7. Functional Architecture and Implementation Details

### 7.1 Authentication and identity

The project documentation describes Google OAuth and JWT-based session authentication. Server dependencies include Passport and `passport-google-oauth20`, `jsonwebtoken`, `express-session`, and `bcryptjs`, while the client includes Supabase JS. These packages indicate the available integration mechanisms; package presence alone does not establish how every mechanism is used.

The client has an authentication context and a protected-route component. The API also includes authentication middleware, which is essential because client-side route guards only control navigation and cannot secure data by themselves. A robust end-to-end implementation should:

- Verify identity on every private API request.
- Derive the user identifier from verified credentials, never from an untrusted request body.
- Apply authorization at the object level for each file/folder operation.
- Keep signing keys and service-role credentials only on the server.
- Use secure, HTTP-only, same-site cookies when cookie sessions are used, and configure CSRF protections as appropriate.
- Rotate/revoke sessions and handle token expiration explicitly.

### 7.2 File management and object storage

The documented feature set includes drag-and-drop upload, previews for common document/image types, downloads, file movement, and storage usage tracking. The server has file routes and a file controller, and its dependencies include Multer and the Supabase client.

The intended data split is:

- **Object storage:** File bytes and storage-specific object identifiers.
- **Relational database:** Owner, original filename, MIME type, byte size, folder relationship, timestamps, and access/share metadata.

A safe upload workflow should enforce upload size and type limits, generate collision-resistant storage keys, scope keys to the owning account, and clean up partially completed operations. Database metadata should not be committed as successful until the object upload succeeds (or the workflow should include compensating cleanup). Downloads and previews should be authorized before issuing a time-bounded storage URL or streaming bytes.

### 7.3 Folder hierarchy

Folder routes and controller modules indicate separate folder operations. The feature description covers creation, rename, deletion, and moving files between folders. A typical relational representation uses a parent-folder reference and an owner reference, with a root representation that is consistently defined. Folder operations must validate that both the source and destination belong to an authorized drive and prevent cycles when moving folders. The exact schema and cascade semantics should be verified against the deployed Supabase database.

### 7.4 Sharing and permissions

The server contains separate file-sharing and drive-sharing route/controller modules. The documented capabilities include generated public links for files and read-only drive sharing, with owner/edit/view roles listed in the README.

Authorization should be evaluated server-side for each request. Share records should bind an opaque, high-entropy token to the target resource, allowed role, creator, and lifecycle state. For expiry/revocation controls, the API should check expiry and revocation on every access rather than treating an unguessable URL as permanent authorization. Public endpoints should return only the fields required by the share experience and should not expose internal storage paths or unrelated metadata.

The repository description references expiry controls, but the inspected high-level documentation does not specify their schema or exact behavior; implementation and configuration should be verified in the share controller/database policies before relying on a particular expiry guarantee.

### 7.5 Search

A dedicated search route/controller exists, and the README describes real-time file search. Search results must be scoped to the current user's accessible resources, including explicitly shared resources where intended. Input should be normalized and bounded; result pagination and database indexes should be used as data volume grows. Search should not reveal object names or metadata from another user's private drive.

### 7.6 Client application

The client is a React SPA built with Vite. Its source layout separates pages, reusable components, authentication context, and utilities. The project includes React Router, Axios, Tailwind CSS 4 with its Vite plugin, React Toastify for notifications, and icon libraries (`lucide-react`, `react-icons`). The documented UI includes a landing experience, dashboard, folder page, shared-drive experience, profile, auth views, and shared file/folder pages.

Vite is used for local development and production bundling. The client package exposes `dev`, `build`, `lint`, and `preview` scripts. ESLint is configured as a development tool. The frontend API base URL and Supabase public configuration are expected to be supplied through Vite environment variables according to the README.

### 7.7 Error handling and observability

The server includes Morgan request logging in development and a root health response (`GET /`). For production readiness, add structured logs with request/correlation IDs, centralized error serialization, consistent HTTP status codes, and monitoring for API latency, upload failures, storage errors, database connectivity, and OAuth callback failures. Avoid logging access tokens, share tokens, or sensitive file metadata.

## 8. Technology Stack

| Area | Technology | Role |
|---|---|---|
| Language/runtime | JavaScript, Node.js | Client and server implementation; server package uses ES modules. |
| UI | React 19, React DOM | Component-based SPA. |
| Build/dev server | Vite 7, React Vite plugin | Fast development server and client production build. |
| Styling | Tailwind CSS 4, `@tailwindcss/vite` | Utility-first styling and Vite integration. |
| Routing | React Router DOM 7 | Client-side route navigation and protected views. |
| HTTP client | Axios | API calls from the browser. |
| UI utilities | React Toastify, Lucide React, React Icons | Notifications and iconography. |
| API framework | Express 5 | REST API and middleware composition. |
| Auth integration | Passport, Google OAuth strategy, JWT, Express Session | Authentication/session dependencies documented or present in server dependencies. |
| Upload handling | Multer | Multipart upload parsing in the API. |
| Managed data | Supabase JS, Supabase PostgreSQL | Database and storage integration. |
| PostgreSQL driver | `pg` | PostgreSQL connectivity dependency. |
| Supporting server packages | CORS, dotenv, Morgan, UUID, bcryptjs | Cross-origin policy, environment loading, development logging, identifiers, and password hashing utility. |
| Development | Nodemon, ESLint | Backend reload and frontend linting. |
| Hosting (documented) | Render deployment link | Public deployed application URL listed in the README. |

## 9. Data Model (Logical)

The exact SQL schema is not included in the repository-level artifacts inspected for this report. The following is a logical model inferred from the product features, not a transcription of a confirmed database schema:

- **User**: application identity and provider subject/profile references.
- **Folder**: owner, parent folder (nullable/root), name, creation/update timestamps.
- **File**: owner, folder, original name, storage object key, MIME type, byte size, timestamps, and optional soft-delete state.
- **Resource permission/share**: resource type and ID, grantee or opaque token, role (`owner`, `edit`, `view`), creator, expiration/revocation state, and timestamps.
- **Drive share**: owner/drive reference and share lifecycle/role settings.

Recommended relational constraints include foreign keys, owner-scoped uniqueness rules where appropriate, indexes on owner/folder/resource identifiers, and indexes for token lookup and expiry cleanup. Use database policies as an additional security boundary when Supabase Row Level Security is enabled, while retaining API authorization checks.

## 10. API Surface (Domain-Level)

The application mounts these route prefixes (specific HTTP methods and exact request/response contracts should be read from the route files):

| Prefix | Domain |
|---|---|
| `/auth` | Login/OAuth and authentication operations. |
| `/folders` | Folder lifecycle and hierarchy operations. |
| `/files` | Upload, listing, file metadata, movement, preview/download, and deletion operations. |
| `/share` | File share operations and drive share operations (two routers are mounted at this prefix). |
| `/search` | File/folder search. |
| `/` | API health/welcome response. |

The API is configured for credentialed CORS from `FRONTEND_URL`, defaulting to the deployed Nestify frontend origin. Production deployments should configure the origin explicitly and avoid broad wildcard origins when credentials are enabled.

## 11. Security Design Considerations

Security is central to a file storage product. The following controls should be maintained and validated in deployment:

1. **Authentication:** Validate OAuth state/callbacks and verify JWT/session credentials server-side. Do not trust client-provided user IDs.
2. **Authorization:** Enforce owner/share-role rules for each object and action. Check the target folder and file relationship, not just the request route.
3. **Storage access:** Keep service-role keys server-only. Configure bucket privacy and RLS/policies deliberately. Use short-lived signed URLs for controlled downloads where applicable.
4. **Share links:** Generate cryptographically unpredictable tokens; support expiry and revocation; rate-limit public resolution endpoints; avoid leaking tokens in logs or analytics.
5. **Uploads:** Enforce size/type limits, validate filenames and MIME handling, avoid path traversal, and consider malware scanning for untrusted uploads.
6. **Transport and browser:** Require HTTPS in production; use strict CORS allowlists; use secure cookie settings and appropriate CSRF protections if cookie authentication is used.
7. **Secrets:** Keep `.env` files and service keys out of version control; rotate credentials and use deployment secret storage.
8. **Abuse prevention:** Apply request and upload rate limits, quota enforcement, and resource exhaustion controls.
9. **Operational safety:** Back up metadata, define object-retention and deletion semantics, and test restore procedures.

This section is a set of architectural requirements and recommendations; the repository overview alone does not prove that every control is configured in the deployed environment.

## 12. Configuration and Local Development

The repository README describes separate `client` and `server` applications. The server reads environment configuration via `dotenv`; its documented variables include `PORT`, `SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET`, and `FRONTEND_URL`. The client configuration described by the README includes `VITE_API_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_KEY`.

Typical local workflow:

1. Install dependencies independently in `server/` and `client/`.
2. Configure server and client environment files with local URLs and Supabase project credentials.
3. Start the server using its `dev` script (`nodemon server.js`).
4. Start the client using Vite (`npm run dev`).
5. Build the client with `npm run build`; run `npm run lint` for client lint checks.

The README's example commands and folder names are partly inconsistent with the actual `client/` and `server/` repository layout. Use the actual directory names and package scripts in this repository. Do not expose a Supabase service-role key through a `VITE_` variable; Vite variables are available in the browser bundle and must contain only public/anonymous credentials intended for client exposure.

## 13. Deployment and Operations

The README lists a Render-hosted application URL. A typical deployment separates the static SPA and API process (or deploys them under coordinated origins), configures environment variables in the hosting platform, and connects the API to Supabase over TLS.

Recommended production practices:

- Set an explicit production `FRONTEND_URL`, `PORT`, Supabase URL/key, OAuth credentials, and token/session secrets.
- Use separate development and production Supabase projects.
- Configure OAuth redirect URLs and allowed origins for each environment.
- Add readiness and liveness checks that reflect API and dependency health without exposing secrets.
- Configure database migrations/schema changes as repeatable deployment steps.
- Monitor storage usage, database utilization, request latency, and error rates.
- Define backup, restore, retention, and account deletion procedures.
- Ensure deployed frontend build-time variables point to the intended API and public Supabase configuration.

## 14. Reliability, Scalability, and Performance

The current layout is a modular monolithic API with a separate SPA and managed backend services. This is appropriate for a small-to-medium application and keeps operations relatively simple. Scaling should prioritize:

- Direct-to-storage or resumable uploads for large files, using narrowly scoped, short-lived upload authorization where appropriate.
- Pagination and database indexes for file/folder listings and search.
- Streaming or signed-URL delivery rather than buffering large files in API memory.
- Caching only non-sensitive or correctly authorization-keyed metadata.
- Background jobs for cleanup of expired shares, orphaned objects, and quota reconciliation.
- Rate limits and per-user quotas to isolate noisy tenants.
- Idempotency and compensating actions around storage/database multi-step operations.

No throughput, latency, or availability targets are stated in the repository; these should be defined based on deployment and usage requirements.

## 15. Testing and Quality Strategy

The server `package.json` currently defines a placeholder test script that exits with “no test specified.” The client exposes lint and build scripts. A production-quality validation plan should include:

- Unit tests for permission decisions, token validation, folder hierarchy rules, and share expiry.
- API integration tests for unauthenticated access, cross-user access denial, upload metadata consistency, and share revocation.
- Client tests for authentication state, protected routes, loading/error states, and shared-link views.
- End-to-end tests for login, upload, folder organization, search, preview/download, and file/drive sharing.
- Security tests for invalid/expired credentials, malformed input, upload limits, and object-level authorization.
- CI checks for lint, tests, production client build, and dependency auditing.

## 16. Known Constraints and Verification Notes

- Repository README and implementation layout document a managed Supabase database/storage approach; actual database schema and RLS policies are not represented in the root documentation inspected here.
- Dependencies include several authentication-related packages, but dependency declarations do not by themselves prove which authentication path is active or its exact cookie/token semantics.
- Share expiry is referenced by the repository description, but the high-level README does not define expiry rules or retention behavior.
- Client-side guards improve UX but must not be treated as an authorization control.
- The README's setup paths describe `backend/` and `frontend/`, whereas the repository contains `server/` and `client/`; follow the checked-in package locations.
- The server currently has a placeholder test command, so automated backend coverage should be established.

## 17. Recommended Roadmap

### Near term

- Document the actual schema, RLS policies, bucket policies, environment variables, OAuth callback flow, and endpoint contracts.
- Add centralized API error handling and request validation.
- Add tests for authorization boundaries and share-link lifecycle.
- Enforce upload size/type limits and API rate limiting.
- Clarify deletion, expiry, and storage quota semantics.

### Medium term

- Add resumable uploads, upload progress, and background cleanup jobs.
- Implement version history and recycle-bin/restore semantics if required by product goals.
- Add structured observability, dashboards, and alerting.
- Add CI workflows for lint, tests, builds, and dependency/security checks.

### Long term

- Evaluate offline sync and real-time collaboration only after defining conflict resolution, consistency, and authorization requirements.
- Define service-level objectives, disaster recovery objectives, and data retention/compliance requirements as the user base grows.

## 18. Conclusion

Nestify combines a React/Vite client with a modular Express API and Supabase-managed relational and object storage services to provide core cloud-drive and sharing workflows. Its separation of UI, API routes/controllers, authentication and permission middleware, and storage/database services provides a sound foundation for an application of this scope. The most important engineering priorities are to make object-level authorization and share lifecycle rules explicit, document the actual database/storage policies, and add backend tests and operational controls before relying on the service for sensitive or high-volume data.
