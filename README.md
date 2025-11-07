# NumberTalk

Full-stack demo where arithmetic conversations become threaded discussions. Built with Node.js, Express, SQLite, TypeScript, React, and Tailwind CSS. Ships with Docker Compose setup and automated tests on both tiers.

## Requirements Covered

- [x] Unregistered visitors can browse every discussion thread.
- [x] Account registration and authentication with JWT.
- [x] Authenticated users may start new computation trees and reply at any depth.
- [x] Four core operations (add, subtract, multiply, divide) enforced server-side.
- [x] Component-driven React UI styled in Tailwind.
- [x] Automated tests through Vitest on both server and client utilities.
- [x] Docker Compose orchestration for a single command spin-up.

## Tech Stack

| Area   | Tech |
| ------ | ---- |
| Server | Node 20, Express, better-sqlite3, TypeScript, Vitest |
| Client | React 18, Vite, TailwindCSS, React Query, React Hook Form, Vitest + Testing Library |
| Auth   | bcrypt password hashing, JWT tokens |
| Storage | SQLite (persisted to Docker volume) |
| Tooling | ESLint, Prettier baseline, Docker Compose |

## Getting Started Locally

1. **Install dependencies**
   ```powershell
   cd server
   npm install

   cd ../client
   npm install
   ```

2. **Run the back end**
   ```powershell
   cd server
   npm run dev
   ```

3. **Run the front end**
   ```powershell
   cd ../client
   npm run dev
   ```

4. Visit `http://localhost:5173`. The Vite dev server proxies API calls to the Express server.

### Environment Variables

Duplicate `server/.env.example` to `server/.env` if you want to override defaults.

```
PORT=4000
JWT_SECRET=supersecretjwt
DATABASE_PATH=./data/data.db
```

For the client you can optionally define `VITE_API_BASE_URL` (defaults to `/api` in dev and is injected during Docker builds).

## Tests & Linting

```powershell
cd server
npm run lint
npm test

cd ../client
npm run lint
npm test
```

## Docker Compose

Build and run full stack with a single command (requires Docker Desktop):

```powershell
docker compose up --build
```

- Client exposed on <http://localhost:5173>.
- API exposed on <http://localhost:4000>.
- SQLite database persisted in the `server-data` volume.

Stop stack with `docker compose down`.

## Project Structure

```
Mini-App/
├── client/        # React + Tailwind single-page app
├── server/        # Express + SQLite API
└── docker-compose.yml
```

Key client folders:
- `src/components` – UI broken into small, reusable pieces (`ThreadCard`, `OperationForm`, etc.).
- `src/state/AuthProvider.tsx` – Context-driven auth with persistent token storage.
- `src/lib/api.ts` – Axios instance with auth interceptors.

Key server folders:
- `src/routes` – Express routers (`auth` and `threads`).
- `src/services` – Business logic for building computation trees.
- `tests/` – Vitest coverage for critical operations.

## Notes

- Passwords hashed with bcrypt before storage.
- JWTs carry the user id and expire after 7 days.
- Division by zero rejected at the service layer and covered by tests.
- React Query keeps threads in sync with background polling every 5 seconds.
- Tailwind design mirrors the provided mockup while staying responsive and accessible.

Enjoy exploring conversational mathematics!
