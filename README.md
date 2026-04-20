# EventFlow – The Smart Digital Queue 🚀

[![CI/CD Pipeline](https://img.shields.io/github/actions/workflow/status/username/eventflow/main.yml?branch=main&label=CI%2FCD)](https://github.com/username/eventflow/actions)
[![Stack](https://img.shields.io/badge/Stack-MERN-blue)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

EventFlow is a highly scalable web platform that revolutionizes queue management at events (campus festivals, clubs, food trucks). Through **Zero-Risk Pricing** and an intuitive **No-Code interface**, it enables organizers to eliminate wait times and optimize the guest experience via real-time notifications.

---

## 🏗 Architecture & Tech Stack

The project is built on the **MERN Stack** (MongoDB, Express, React, Node.js).

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite (responsive, mobile-first) |
| **Backend** | Node.js & Express API |
| **Database** | MongoDB (via Mongoose) |
| **Payments** | Stripe (test mode included) |
| **QR Codes** | `qrcode.react` – generated in-browser |
| **Infrastructure** | Docker Compose (local) · Render (production) |

### Multi-Dashboard System

| View | URL | Purpose |
|---|---|---|
| **Admin** | `/` | No-code event & station configurator |
| **QR Code** | `/qr` | Generate & print QR codes per station |
| **Station** | `/station` | Staff process & advance orders |
| **Track Order** | `/guest` | Guest looks up order status by token |
| **Order & Pay** | `/order?event=X&station=Y` | Customer-facing menu + Stripe checkout |

---

## 🚀 CI/CD Pipeline

Every push to the `main` branch triggers the automated pipeline:

1. **Lint & Test** – Jest unit tests (backend) + Vite build check (frontend)
2. **Build** – Docker images pushed to GitHub Container Registry (GHCR)
3. **Deploy** – Render deploy hooks triggered via GitHub Secrets

> Pipeline config: `.github/workflows/main.yml`

---

## 🛠 Installation & Development

### Prerequisites

- Node.js >= 18.x
- MongoDB (local, Homebrew, or Atlas)
- Stripe account (free test mode — optional, see Demo Mode below)

### 1. Clone & Install

```bash
git clone https://github.com/username/eventflow.git
cd eventflow
npm run install-all   # installs root + backend + frontend
```

### 2. Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env – set MONGO_URI, STRIPE_SECRET_KEY, and STRIPE_WEBHOOK_SECRET

# Frontend (optional – enables real Stripe payments)
cp frontend/.env.example frontend/.env
# Edit frontend/.env – set VITE_STRIPE_PUBLISHABLE_KEY
```

**Backend environment variables:**

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string |
| `STRIPE_SECRET_KEY` | No | Stripe secret key (`sk_test_*`) – omit for demo mode |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret (`whsec_*`) – for production webhooks |
| `PORT` | No | API port (default: 5000) |
| `NODE_ENV` | No | `development` or `production` |

**Frontend environment variables:**

| Variable | Required | Description |
|---|---|---|
| `VITE_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key (`pk_test_*`) – omit for demo mode |
| `VITE_API_URL` | No | Backend URL (default: proxied via Vite to `localhost:5000`) |

### 3. Start MongoDB

**Option A – Homebrew (Mac):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Option B – Docker:**
```bash
docker run -d -p 27017:27017 --name mongo mongo:7
```

**Option C – MongoDB Atlas (Cloud, free):**
> Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com) and paste the connection string into `backend/.env` as `MONGO_URI`.

### 4. Seed Demo Data

```bash
npm run seed --prefix backend
# Prints station-specific QR code URLs to the console
```

### 5. Run Development Servers

```bash
npm run dev            # starts both backend (5000) + frontend (3000) concurrently
```

Open [http://localhost:3000](http://localhost:3000)

---

## 💳 Stripe Integration

### Demo Mode (no setup needed)
If `VITE_STRIPE_PUBLISHABLE_KEY` is not set, the app runs in **Demo Mode** — orders are placed without real payment processing. Perfect for local development.

### Real Stripe (Test Mode)
1. Create a free account at [stripe.com](https://stripe.com)
2. Go to **Dashboard → Developers → API Keys**
3. Copy your **test keys** (prefix `pk_test_` and `sk_test_`)
4. Add to your `.env` files:

```env
# backend/.env
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# frontend/.env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

**Test card numbers:**
| Card | Number |
|---|---|
| Visa (success) | `4242 4242 4242 4242` |
| Declined | `4000 0000 0000 0002` |
| 3D Secure | `4000 0025 0000 3155` |

Use any future expiry date and any 3-digit CVC.

---

## 🔲 QR Code Flow

```
Admin selects event + station → /qr page
         ↓
  QR Code displayed on screen / printed
         ↓
    Guest scans with phone camera
         ↓
  /order?event=<id>&station=<id>
         ↓
  Browses menu → adds items → enters name
         ↓
  Pays via Stripe (or Demo) → gets token
         ↓
  Tracks order at /guest with token
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/events` | List all events |
| `POST` | `/api/events` | Create event |
| `GET` | `/api/events/:id` | Get event (includes stations + menu items) |
| `PUT` | `/api/events/:id` | Update event |
| `DELETE` | `/api/events/:id` | Delete event |
| `GET` | `/api/orders` | List orders (filter: `eventId`, `stationId`, `status`) |
| `POST` | `/api/orders` | Guest places order |
| `GET` | `/api/orders/token/:token` | Guest checks own order |
| `PATCH` | `/api/orders/:id/status` | Station updates order status |
| `POST` | `/api/payments/create-intent` | Create Stripe PaymentIntent |
| `POST` | `/api/payments/webhook` | Stripe webhook (mark order as paid) |

---

## 🐳 Docker (Full Stack)

```bash
echo "STRIPE_SECRET_KEY=sk_test_placeholder" > .env
docker-compose up --build
# → Frontend: http://localhost:3000
# → Backend:  http://localhost:5000
# → MongoDB:  localhost:27017
```

Services: `mongo` (mongo:7), `backend` (Node 20-alpine), `frontend` (Nginx-served production build).

---

## ☁️ Deployment

### Render

Render deploy hooks are triggered automatically by the CI/CD pipeline after a successful build. Configure the secrets below in your GitHub repository.

### Vercel

Both `backend/vercel.json` and `frontend/vercel.json` are included for serverless deployment to Vercel. The backend uses the `@vercel/node` runtime; the frontend uses the Vite framework preset with SPA rewrites.

```bash
# Deploy frontend
cd frontend && vercel

# Deploy backend
cd backend && vercel
```

---

## 🔑 GitHub Actions – Required Secrets

Go to: **GitHub repo → Settings → Secrets and variables → Actions**

| Secret | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | Production backend URL (injected at frontend build time) |
| `STRIPE_SECRET_KEY` | No | Stripe secret key (used during Docker build verification) |
| `RENDER_BACKEND_DEPLOY_HOOK_URL` | No | Render webhook for backend service |
| `RENDER_FRONTEND_DEPLOY_HOOK_URL` | No | Render webhook for frontend service |

`GITHUB_TOKEN` is automatic (used to push Docker images to GHCR).

> **Note:** The deploy job requires **manual approval** via a GitHub environment (`staging`). Configure the environment under **Settings → Environments** to add required reviewers.

---

## 📈 Business Case

### Value Proposition

- **Zero-Risk** – Pay-per-use: free setup, payment only during live operation
- **Simplicity** – No-code setup for non-technical staff
- **Instant** – Guests order & pay from their phone via QR code, no app needed

### Revenue Model

| Model | Description |
|---|---|
| **Hybrid** | Setup fee + time-based usage (e.g. €10 + €2/hr) |
| **Volume** | Setup fee + per-guest charge (€0.05 per ticket) |
| **Premium** | Advanced analytics + PDF reports for large-scale organizers |

---

## 📋 Roadmap

- [ ] **MVP Focus:** Complete the no-code event configurator
- [ ] **Real-time:** WebSocket push notifications for order status changes
- [ ] **Load Balancing:** Redis queue for spike traffic (500+ concurrent)
- [ ] **UX:** Refine guest order flow for one-time users
- [ ] **Partnerships:** Pilot phases with TUM student union (AStA)

---

## 💡 Developer Notes

- **Scaling:** Redis will be added for queue management under spike traffic
- **Security:** Never commit API keys — use GitHub Secrets and `.env` files (gitignored)
- **Stripe Webhooks (production):** Use `stripe listen --forward-to localhost:5000/api/payments/webhook` for local testing

---

## 👥 Contact & Contributing

**Contact:** Daniel Sich / TU München  
