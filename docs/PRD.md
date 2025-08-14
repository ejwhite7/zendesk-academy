# Zendesk KB → Interactive Courses (Open Source)

### TL;DR

Turn Zendesk Guide knowledge base articles into interactive, auto-generated courses that teams can embed into any React app. The system continuously monitors the KB, uses Claude-powered generation to synthesize progressive learning paths (beginner → expert), and keeps courses fresh within 24 hours of KB changes. It creates outlines, lessons, quizzes, branching scenarios, simulations, videos with checkpoints, and badges, and tracks learner progress with a built-in, free sign-up. Admins can review diffs and edits before publishing, with AI handling most of the heavy lifting.

---

## Goals

### Business Goals

* Maintain always-current courses with <24h freshness after KB changes to reduce outdated learning by 90%.

* Minimize manual authoring effort; target >70% of lesson content auto-generated and >60% of updates auto-merged.

* Improve self-serve efficiency: increase deflection/activation KPIs tied to course usage.

### User Goals

* Provide a guided path from beginner to mastery with clear levels and prerequisites.

* Keep content in sync with the latest Zendesk KB so learners trust it is current.

* Offer adaptive next-step recommendations based on progress and knowledge gaps.

### Non-Goals

* Proctoring or timed exams (explicitly out of scope for MVP).

---

## User Stories

* As an Admin, I connect Zendesk, select articles by label/section, and auto-generate a full path (levels → modules → lessons) so I can publish within minutes.

* As an Author, I review AI drafts, compare diffs against the source KB, and accept/merge changes without losing analytics or prior edits.

* As a Learner, I follow a progressive path with prerequisites, receive adaptive recommendations, and see when lessons were updated.

* As a Developer, I embed a React CoursePlayer with minimal code and keep it current automatically as the KB evolves.

* As a PM, I track completion, activation, and freshness SLAs to prove impact on deflection and onboarding.

---

## Functional Requirements

* AI Course Generation & Refresh (Priority: P0)

  * Initial Synthesis: From Zendesk Guide KB articles (by label/section), auto-generate course outlines, modules, lessons, learning objectives, and assessments (multiple choice, checkpoints). Create branching scenarios and simulation prompts; insert placeholders for videos/product sandboxes.

  * Progressive Learning Paths: Build a skill/knowledge graph across KB topics; define levels (Beginner, Intermediate, Advanced, Expert). Enforce prerequisites and unlocks; recommend the next module based on mastery signals.

  * Change Detection & Delta Updates: Listen to Zendesk webhooks or poll on a schedule. Compute diffs per article; identify impacted modules/assessments; selectively regenerate affected lessons. Preserve analytics and admin edits; present a change summary.

  * Human-in-the-Loop Review: Provide a review queue with side-by-side diffs (KB → lesson). Allow accept/reject/merge with notes and scheduled publish. Support rules for auto-publish (e.g., cosmetic changes only).

  * Versioning & Audit: Semantic version courses; keep an immutable history of generated content, prompts, and admin changes.

  * Badging: Define badge criteria per path/level; automatically award and expose verifiable certificates/badges (no proctoring).

  * Progress Tracking: Free learner sign-up; track per-lesson progress, score, attempts, and time. Export data as CSV/JSON.

  * Claude Integration: Use Claude by default via provider abstraction. Maintain a prompt library, content safety guardrails, and token/cost monitoring.

  * React Embeds: Provide a lightweight React SDK/component to render paths/lessons in existing sites.

  * Automation Framework: Background jobs/queues for ingestion, indexing, regeneration, and publishing with concurrency controls and retries.

  * Analytics: Capture completion and activation rates; module-level drop-off; freshness score per course.

* Zendesk Ingestion (Priority: P0)

  * Connect via subdomain + API token; select labels/sections for scope. Support scheduled sync and on-demand reindex.

* Search & Recommendations (Priority: P1)

  * Learner search across course content and source KB. Recommend remedial or advanced modules based on quiz results.

* Branding & White-Labeling (Priority: P1)

  * Theme Tokens: Admins can define brand tokens (colors, typography, spacing, corner radius) at tenant level; dark/light modes supported.

  * Brand Assets: Upload logo, favicon, wordmark, background image; auto-generate safe variants (SVG/PNG) and sizes.

  * Custom Domain: Map a custom domain or subdomain (e.g., learn.example.com) with automated TLS via ACME; optional subpath (/academy).

  * Certificates & Badges: Brand certificates (logo, colors, signature image) and Open Badges metadata; downloadable PDF.

  * Email Templates: Brand transactional emails (invites, progress, completions) with logo/colors; preview before publish.

  * Embeds: React SDK/Web Component accepts theme props; supports inherited tokens from host site and local overrides.

  * White-Label Mode: Hide OSS vendor branding and show customer copyright/footer; optional "Powered by" toggle.

  * Multi-Tenant Inheritance: Default global theme → tenant overrides → course-level tweaks; guardrails to prevent illegible combinations.

---

## User Experience

**Entry Point & First-Time User Experience**

* Admin connects Zendesk (subdomain + API token), selects labels/sections, and clicks “Generate.” The system produces a draft path (levels, modules, lessons, quizzes, scenarios) with a freshness indicator.

* Admin reviews diffs in a queue and publishes. Embedding instructions (React snippet) are displayed.

**Core Experience**

* Learner lands on a path with levels and estimated time-to-complete. Each lesson mixes narrative, checkpoints, and quizzes; scenarios branch based on choices.

* Adaptive flow suggests the next lesson; a “Need practice?” shortcut offers targeted drills from the knowledge graph.

* Badges unlock at level completion. A “What’s New” ribbon flags lessons updated due to KB changes.

**Advanced Features & Edge Cases**

* When KB changes, affected lessons show an update banner; learners may be prompted for a quick re-check to keep badges valid.

* If regeneration conflicts with admin edits, the review queue surfaces a three-way merge with clear provenance.

**UI/UX Highlights**

* Clear diff visualizations; level progress bars; badge previews; responsive embeds that work inside third-party React apps.

### Admin Branding Workflow

1. Navigate: Admin → Settings → Branding.

2. Upload brand assets; system validates file type/size, and generates previews on light/dark backgrounds.

3. Set theme tokens (primary, surface, text, success, warning, error; typography scale). Contrast checker flags issues and suggests alternatives.

4. Preview: Live preview across key surfaces (course card, lesson page, quiz, certificate, email).

5. Custom Domain: Enter domain, receive CNAME target; status shows DNS/TLS readiness; click Activate when verified.

6. Publish: Versioned theme saved; rollback available.

7. Embeds: Copy code snippet with theme props; optional auto-detect to inherit CSS variables from host.

### Learner Experience (branding effects)

* Consistent colors, logo, and typography across catalog, player, quizzes, checkpoints, and certificates.

* Accessible contrasts maintained automatically; user can switch light/dark if enabled by admin.

### UI/UX Highlights (expanded)

* Token-first design; CSS variables at runtime for instant theme switching without rebuilds.

* Minimum AA contrast enforced; warnings on sub-AA choices.

* Respect host site fonts via "inherit" mode; fallbacks defined; motion reduced when prefers-reduced-motion is set.

* Print-friendly certificate layouts with brand assets embedded.

---

## Narrative

Maya, a customer education manager, owns a sprawling Zendesk KB. She installs the OSS tool, connects her Zendesk subdomain, selects the Product Mastery template, and clicks Generate. In minutes, she has a progressive path that starts at Beginner and builds to Expert, with modules aligned to the KB, lessons trimmed to essentials, and branching scenarios that mirror real decision paths. Over time, as KB articles update, Maya sees diffs, approves auto-merge candidates, and publishes updates that keep her courses fresh within a day. Learners see a “What’s New” ribbon on updated lessons, receive adaptive recommendations for weak areas, and retain badges with quick re-checks. Support sees earlier activation and fewer “how do I” tickets, while onboarding shifts to a consistent, always-current experience.

---

## Success Metrics

### User-Centric Metrics

* Course completion rate and activation rate (primary).

* Time-to-first-skill (TTFS) and time-to-level-up.

* Repeat engagement after updates.

### Business Metrics

* Content freshness SLA hit rate (<24h from KB change to published update).

* % of updates auto-accepted without manual review.

### Technical Metrics

* Regeneration job success rate and median latency.

* Embedding load time under 200ms p95; lesson render under 500ms p95.

### Branding & White-Label Metrics

* Branding Adoption: % of tenants with custom theme ≥1 asset and ≥1 token override in first 7 days.

* Time-to-Brand: Median minutes from first login to published theme.

* White-Label Reach: % of course views served from custom domains or embedded surfaces.

* Certificate Personalization Rate: % of completions with branded certificates.

---

## Integration Points

### Tier 1 (MVP)

* Zendesk Guide (source of truth)

  * Incremental sync via Zendesk REST + webhooks; nightly full backfill.

  * Mapping: Guide categories/sections → Course collections/modules; article labels → lesson tags/objectives.

  * Supported content: HTML/Markdown body, attachments, images; preserve anchors for deep links.

* Authentication & Identity

  * Built-in email/password with optional Google and Microsoft OAuth for learners and admins.

  * Optional Zendesk SSO for admins. Enterprise SSO (Okta/Azure) deferred to Tier 2.

  * Note: Claude is used as the LLM for generation; user authentication does not rely on Claude.

* Delivery & Embedding

  * React SDK and a framework-agnostic Web Component to embed courses on existing sites.

  * Embed emits analytics events and supports theme tokens for brand integration.

* Video & Media

  * YouTube and Vimeo URLs supported at ingest; Loom links accepted. Time-coded checkpoints with overlays.

* Analytics

  * GA4 and PostHog integrations (self-hosted or cloud). Event schema below in Tracking Plan.

* Notifications

  * Slack and Microsoft Teams via webhook apps: publish events (course_published), QA alerts (quiz_fail_rate_spike), and freshness alerts (kb_stale_detected).

* Storage & Infra

  * S3-compatible object storage (AWS S3 or MinIO) for media and static exports.

  * Postgres (incl. pgvector) as primary DB and retrieval index.

  * Docker Compose reference deployment.

* Credentials & Recognition

  * Open Badges 2.0 via Badgr for badges; built-in PDF certificate generation.

* AI Providers

  * Anthropic Claude as default for course generation, lesson synthesis, question generation, and hints. Provider abstraction allows others later.

### Tier 2 (Staged)

* LMS & EDU: SCORM 1.2 export, xAPI to Learning Locker, LTI 1.3 for Canvas/Moodle.

* Product Comms: Intercom in-app and HubSpot lists for enrollment nudges.

* Broader Ingestion: Confluence, Notion, Google Docs, GitHub Wiki.

* Experimentation & Feature Flags: Amplitude and LaunchDarkly.

* Search: Algolia or Typesense for course and lesson search.

* Enterprise SSO: Okta/Azure AD via OIDC/SAML for learners and admins.

* Observability: Sentry (FE/BE) and Datadog logs/metrics.

* Localization: i18next with Lokalise sync.

---

## Technical Needs

* Core Services

  * Ingestion Service: Poll + webhook consumers for Zendesk; normalizes articles, maintains document graph, detects deltas.

  * Generation Orchestrator: Async workers that build course skeletons, draft lessons, generate quizzes, and create branching scenarios from KB diffs.

  * Course Editor (Admin UI): Approve/modify AI output, reorder modules, author questions, manage badges/certificates.

  * Learner Runtime (Client): Renders courses, quizzes, scenarios, videos with checkpoints; offline-friendly where possible.

  * Assessment Engine: Question banks, randomization, attempts/retakes, scoring, feedback, remediation links to source docs.

  * Progress & Credentials: Tracks enrollments, progress, completions; issues badges/certificates via Badgr.

  * Event Pipeline: Client SDK → server collector → GA4/PostHog forwarder; retries and batching.

* APIs & Integrations

  * Zendesk: REST + webhooks; required scopes documented; rate-limit aware.

  * Slack/Teams: Incoming webhooks; message templates with deep links to admin/editor.

  * GA4/PostHog: Server-side and client-side ingestion.

  * Video: YouTube/Vimeo oEmbed for metadata; time-coded overlays stored locally.

  * Badgr: Issue and verify Open Badges 2.0.

  * OAuth: Google/Microsoft; optional Zendesk SSO for admins.

* Data Model (high-level)

  * User, Enrollment, Progress, Course, Module, Lesson, Assessment, Question, AnswerOption, Attempt, Result, Badge, Certificate, KnowledgeSource, Article, WebhookEvent, SyncRun.

* Storage & Retrieval

  * Postgres for relational data; pgvector for embeddings; S3/MinIO for assets.

* Embedding & UI

  * React SDK and Web Component: render() with theme tokens; emits events per Tracking Plan.

* Security & Privacy

  * Role-based access (Learner, Admin); least-privilege Zendesk tokens; PII limited to learner account profile and progress.

---

## Tracking Plan

Event naming: snake_case. Include user_id (hashed if client-side), course_id, module_id, lesson_id, attempt_id as applicable. All events recorded client-side and server-validated. Forward to GA4/PostHog with consistent properties.

Learner Journey

* course_viewed: first view of a course; props: referrer, embed_host.

* module_started / module_completed.

* lesson_started / lesson_completed.

* video_played / video_progress / video_completed; props: provider, seconds_watched.

* checkpoint_reached: time-coded overlays hit; props: checkpoint_id.

* quiz_started.

* question_presented.

* question_answered: props: question_id, correct (bool), latency_ms, option_id(s).

* quiz_completed: props: score_pct, pass (bool), attempts_count.

* scenario_branch_selected: props: branch_id, path_depth.

* remediation_link_clicked: back to source KB; props: article_id.

* certificate_issued and badge_awarded: props: badge_id, standard.

Acquisition & Activation

* signup_started / signup_completed: props: provider (email/google/microsoft).

* enrollment_created: props: source (self, admin_invite, campaign).

* activation_reached: first lesson_completed + first quiz_completed within 7 days.

Content & Freshness

* kb_sync_started / kb_sync_completed: props: articles_scanned, articles_changed.

* kb_delta_detected: props: article_id, change_type (new/updated/removed).

* course_rebuild_started / course_rebuild_completed: props: duration_ms, diff_summary.

* stale_content_flagged: props: lesson_id, age_days.

Quality & Alerts

* quiz_fail_rate_spike: props: window_hours, fail_rate_pct (trigger Slack/Teams).

* runtime_error: props: error_code, surface.

Admin & Editorial

* course_published / course_unpublished.

* admin_edit_committed: props: entity_type, diff_size.

* version_rolled_back: props: from_version, to_version.

SDK/Embed

* embed_loaded: props: host, version.

* embed_interaction: props: action (fullscreen, theme_toggle, etc.).

Branding & White-Label Events

* brand_theme_opened

* brand_asset_uploaded

* brand_tokens_saved: props: contrast_warnings

* brand_preview_rendered

* brand_theme_published: props: version

* brand_theme_rolled_back: props: from_version, to_version

* custom_domain_requested: props: domain

* custom_domain_verified

* custom_domain_activated

* embed_snippet_copied: props: framework

* embed_rendered: props: theme_source (host|tenant|course)

* certificate_template_saved

* certificate_downloaded: props: branded (true|false)

PII & Privacy Notes

* Do not send free-text answers to third parties by default; redact before forwarding.

* Allow opt-out of GA4/PostHog; always retain first-party event log for OSS users.

---

## Technical Considerations

### Data Storage & Privacy

* Store learner progress and minimal profile data. Exclude secure/PII KB fields from prompts by default; redact before indexing. Use ephemeral prompts where possible; allow opt-out of prompt logging.

### Scalability & Performance

* Backpressure and rate limiting against Zendesk and LLM APIs; batch regeneration; caching prompts and intermediate artifacts.

### Potential Challenges

* KB drift and ambiguous changes; preserving admin edits across regenerations; LLM hallucination control; operating costs. Mitigate via diff scopes, test prompts, and guardrails.

### Branding & White-Label Architecture

* Tokens & Storage: JSON design tokens persisted per tenant/course in Postgres; runtime CSS variables generated server-side and hydrated client-side; versioned with created_by/reviewed_by.

* Asset Pipeline: S3-compatible storage (e.g., MinIO); server generates responsive images and SVG sanitization; CDN cache headers; signed URLs for private previews.

* Embeds: React SDK + Web Component read tokens via props or CSS variables; support shadow DOM isolation; allowlist parent origins; postMessage for resize/events.

* Custom Domains: Domain-based tenant resolution; ACME client for auto TLS; health checks; fallback to platform domain; rate-limited issuance. SEO tags (title/og) use tenant brand.

* Email/Certs: MJML/Handlebars templates compiled with brand tokens; PDF renderer for certificates; font licensing respected.

* Accessibility Guardrails: Contrast calculator; automated audits in CI (axe) on theme presets.

* Security: MIME/type checks on uploads, size limits, image sanitization, CSP for embeds; no arbitrary HTML injection from themes.

---

## Milestones & Sequencing

* Phase 1 (2–3 weeks): Zendesk connection, ingest/index, initial synthesis to path/lessons, React embed, basic quizzes/badges, manual publish.

* Phase 1.5: Branding & Embed v1 (1 week)

  * Deliverables: Admin Branding page (tokens, assets), contrast checker, React SDK/Web Component theming props, basic certificate/email theming, custom domain connect with manual DNS verify.

  * Dependencies: Storage bucket, CDN, email service, PDF service, ACME/TLS service.

* Phase 2 (2 weeks): Change detection, delta regen, review queue with diffs, versioning, freshness SLA dashboard.

* Phase 3 (1–2 weeks): Adaptive recommendations, search, export, and extended analytics.

Team: Small team (3–4 people): 1 product/PM, 2 full-stack engineers, 0.5 designer.