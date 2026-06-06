# 🏀 HARDWOOD — System Architecture

**Status:** Phase 1 (Monolith MVP)  
**Last Updated:** June 7, 2026  
**Next Review:** Phase 2 (Microservices Transition)

---

## 1. 📐 Architecture Overview

### Phase 1: Monolith MVP (Current)

```
┌────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                    │
│              (Player browsing, team builder, UI)            │
└─────────────────────┬──────────────────────────────────────┘
                      │ HTTP/REST (port 5173)
                      ↓
┌────────────────────────────────────────────────────────────┐
│              Express.js Monolith Backend                     │
│              (Single Node.js process)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Routes (HTTP Endpoints)                    │  │
│  │  ├─ GET    /health                                    │  │
│  │  ├─ POST   /auth/google-callback                      │  │
│  │  ├─ GET    /auth/verify                               │  │
│  │  ├─ GET    /players                                   │  │
│  │  ├─ GET    /players/:id                               │  │
│  │  ├─ POST   /teams                                     │  │
│  │  ├─ GET    /teams/:id                                 │  │
│  │  └─ (more routes in Phase 1.2+)                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Middleware (Request Checks)                  │  │
│  │  ├─ CORS handler (allow frontend origin)              │  │
│  │  ├─ JSON parser (parse request bodies)                │  │
│  │  └─ authMiddleware (JWT validation)                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        Services (Business Logic - No DB)              │  │
│  │  ├─ auth.service.ts (JWT generation/validation)       │  │
│  │  ├─ player.service.ts (player lookups, filters)       │  │
│  │  ├─ team.service.ts (team creation, validation)       │  │
│  │  ├─ simulation.service.ts (probabilistic engine)      │  │
│  │  ├─ analytics.service.ts (metric calculations)        │  │
│  │  └─ (more services as features grow)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      Database Layer (Queries & Connections)           │  │
│  │  ├─ db/client.ts (Supabase connection)                │  │
│  │  └─ db/queries/* (all database operations)            │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
└─────────────────────┬──────────────────────────────────────┘
                      │ HTTPS (port 3000)
                      ↓
┌────────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL Database                    │
│  ├─ auth_users (user identities)                            │
│  ├─ players (NBA player data)                               │
│  ├─ player_stats (seasonal statistics)                      │
│  ├─ nba_teams (NBA team reference data)                     │
│  ├─ user_teams (custom teams created by users)             │
│  ├─ user_team_players (roster players)                      │
│  ├─ games (NBA game schedules & results)                   │
│  ├─ game_stats (individual game performance)               │
│  ├─ comparisons (saved player comparisons)                 │
│  └─ simulations (saved simulation results)                 │
└────────────────────────────────────────────────────────────┘
```

### Phase 2+: Microservices (Future)

Each service becomes a separate Docker container with its own codebase:

```
API Gateway (Kong/Express)
    ├─→ Auth Service (Docker)
    ├─→ Player Service (Docker)
    ├─→ Team Service (Docker)
    ├─→ Simulation Service (Docker)
    ├─→ Analytics Service (Docker)
    ├─→ Game Service (Docker)
    └─→ ... (other services)
         ↓
    Shared Supabase PostgreSQL (or per-service schemas)
```

---

## 2. 🔐 Authentication & Authorization Flow

### Google OAuth + Custom JWT

```
1. User clicks "Sign in with Google"
   ↓
2. Frontend redirects to Supabase OAuth endpoint
   ↓
3. Supabase handles Google OAuth flow
   ├─ User sees Google consent screen
   ├─ Google returns auth code to Supabase
   └─ Supabase returns access_token to frontend
   ↓
4. Frontend calls POST /auth/google-callback
   Headers: Content-Type: application/json
   Body: { access_token: "supabase_token" }
   ↓
5. Backend receives Supabase token
   ├─ Verifies token signature with Supabase
   ├─ Extracts user identity (email, google_id)
   └─ If invalid → Return 401 error
   ↓
6. Backend checks auth_users table
   ├─ User exists? → Use existing record
   └─ New user? → Create auth_users record
   ↓
7. Backend generates CUSTOM JWT token
   ├─ Payload: { user_id, email, username, iat, exp }
   ├─ Signs with JWT_SECRET
   ├─ Expiry: 7 days
   └─ Returns to frontend
   ↓
8. Frontend stores JWT in localStorage
   ↓
9. Future requests include JWT in Authorization header
   Authorization: Bearer {jwt_token}
   ↓
10. Backend middleware validates JWT
    ├─ Extracts token from Authorization header
    ├─ Verifies signature with JWT_SECRET
    ├─ Adds decoded user to req.user
    └─ Proceeds to route handler (if valid)
```

### Protected Routes

```typescript
// Unprotected (anyone can call)
GET /health
GET /players
GET /players/:id
GET /games

// Protected (requires valid JWT)
POST /auth/google-callback (Google token required)
POST /teams (JWT required)
GET /teams/:id (JWT required, owner verification)
PUT /teams/:id (JWT required, owner verification)
DELETE /teams/:id (JWT required, owner verification)
POST /simulations (JWT required)
GET /simulations/:id (JWT required)
```

### JWT Structure

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "username",
  "iat": 1717680000,
  "exp": 1718284800
}
```

---

## 3. 🗄️ Database Schema & Relationships

### Entity Relationship Diagram

```
┌─────────────┐
│  auth_users │ (User identity - from Google OAuth)
├─────────────┤
│ id (UUID)   │◄─┐
│ email       │  │ (One-to-many)
│ username    │  │
│ google_id   │  │
└─────────────┘  │
                 │
        ┌────────┴────────┬────────────────┐
        │                 │                │
    ┌─────────────┐  ┌──────────┐  ┌────────────┐
    │ user_teams  │  │comparisons│  │simulations │
    │─────────────│  │───────────│  │────────────│
    │ id (UUID)   │  │ id        │  │ id         │
    │ user_id*    │  │ user_id*  │  │ user_id*   │
    │ name        │  │ player_a_id*
    │ created_at  │  │ player_b_id*
    └────────┬────┘  │ result_json
             │       └───────┬────┘
             │               │
    ┌────────▼──────────┐    │
    │user_team_players  │    │
    │───────────────────│    │
    │ id                │    │
    │ team_id*          │    │
    │ player_id*        │    │
    └────────┬──────────┘    │
             │               │
    ┌────────▼──────┐        │
    │    players    │◄───────┘
    │───────────────│
    │ id (UUID)     │
    │ name          │
    │ team_id*      │
    │ position      │
    │ height        │
    │ weight        │
    │ nba_id        │
    │ image_url     │
    └────┬──────┬───┘
         │      │
    ┌────▼─┐  ┌▼──────────────┐
    │ nba_ │  │ player_stats  │
    │teams │  │───────────────│
    │──────│  │ id            │
    │ id   │  │ player_id*    │
    │ name │  │ season        │
    │ abbr │  │ ppg           │
    │ conf │  │ rpg           │
    └─────┘  │ apg           │
             │ ts_pct        │
             │ bpm           │
             │ per           │
             └───────────────┘


    ┌────────────┐
    │   games    │
    │────────────│
    │ id (UUID)  │
    │ home_team* │──┐
    │ away_team* │──┼─→ nba_teams
    │ game_date  │◄─┘
    │ status     │
    │ home_score │
    │ away_score │
    └────────┬───┘
             │
    ┌────────▼──────────┐
    │   game_stats      │
    │───────────────────│
    │ id                │
    │ game_id*          │
    │ player_id*────────→ players
    │ points            │
    │ rebounds          │
    │ assists           │
    │ minutes           │
    │ plus_minus        │
    └───────────────────┘

* = Foreign Key reference
```

### Key Constraints

```sql
-- Referential Integrity
players.team_id → nba_teams.id
player_stats.player_id → players.id (CASCADE DELETE)
user_teams.user_id → auth_users.id (CASCADE DELETE)
user_team_players.team_id → user_teams.id (CASCADE DELETE)
user_team_players.player_id → players.id
comparisons.player_a_id → players.id
comparisons.player_b_id → players.id
simulations.user_id → auth_users.id
games.home_team_id → nba_teams.id
games.away_team_id → nba_teams.id
game_stats.game_id → games.id (CASCADE DELETE)
game_stats.player_id → players.id

-- Uniqueness
player_stats: UNIQUE(player_id, season) -- Can't have duplicate stats
nba_teams: UNIQUE(abbreviation)
auth_users: UNIQUE(email), UNIQUE(google_id)
user_team_players: UNIQUE(team_id, player_id) -- Player only on team once
```

---

## 4. 📡 Data Flow Patterns

### Read Flow (Getting Data)

```
Frontend Request
    ↓
Express Route Handler
    ↓
Check if data in Redis cache (Phase 3+)
    ├─ HIT: Return cached data (< 5ms)
    └─ MISS: Query database
         ↓
Database Query (PostgreSQL)
    ├─ Use indexes for fast lookup
    ├─ Apply filters, pagination
    └─ Return result set (~100ms)
    ↓
Service formats response (transform, aggregate)
    ↓
Populate Redis cache (Phase 3+)
    ├─ Set TTL (time-to-live)
    └─ For future requests
    ↓
HTTP Response to Frontend
    ├─ JSON body
    ├─ Cache-Control headers
    └─ ETag for conditional requests
```

**Performance Target:** < 200ms (p95)

### Write Flow (Modifying Data)

```
Frontend Request (POST/PUT/DELETE)
    ↓
Express Route Handler
    ↓
Validate request data (TypeScript types)
    ├─ Check required fields
    ├─ Type validation
    └─ Business rule checks
    ↓
Check authorization
    ├─ Is user authenticated? (JWT valid)
    ├─ Can user perform this action? (owner check)
    └─ Return 403 if denied
    ↓
Begin Database Transaction
    ├─ Ensures atomicity (all-or-nothing)
    ├─ Prevents race conditions
    └─ Rollback on error
    ↓
Execute Database Operation(s)
    ├─ INSERT: Create new record
    ├─ UPDATE: Modify existing
    └─ DELETE: Remove record
    ↓
Commit Transaction
    ↓
Invalidate Related Cache (Phase 3+)
    ├─ Remove cached data that's now stale
    └─ Future reads will fetch fresh data
    ↓
Publish Event to Kafka (Phase 3+)
    └─ Other services react asynchronously
    ↓
HTTP Response (201 Created / 200 OK / 204 No Content)
    └─ Return created/updated resource
```

**Consistency:** ACID transactions ensure data integrity
**Eventual Consistency:** Kafka events propagate to other services

---

## 5. 🔗 API Contract Specifications

### Request/Response Pattern

All responses follow this structure:

#### Success Response (2xx)

```json
{
  "data": { /* actual response */ },
  "error": null,
  "status": 200
}
```

#### Error Response (4xx, 5xx)

```json
{
  "data": null,
  "error": "Human-readable error message",
  "status": 400
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | GET succeeded |
| 201 | Created | POST /teams created new team |
| 204 | No Content | DELETE succeeded, no body |
| 400 | Bad Request | Invalid JSON, missing fields |
| 401 | Unauthorized | No token or invalid JWT |
| 403 | Forbidden | User can't access resource |
| 404 | Not Found | Player not found |
| 409 | Conflict | Duplicate email, already exists |
| 500 | Server Error | Unexpected error |

### Pagination (for list endpoints)

```
GET /players?page=1&limit=20&sort=name&order=asc

Query Parameters:
  page: Current page (1-indexed)
  limit: Records per page (default 20, max 100)
  sort: Field to sort by (name, ppg, etc.)
  order: asc or desc

Response:
{
  "data": [
    { /* player 1 */ },
    { /* player 2 */ },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 450,
    "pages": 23
  },
  "error": null
}
```

---

## 6. 🛣️ API Endpoint Overview (Phase 1)

### Health & Status

```
GET /health
  Response: { status: "ok", service: "HARDWOOD API", timestamp: "..." }
  Purpose: Liveness check for load balancers, monitoring
  Auth: None
```

### Authentication

```
POST /auth/google-callback
  Body: { access_token: "supabase_token" }
  Response: { token: "jwt", user: { id, email, username } }
  Purpose: Complete Google OAuth flow, get JWT
  Auth: Supabase token (not user's own JWT)

GET /auth/verify
  Response: { valid: true, user: { user_id, email, username } }
  Purpose: Check if token is still valid
  Auth: JWT required (Bearer token)
```

### Players (Phase 1.2+)

```
GET /players
  Query: ?page=1&limit=20&team=LAL&season=2024
  Response: { data: [players...], pagination: {...} }
  Purpose: List all players with filters
  Auth: None (public)

GET /players/:id
  Response: { data: player_full_profile }
  Purpose: Get single player with all stats
  Auth: None (public)

GET /players/:id/stats
  Query: ?season=2024
  Response: { data: stats_by_season }
  Purpose: Get player's seasonal stats
  Auth: None (public)
```

### Teams (Phase 1.3+)

```
POST /teams
  Body: { name: "My Dream Team" }
  Response: { data: team_object }
  Purpose: Create new custom team
  Auth: JWT required

GET /teams/:id
  Response: { data: { team, players: [] } }
  Purpose: Get team details + roster
  Auth: JWT required (owner or admin)

PUT /teams/:id
  Body: { name: "Updated Name", players: [player_ids] }
  Response: { data: updated_team }
  Purpose: Update team
  Auth: JWT required (owner only)

DELETE /teams/:id
  Response: 204 No Content
  Purpose: Delete team
  Auth: JWT required (owner only)
```

### Simulations (Phase 1.4+)

```
POST /simulations
  Body: { team_a: [player_ids], team_b: [player_ids] }
  Response: { data: sim_result }
  Purpose: Run team vs team simulation
  Auth: JWT required

GET /simulations/:id
  Response: { data: simulation_result }
  Purpose: Get previous simulation result
  Auth: JWT required (creator or public if shared)
```

### More endpoints in later checkpoints...

---

## 7. ⚡ Performance Considerations

### Database Indexes (Critical for Speed)

```sql
-- High-traffic queries need indexes
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_player_stats_season ON player_stats(season);
CREATE INDEX idx_player_stats_player_season ON player_stats(player_id, season);
CREATE INDEX idx_games_date ON games(game_date);
CREATE INDEX idx_game_stats_game ON game_stats(game_id);
CREATE INDEX idx_user_teams_user ON user_teams(user_id);

-- Speed up specific lookups
CREATE INDEX idx_players_nba_id ON players(nba_id);
CREATE INDEX idx_nba_teams_abbr ON nba_teams(abbreviation);
```

### Query Optimization Rules

1. **Always use indexes** for `WHERE` and `JOIN` conditions
2. **Select only needed columns** (not `SELECT *`)
3. **Paginate large result sets** (don't fetch 10K rows)
4. **Use `EXPLAIN` to analyze slow queries** before adding indexes
5. **Cache frequently accessed data** (Phase 3 with Redis)

Example:

```sql
-- ❌ SLOW: No index, fetches too much
SELECT * FROM player_stats WHERE season = 2024;

-- ✅ FAST: Uses index, fetches specific columns, paginated
SELECT player_id, ppg, rpg, apg FROM player_stats 
  WHERE season = 2024 
  LIMIT 20 OFFSET 0;
```

### Response Time Budget

```
API Request
  ├─ Network latency: 20ms
  ├─ Route lookup: 1ms
  ├─ Middleware: 5ms
  ├─ Authentication check: 2ms
  ├─ Database query: 100ms (with index)
  ├─ Service formatting: 20ms
  ├─ Serialization: 10ms
  └─ Network response: 20ms
  ─────────────────────────
  TOTAL: ~178ms (target: < 200ms)
```

---

## 8. 🚀 Deployment Architecture

### Phase 1: Local Development

```
npm run dev (from apps/api/)
  ↓
tsx watch src/index.ts
  ↓
localhost:3000 (backend)
localhost:5173 (frontend via Vite)
```

### Phase 2: Cloud Deployment (Post-MVP)

```
GitHub Repo
  ↓ (push to main)
GitHub Actions (CI/CD)
  ├─ Run tests
  ├─ Type check
  ├─ Build Docker image
  └─ Push to Docker registry
     ↓
Railway or Render (PaaS)
  ├─ Backend: Node.js container
  └─ Frontend: Static hosting (Vercel)
     ↓
Supabase (Managed PostgreSQL)
```

### Phase 4: AWS Production

```
GitHub Repo → GitHub Actions → Amazon ECR
                                    ↓
Frontend (React build) → CloudFront CDN ← ALB (Application Load Balancer)
                                    ↓
                          EKS Kubernetes Cluster
                          ├─ Auth Service Pod
                          ├─ Player Service Pod
                          ├─ Team Service Pod
                          └─ ... (other services)
                                    ↓
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
                  RDS        ElastiCache          MSK
              PostgreSQL        Redis             Kafka
```

---

## 9. 🔍 Monitoring & Observability

### Phase 1: Basic

```
Health endpoint: GET /health
Error logging: console.error() → CloudWatch (Phase 4)
Request logging: morgan middleware (future)
```

### Phase 3+: Advanced

```
Logs: CloudWatch → Datadog or ELK
Metrics: Prometheus → Grafana dashboards
Traces: X-Ray or Jaeger
Alerts: PagerDuty (production errors)
```

---

## 10. 🔄 Scaling Strategy

### Phase 1 (Monolith)
- Single Express server process
- Vertical scaling only (bigger machine)
- Supabase handles database scaling

### Phase 2 (Services)
- Multiple service containers
- Each service scales independently
- Docker Compose locally, Kubernetes later

### Phase 3 (Events + Cache)
- Redis cache layer (reduces DB load)
- Kafka decouples services (async processing)
- Multiple instances per service

### Phase 4 (AWS)
- Auto-scaling groups (CPU/memory based)
- Load balancer distributes traffic
- Database read replicas for reads
- CDN for static content caching

---

## 11. 🛡️ Error Handling

### Types of Errors

```typescript
// Validation Error (user's fault)
throw new BadRequestError("Invalid season format. Must be YYYY");

// Authentication Error (permissions)
throw new UnauthorizedError("No token provided");

// Not Found (resource doesn't exist)
throw new NotFoundError("Player not found");

// Server Error (our fault)
throw new InternalServerError("Database connection failed");
```

### Error Response Format

```json
{
  "error": "Descriptive message",
  "code": "VALIDATION_ERROR",
  "statusCode": 400,
  "timestamp": "2026-06-07T10:30:00Z"
}
```

---

## 12. 📋 Service Boundaries (for Phase 2 Split)

When splitting into microservices, each service owns:

### Auth Service
- **Owns:** JWT validation, user identity
- **Database:** auth_users table
- **API:** POST /auth/google-callback, GET /auth/verify
- **Dependencies:** None (stateless)

### Player Service
- **Owns:** Player data, stats calculations
- **Database:** players, player_stats tables
- **API:** GET /players, GET /players/:id
- **Dependencies:** None
- **Cache:** Heavily cached (rarely changes)

### Team Service
- **Owns:** User custom teams
- **Database:** user_teams, user_team_players tables
- **API:** CRUD /teams
- **Dependencies:** Auth Service (verify user), Player Service (validate roster)

### Simulation Service
- **Owns:** Game simulation logic
- **Database:** simulations table
- **API:** POST /simulations, GET /simulations/:id
- **Dependencies:** Player Service (get stats), Analytics Service (advanced metrics)

*(more services defined in Phase 2)*

---

## 13. 🔮 Future Evolution

### Phase 2 Changes
- Services become separate Docker containers
- Service-to-service communication via REST
- Shared database or per-service schemas
- API Gateway handles routing

### Phase 3 Changes
- Kafka events replace synchronous calls
- Redis cache layer
- Async data processing
- Event sourcing for audit trails

### Phase 4 Changes
- EKS Kubernetes orchestration
- AWS managed services (RDS, ElastiCache, MSK)
- Auto-scaling policies
- Observability stack (CloudWatch, Prometheus, Grafana)
- Multi-region failover

---

## 📚 Related Documents

- [PRP.md](./PRP.md) — Product requirements and project plan
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) — Detailed schema documentation
- [API_REFERENCE.md](./API_REFERENCE.md) — Complete API endpoint documentation (TBD)
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Deployment procedures (TBD)

---

**Built with engineering rigor for NBA analytics at scale.** ⚡
