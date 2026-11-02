# Bharat Darshan 3D (भारत दर्शन 3D)

> **Virtual Explorer of Indian Tourist Places**  
> A spatial, full-stack 3D exploration platform letting anyone walk through India's temples, monuments, beaches, cultural heritage sites, national parks, and Himalayan trails from their browser.

---

## 🌟 Key Features

1. **Spatial UI & Design System**:
   - Immersive dusk color palette: Void (`#0A0F0D`), Surface (`#111A16`), Forest Green (`#1F5C3F`), Royal Purple (`#5B3A8C`), and glowing Wine Red CTA (`#7A1F36`).
   - Glassmorphic floating panels with `backdrop-blur-glass` and subtle 3D hover depth.
2. **Third-Person 3D Virtual Walkthrough**:
   - WebGL 3D rendering powered by **Three.js**.
   - Controllable avatar with WASD / Arrow keys movement, Sprint (Shift), and mouse-look camera orbit.
   - Procedural architectural monuments customized for each destination:
     - **Konark Sun Temple**: Tiered Jagamohana pyramid, 24 carved stone sundial wheels, Natya Mandir dancer pavilion.
     - **Taj Mahal**: Pristine marble central dome, 4 corner minarets, Charbagh reflecting waterways.
     - **Palolem Beach & Havelock Island**: Curved golden beach shores, ocean waves, swaying coconut palms, coral lagoons.
     - **Hampi Ruins**: Boulder kingdom hills, monolithic stone chariot, musical mandapa pillars.
     - **Jim Corbett**: Sal forest trees, Ramganga riverbed, grassland chaur.
     - **Triund Trek**: High alpine meadow ridge, snow-capped Dhauladhar peaks, prayer flags.
3. **Interactive Points of Interest (POIs)**:
   - Glowing 3D beacons at landmark locations.
   - Proximity radar: Approaching within the POI radius triggers an interactive HUD discovery card with historical facts.
4. **Groq AI Heritage Guide**:
   - Ultra-low latency in-world assistant via the Django backend `/api/v1/guide/ask/` proxy.
   - Contextually grounded in the current monument, nearby POI, and verified historical records.
   - Curated archive fallback ensuring reliable responses even without an external API key.
5. **Interactive Map & Google Maps Integration**:
   - Clustered multi-destination map and individual place pins.
   - Deep-linking to Google Maps with exact geographical coordinates.
   - Resilient dark canvas map fallback.
6. **Synthesized Ambient Soundscape**:
   - Built-in Web Audio API synthesizer for bronze temple bells, ocean surf, and mountain breeze chimes with zero external audio assets required.
7. **Secure Authentication & User Accounts**:
   - Custom User model with email authentication and JWT access/refresh token pair.
   - Profile management, visit session duration logging, and favourites.

---

## 🏛️ Seeded Pilot Places Across 7 Categories

| Category | Pilot Destination | State | Scene Mode |
|---|---|---|---|
| **Temples and sacred shrines** | Konark Sun Temple | Odisha | 3D Walkthrough |
| **Monuments** | Taj Mahal | Uttar Pradesh | 3D Walkthrough |
| **Beach resorts** | Palolem Beach | Goa | 3D Walkthrough |
| **Cultural heritage** | Hampi Ruins | Karnataka | 3D Walkthrough |
| **Ecotourism and wildlife** | Jim Corbett National Park | Uttarakhand | 3D Walkthrough |
| **Trekking** | Triund Trek | Himachal Pradesh | 3D Walkthrough |
| **Water sports** | Havelock Island (Swaraj Dweep) | Andaman & Nicobar | 3D Walkthrough |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.12 / 3.14)
- Node.js 18+ & npm

---

### 2. Backend Setup (Django REST Framework)

```powershell
# 1. Activate virtual environment
.\backend_venv\Scripts\activate

# 2. Navigate to backend directory
cd backend

# 3. Apply database migrations
python manage.py migrate

# 4. Seed categories, states, and the 7 pilot places
python manage.py seed_places

# 5. (Optional) Run tests
python manage.py test apps.core apps.places apps.accounts

# 6. Start the API server
python manage.py runserver 127.0.0.1:8000
```

The API will be live at `http://127.0.0.1:8000/api/v1/`.  
Django Admin is accessible at `http://127.0.0.1:8000/admin/` with:
- **Email**: `admin@bharatdarshan.com`
- **Password**: `Admin@12345`

---

### 3. Frontend Setup (React + Vite + Three.js + Tailwind)

```powershell
# 1. Navigate to frontend directory
cd frontend

# 2. Start the Vite development server
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🎮 Virtual World Controls

| Action | Control |
|---|---|
| **Move Avatar** | `W` / `A` / `S` / `D` or `Arrow Keys` |
| **Sprint** | Hold `Shift` while moving |
| **Orbit Camera / Look** | Click and Drag Mouse / Touchpad |
| **Inspect POI** | Walk within proximity radius of any purple beacon |
| **Consult AI Guide** | Click "AI Guide" or "Chat About This Landmark" |
| **Toggle Ambient Audio** | Click the Volume Icon on the top right |
| **Exit Tour** | Click "Exit Tour" on the top left |

---

## 🔒 Security & Privacy (DPDP Aligned)
- Groq API keys remain strictly on the backend and are never exposed to the client.
- Data minimisation: user queries sent to AI do not transmit personal identifiers.
- Strong password validation and JWT authentication.
- Read-only public exploration with protected access for virtual walkthrough tracking.

