# 🏀 HARDWOOD

**Real-time NBA analytics platform** — player stats, team builder, game simulations, and AI-powered insights.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

---

## What is HARDWOOD?

HARDWOOD ingests and normalizes NBA player data from the official stats API, stores it in a managed PostgreSQL database, and exposes it through a type-safe REST API consumed by a React frontend. The platform is designed from the ground up to evolve from a monolith MVP into a distributed, event-driven, cloud-native system on AWS.

**Core capabilities:**

- Browse all ~500 active NBA players with seasonal stats and career history
- Build custom fantasy rosters and validate them
- Run head-to-head player comparisons with normalized metrics
- Simulate team matchups with probabilistic win probability models
- AI-powered natural language insights on players and matchups
- Track live game scores and box scores

---

## Architecture

### Phase 1 (Current) — Monolith

```
React Frontend (Vite)
        │ HTTP/REST
        ▼
Express.js Backend (Node.js / TypeScript)
  ├── routes/         HTTP endpoint handlers
  ├── services/       Business logic (no DB access)
  ├── db/queries/     All Supabase operations
  └── lib/            NBA API client, job tracker, utilities
        │
        ▼
Supabase PostgreSQL
```

The backend follows a strict three-layer architecture: HTTP client → service orchestration → database queries. No layer reaches past its neighbor.

### Future Phases

| Phase | What Changes |
|---|---|
| **Phase 2** | Monolith splits into 10 independent Docker microservices behind an API Gateway |
| **Phase 3** | Kafka event bus + Redis caching layer replace synchronous inter-service calls |
| **Phase 4** | Full AWS deployment — EKS, RDS, ElastiCache, MSK, CloudFront, auto-scaling |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript, TanStack Query |
| Backend | Node.js 18+, Express.js, TypeScript |
| Database | Supabase (managed PostgreSQL) |
| Monorepo | Turborepo |
| Auth | Google OAuth via Supabase + custom JWT (7-day expiry) |
| Data source | `stats.nba.com` REST API |

---

## Project Structure

```
HARDWOOD/
├── apps/
│   ├── api/                    Express.js backend
│   │   └── src/
│   │       ├── routes/         HTTP route handlers
│   │       │   ├── ingest.ts   Fire-and-forget ingestion trigger (202)
│   │       │   ├── players.ts
│   │       │   ├── teams.ts
│   │       │   └── auth.ts
│   │       ├── services/       Business logic layer
│   │       │   └── ingest.service.ts
│   │       ├── db/
│   │       │   └── queries/    Supabase upsert operations (Map pattern)
│   │       │       └── players.queries.ts
│   │       └── lib/
│   │           ├── nba-client.ts    stats.nba.com HTTP client
│   │           └── ingest-tracker.ts  In-memory job status tracker
│   └── web/                    React + Vite frontend
│       └── src/
│           └── hooks/          TanStack Query hooks (mutation + polling)
└── packages/                   Shared types and config (Turborepo)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A [Supabase](https://supabase.com/) project

### 1. Clone and install

```bash
git clone https://github.com/Hanfried-Nguegan/HARDWOOD.git
cd HARDWOOD
npm install
```

### 2. Configure environment

Create `apps/api/.env`:

```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
```

Create `apps/web/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 3. Run the database migrations

Apply the schema in your Supabase SQL editor. The full schema lives in [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) and covers:

- `auth_users`, `jwt_tokens`
- `nba_teams`, `players`, `player_stats`
- `user_teams`, `user_team_players`
- `games`, `game_stats`
- `comparisons`, `simulations`

### 4. Start development servers

```bash
npm run dev
```

This starts both the API (`localhost:3000`) and the frontend (`localhost:5173`) in parallel via Turborepo.

---

## Data Ingestion

HARDWOOD pulls player data from `stats.nba.com` — the same endpoints used by the Python `nba_api` library — translated into Node.js with the required headers and rate limiting.

### Trigger ingestion

```bash
POST /ingest
```

Returns `202 Accepted` immediately. Ingestion runs in the background (~5 minutes for all ~500 active players across all seasons).

### Poll status

```bash
GET /ingest/status
```

Returns the current job state: `idle`, `running`, `done`, or `failed` with progress details.

The frontend uses a `useQuery` hook with 3-second polling that automatically stops when the job completes.

### Design decisions

- **Serial rate-limited loops** — requests to `stats.nba.com` are made one at a time with delays to avoid triggering bans
- **Map pattern for bulk upserts** — avoids N+1 queries when writing large stat datasets to Supabase
- **Partial failure handling** — a single player failure does not abort the full ingestion run

---

## API Overview

All responses follow a consistent envelope:

```json
{ "data": { }, "error": null, "status": 200 }
```

### Public endpoints

```
GET  /health
GET  /players?page=1&limit=20&team=LAL&season=2024
GET  /players/:id
GET  /players/:id/stats?season=2024
GET  /games
```

### Authenticated endpoints (JWT required)

```
POST /auth/google-callback       Exchange Supabase token for JWT
GET  /auth/verify                Validate current JWT

POST /teams                      Create custom team
GET  /teams/:id                  Get team + roster
PUT  /teams/:id                  Update team
DELETE /teams/:id                Delete team

POST /simulations                Run team vs team simulation
GET  /simulations/:id            Retrieve simulation result
```

### Ingestion

```
POST /ingest                     Trigger background ingestion (202)
GET  /ingest/status              Poll job status
```

---

## Simulation Engine

The simulation takes two 5-player rosters and produces win probabilities and predicted scores.

**Algorithm:**

1. Aggregate player stat vectors (PPG, RPG, APG, TS%, BPM, etc.)
2. Normalize to per-game basis to account for playing time differences
3. Calculate offensive and defensive ratings per possession
4. Apply Bradley-Terry model for win probability
5. Use Poisson distribution for score prediction
6. Run 100–1000 Monte Carlo iterations to produce confidence intervals

**Performance target:** < 2 seconds per simulation.

---

## Authentication

Google OAuth is handled by Supabase. After the OAuth callback, the backend verifies the Supabase token, upserts the user into `auth_users`, and returns a custom 7-day JWT signed with `JWT_SECRET`. All subsequent requests include this JWT as a `Bearer` token.

```
User → Supabase Google OAuth → POST /auth/google-callback → Custom JWT → All protected routes
```

---

## Performance Targets

| Metric | Target |
|---|---|
| API latency (p95) | < 200ms |
| Simulation runtime | < 2s |
| Cache hit rate (Phase 3+) | > 80% |
| Data ingestion | 500+ players in < 30 min |

---

## Roadmap

- [x] Express.js monolith with modular route structure
- [x] NBA stats ingestion with fire-and-forget + polling pattern
- [x] Player and stats persistence (Supabase)
- [x] In-memory job tracker
- [x] Frontend React Query hooks for ingestion
- [ ] Player browsing UI
- [ ] Custom team builder
- [ ] Simulation engine + UI
- [ ] Google OAuth + JWT auth flow
- [ ] Microservices split (Phase 2)
- [ ] Kafka + Redis caching (Phase 3)
- [ ] AWS EKS production deployment (Phase 4)

---

## Contributing

This project is in active development. If you're contributing:

- Follow the three-layer architecture (routes → services → db/queries)
- No direct DB calls from routes or service-to-service calls that skip the query layer
- All new features must be TypeScript end-to-end
- Run `npm run typecheck` and `npm run lint` before opening a PR

---

## License

MIT

---

*Built for the NBA and basketball analytics community. ⚡*