# System Workflow

**Product:** Bharat Darshan 3D, a virtual explorer of Indian tourist places
**Version:** 1.0 | **Date:** 01 Nov 2026

---

## 1. End-to-End User Journey
```mermaid
flowchart TD
  A[Open website] --> B{Logged in?}
  B -- No --> C[Browse home, categories, places]
  C --> D[Click Visit]
  D --> E[Redirect to Login / Register]
  E --> F[Authenticated]
  B -- Yes --> F
  F --> G[Explore: category, search, map view]
  G --> H[Place detail: description + Google Map]
  H --> I[Click Visit]
  I --> J[Load scene manifest]
  J --> K[Load 3D world + avatar]
  K --> L[Walk, discover POIs, ask AI guide]
  L --> M[Exit or close]
  M --> N[Visit saved to history]
```

## 2. Registration and Login
```mermaid
sequenceDiagram
  participant U as User
  participant FE as React
  participant API as Django API
  participant DB as PostgreSQL
  U->>FE: Submit email + password
  FE->>API: POST /auth/register/
  API->>API: Validate input, check password strength
  API->>DB: Create user (Argon2/PBKDF2 hash)
  API-->>FE: 201 Created (+ verification email queued)
  U->>FE: Login
  FE->>API: POST /auth/login/
  API->>DB: Verify credentials
  API-->>FE: Access token (JSON, memory) + Refresh token (HttpOnly cookie)
  FE->>API: Authenticated requests with Bearer access token
  FE->>API: POST /auth/token/refresh/ when access token expires
  API-->>FE: New access token (refresh rotated)
```
**Google sign-in variant:** The frontend gets a Google ID token, sends it to `/auth/google/`, and the backend verifies it with Google, finds or creates the user, then issues the same JWT pair.

## 3. Place Discovery
1. Home loads categories from `GET /categories/`.
2. User picks a category or searches. The frontend calls `GET /places/?category=...&q=...`.
3. The explore page shows a card grid plus a map with clustered markers.
4. Clicking a card opens the detail page via `GET /places/{slug}/`.
5. The detail page shows the short description, state, best season, and the Google Map pin.

## 4. Short Description Generation (Admin, Offline)
```mermaid
sequenceDiagram
  participant AD as Admin
  participant API as Django
  participant Q as Celery
  participant G as Groq API
  participant DB as PostgreSQL
  AD->>API: Add place + verified facts
  API->>Q: Enqueue generate_description(place_id)
  Q->>G: Prompt (facts, length 80 words, neutral tone)
  G-->>Q: Draft description
  Q->>DB: Save short_description_ai (unpublished)
  AD->>API: Review / edit / approve
  API->>DB: Promote to short_description, publish
```

## 5. Virtual Visit Flow
```mermaid
sequenceDiagram
  participant U as User
  participant FE as React 3D
  participant API as Django
  participant CDN as CDN / Object Storage
  U->>FE: Click "Visit"
  FE->>API: POST /visits/ (place)
  API-->>FE: visit_id
  FE->>API: GET /places/{slug}/scene/
  API-->>FE: Manifest: asset URLs, spawn point, POIs, collision config
  FE->>CDN: Fetch GLB, textures, audio (cached, compressed)
  CDN-->>FE: Assets
  FE->>FE: Build scene, spawn avatar, start render loop
  U->>FE: WASD / joystick + mouse look
  FE->>FE: Collision check, animation blend, camera follow
  FE->>FE: Distance to POI < radius, show info card
  U->>FE: Exit
  FE->>API: PATCH /visits/{id}/ (ended_at, duration)
```

### In-Scene Loop (per frame)
1. Read input and compute the movement vector.
2. Physics step and collision resolution (stay inside bounds, no wall clipping).
3. Update avatar animation (idle, walk, run).
4. Update the follow camera.
5. Check POI proximity and show or hide info cards.
6. Update the minimap.
7. Render.

### Degraded Modes
| Condition | Behaviour |
|---|---|
| No WebGL2 / very weak device | Show the 360-degree panorama viewer |
| Slow network | Low-quality assets first, upgrade textures later |
| Scene asset fails to load | Retry, then show an error with a panorama or gallery fallback |

## 6. AI Guide Chat Flow
```mermaid
sequenceDiagram
  participant U as User
  participant FE as React
  participant API as Django
  participant R as Redis
  participant G as Groq API
  U->>FE: "Who built this temple?"
  FE->>API: POST /guide/ask/ {place, question, chat_id}
  API->>R: Check rate limit and token budget
  API->>API: Build prompt (system + place facts + nearby POIs + last turns)
  API->>G: Chat completion
  G-->>API: Answer
  API->>API: Filter and trim output, store message
  API-->>FE: Answer (JSON or SSE stream)
  FE-->>U: Show in guide panel
```
**Failure path:** On timeout or quota exhaustion the API returns a friendly message plus the stored place description. The UI stays usable.

## 7. Google Maps Flow
- The frontend loads the Maps JS API with the restricted browser key.
- The place coordinates come from the API, so the map is centred on them and a marker is dropped.
- "Open in Google Maps" builds a deep link from the coordinates or place name.
- Optional: the backend uses a separate server-restricted key for geocoding during admin entry. That key never goes to the browser.

## 8. Admin Workflow
1. Admin logs in to the Django admin (restricted by role and IP allowlist if possible).
2. Creates a Place: name, category, state, coordinates, facts.
3. Uploads or links assets (GLB, textures, audio, panorama).
4. Defines POIs (position, radius, text).
5. Triggers AI description, reviews, approves.
6. Publishes the place. The cache is invalidated and the place goes live.

## 9. Session and Token Lifecycle
| Token | Lifetime | Storage |
|---|---|---|
| Access JWT | 10-15 min | JS memory only |
| Refresh JWT | 7 days, rotated on each use | HttpOnly, Secure, SameSite cookie |
| Password reset token | 30 min, single use | Email link |

Logout blacklists the refresh token and clears the cookie.

## 10. Error Handling Conventions
| Case | HTTP | UI behaviour |
|---|---|---|
| Validation error | 400 | Inline field messages |
| Unauthenticated | 401 | Silent refresh once, else redirect to login |
| Forbidden | 403 | "No access" message |
| Not found | 404 | Friendly not-found page |
| Throttled | 429 | "Please wait" with retry timer |
| Upstream (Groq/Maps) failure | 502/503 | Fallback content, retry option |
| Server error | 500 | Generic message plus error ID for support |

## 11. Notifications and Analytics (v1 minimal)
- Emails: verification, password reset.
- Events logged: sign-up, login, place view, visit start and end, guide question count. These feed the success metrics in the PRD.
