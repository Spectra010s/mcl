# My Campus Library - Changelog

## Overview

This document summarizes all changes made to My Campus Library (MCL) since the initial commit.

## Current Version: v0.3.0

MCL follows [Semantic Versioning](https://semver.org/) (SemVer) for version management.

## Version Format

MAJOR.MINOR.PATCH

- **MAJOR**: Breaking changes, major feature additions
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

## Version History

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
