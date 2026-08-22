# MediManage Suite

**A hospital doesn't run on paperwork — it runs on who's free, who's waiting, and what's left in the stockroom.**

MediManage Suite is an Integrated Hospital Management System (IHMS) built around four things that public hospitals genuinely struggle to track in real time: the OPD queue, bed availability, patient admissions, and medical inventory. It grew out of a problem statement about metropolitan public hospitals (Delhi, specifically) where OPDs overcrowd, beds get tracked on paper, and stock-outs happen because nobody sees the shelf until it's empty — this repo is the working prototype of a system meant to fix that at the single-hospital level.

---

## What's actually in here

This is a full-stack TypeScript app — one Express server, one React frontend, one shared schema between them so the client and server never disagree about what a "patient" or "appointment" looks like.

| Layer | What it does |
|---|---|
| **Dashboard** | Live counts pulled straight from the database: total patients, active admissions, available beds, pending appointments, low-stock items. |
| **Patients** | A central patient record — demographics, contact info, address, medical history — that admissions and appointments both reference. |
| **Appointments (OPD queue)** | Book a patient against a doctor and date; each appointment gets a queue number and moves through `scheduled → checked-in → completed / cancelled`. |
| **Beds** | Every bed in the hospital, tagged by ward and type (ICU / General / Emergency), with a live `available / occupied / maintenance` status. |
| **Admissions** | Admit a patient to a specific bed with a diagnosis; discharging an admission automatically flips that bed back to `available`. |
| **Inventory** | Medicines and consumables with quantity, unit, reorder level, and expiry date — the dashboard's "low stock" count is a live query (`quantity <= reorderLevel`), not a manual flag. |
| **Auth** | Sign-in gate on the whole app via **Replit Auth** (OpenID Connect) — see the honest caveat about this below. |

---

## Tech stack — what's really running under the hood

**Frontend** — React 18 + Vite, TypeScript throughout, Tailwind CSS with shadcn/ui components (built on Radix primitives), TanStack Query for all server state, `wouter` for routing (not React Router), `recharts` for the dashboard charts, `framer-motion` for transitions, `react-hook-form` + Zod for forms.

**Backend** — Node.js + Express, written in TypeScript and run directly with `tsx` (no separate compile step in dev).

**Database — PostgreSQL, not SQLite.** The GitHub "About" description and an earlier version of this README said SQLite; the actual code (`server/db.ts`) uses `drizzle-orm/node-postgres` against a `pg.Pool`, and `.replit` provisions a `postgresql-16` module. If you're setting this up yourself, you need a real Postgres instance and a `DATABASE_URL`, not a `.sqlite` file.

**ORM / validation** — Drizzle ORM defines the schema once in `shared/schema.ts`; `drizzle-zod` derives Zod validators from those same table definitions, and both `client/` and `server/` import from `shared/` so a validation rule never has to be written twice.

**Auth — Replit Auth, specifically, not a generic role-based login.** The original README describes this as "Role-Based Access: Secure authentication system for hospital staff," but there's only one `users` table (no `role` column) and the login flow (`server/replit_integrations/auth/replitAuth.ts`) is an OpenID Connect strategy pointed at `https://replit.com/oidc`, using Passport, with sessions persisted in Postgres via `connect-pg-simple`. In practice: everyone who logs in gets the same access, and the login itself is tied to a Replit identity and a `REPL_ID`. There's no doctor/nurse/admin distinction in the code yet.

---

## Project structure

```
medi-manage/
├── client/                      # React frontend
│   └── src/
│       ├── pages/                # Dashboard, Appointments, Patients, Beds, Admissions, Inventory, Landing
│       ├── components/           # Layout, Sidebar, shadcn/ui primitives
│       ├── hooks/                 # use-auth, use-ihms (data hooks), use-toast, use-mobile
│       └── lib/                   # queryClient, auth-utils, utils
│
├── server/                      # Express backend
│   ├── index.ts                  # entry point
│   ├── routes.ts                 # registers every /api/* endpoint, calls storage layer
│   ├── storage.ts                # DatabaseStorage class — all Drizzle queries live here
│   ├── db.ts                     # Postgres pool + Drizzle instance
│   ├── vite.ts / static.ts       # dev vs. production asset serving
│   └── replit_integrations/auth/ # Replit OIDC login, session setup, auth routes
│
├── shared/                      # imported by BOTH client and server
│   ├── schema.ts                 # Drizzle table definitions + inferred Zod schemas + types
│   ├── models/auth.ts            # sessions & users tables (required by Replit Auth)
│   └── routes.ts                 # single source of truth for every API path + its Zod input/response shape
│
├── script/build.ts              # custom build: Vite for the client, esbuild for the server → dist/
├── attached_assets/             # original problem statement + software requirements docs (project background)
├── drizzle.config.ts
├── .replit                       # Replit environment: nodejs-20, postgresql-16, port 5000
└── package.json
```

---

## Data model, as it's actually defined

Seven tables, defined once in `shared/schema.ts`:

- **`departments`** — name + location, e.g. Cardiology / Block A
- **`doctors`** — belongs to a department, has a specialty, `availableDays` (as a JSON array), and a consultation fee
- **`patients`** — name, age, gender, contact, address, free-text medical history
- **`appointments`** — links a patient to a doctor on a date; carries `status`, an auto-assigned `queueNumber`, `symptoms`, `diagnosis`
- **`beds`** — ward, bed number, type (ICU/General/Private/Emergency), status, optional department link
- **`admissions`** — links a patient to a bed with an admission date, optional discharge date, status, diagnosis
- **`inventory`** — name, type (Medicine/Consumable), quantity, unit, reorder level, expiry date
- **`users`** / **`sessions`** — required by Replit Auth, not part of the hospital domain model itself

Every table above has a matching `insertXSchema` (Zod, generated from the Drizzle table) and inferred TypeScript types, so the same validation rule enforced on the server also type-checks the client's forms.

---

## Getting it running locally

### Prerequisites
- Node.js 18+ (the project's own `.replit` config targets Node 20)
- npm
- A PostgreSQL database you control the connection string for
- Since auth is wired to Replit's OIDC provider, running this **fully** outside Replit means you also need a `REPL_ID` registered with Replit's OIDC and, ideally, the app served over HTTPS (the session cookie is set `secure: true`). If you just want to poke at the API/data layer without wrestling with OIDC, you can stub or bypass `isAuthenticated` in `server/routes.ts` for local testing.

### 1. Clone and install
```bash
git clone https://github.com/lucifer55555555/medi-manage.git
cd medi-manage
npm install
```

### 2. Set environment variables
There's no `.env.example` committed, so here's what the code actually reads:

```bash
DATABASE_URL=postgres://user:password@host:5432/medimanage
SESSION_SECRET=some-long-random-string
REPL_ID=your-replit-app-id            # required by the OIDC strategy
ISSUER_URL=https://replit.com/oidc    # optional — this is the default if unset
```

### 3. Push the schema to your database
```bash
npm run db:push
```
This uses `drizzle-kit push` — it syncs your live database to match `shared/schema.ts` directly. There's no migrations folder in this repo; schema changes are pushed, not versioned as SQL migration files.

### 4. Run it
```bash
npm run dev
```
Server + client both come up together (Express serving the Vite dev middleware) at `http://localhost:5000`.

On first boot, if the `departments` table is empty, `seedDatabase()` in `server/routes.ts` runs automatically — it creates two departments, two doctors, nine beds across ICU/General/Emergency, eight inventory items (including two already below their reorder level and two already past their expiry date, on purpose, so the dashboard has something to flag), and one sample patient.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Runs the server (via `tsx`) with Vite dev middleware for the client — one process, hot reload |
| `npm run build` | `script/build.ts`: Vite-builds the client, esbuilds the server into a single `dist/index.cjs` |
| `npm run start` | Runs the production build (`node dist/index.cjs`) |
| `npm run check` | `tsc` — type-checks the whole project, no emit |
| `npm run db:push` | Pushes `shared/schema.ts` to your Postgres database via Drizzle Kit |

---

## API surface

Every endpoint is declared once in `shared/routes.ts` (method, path, Zod input schema, Zod response schema) and implemented in `server/routes.ts`. Nothing here is guessed — this is the actual list:

```
GET    /api/departments
GET    /api/doctors                POST /api/doctors
GET    /api/patients               POST /api/patients          PUT /api/patients/:id
GET    /api/appointments           POST /api/appointments       PUT /api/appointments/:id
GET    /api/beds                                                PUT /api/beds/:id
GET    /api/admissions             POST /api/admissions
                                    POST /api/admissions/:id/discharge
GET    /api/inventory                                            PUT /api/inventory/:id
GET    /api/stats
```

`POST /api/admissions/:id/discharge` is the one endpoint with a side effect worth knowing about: it marks the admission `discharged`, stamps a discharge date, and — in the same request — flips the linked bed back to `available`. That coupling lives in `routes.ts`, not in a database trigger.

---

## What's honestly not built yet

The original problem statement this project is based on calls for queuing-theory-driven token allocation (M/M/1 / M/M/c models), NIC system integration, and full role-based access control. As shipped in this repo, none of that is implemented — worth knowing before you present or extend this:

- **Queue numbers are random.** `createAppointment` in `storage.ts` assigns `Math.floor(Math.random() * 100) + 1` as the queue number — there's a comment in the code itself noting this is a placeholder, not real per-doctor, per-day queue logic.
- **No role-based access control.** Every authenticated user has identical permissions; there's no `role` field on the `users` table and no middleware that branches on one.
- **No NIC or city-wide system integration** — this is a single-hospital, standalone system.
- **No automated reorder alerts are actually sent anywhere.** The `reorderLevel` field powers the dashboard's "low stock" count, but there's no email/SMS/notification pipeline attached to it.
- **No pharmacy dispensation workflow** — inventory quantity is edited directly (`PUT /api/inventory/:id`); there's no "dispense N units to patient X" transaction that decrements stock automatically.
- Built and configured around Replit's runtime (`.replit`, the `postgresql-16` Nix module, Replit Auth) — running it as a fully generic self-hosted app takes a bit of extra work, mainly around auth, as noted above.

## Author

**Krish Agrawal**

## License

There is **no LICENSE file in this repository**. `package.json` does contain a `"license": "MIT"` field, but a field in `package.json` is not itself a license grant — without an actual `LICENSE` file, the code defaults to standard copyright: all rights reserved by the author. If you want this to actually be MIT-licensed (or anything else), add a proper `LICENSE` file with that text; until then, treat reuse, redistribution, or deployment of this code as something to check with the author about first. This project's stated purpose is educational/hackathon-prototype in nature.
