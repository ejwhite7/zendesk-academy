# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

⚠️ **Early Development Stage**: This repository currently contains only project specifications (PRD.md). No codebase has been implemented yet.

## Project Overview

Zendesk KB → Interactive Courses: An open-source system that transforms Zendesk Guide knowledge base articles into interactive, auto-generated courses that can be embedded into React applications. The system uses Claude-powered generation to synthesize progressive learning paths and keeps courses fresh within 24 hours of KB changes.

## Project Overview

The system continuously monitors Zendesk KB, uses Claude-powered generation to synthesize progressive learning paths (beginner → expert), and keeps courses fresh within 24 hours of KB changes. It creates outlines, lessons, quizzes, branching scenarios, simulations, videos with checkpoints, and badges.

## Key Technologies & Stack

- **Frontend**: React SDK and Web Components for embedding
- **Backend**: Node.js/Express services
- **Database**: PostgreSQL with pgvector for embeddings
- **Storage**: S3-compatible object storage (AWS S3 or MinIO)
- **AI**: Anthropic Claude for content generation
- **Authentication**: Built-in email/password + OAuth (Google, Microsoft)
- **Deployment**: Docker Compose reference deployment

## Core Features

### AI Course Generation & Refresh (P0)
- Auto-generate course outlines, modules, lessons from Zendesk KB articles
- Build progressive learning paths with skill/knowledge graphs
- Change detection with delta updates via webhooks
- Human-in-the-loop review with side-by-side diffs
- Versioning & audit trails
- Automated badging and progress tracking

### Zendesk Integration (P0) 
- Connect via subdomain + API token
- Select articles by labels/sections
- Scheduled sync and on-demand reindex
- Support for HTML/Markdown content, attachments, images

### Branding & White-Labeling (P1)
- Custom theme tokens (colors, typography, spacing)
- Brand asset uploads (logo, favicon, wordmark)
- Custom domain mapping with automated TLS
- Branded certificates and email templates
- Multi-tenant inheritance system

## Architecture Components

### Core Services
- **Ingestion Service**: Zendesk polling + webhook consumers
- **Generation Orchestrator**: Async workers for course building
- **Course Editor**: Admin UI for reviewing/editing AI output
- **Learner Runtime**: Client-side course player
- **Assessment Engine**: Quiz system with scoring and feedback
- **Progress & Credentials**: Badge/certificate management
- **Event Pipeline**: Analytics collection and forwarding

### Data Model (Key Entities)
- User, Enrollment, Progress, Course, Module, Lesson
- Assessment, Question, AnswerOption, Attempt, Result
- Badge, Certificate, KnowledgeSource, Article
- WebhookEvent, SyncRun

## Implementation Architecture

Based on the PRD, the system should be architected as:

### Monorepo Structure (Recommended)
```
/
├── apps/
│   ├── admin/          # Admin dashboard React app
│   ├── learner/        # Learner-facing React app  
│   └── api/            # Node.js/Express API server
├── packages/
│   ├── shared/         # Shared utilities and types
│   ├── react-sdk/      # Embeddable React components
│   └── web-component/  # Framework-agnostic web component
├── services/
│   ├── ingestion/      # Zendesk sync service
│   ├── generation/     # Claude-powered content generation
│   └── assessment/     # Quiz and progress tracking
└── docker-compose.yml  # Local development environment
```

### Key Implementation Considerations

**AI Content Generation Pipeline**:
- Implement async job queue for Claude API calls
- Design prompt templates for course structure, lessons, quizzes
- Build diff/merge system for preserving admin edits during regeneration
- Implement rate limiting and cost monitoring for Claude API

**Zendesk Integration**:
- REST API client with proper error handling and rate limiting
- Webhook receiver for real-time change detection  
- Article content parser supporting HTML/Markdown
- Delta detection algorithm for selective content updates

**Multi-tenant Branding System**:
- Theme token inheritance: Global → Tenant → Course level
- Asset pipeline with image optimization and CDN integration
- CSS-in-JS system supporting runtime theme switching
- Custom domain routing with automated TLS (ACME protocol)

**React SDK Architecture**:
- Provider pattern for theme context and configuration
- Event emission system for analytics integration
- Shadow DOM isolation for embedded components
- Responsive design supporting various container sizes

## Key Workflows

### Admin Setup
1. Connect Zendesk (subdomain + API token)
2. Select articles by labels/sections
3. Generate initial course structure
4. Review and publish content
5. Configure branding/theming
6. Embed courses in target applications

### Content Updates
1. Detect KB changes via webhooks
2. Generate diffs and impact analysis
3. Queue changes for admin review
4. Auto-merge or manual approval
5. Publish updates to live courses

### Learner Experience
1. Browse course catalog
2. Follow progressive learning paths
3. Complete lessons, quizzes, scenarios
4. Earn badges and certificates
5. Receive adaptive recommendations

## Success Metrics

- **Freshness**: <24h from KB change to published update
- **Automation**: >70% auto-generated content, >60% auto-merged updates  
- **Engagement**: Course completion and activation rates
- **Performance**: <200ms embed load time, <500ms lesson render
- **Branding**: % tenants with custom themes in first 7 days

## Integration Points

### Tier 1 (MVP)
- Zendesk Guide REST API + webhooks
- Google/Microsoft OAuth
- YouTube/Vimeo video embedding
- GA4/PostHog analytics
- Slack/Teams notifications
- Open Badges 2.0 via Badgr

### Tier 2 (Future)
- SCORM/xAPI/LTI for LMS integration
- Confluence, Notion, GitHub Wiki ingestion
- Enterprise SSO (Okta/Azure AD)
- Advanced search (Algolia/Typesense)
- Observability (Sentry/Datadog)

## Development Phases

1. **Phase 1** (2-3 weeks): Core Zendesk integration, basic course generation, React embeds
2. **Phase 1.5** (1 week): Branding system, theming, custom domains
3. **Phase 2** (2 weeks): Change detection, delta regeneration, review workflows
4. **Phase 3** (1-2 weeks): Advanced features, analytics, search

## Development Setup

**Note**: No package.json or build system exists yet. When implementing:

### Planned Tech Stack
- **Frontend**: React with TypeScript
- **Backend**: Node.js/Express services  
- **Database**: PostgreSQL with pgvector extension
- **Storage**: S3-compatible (AWS S3 or MinIO)
- **Containerization**: Docker Compose for local development

### Expected Common Commands (TBD)
```bash
# When package.json is created:
npm install
npm run dev
npm run build
npm run test
npm run lint
npm run typecheck

# Docker development environment:
docker-compose up -d
```

## Critical Implementation Notes

**Claude API Integration**:
- Use provider abstraction pattern to support multiple LLM providers later
- Implement content safety guardrails and output validation
- Design prompt versioning system for reproducible generation
- Monitor token usage and implement cost controls

**Performance Requirements**:
- Embed load time: <200ms p95
- Lesson render time: <500ms p95  
- Course freshness: <24h from KB change to published update
- Auto-generation target: >70% content, >60% auto-merged updates

**Security & Privacy**:
- Never send PII or sensitive KB content to Claude API
- Implement least-privilege Zendesk API token scopes
- Use ephemeral prompts where possible, allow opt-out of logging
- Sanitize all user uploads (themes, assets) before storage

**Open Source Considerations**:
- Design white-label system as optional premium feature
- Ensure core functionality works without proprietary services
- Document self-hosting requirements (Claude API key, storage, etc.)
- Provide Docker Compose setup for easy local development