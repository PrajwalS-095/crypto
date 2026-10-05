# Key Exchange with Trusted Third Party (KDC) — Virtual Lab

An educational virtual-lab experiment (Aim · Theory · Objective · Procedure · Simulation) that walks
through a simplified, Needham–Schroeder-style symmetric key exchange via a Key Distribution Center.
All cryptography (AES-256-GCM, key generation, random nonces/IVs) runs in the browser via the Web Crypto API.
There is no backend.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build + type check
npm run typecheck
```

## Deploy

Import the repository in Vercel (framework preset: Next.js). No environment variables are needed.

## Layout

- `app/` — routes for the five sections (`/` redirects to `/aim`)
- `components/layout/` — header, sidebar, mobile drawer
- `components/content/` — static diagrams for the Theory section
- `components/simulation/` — simulation UI (flow diagram, step views, settings, controls)
- `lib/crypto.ts` — Web Crypto wrappers
- `lib/kdc-protocol.ts` — protocol engine (one async function per step)
- `lib/sim-machine.ts` — simulation state machine (reducer)
- `types/simulation.ts` — protocol and state types
