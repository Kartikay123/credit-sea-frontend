# CreditFlow LMS — Frontend

Next.js (App Router) + TypeScript + Tailwind CSS client for the Loan Management System.

## Tech stack

- **Framework**: Next.js 14 (App Router, client components)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS
- **State**: React context for auth (`lib/auth.tsx`)
- **HTTP**: `fetch` wrapper in `lib/api.ts`

## Folder layout

```
frontend/
├── app/
│   ├── layout.tsx                 root layout · AuthProvider + Navbar
│   ├── page.tsx                   redirects to login or role landing
│   ├── globals.css                Tailwind base + reusable classes
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── apply/
│   │   ├── details/page.tsx       step 1 — personal details (BRE)
│   │   ├── upload/page.tsx        step 2 — salary slip upload
│   │   ├── loan/page.tsx          step 3 — amount + tenure + live SI
│   │   └── status/page.tsx        view applied loans
│   └── dashboard/
│       ├── page.tsx               admin landing
│       ├── sales/page.tsx         lead tracking
│       ├── sanction/page.tsx      approve / reject (with reason)
│       ├── disbursement/page.tsx  mark as disbursed
│       └── collection/page.tsx    record payments · auto-close
├── components/
│   ├── Navbar.tsx                 top bar with logout
│   ├── StepBar.tsx                4-step progress for borrower journey
│   └── DashboardShell.tsx         module tabs (RBAC-filtered)
├── lib/
│   ├── api.ts                     fetch wrapper · Bearer token · errors
│   ├── auth.tsx                   AuthProvider + useRequireAuth(roles)
│   ├── types.ts                   shared TS types (mirror backend)
│   └── format.ts                  ₹, dates, status colors
├── .env.example
├── next.config.js
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Setup

### 1. Prerequisites

- Node.js 18+
- Backend running (default: `http://localhost:5001`). See `../backend/README.md`.

### 2. Configure environment

```bash
cp .env.example .env.local
```

| Variable               | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_API_URL`  | Base URL of the backend API (e.g. `.../api`)    |

### 3. Install + run

```bash
npm install
npm run dev        # http://localhost:3000
```

### 4. Production build

```bash
npm run build
npm start
```

## Routes

### Public

| Route      | Purpose                              |
| ---------- | ------------------------------------ |
| `/login`   | Sign in for any role                 |
| `/signup`  | Create a borrower account            |

### Borrower (role: `borrower`)

| Route               | Purpose                                                |
| ------------------- | ------------------------------------------------------ |
| `/apply/details`    | Step 1 — personal details + server-side BRE check      |
| `/apply/upload`     | Step 2 — salary slip upload (PDF/JPG/PNG, ≤5 MB)       |
| `/apply/loan`       | Step 3 — amount slider + tenure slider + live SI calc  |
| `/apply/status`     | View all loans (applied, sanctioned, disbursed, closed)|

### Operations dashboard

Each role sees **only** its own module. Admin sees all four tabs.

| Route                      | Visible to                |
| -------------------------- | ------------------------- |
| `/dashboard`               | admin landing             |
| `/dashboard/sales`         | sales (or admin)          |
| `/dashboard/sanction`      | sanction (or admin)       |
| `/dashboard/disbursement`  | disbursement (or admin)   |
| `/dashboard/collection`    | collection (or admin)     |

## Authentication

1. On login/signup, the API returns a JWT — saved to `localStorage.lms_token`.
2. `AuthProvider` (in `lib/auth.tsx`) calls `GET /auth/me` on mount to hydrate the user.
3. `useRequireAuth(allowedRoles)` redirects:
   - to `/login` if not authenticated
   - to `/dashboard` if logged in but lacking permission
4. Every API call attaches `Authorization: Bearer <token>` via the `api.ts` wrapper.

**RBAC is also enforced on the backend** — even if you tamper with the client, the API returns `401` / `403`.

## Role-based landing

After login, `landingPathForRole()` routes each user:

| Role           | Lands on                  |
| -------------- | ------------------------- |
| borrower       | `/apply/details`          |
| sales          | `/dashboard/sales`        |
| sanction       | `/dashboard/sanction`     |
| disbursement   | `/dashboard/disbursement` |
| collection     | `/dashboard/collection`   |
| admin          | `/dashboard`              |

## End-to-end demo flow

Run the backend (`cd ../backend && npm run seed && npm run dev`) and the frontend (`npm run dev`), then:

1. **Borrower applies** — sign in as `borrower@lms.test` / `borrow1234` (or sign up fresh):
   - Fill personal details. Try invalid PAN / underage DOB / salary <25k / unemployed → see BRE rejection screen with reasons.
   - With valid data, continue → upload any small PDF/PNG/JPG → set amount & tenure → **Apply**.
2. **Sanction approves** — log out, sign in as `sanction@lms.test` / `sanction1234` → **Approve** (or **Reject** with a reason).
3. **Disbursement** — sign in as `disbursement@lms.test` / `disburse1234` → **Mark disbursed**.
4. **Collection** — sign in as `collection@lms.test` / `collect1234` → expand the loan → record a payment. Enter the full outstanding amount with a unique UTR (e.g. `UTR0001`) → loan **auto-closes**.

Admin (`admin@lms.test` / `admin1234`) can see all four dashboard tabs.

## Notes

- The Loan Config page (`/apply/loan`) recomputes interest + total in real time as you slide; the formula is mirrored from the backend's `loanMath.ts`.
- Tailwind utility classes are aliased in `globals.css` (`.btn-primary`, `.input`, `.card`, etc.) so component markup stays compact.
- The salary slip link in the sanction view points to `${API_URL}/uploads/<filename>`.
# credit-sea-frontend
