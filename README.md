# Zendesk Academy

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black)
![React](https://img.shields.io/badge/React-18.2-blue)

Transform your Zendesk Guide knowledge base articles into interactive, AI-powered learning courses that can be embedded into any React application.

## 🌟 Overview

Zendesk Academy is an open-source system that automatically converts Zendesk Guide knowledge base articles into structured, interactive courses with quizzes, progress tracking, and badging. The system uses Anthropic Claude AI to synthesize progressive learning paths and keeps courses fresh within 24 hours of KB changes.

### Key Features

- **🤖 AI-Powered Course Generation**: Automatically transform Zendesk KB articles into structured learning modules
- **📚 Interactive Learning**: Progressive learning paths with lessons, quizzes, and assessments
- **🔄 Real-time Sync**: Automatic updates when your Zendesk KB changes
- **🎨 White-label Ready**: Customizable branding and theming
- **📊 Progress Tracking**: Learner analytics, badges, and certificates
- **🔌 Easy Integration**: React SDK and Web Components for seamless embedding
- **🌐 Multi-tenant**: Support for multiple organizations and custom domains

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Supabase (PostgreSQL + Auth)
- **AI**: Anthropic Claude API
- **Storage**: S3-compatible object storage
- **Authentication**: Supabase Auth (Email/Password + OAuth)
- **Deployment**: Docker, Vercel, or self-hosted

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (or self-hosted Supabase)
- Anthropic Claude API key
- Zendesk Guide with API access

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/zendesk-academy.git
cd zendesk-academy
npm install
```

### 2. Environment Setup

Copy the environment template and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic Claude API
ANTHROPIC_API_KEY=your-claude-api-key

# Zendesk Integration (for testing)
ZENDESK_API_TOKEN=your-zendesk-token
ZENDESK_EMAIL=your-zendesk-email

# Application Configuration
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 3. Database Setup

Set up your Supabase database with the provided migrations:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the migrations from supabase/migrations/
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📖 Usage

### For Administrators

1. **Connect Your Zendesk**: Navigate to the dashboard and add your Zendesk credentials
2. **Select Articles**: Choose which KB articles to include in your courses
3. **Generate Courses**: Let Claude AI create structured learning paths
4. **Review & Customize**: Edit generated content and adjust course flow
5. **Publish**: Make courses available to learners

### For Learners

1. **Browse Catalog**: Explore available courses organized by topic
2. **Enroll & Learn**: Take courses with interactive lessons and quizzes
3. **Track Progress**: Monitor completion and earn badges
4. **Continue Learning**: Get personalized course recommendations

### For Developers

Embed courses in your applications using our React SDK:

```jsx
import { ZendeskAcademy } from '@zendesk-academy/react-sdk'

function MyApp() {
  return (
    <ZendeskAcademy
      apiKey="your-api-key"
      courseId="course-123"
      theme={{
        primaryColor: '#007b8e',
        fontFamily: 'Inter'
      }}
    />
  )
}
```

## 🏗 Architecture

### Directory Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Admin dashboard
│   ├── learn/            # Learner interface
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── dashboard/        # Admin components
│   ├── learn/           # Learning components
│   └── ui/              # Reusable UI components
├── lib/                 # Utilities and configurations
│   ├── services/        # Business logic
│   ├── supabase/       # Database client
│   └── utils.ts        # Helper functions
├── hooks/              # Custom React hooks
└── types/              # TypeScript type definitions
```

### Core Components

- **Course Generation Service**: Interfaces with Claude AI to transform KB articles
- **Zendesk Integration**: Syncs with Zendesk Guide API
- **Learning Management**: Tracks progress, quizzes, and badges
- **Authentication**: Handles user management and access control
- **Embedding SDK**: Provides easy integration for external applications

## 🚀 Deployment

### Option 1: Vercel (Recommended)

1. **Prepare for deployment**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**:
   ```bash
   npx vercel
   ```

3. **Set environment variables** in Vercel dashboard

4. **Configure custom domain** (optional)

### Option 2: Docker

1. **Build the Docker image**:
   ```bash
   docker build -t zendesk-academy .
   ```

2. **Run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

### Option 3: Self-hosted

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

3. **Set up reverse proxy** (nginx, Apache, etc.)

4. **Configure SSL certificate**

### Production Checklist

- [ ] Set secure `NEXTAUTH_SECRET`
- [ ] Configure production Supabase instance
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Configure CDN for static assets
- [ ] Set up backup strategy for database
- [ ] Configure rate limiting
- [ ] Set up SSL certificate
- [ ] Configure environment-specific variables

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `ANTHROPIC_API_KEY` | Claude AI API key | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js secret | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `ZENDESK_API_TOKEN` | Zendesk API token | No* |
| `ZENDESK_EMAIL` | Zendesk user email | No* |
| `SENTRY_DSN` | Sentry error tracking | No |

*Required for Zendesk integration features

### Feature Flags

Enable/disable features using environment variables:

```env
ENABLE_ANALYTICS=true
ENABLE_EMBEDDINGS=true
ENABLE_WEBHOOKS=true
```

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

### Code Quality

This project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Tailwind CSS** for styling

### Testing

```bash
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📚 API Documentation

### REST API Endpoints

```
POST /api/courses/generate    # Generate course from Zendesk articles
GET  /api/courses            # List courses
GET  /api/courses/:id        # Get course details
POST /api/zendesk/sync       # Sync with Zendesk KB
GET  /api/progress/:userId   # Get user progress
```

### React SDK

```jsx
// Basic usage
<ZendeskAcademy courseId="123" />

// With custom theme
<ZendeskAcademy 
  courseId="123"
  theme={{
    primaryColor: '#007b8e',
    secondaryColor: '#f0f0f0',
    fontFamily: 'Inter'
  }}
/>

// With event handlers
<ZendeskAcademy 
  courseId="123"
  onComplete={(courseId, score) => {
    console.log('Course completed!', courseId, score)
  }}
  onProgress={(progress) => {
    console.log('Progress:', progress)
  }}
/>
```

## 🛡 Security

- All API endpoints are protected with authentication
- RBAC (Role-Based Access Control) for admin features
- Input validation and sanitization
- SQL injection protection via Supabase ORM
- XSS protection with Content Security Policy
- Rate limiting on API endpoints

## 📊 Monitoring & Analytics

### Built-in Analytics
- Course completion rates
- User engagement metrics
- Learning path effectiveness
- Knowledge gap analysis

### External Integrations
- Google Analytics 4
- PostHog for product analytics
- Sentry for error monitoring
- Custom webhook events

## 🔗 Integrations

### Tier 1 (Available)
- **Zendesk Guide**: Primary KB source
- **Google/Microsoft OAuth**: Authentication
- **YouTube/Vimeo**: Video embedding
- **Slack/Teams**: Notifications
- **Open Badges 2.0**: Credential verification

### Tier 2 (Planned)
- **LMS Integration**: SCORM/xAPI/LTI support
- **Additional KB Sources**: Confluence, Notion, GitHub Wiki
- **Enterprise SSO**: Okta, Azure AD
- **Advanced Search**: Algolia, Typesense

## 🆘 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**Database Connection Issues**
- Verify Supabase credentials in `.env.local`
- Check network connectivity
- Ensure database migrations are applied

**Claude API Errors**
- Verify API key is valid
- Check rate limits
- Ensure sufficient credits

**Zendesk Integration Issues**
- Verify API token permissions
- Check subdomain configuration
- Ensure API is enabled for your plan

### Getting Help

- 📖 [Documentation](https://docs.zendesk-academy.com)
- 💬 [Discord Community](https://discord.gg/zendesk-academy)
- 🐛 [Issue Tracker](https://github.com/your-org/zendesk-academy/issues)
- 📧 [Email Support](mailto:support@zendesk-academy.com)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Anthropic](https://anthropic.com) for Claude AI
- [Supabase](https://supabase.com) for backend infrastructure
- [Zendesk](https://zendesk.com) for the knowledge base platform
- [Vercel](https://vercel.com) for hosting platform
- The open-source community for amazing tools and libraries

---

**Built with ❤️ by the Zendesk Academy team**

For more information, visit our [website](https://zendesk-academy.com) or [documentation](https://docs.zendesk-academy.com).