<!--
# Sync Impact Report
- Version Change: 0.0.0 (Unratified Template) → 1.0.0
- Modified Principles:
  - [PRINCIPLE_1_NAME] → I. Mobile-Responsive & Adaptive UI (NON-NEGOTIABLE)
  - [PRINCIPLE_2_NAME] → II. Cloud-Native BaaS & Data Layer Security (Supabase Cloud)
  - [PRINCIPLE_3_NAME] → III. Strict Credential & Secret Boundary Isolation (NON-NEGOTIABLE)
  - [PRINCIPLE_4_NAME] → IV. Edge Tunnel Ingress & Showcase Alignment (Cloudflare Tunnel)
  - [PRINCIPLE_5_NAME] → V. Test-First Quality & Contract Verification
- Added Sections:
  - Technology Stack & Security Constraints
  - Development Workflow & Quality Gates
- Removed Sections: None
- Deferred Placeholders / Follow-up TODOs: None
-->

# HackBuild Web App Constitution

## Core Principles

### I. Mobile-Responsive & Adaptive UI (NON-NEGOTIABLE)
Applications MUST be designed and implemented mobile-first, ensuring fluid responsive behavior
across phone, tablet, and desktop viewports (minimum width 320px up to 4K displays).
- Touch targets MUST meet standard accessibility criteria (minimum 44x44px).
- Viewport overflow causing horizontal scrolling MUST NOT occur under any standard device width.
- Layouts and components MUST gracefully adapt to portrait and landscape orientations.
*Rationale*: Mobile responsiveness guarantees broad user accessibility and consistent usability
across personal mobile devices and desktop showcase environments.

### II. Cloud-Native BaaS & Data Layer Security (Supabase Cloud)
Backend persistence and user management MUST leverage Supabase Cloud managed services
(PostgreSQL, Supabase Auth, Storage, and Edge Functions).
- PostgreSQL Row Level Security (RLS) MUST be enabled on every public table; default-deny access
  policies MUST be explicitly declared and tested.
- Authentication tokens and user sessions MUST be validated through Supabase Auth and JWKS
  endpoints (`/auth/v1/.well-known/jwks.json`).
- Schema migrations MUST be declarative, version-controlled, and reproducible.
*Rationale*: Leveraging managed BaaS accelerates development velocity while database-level RLS
guarantees data boundary protection independent of application-level bugs.

### III. Strict Credential & Secret Boundary Isolation (NON-NEGOTIABLE)
Service role / secret keys (`SUPABASE_SECRET_KEY`) MUST NEVER be bundled into client-side code,
exposed in public repositories, or delivered to browsers.
- Client bundles and public interfaces MUST ONLY access the publishable key
  (`SUPABASE_PUBLISHABLE_KEY`) and project URL (`SUPABASE_URL`).
- All backend-only service credentials MUST be isolated in server-side runtime environments or
  secure secrets managers.
- Repository commits and pull requests MUST undergo automated secret scanning to prevent
  credential leakage.
*Rationale*: The client environment is fundamentally untrusted. Exposing secret keys grants full
database bypass privileges and compromises total application security.

### IV. Edge Tunnel Ingress & Showcase Alignment (Cloudflare Tunnel)
Local development, staging previews, and public showcases MUST be exposed via Cloudflare Tunnel
infrastructures (e.g., `*.sharukhtech.com`) running under authorized origin daemons.
- Public port forwarding and unencrypted direct origin exposure MUST NOT be used.
- Origin routing MUST map cleanly to designated hostnames (e.g., `react.sharukhtech.com`,
  `vite.sharukhtech.com`, `fastapi.sharukhtech.com`).
- CORS policies and allowed origin headers MUST strictly restrict traffic to authorized Cloudflare
  Tunnel hostnames and local development ports.
*Rationale*: Cloudflare Tunnels provide zero-trust perimeter security, automated edge TLS, and
stable public showcase URLs without requiring static public IP configurations or exposing local ports.

### V. Test-First Quality & Contract Verification
Core business logic, authentication handlers, and data transformations MUST follow test-driven
practices with verified automated test coverage prior to completion.
- BaaS API interactions and database schema contracts MUST have automated contract and integration
  tests validating schema adherence.
- User flows MUST include automated end-to-end or component verification covering mobile and
  desktop viewport variations.
- No code change may bypass test suites or disable security checks to achieve passing builds.
*Rationale*: Automated contract and responsive regression testing prevents breaking changes across
rapid client iterations and cloud schema updates.

## Technology Stack & Security Constraints

- **Frontend Architecture**: Modern responsive single-page or hybrid web application (React / Vite)
  built with TypeScript and responsive CSS frameworks (e.g., Tailwind CSS).
- **Backend & Persistence**: Supabase Cloud PostgreSQL, Supabase Auth (with JWKS token verification),
  and Row Level Security (RLS).
- **Ingress & Edge Routing**: Cloudflare Tunnel daemon (`cloudflared`) routing external requests to
  local development services over TLS.
- **Security Baseline**:
  - Enforce TLS 1.3 at Cloudflare edge.
  - Zero hardcoded credentials in source code; strict separation between `.env.example` and local `.env`.
  - Content Security Policy (CSP) and secure cookie flags applied to all web responses.

## Development Workflow & Quality Gates

- **Branching & PR Discipline**: All features and fixes MUST originate from dedicated feature branches
  and pass automated linters, type checks, and tests before merging.
- **Security & Secret Audit Gate**: Any pull request containing API keys, private tokens, or secret
  keys MUST be blocked automatically.
- **Responsive Inspection Gate**: Pull requests introducing UI modifications MUST verify layout
  fidelity across mobile (375px), tablet (768px), and desktop (1280px+) breakpoints.
- **Edge Deployment Check**: Showcase deployments MUST verify origin reachability and valid SSL/TLS
  handshake through Cloudflare Tunnel before external review.

## Governance

- **Constitutional Supremacy**: This Constitution supersedes all informal team practices, local
  configurations, and unreviewed conventions. All pull requests, code reviews, and architectural
  plans must strictly verify compliance against this document.
- **Amendment Procedure**: Amendments require documented business or architectural rationale,
  impact assessment on existing schemas/tunnels, and consensus approval.
- **Versioning Policy**: Semantic versioning (MAJOR.MINOR.PATCH) is strictly applied:
  - **MAJOR**: Incompatible principle removals or foundational architecture shifts (e.g., replacing BaaS).
  - **MINOR**: Addition of new principles, security constraints, or structural quality gates.
  - **PATCH**: Clarifications, wording improvements, non-semantic typographical updates.
- **Compliance Review**: Every architectural specification and code review MUST include an explicit
  compliance check against Core Principles I through V.

**Version**: 1.0.0 | **Ratified**: 2026-11-02 | **Last Amended**: 2026-11-02
