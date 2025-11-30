# My Campus Library - Changelog

## Overview

This document summarizes all changes made to My Campus Library (MCL) since the initial commit.

## Current Version: v0.9.0

MCL follows [Semantic Versioning](https://semver.org/) (SemVer) for version management.

## Version Format

MAJOR.MINOR.PATCH

- **MAJOR**: Breaking changes, major feature additions
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

## Version History

### 0.9.0 - Minor Release

**Release Date:** 2025-11-30
**Status:** Development

**Features:**

- feat(admin): add resource review dashboard with approve/reject workflow
- feat(admin): add styled 403 page for unauthorized access
- feat: display upload date with date-fns to fix hydration errors
- feat(admin-ui): Create AdminStats component for dashboard Overview
- feat(admin): Create secure Admin Dashboard page
- feat: add admim guard in middleware file
- feat: add settings homepage
- feat: add db needed for new tables, rls, functioj and triggers
- feat: add ResourcePage for viewing detailed resource info
- feat(sql): Create search_resources_and_keywords RPC function
- feat(search): add SearchPage and results display

**Fix:**

- fix(settings): use date-fns to format download/bookmark dates
- fix(middleware): Update 403 Forbidden response to return custom html
- fix: correctly destructure faculty and department data, adjust level title formatting
- fix: update course page to use new resource fields and fix error handling
- fix: refractor ui in course page to match db
- fix: 403 page title and email function formatting
- fix(search): sync state with URL query and update department field
- fix: pass user profile data in signUp options and delete manual insert logic
- fix(db): enhance resources search and indexing

**Refactor:**

- Refactor view_history policies causing sql queries errors
- refactor: add height to prevent scrollijg of age whenbchild has overflow
- refactor: ui changes to match db , remove dependency of supabase to moutn user once

**Chores:**

- chore: update ResourceCarousel by removinf unused props
- chore: update ResourceCarousel to use download_count and improve UI polish
- chore: refractor project structure for browse pages
- chore: run prettier in repo
- chore: use `npx @next/codemod@canary middleware-to-proxy .` to chnage middlware → proxy.tsx
- chore: combine mobileSearchOpen check using `? :`
- chore: update latest migration sql to use different ALTER TABLES
- chore: replaced — with html entity '&#8212'
- chore: update env.example
- chore: Bump version to 0.7.0
- chore: update `CHANGELOG.md` for 0.9.0

**Tests:**

- test: add unit tests for updateSession middleware

**File Created:**

- `components/AdminResource.tsx`
- `components/AdminStats`
- `scripts/alter_resources.sql`
- `scripts/index_performance.sql`
- `scripts/create_functions.sql`
- `scripts/user_interaction_tables.sql`
- `scripts/update_faculties_departmentals_names.sql`
- `scripts/row_level_security_policies.sql`
- `scripts/schema.sql`
- `lib/email.tsx`
- `app/api/resources/[id]/approve/`
- `app/api/resources/[id]/reject/`
- `app/admin/page.tsx`
- `app/admin/reviews/`
- `app/resource[resourceId]/`
- `app/search/`
- `app/upload/`
- `app/settings`

**Files Modified:**

- `lib/supabase/middleware.ts``
- `app/signup/page.tsx`
- `components/LayoutContent`
- `components/ResourceCarousel`
- `test/lib/middleware.ts`
- `app/browse/faculties/[facultyId]/departments/[departmentId]/levels/[levelId]/page.tsx`
- `app/browse/faculties/[facultyId]/departments/[departmentId]/levels/[levelId]/courses/[courseId]/page.tsx`
- `proxy.ts`
- `env.example`
- `package.json`
- `package-lock.json`
- `CHANGELOG.md`

**Files Deleted:**

- `middleware.ts`

### 0.8.0 - Minor Release

**Release Date:** 2025-11-27
**Status:** Development

**Features:**

- Add custom homepage for MCL
- Add ResourceCarousel component for course ResourceCarousel
- Implement hierarchical browse system (faculty → department → level → course)"

- **Chores:**

- Setup Vitest and React Testing library
- Rename name to `short_name` and add `full_name` column to faculties and departments
- Add aria-labels to buttons in `components/ResourceCarousel.tsx`
- Bump version to 0.8.0

**Test:**

- Add unit tests for ResourceCarousel component

**Files Created:**

- `vitest.config.ts`
- `vitest.setup.ts`
- `app/browse/faculties/page.tsx`
- `app/browse/faculties/[facultyId]/page.tsx`
- `app/browse/faculties/[facultyId]/departments/[departmentId]/page.tsx`
- `app/browse/faculties/[facultyId]/departments/[departmentId]/levels/[levelId]/page.tsx`
- `app/browse/faculties/[facultyId]/departments/[departmentId]/levels/[levelId]/courses/[courseId]/page.tsx`
- `scripts/update_faculties_departmentals_names.sql`
- `components/ResourceCarousel.tsx`
- `test/components/ResourceCarousel.test.tsx`

**Files Modified:**

- `app/page.tsx`
- `package.json`
- `package-lock.json`
- `CHANGELOG.md`

### 0.7.0 - Minor Release

**Release Date:** 2025-11-24
**Status:** Development

**Features:**

- Add components separator ui
- Add footer component
- Add Header component
- Add Sidebar component
- Add Vercel Analytics inside layout
- Add mockup `upload` page to test middleware

**fix:**

- Protect /upload route with middleware

**Chores:**

- Run prettier in repo
- Bump version to 0.7.0

**Refractor:**

- Replace default Next.js root layout with custom LayoutContent

**Files Created:**

- `components/ui/separator.tsx`
- `components/Header.tsx`
- `components/Footer.tsx`
- `components/Sidebar.tsx`
- `components/LayoutContent.tsx`
- `app/upload/page.tsx`
- `middleware.ts`

**Files Modified:**

- `app/layout.tsx`
- `package.json`
- `package-lock.json`
- `CHANGELOG.md`

### 0.6.0 - Minor Release

**Release Date:** 2025-11-24
**Status:** Development

**Features:**

- Add Google and GitHub OAuth Signup handlers
- Add Google and GitHub OAuth login handlers
- Add reusable PasswordInput component

**Chores:**

- Update `global.css` to use site brand colors
- Run prettier in repo
- Bump version to 0.6.0

**Files Created:**

- `components/ui/passwordInput`

**Files Modified:**

- `app/login/page.tsx`
- `app/signup/page.tsx`
- `app/global.css`
- `package.json`
- `package-lock.json`
- `CHANGELOG.md`

### 0.5.0 - Minor Release

**Release Date:** 2025-11-23  
**Status:** Development

**Features:**

- Implement user signup page
- Implement email/password and username/password login
- Add OAuth callback route to exchange code for session

**Chores:**

- Add License and Cla Files
- Add --webpack to package.json to use webpack instead of turbopack
- Update `env.exmaple` template
- Run prettier in repo
- Bump version to 0.5.0

**Files Created:**

- `app/login/page.tsx`
- `app/signup/page.tsx`
- `app/auth/callback/route.ts`
- `CLA.md`
- `LICENSE`

**Files Modified:**

- `package.json`
- `env.example`
- `package-lock.json`
- `CHANGELOG.md`

### 0.4.0 - Minor Release

**Release Date:** 2025-11-22  
**Status:** Development

**Features:**

- Integrate Supabase authentication and database clients"

**Chores:**

- Run prettier in repo
- Bump version to 0.4.0

**Files Created:**

- `client.ts`
- `server.ts`
- `middleware.ts`

**Files Modified:**

- `package.json`
- `package-lock.json`
- `CHANGELOG.md`

### 0.3.0 - Minor Release

**Release Date:** 2025-11-22  
**Status:** Development

**Features:**

- Add `01_core_tables.sql` database schema migration core tables script

**Chores:**

- Create environmemtal variables template
- Add comment on Envvars in gitignore
- Run prettier in repo
- Bump version to 0.3.0

**Files Created:**

- `env.example`
- `.gitignore`
- `scripts/`
- `scripts/01_core_tables.sql`

**Files Modified:**

- `package.json`
- `package-lock.json`
- `CHANGELOG.md`

### 0.2.0 - Minor Release

**Release Date:** 2025-11-22  
**Status:** Development

**Features:**

- Add shadcn/ui component library

**Chores:**

- Add `--write` to prettier script to overwrite Files
- Run prettier in repo
- Change status and remove type of first version
- Update next.config for dev/prod settings
- Bump version to 0.2.0

**Files Created:**

- `components/ui/*`
- `lib/utils`
- `components.json`

**Files Modified:**

- `package.json`
- `package-lock.json`
- `next.config.ts`
- `CHANGELOG.md`

### 0.1.0 - Minor Release

**Release Date:** 2025-11-22  
**Status:** Initial Development release

**Features:**

- Initialize Next.js 16 with TypeScript and Tailwind CSS
- Add Changelog.md
- Add README.md
- Add `assets` directory
- Add public images
- Initialize Prettier
