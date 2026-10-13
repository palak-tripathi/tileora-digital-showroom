# TILEORA — Timeless Tiles. Beautiful Spaces.

**A premium digital showroom concept for a tiles company** — combining architectural product discovery, interactive tile visualization, product comparison, room recommendations, quotation capture, WhatsApp contact, and a digital marketing strategy.

> **Project status:** Source package prepared for GitHub. The application code has intentionally been preserved. Build, end-to-end behavior, backend production security, and live deployment have **not** been independently verified in this packaging step. Please read the deployment and security notes before publishing or deploying.

---

## Contents

- [Overview](#overview)
- [Features](#features)
- [Technology](#technology)
- [Project structure](#project-structure)
- [Run locally](#run-locally)
- [Environment configuration](#environment-configuration)
- [Currency selector](#currency-selector)
- [GitHub upload](#github-upload-beginner-friendly)
- [Vercel deployment](#vercel-deployment)
- [Security and production limitations](#security-and-production-limitations)
- [Testing checklist](#testing-checklist)

## Overview

TILEORA is a polished showroom experience designed to help customers explore tiles online before requesting a quote. It brings product discovery and marketing planning together in one interface.

The catalogue contains demonstration product data. Product descriptions, example reviews, showroom/store information, and enquiry examples should be reviewed and replaced with verified business information before using this as a real commercial website.

## Features included in the source

- Premium showroom landing page and collection sections
- Product catalogue with search and filters
- Product detail modal and tile specification information
- Three.js-based tile visualization
- Room recommendation tools and product comparison
- Quantity/wastage calculator with optional Gemini integration
- Quote/enquiry flow and WhatsApp draft link
- About, contact, offers, customer journey, and marketing strategy sections
- Admin dashboard and Express API routes in `server.ts`
- Currency selector for INR, USD, EUR, GBP, and JPY

Feature presence in source code is not a guarantee that every path has been tested in a production environment.

## Technology

- React 19 and TypeScript
- Vite
- Tailwind CSS v4
- Three.js
- Express and `tsx` for the local server/API
- `@google/genai` for optional Gemini-backed functionality
- Lucide React and Motion

## Project structure

```text
.
├── index.html
├── package.json
├── bun.lock
├── server.ts
├── vite.config.ts
├── tsconfig.json
├── vercel.json
├── .env.example
├── .gitignore
├── data/
│   └── enquiries.json
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── assets/images/
    ├── context/
    ├── data/
    ├── types/
    ├── utils/
    └── components/
```

## Run locally

### Prerequisites

- Node.js compatible with the versions required by the dependencies in `package.json`
- npm (or Bun, if you prefer the lockfile's package manager)

### Steps

1. Extract the ZIP.
2. Open a terminal in the folder that contains `package.json`.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a local `.env` file by copying `.env.example` and set a strong, unique `ADMIN_PASSWORD` before running the server. Never commit `.env`.
5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open the local address printed in the terminal (the server defaults to port `3000`).

### Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Starts the Express server with Vite middleware for local development |
| `npm run build` | Builds the Vite frontend into `dist/` |
| `npm run preview` | Starts Vite's static preview server (after a build) |
| `npm run lint` | Runs the configured TypeScript check (`tsc --noEmit`) |
| `npm start` | Starts `server.ts` through Node; verify runtime compatibility before relying on this script |

If a command fails, capture the full terminal error and resolve it before claiming the check passed.

## Environment configuration

Copy `.env.example` to `.env` for local development. The template contains placeholders only.

| Variable | Required? | Purpose |
|---|---|---|
| `PORT` | Optional | Local Express server port; defaults to `3000` |
| `ADMIN_PASSWORD` | Required for any admin-enabled run | Set a strong, unique password in your local environment and hosting provider. Do not use a sample/default password. |
| `GEMINI_API_KEY` | Optional | Enables Gemini-backed recommendations where configured. Keep it server-side and never put it in frontend-exposed variables. |

**Important:** The preserved `server.ts` currently includes a fallback admin password in its source. Setting `ADMIN_PASSWORD` in the environment overrides that fallback, but does not remove the fallback from the code. Do not expose the backend publicly as a production admin service until that fallback has been removed in a reviewed security change. This package deliberately avoids changing application code, as requested.

## Currency selector

The source includes a currency selector for:

- INR — Indian Rupee (default)
- USD — US Dollar
- EUR — Euro
- GBP — British Pound
- JPY — Japanese Yen

The current conversion utility uses configurable **benchmark/reference rates**, not a live exchange-rate feed. Rates can become stale and must not be presented as live market rates. Review all price surfaces and quotation behavior before using the currency selector for real transactions. Keep original product prices in INR and validate any currency-specific quote or checkout requirements separately.

## GitHub upload (beginner-friendly)

### Option A — GitHub Desktop (recommended)

1. Keep this ZIP as your untouched backup.
2. Extract it to a folder such as `TILEORA_GitHub_Ready`.
3. Install and open [GitHub Desktop](https://desktop.github.com/), then sign in.
4. Choose **File → Add Local Repository**. If the extracted folder is not a Git repository yet, use **Create a New Repository** and choose this extracted folder as the local path.
5. Set the repository name to `tileora-digital-showroom` and create it. Keep it **Private** until you have completed the security review.
6. Review the file list before committing. Confirm `.env` and any real customer data or secrets are not included. `.env.example` is a template and is intended to be committed.
7. Enter a clear initial commit message, such as `Prepare TILEORA showroom source for GitHub`, then commit and click **Publish repository**.
8. Keep the repository private until the backend's hardcoded fallback password and production storage/authentication design have been addressed.

### Option B — GitHub website

Create a repository at [github.com/new](https://github.com/new), then upload the **extracted files and folders**, not the ZIP file itself. The website upload flow can be awkward for larger projects; GitHub Desktop is usually easier for a complete folder.

## Vercel deployment

The included `vercel.json` configures a Vite build and SPA fallback. The repository also contains an Express API server in `server.ts`.

**Important distinction:** Deploying this Vite project to Vercel does not automatically turn the existing Express server into working Vercel API functions. With the current configuration, treat the Vercel deployment as a **frontend/static deployment only** unless you separately adapt and verify the API routes for Vercel or deploy the Express backend to a compatible Node hosting service.

### Frontend-only deployment

1. Push the extracted project to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and choose **Add New → Project**.
3. Import the GitHub repository.
4. Check the detected framework is Vite, the build command is `npm run build`, and the output directory is `dist`.
5. Deploy, then open the generated URL and test the frontend.
6. Do not assume quote persistence, admin login, product management, or AI API routes work on that URL until the backend is separately configured and tested.

### Backend requirements before real use

- Choose a host that supports the Express server, or convert the API routes to the hosting platform's supported serverless format.
- Configure `ADMIN_PASSWORD` and `GEMINI_API_KEY` in the host's environment-variable settings, not in committed files.
- Replace file-based JSON persistence with durable storage if you need reliable production enquiries. Serverless filesystems are not a dependable persistent database.
- Review authentication, session/token handling, rate limits, validation, CORS, and access control before making admin routes public.
- Verify the full quote submission and admin workflow against the deployed backend.

## Security and production limitations

This is a source handoff package, not a security certification or proof of production readiness.

- Do not commit `.env`, real credentials, private keys, or customer records.
- The bundled `data/enquiries.json` has been cleared of example enquiry records for safer source sharing. Real enquiries must stay private.
- `server.ts` still contains the original fallback admin password and demo seed records in its initialization code. The code was intentionally not changed. Keep the repository private and do not expose the backend publicly until this is fixed and reviewed.
- The included Vercel config covers the frontend build/routing, not automatic Express API deployment.
- The currency rates are reference rates, not live exchange rates.
- Product catalogue and marketing content are demonstration material; verify claims, prices, reviews, locations, and business contact details before commercial use.
- No claim is made that the build, all interactions, security, or live deployment passed verification as part of this ZIP packaging.

## Testing checklist

Before sharing or deploying, complete these checks:

- [ ] `npm install` finishes without errors
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Home page and responsive navigation work
- [ ] Product search and filters work
- [ ] 3D tile viewer renders on supported browsers/devices
- [ ] Currency selection updates every relevant price consistently
- [ ] Currency preference persists after refresh
- [ ] Quote form and WhatsApp draft are checked end-to-end
- [ ] Admin routes are secured and use a strong configured password
- [ ] Deployed API and durable enquiry storage are configured and tested
- [ ] No secrets or real customer data are committed

---

## Brand mission

**TILEORA — Timeless Tiles. Beautiful Spaces.**

Make architectural tile selection more visual, informed, and convenient by connecting a digital showroom with clear product information and a thoughtful customer journey.
