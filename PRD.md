# Product Requirements Document (PRD)

**Working title:** Bharat Darshan 3D, a virtual explorer of Indian tourist places
**Version:** 1.0 | **Date:** 01 Nov 2026 | **Status:** Draft

---

## 1. Vision
Let anyone experience India's temples, monuments, beaches, heritage sites, forests and trails from their browser. The user picks a place, reads a short description, sees it on Google Maps, then clicks **Visit** and walks through a 3D rendition of it as a virtual character.

## 2. Problem Statement
- Travel to many sacred, remote or eco-sensitive places is costly, physically hard, or restricted.
- Existing sites show photo galleries or videos. They do not offer self-paced, interactive exploration.
- Elderly users, people with disabilities, and students cannot always visit in person.

## 3. Goals and Non-Goals
**Goals**
1. A catalogue of places grouped by category.
2. Secure user accounts.
3. Google Maps view of each place.
4. AI-generated short descriptions and a guide chat powered by Groq.
5. A 3D virtual walkthrough with a controllable character.

**Non-Goals (v1)**
- Real-time multiplayer, VR headset support, booking or payments, user-generated 3D content.

## 4. Target Users
| Persona | Need |
|---|---|
| Curious explorer | Browse and "visit" places for fun |
| Student / researcher | Learn history and culture of a site |
| Elderly / differently-abled user | Experience places that are hard to reach |
| Trip planner | Preview a place before travelling |

## 5. Place Categories
1. Temples and sacred shrines
2. Monuments
3. Beach resorts
4. Cultural heritage
5. Ecotourism and wildlife
6. Trekking
7. Water sports

## 6. Functional Requirements

### FR-1 Authentication
- Register and login with email and password; optional Google OAuth sign-in.
- JWT access and refresh tokens, logout, password reset by email.
- Profile page (name, avatar, favourite places, visit history).

### FR-2 Discovery
- Home page with category cards in a spatial UI.
- Search by name, state or category, plus filters.
- Place detail page: hero visual, short description, category, state, best season, map.

### FR-3 Google Maps Integration
- Embedded map showing the place pin and its surroundings.
- Cluster map on the explore page showing all places.
- "Open in Google Maps" deep link.

### FR-4 Groq AI Integration
- Generate a short description (about 80 words) per place. Generated once, stored, and editable by admin.
- In-world guide chat: the user asks questions about the place and gets answers.
- All Groq calls go through the Django backend, never the browser.

### FR-5 Virtual Visit
- A **Visit** button opens the 3D scene for the place.
- A third-person character is controlled with WASD or arrow keys (touch joystick on mobile), plus mouse look.
- Points of interest (POIs) in the scene show info cards when approached.
- Fallback mode: a 360-degree panorama for places without a full 3D scene.
- Controls: pause, minimap, quality toggle, mute ambient audio.

### FR-6 Admin Panel
- CRUD for places, categories, POIs and scene assets.
- Moderate AI descriptions.
- View basic analytics.

### FR-7 User Extras (v1.1)
- Favourites, visit history, ratings, share link.

## 7. Non-Functional Requirements
| Area | Target |
|---|---|
| Performance | 3D scene interactive within 8 s on 4G; 30+ FPS on mid-range laptops |
| Scalability | 1,000 concurrent users on the API; scenes served by CDN |
| Availability | 99.5% |
| Security | See `SECURITY_ARCHITECTURE.md` |
| Accessibility | Keyboard navigation, captions for audio, high-contrast mode, WCAG 2.1 AA for 2D pages |
| Browser support | Latest Chrome, Edge, Firefox, Safari (WebGL2) |
| Responsive | Desktop first, usable on tablet and mobile |

## 8. UI / UX Direction: Spatial UI
A "natural, virtual world" feel: depth, glass panels, soft glow, parallax.

| Role | Colour | Hex |
|---|---|---|
| Background | Deep black-green | `#0A0F0D` |
| Primary | Forest green | `#1F5C3F` |
| Accent 1 | Royal purple (dusk sky) | `#5B3A8C` |
| Accent 2 | Wine red (CTA, alerts) | `#7A1F36` |
| Highlight | Moss / sage | `#8FBF9F` |
| Text | Warm off-white | `#EDEDE6` |

Guidelines:
- Glassmorphic floating panels over the 3D or blurred backdrop.
- Gradients: black to forest green for base; purple to wine for sunset-style highlights.
- Wine red is reserved for primary actions (e.g. **Visit**), purple for interactive hover states.

## 9. Key User Stories
1. As a visitor, I can register and log in so my favourites and history are saved.
2. As a user, I can filter places by category so I find what interests me.
3. As a user, I can read a short description and see the place on Google Maps.
4. As a user, I can click **Visit** and walk through the place as a character.
5. As a user, I can ask the AI guide questions about what I am seeing.
6. As an admin, I can add a new place with its scene assets and metadata.

## 10. Acceptance Criteria (samples)
- Unauthenticated users can browse places but are redirected to login when clicking **Visit**.
- Place page loads the map and description in under 3 s on broadband.
- Groq failures show a graceful fallback (stored description) with no broken UI.
- Character cannot walk outside the scene bounds or through collision meshes.

## 11. Success Metrics
- Registration to first visit conversion above 40%.
- Average session above 6 minutes.
- Scene load failure rate below 2%.
- Return users within 14 days above 25%.

## 12. Release Plan
| Phase | Scope | Duration |
|---|---|---|
| M1 | Auth, place catalogue, Maps, admin | 3 weeks |
| M2 | Groq descriptions and chat | 2 weeks |
| M3 | 3D engine, character, 2 pilot places | 4 weeks |
| M4 | Remaining categories (1 pilot each), polish, testing | 4 weeks |
| M5 | Beta launch | 1 week |

Suggested pilot places, one per category: Konark Sun Temple, Taj Mahal, Palolem Beach, Hampi, Jim Corbett, Triund Trek, Havelock Island.

## 13. Risks and Mitigations
| Risk | Mitigation |
|---|---|
| 3D asset creation is expensive | Start with low-poly stylised scenes; use CC0 assets; 360 fallback |
| Heavy scenes on weak devices | LOD, texture compression, quality presets |
| AI inaccuracies | Store and review descriptions; ground prompts with curated facts; show an "AI-generated" label |
| API cost or rate limits (Groq, Maps) | Cache outputs, per-user rate limits, key restrictions |
| Sensitive religious sites | Respectful modelling, no inappropriate avatar actions, content review |

## 14. Open Questions
- Realistic vs stylised art direction?
- Photogrammetry or hand-modelled scenes per place?
- Is a mobile app required later?
