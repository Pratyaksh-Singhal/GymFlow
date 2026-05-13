# GymFlow SaaS - Gym Management Platform

A modern, affordable SaaS platform for managing small to medium-sized gyms. Built with Next.js 14, TypeScript, Supabase, and Prisma.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS, Shadcn/ui
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL) with Row-Level Security (RLS)
- **ORM:** Prisma
- **State Management:** TanStack Query (React Query)
- **Charts:** Recharts
- **Email:** Resend
- **SMS:** Twilio
- **Deployment:** Vercel
- **Error Tracking:** Sentry
- **Testing:** Jest, React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Environment variables configured

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/gymflow.git
cd gymflow
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase, Resend, Twilio credentials
```

4. Setup database:

```bash
npx prisma migrate dev --name init
```

5. Run development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
.
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── tenants/         # Multi-tenant API
│   │   └── webhooks/        # Webhook handlers
│   ├── dashboard/           # Protected dashboard routes
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # Reusable React components
│   └── ui/                  # Shadcn/ui components
├── lib/                      # Utilities
│   ├── api-error.ts         # Error handling
│   ├── validations.ts       # Zod schemas
│   └── query-client.tsx     # React Query setup
├── prisma/
│   └── schema.prisma        # Database schema
├── docs/                    # Project documentation
│   ├── project-brief.md
│   ├── prd.md
│   ├── fullstack-architecture.md
│   ├── front-end-spec.md
│   └── epic-1-stories.md
└── package.json
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm test:coverage    # Generate coverage report

# Database
npm run db:push      # Push schema to database
npm run db:migrate   # Create and run migration
npm run db:studio    # Open Prisma Studio
npm run prisma:generate # Generate Prisma client
```

## API Documentation

API routes are organized by feature:

- `POST /api/auth/signup` - Register new gym
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh JWT token
- `GET/POST /api/tenants/[tenantId]/members` - Manage members
- `GET/POST /api/tenants/[tenantId]/packages` - Manage packages
- `GET/PATCH /api/tenants/[tenantId]/fees` - Manage fees
- `POST /api/tenants/[tenantId]/notifications/send` - Send notifications
- `GET /api/tenants/[tenantId]/dashboard/metrics` - Dashboard metrics

See `docs/fullstack-architecture.md` for detailed API specifications.

## Features

### Current (MVP - Epic 1-2)

- [x] Multi-tenant architecture with data isolation
- [x] User authentication (owner, trainer, member roles)
- [x] Member management (CRUD, bulk operations)
- [x] Trainer management and assignment
- [x] Membership packages and fee tracking
- [x] Automated fee reminders (email + SMS)
- [x] Owner dashboard with metrics
- [x] Member portal with payment tracking

### Planned (Phase 2)

- [ ] Payment gateway integration (Stripe)
- [ ] Advanced analytics (LTV, churn prediction)
- [ ] Custom email templates
- [ ] Mobile app (React Native)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Member progress tracking
- [ ] Trainer performance analytics

## Development Timeline

**Epic 1 (Weeks 1-2):** Foundation & Infrastructure  
**Epic 2 (Weeks 3-4):** Gym Management & Members  
**Epic 3 (Weeks 5-6):** Packages & Fee System  
**Epic 4 (Weeks 7-9):** Notifications System  
**Epic 5 (Weeks 10-11):** Owner Dashboard  
**Epic 6 (Week 12):** Trainer & Member Interfaces

See `docs/epic-1-stories.md` for detailed story breakdown.

## Security

- Row-Level Security (RLS) for multi-tenant data isolation
- JWT authentication with refresh tokens
- HTTPS/TLS for all connections
- Secure password hashing (bcrypt via Supabase Auth)
- SQL injection prevention (parameterized queries)
- Rate limiting on API endpoints
- CSRF protection (Next.js built-in)
- XSS protection (React escaping)
- WCAG 2.1 AA accessibility compliance

See `docs/fullstack-architecture.md#7-security--compliance` for full security details.

## Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- members.test.ts

# Watch mode
npm run test:watch
```

Target: **70% code coverage** with unit and integration tests.

## Deployment

This project is deployed on Vercel with automatic deployments on:

- Push to `main` branch → Production
- Push to `staging` branch → Staging preview
- Pull requests → Preview deployments

Environment secrets are configured in Vercel dashboard and automatically injected.

## Monitoring

- **Error Tracking:** Sentry for real-time error alerts
- **Performance:** Vercel Analytics for Core Web Vitals
- **Logs:** Structured logging with Pino

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -am 'Add feature'`
3. Push branch: `git push origin feature/your-feature`
4. Create Pull Request with description

All PRs must:

- Pass CI/CD checks (lint, type check, tests, build)
- Have >70% test coverage
- Include documentation updates

## License

MIT

## Support

- Documentation: See `docs/` folder
- Issues: Create GitHub issue
- Questions: Email support@gymflow.in

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release notes.

---

**Created by:** Solo Founder Development  
**Last Updated:** May 12, 2026  
**Version:** 0.1.0 (MVP)
