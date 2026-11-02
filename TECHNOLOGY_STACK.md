# Technology Stack

**Product:** Bharat Darshan 3D, a virtual explorer of Indian tourist places
**Version:** 1.0 | **Date:** 01 Nov 2026

> Versions below are suggested targets. Pin the exact versions you install in `package.json` and `requirements.txt`, and check current releases when you start.

---

## 1. Stack at a Glance
| Layer | Technology |
|---|---|
| Frontend | React (Vite), TypeScript recommended |
| 3D / spatial | Three.js via React Three Fiber, drei, Rapier physics |
| Styling / UI | Tailwind CSS with custom spatial theme tokens, Framer Motion |
| Backend | Python, Django, Django REST Framework |
| Auth | SimpleJWT, Google OAuth (ID token verification) |
| Database | PostgreSQL (PostGIS optional) |
| Cache / queue | Redis, Celery |
| AI | Groq API (LLM chat completions) |
| Maps | Google Maps JavaScript API |
| Storage / CDN | S3-compatible object storage (AWS S3 / Cloudflare R2 / MinIO) plus CDN |
| DevOps | Docker, Docker Compose, Nginx, GitHub Actions |
| Monitoring | Sentry, structured logging |

## 2. Frontend
| Purpose | Choice | Why |
|---|---|---|
| Framework | React 18+ with Vite | Fast dev server and builds; you already know React |
| Language | TypeScript | Safer code for a large 3D and API codebase |
| Routing | React Router | Standard SPA routing |
| Server state | TanStack Query | Caching, retries, loading states for API data |
| Client state | Zustand | Small and simple for UI and 3D state (settings, character state) |
| HTTP | Axios | Interceptors for JWT and silent refresh |
| 3D engine | `three`, `@react-three/fiber`, `@react-three/drei` | Declarative Three.js in React; loaders, controls, helpers |
| Physics | `@react-three/rapier` | Collision and character movement |
| Post-processing | `@react-three/postprocessing` (optional) | Bloom and depth effects for the spatial feel |
| Maps | `@vis.gl/react-google-maps` | Official-style React wrapper for Google Maps |
| Styling | Tailwind CSS | Quick theming through design tokens |
| Animation | Framer Motion | Smooth panel transitions and parallax |
| Forms | React Hook Form + Zod | Validation shared with TypeScript types |
| Sanitising | DOMPurify | Safe rendering of AI-generated text |
| Testing | Vitest, React Testing Library, Playwright | Unit, component, E2E |
| Lint/format | ESLint, Prettier | Consistency |

### 3D Asset Tooling
| Tool | Use |
|---|---|
| Blender | Modelling scenes and the avatar |
| glTF / GLB | Delivery format |
| gltf-transform / gltfpack | Draco and meshopt compression, texture optimisation |
| KTX2 (Basis) | GPU-compressed textures |
| Mixamo or Ready Player Me (check licences) | Avatar rigs and walk/idle animations |
| CC0 sources (e.g. Poly Haven, Kenney) | Free textures, HDRIs and props; verify licences |

## 3. Backend
| Purpose | Choice |
|---|---|
| Framework | Django 5.x + Django REST Framework |
| Python | 3.12+ |
| Auth | `djangorestframework-simplejwt` (with blacklist app), `google-auth` for ID token verification |
| API docs | `drf-spectacular` (OpenAPI/Swagger) |
| Filtering | `django-filter` |
| CORS | `django-cors-headers` |
| Rate limiting | DRF throttling backed by Redis |
| Async tasks | Celery + Redis |
| Real-time (optional) | Django Channels for streaming guide answers or multiplayer later |
| Groq | `groq` Python SDK or plain `httpx` against the OpenAI-compatible endpoint |
| Config | `django-environ` or `python-decouple` |
| Server | Gunicorn (WSGI) or Uvicorn/Daphne (ASGI if streaming/WebSockets) |
| Static/media | WhiteNoise for static; `django-storages` + `boto3` for object storage |
| Security | `django-axes` (login lockout), `django-csp` |
| Testing | pytest, pytest-django, factory_boy, coverage |
| Quality | Ruff, Black, mypy (optional), Bandit |

## 4. Database and Storage
| Component | Choice | Notes |
|---|---|---|
| Primary DB | PostgreSQL 16 | Relational integrity, JSON support |
| Geo (optional) | PostGIS | Nearby-places queries |
| Search | `pg_trgm` trigram index | Good enough for name search; upgrade to Meilisearch/Elasticsearch later if needed |
| Cache/broker | Redis 7 | Cache, throttles, Celery |
| Object storage | S3-compatible | GLB, textures, audio, panoramas, images |
| CDN | Cloudflare / CloudFront | Global delivery and WAF |

## 5. External APIs
| Service | Usage | Where the key lives |
|---|---|---|
| Groq API | Short description generation, AI guide chat | Backend only (env/secret store) |
| Google Maps JavaScript API | Interactive map on explore and detail pages | Frontend, referrer- and API-restricted |
| Google Geocoding / Places (optional) | Admin tools to fill coordinates | Backend, IP-restricted |
| Google Identity Services | "Sign in with Google" | Client ID public; verification on backend |
| Email (SMTP/Resend/SES) | Verification and reset mails | Backend |

## 6. UI Theme: Spatial UI Colour System
A natural, immersive "virtual world" palette: forest and dusk tones with a wine-red call to action.

| Token | Hex | Usage |
|---|---|---|
| `--bg-void` | `#0A0F0D` | App background (near-black with a green tint) |
| `--bg-surface` | `#111A16` | Cards, panels |
| `--forest-600` | `#1F5C3F` | Primary brand, nav, success |
| `--forest-400` | `#3E8E64` | Hover and active states |
| `--sage-300` | `#8FBF9F` | Secondary text, outlines, highlights |
| `--purple-600` | `#5B3A8C` | Accent: dusk sky, focus rings, gradients |
| `--purple-400` | `#8C6BC8` | Hover glow, links |
| `--wine-600` | `#7A1F36` | Primary CTA ("Visit"), alerts |
| `--wine-400` | `#A63A55` | CTA hover |
| `--text-main` | `#EDEDE6` | Body text |
| `--text-muted` | `#A8B3AB` | Secondary text |

**Tailwind theme snippet**
```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        void: '#0A0F0D',
        surface: '#111A16',
        forest: { 400: '#3E8E64', 600: '#1F5C3F' },
        sage: { 300: '#8FBF9F' },
        royal: { 400: '#8C6BC8', 600: '#5B3A8C' },
        wine: { 400: '#A63A55', 600: '#7A1F36' },
        ink: { main: '#EDEDE6', muted: '#A8B3AB' },
      },
      backgroundImage: {
        'dusk': 'linear-gradient(160deg, #0A0F0D 0%, #1F5C3F 55%, #5B3A8C 100%)',
        'ember': 'linear-gradient(135deg, #5B3A8C 0%, #7A1F36 100%)',
      },
      boxShadow: {
        glow: '0 0 24px rgba(140,107,200,0.35)',
      },
      backdropBlur: { glass: '16px' },
    },
  },
};
```

**Spatial UI patterns**
- Glass panels: `bg-surface/60 backdrop-blur-glass border border-sage-300/15 rounded-2xl`.
- Depth: layered parallax backgrounds, soft shadows, and subtle glow on interactive items.
- Category cards float with a slight 3D tilt on hover.
- Wine red is used sparingly: the **Visit** button and critical alerts only.
- Keep contrast at WCAG AA or better (`#EDEDE6` on `#0A0F0D` passes comfortably).
- Fonts (suggested): a clean sans such as Inter or Outfit for UI, and a refined serif such as Cormorant Garamond for place titles.

## 7. DevOps and Tooling
| Area | Tool |
|---|---|
| Containers | Docker, Docker Compose (api, worker, postgres, redis, nginx) |
| Reverse proxy | Nginx |
| CI/CD | GitHub Actions: lint, test, build, scan, deploy |
| Secrets | GitHub Secrets / cloud secret manager / `.env` locally (git-ignored) |
| Hosting (MVP) | Single VPS or Render/Railway; frontend on Vercel/Netlify/Cloudflare Pages |
| Hosting (scale) | AWS ECS/EKS with RDS, ElastiCache, S3 + CloudFront |
| Monitoring | Sentry, uptime checks, optional Prometheus and Grafana |
| Security scans | gitleaks, pip-audit, npm audit, Trivy, OWASP ZAP |
| Version control | Git with trunk-based or GitFlow; PR templates |

## 8. Suggested Repository Layout
```
bharat-darshan-3d/
  frontend/              # React + Vite app
  backend/               # Django project
  infra/                 # docker-compose, nginx, CI configs
  docs/
    PRD.md
    TECHNICAL_ARCHITECTURE.md
    SYSTEM_WORKFLOW.md
    SECURITY_ARCHITECTURE.md
    TECHNOLOGY_STACK.md
  .github/workflows/
  README.md
```

## 9. Environment Variables (Reference)
**Backend `.env`**
```
DJANGO_SECRET_KEY=
DJANGO_DEBUG=False
ALLOWED_HOSTS=
DATABASE_URL=postgres://user:pass@host:5432/db
REDIS_URL=redis://host:6379/0
JWT_SIGNING_KEY=
GROQ_API_KEY=
GROQ_MODEL=             # set in env so it can change without code edits
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_SERVER_MAPS_KEY= # optional, server-restricted
CORS_ALLOWED_ORIGINS=
S3_BUCKET= S3_REGION= S3_ACCESS_KEY= S3_SECRET_KEY= CDN_BASE_URL=
EMAIL_HOST= EMAIL_HOST_USER= EMAIL_HOST_PASSWORD=
SENTRY_DSN=
```
**Frontend `.env`**
```
VITE_API_BASE_URL=
VITE_GOOGLE_MAPS_BROWSER_KEY=   # referrer-restricted, Maps JS API only
VITE_GOOGLE_CLIENT_ID=
VITE_SENTRY_DSN=
```
Never put the Groq key in any `VITE_` variable. Anything prefixed `VITE_` is shipped to the browser.

## 10. Alternatives Considered
| Decision | Chosen | Alternative | Reason |
|---|---|---|---|
| 3D library | React Three Fiber | Babylon.js, PlayCanvas | Fits React; large community |
| State | Zustand + TanStack Query | Redux Toolkit | Less boilerplate |
| Auth tokens | JWT in memory + HttpOnly refresh cookie | Session cookies | Fits a decoupled SPA; session auth is also valid if you prefer simplicity |
| Task queue | Celery | Django-Q, RQ | Mature and well documented |
| Maps | Google Maps | Mapbox, Leaflet + OSM | Required by the project spec |
| LLM | Groq | Other providers | Required by the project spec; fast inference |

## 11. Learning and Build Order (Practical Path)
1. Django + DRF skeleton, Postgres, custom user, JWT auth.
2. Places and categories API, seed data, admin.
3. React app: auth pages, explore, detail, Google Map.
4. Groq: admin description generation, then the guide chat.
5. R3F prototype: one terrain, avatar movement, camera, a POI.
6. Scene manifest plus asset pipeline, then the first pilot place (e.g. Konark Sun Temple).
7. Panorama fallback, quality presets, polish.
8. Security hardening, tests, CI/CD, deploy.
