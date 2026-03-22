```text
mcl/
├── CHANGELOG.md
├── CLA.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── IMPLEMENTATION_STATUS.md
├── LICENSE
├── README.md
├── ROADMAP.md
├── SECURITY.md
├── SUPPORT.md
├── app
│   ├── about
│   │   └── page.tsx
│   ├── admin
│   │   ├── cbts
│   │   │   ├── [cbtId]
│   │   │   │   ├── edit
│   │   │   │   │   └── page.tsx
│   │   │   │   └── questions
│   │   │   │       ├── [questionId]
│   │   │   │       │   └── edit
│   │   │   │       │       └── page.tsx
│   │   │   │       ├── new
│   │   │   │       │   └── page.tsx
│   │   │   │       └── page.tsx
│   │   │   ├── new
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── faculties
│   │   │   ├── [facultyId]
│   │   │   │   ├── departments
│   │   │   │   │   ├── [departmentId]
│   │   │   │   │   │   ├── edit
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── levels
│   │   │   │   │   │       ├── [levelId]
│   │   │   │   │   │       │   └── courses
│   │   │   │   │   │       │       ├── [courseId]
│   │   │   │   │   │       │       │   └── edit
│   │   │   │   │   │       │       │       └── page.tsx
│   │   │   │   │   │       │       ├── new
│   │   │   │   │   │       │       │   └── page.tsx
│   │   │   │   │   │       │       └── page.tsx
│   │   │   │   │   │       ├── new
│   │   │   │   │   │       │   └── page.tsx
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── new
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── edit
│   │   │   │       └── page.tsx
│   │   │   ├── new
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── feedback
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   ├── reviews
│   │   │   └── page.tsx
│   │   └── users
│   │       └── page.tsx
│   ├── api
│   │   ├── admin
│   │   │   ├── cbts
│   │   │   │   ├── [cbtId]
│   │   │   │   │   ├── questions
│   │   │   │   │   │   ├── [questionId]
│   │   │   │   │   │   │   └── route.ts
│   │   │   │   │   │   ├── import
│   │   │   │   │   │   │   └── route.ts
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── courses
│   │   │   │   └── [id]
│   │   │   │       └── route.ts
│   │   │   ├── departments
│   │   │   │   └── [id]
│   │   │   │       ├── levels
│   │   │   │       │   └── route.ts
│   │   │   │       └── route.ts
│   │   │   ├── faculties
│   │   │   │   ├── [id]
│   │   │   │   │   ├── departments
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── feedback
│   │   │   │   └── route.ts
│   │   │   ├── levels
│   │   │   │   └── [id]
│   │   │   │       ├── courses
│   │   │   │       │   └── route.ts
│   │   │   │       └── route.ts
│   │   │   └── users
│   │   │       └── route.ts
│   │   ├── cbts
│   │   │   ├── [cbtId]
│   │   │   │   ├── attempts
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── attempts
│   │   │   │   └── [attemptId]
│   │   │   │       ├── answers
│   │   │   │       │   └── route.ts
│   │   │   │       ├── review
│   │   │   │       │   └── route.ts
│   │   │   │       ├── route.ts
│   │   │   │       └── submit
│   │   │   │           └── route.ts
│   │   │   └── route.ts
│   │   ├── feedback
│   │   │   └── route.ts
│   │   ├── logout
│   │   │   └── route.ts
│   │   ├── resources
│   │   │   └── [id]
│   │   │       ├── approve
│   │   │       │   └── route.ts
│   │   │       ├── bookmark
│   │   │       │   └── route.ts
│   │   │       ├── download
│   │   │       │   └── route.ts
│   │   │       ├── preview
│   │   │       │   └── route.ts
│   │   │       ├── reject
│   │   │       │   └── route.ts
│   │   │       └── view
│   │   │           └── route.ts
│   │   ├── search
│   │   │   └── record
│   │   │       └── route.ts
│   │   ├── stats
│   │   │   └── dbmcl
│   │   │       └── route.ts
│   │   └── user
│   │       └── update
│   │           └── route.ts
│   ├── auth
│   │   └── callback
│   │       └── route.ts
│   ├── browse
│   │   └── faculties
│   │       ├── [facultyId]
│   │       │   ├── departments
│   │       │   │   └── [departmentId]
│   │       │   │       ├── levels
│   │       │   │       │   └── [levelId]
│   │       │   │       │       ├── courses
│   │       │   │       │       │   └── [courseId]
│   │       │   │       │       │       ├── opengraph-image.tsx
│   │       │   │       │       │       └── page.tsx
│   │       │   │       │       ├── opengraph-image.tsx
│   │       │   │       │       └── page.tsx
│   │       │   │       ├── opengraph-image.tsx
│   │       │   │       └── page.tsx
│   │       │   ├── opengraph-image.tsx
│   │       │   └── page.tsx
│   │       └── page.tsx
│   ├── cbt
│   │   └── [id]
│   │       ├── client.tsx
│   │       └── page.tsx
│   ├── cbts
│   │   ├── [cbtId]
│   │   │   ├── client.tsx
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── globals.css
│   ├── help
│   │   └── page.tsx
│   ├── icon.jpg
│   ├── layout.tsx
│   ├── lib
│   │   ├── client.ts
│   │   └── parser
│   │       └── sqf.ts
│   ├── login
│   │   ├── client.tsx
│   │   └── page.tsx
│   ├── manifest.json
│   ├── page.tsx
│   ├── privacy
│   │   └── page.tsx
│   ├── queryClient.ts
│   ├── resource
│   │   └── [resourceId]
│   │       ├── client.tsx
│   │       └── page.tsx
│   ├── robots.ts
│   ├── search
│   │   ├── client.tsx
│   │   └── page.tsx
│   ├── serwist
│   │   └── [path]
│   │       └── route.ts
│   ├── settings
│   │   └── page.tsx
│   ├── signup
│   │   ├── client.tsx
│   │   └── page.tsx
│   ├── sitemap.ts
│   ├── sw.ts
│   ├── terms
│   │   └── page.tsx
│   ├── upload
│   │   └── page.tsx
│   └── ~offline
│       └── page.tsx
├── assets
│   ├── mcl.png
│   ├── mcl.svg
│   ├── mcl1.png
│   ├── mcl1.svg
│   └── mclWhite.png
├── components
│   ├── AdminFeedback.tsx
│   ├── AdminResource.tsx
│   ├── AdminStats.tsx
│   ├── FeedbackDialog.tsx
│   ├── FeedbackTrigger.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── LayoutContent.tsx
│   ├── LinkifiedText.tsx
│   ├── PdfViewer.tsx
│   ├── ResourceCarousel.tsx
│   ├── ResourcePreview.tsx
│   ├── SettingsComponents.tsx
│   ├── Sidebar.tsx
│   ├── WatchUpWrapper.tsx
│   ├── providers
│   │   └── query-provider.tsx
│   └── ui
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── loader.tsx
│       ├── passwordInput.tsx
│       ├── select.tsx
│       ├── sonner.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       └── textarea.tsx
├── components.json
├── constants
│   └── index.ts
├── data
│   ├── Faculty-Engineering
│   │   ├── Abe.md
│   │   └── ice.md
│   └── faq.ts
├── docs
│   ├── index.md
│   └── sqf-import-guide.md
├── env.example
├── eslint.config.mjs
├── github-dev-ruleset.json
├── github-ruleset.json
├── hooks
│   └── useUser.ts
├── lib
│   ├── api
│   │   ├── admin
│   │   │   └── cbts.ts
│   │   ├── cbts.ts
│   │   ├── resources.ts
│   │   ├── search.ts
│   │   └── upload.ts
│   ├── email.tsx
│   ├── parser
│   │   └── sqf.ts
│   ├── schema
│   │   └── index.ts
│   ├── supabase
│   │   ├── admin.ts
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   └── server.ts
│   └── utils.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── proxy.ts
├── public
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── apple-touch-icon.png
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── icon.png
│   ├── logo.svg
│   ├── martins.jpg
│   └── spectra010s.jpg
├── schemas
│   ├── faq.ts
│   ├── interface.ts
│   ├── organization.ts
│   └── website.ts
├── scripts
│   ├── 10-2-2026-add_question_limit.sql
│   ├── 15-2-2026-allow-duplicate-general-courses.sql
│   ├── 3-3-2026-fix-users-table-vulnerablity.sql
│   ├── add_feedback_table.sql
│   ├── legacy
│   │   ├── 01_core_tables.sql
│   │   ├── 1-5-2025-assessments.sql
│   │   ├── 11-1-2025-search-function-fix.sql
│   │   ├── 200lvl_general_courses_seed_data.sql
│   │   ├── 31-25-2025-resource-uploader-fix.sql
│   │   ├── alter_resources.sql
│   │   ├── create_functions.sql
│   │   ├── fix_cbt_course_fk.sql
│   │   ├── fix_update_review_function.sql
│   │   ├── fix_view_count_history_function.sql
│   │   ├── fts_full_text_search_function.sql
│   │   ├── index_performance.sql
│   │   ├── row_level_security_policies.sql
│   │   ├── seed_data.sql
│   │   ├── update_faculties_departmentals_names.sql
│   │   ├── update_review_function.sql
│   │   └── user_interaction_tables.sql
│   └── schema.sql
├── test
│   ├── app
│   │   ├── login
│   │   │   └── page.test.tsx
│   │   └── signup
│   │       └── page.test.tsx
│   ├── components
│   │   └── ResourceCarousel.test.tsx
│   └── lib
│       └── middleware.test.ts
├── tsconfig.json
├── vitest.config.ts
└── vitest.setup.ts

129 directories, 214 files
```
