# Deployment Guide

This guide covers different deployment options for Zendesk Academy, from development to production environments.

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides the easiest deployment experience with automatic builds, serverless functions, and CDN.

#### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/zendesk-academy)

#### Manual Deployment

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**:
   Go to your Vercel dashboard → Project → Settings → Environment Variables and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ANTHROPIC_API_KEY
   NEXTAUTH_SECRET
   NEXTAUTH_URL
   ```

#### Automatic Deployments

1. Connect your GitHub repository to Vercel
2. Set up automatic deployments on push to main branch
3. Configure preview deployments for pull requests

### Option 2: Docker

Perfect for self-hosted environments and cloud providers.

#### Build Docker Image

1. **Create Dockerfile** (already included):
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   
   COPY package.json package-lock.json* ./
   RUN npm ci --only=production
   
   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   
   RUN npm run build
   
   # Production image, copy all the files and run next
   FROM base AS runner
   WORKDIR /app
   
   ENV NODE_ENV production
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   
   # Set the correct permission for prerender cache
   RUN mkdir .next
   RUN chown nextjs:nodejs .next
   
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   
   EXPOSE 3000
   
   ENV PORT 3000
   ENV HOSTNAME "0.0.0.0"
   
   CMD ["node", "server.js"]
   ```

2. **Build the image**:
   ```bash
   docker build -t zendesk-academy .
   ```

3. **Run the container**:
   ```bash
   docker run -p 3000:3000 --env-file .env.production zendesk-academy
   ```

#### Docker Compose

Use the included `docker-compose.yml` for a complete stack:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Option 3: AWS/GCP/Azure

#### AWS App Runner

1. **Create apprunner.yaml**:
   ```yaml
   version: 1.0
   runtime: nodejs18
   build:
     commands:
       build:
         - npm ci
         - npm run build
   run:
     runtime-version: 18
     command: npm start
     network:
       port: 3000
       env: PORT
   ```

2. **Deploy via AWS Console**:
   - Go to AWS App Runner
   - Create service from source code
   - Connect your GitHub repository
   - Configure environment variables

#### Google Cloud Run

1. **Build and push image**:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT-ID/zendesk-academy
   ```

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy --image gcr.io/PROJECT-ID/zendesk-academy --platform managed
   ```

#### Azure Container Apps

1. **Create resource group**:
   ```bash
   az group create --name zendesk-academy --location eastus
   ```

2. **Deploy container app**:
   ```bash
   az containerapp create \
     --name zendesk-academy \
     --resource-group zendesk-academy \
     --environment myenvironment \
     --image your-registry/zendesk-academy:latest
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env.production` file with your production values:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
ANTHROPIC_API_KEY=sk-ant-your-production-key
NEXTAUTH_SECRET=your-super-secure-production-secret
NEXTAUTH_URL=https://your-domain.com

# Optional but recommended
SENTRY_DSN=https://your-sentry-dsn@sentry.io
```

### Database Setup

1. **Production Supabase**:
   - Create a new Supabase project for production
   - Run migrations: `supabase db push --db-url your-production-url`
   - Set up RLS policies for security

2. **Self-hosted PostgreSQL**:
   ```bash
   # Run migrations
   psql -h your-host -U your-user -d your-db -f supabase/migrations/01_initial_schema.sql
   psql -h your-host -U your-user -d your-db -f supabase/migrations/02_rls_policies.sql
   psql -h your-host -U your-user -d your-db -f supabase/migrations/03_functions.sql
   ```

### SSL/TLS Configuration

#### Automatic (Vercel/Netlify)
- SSL certificates are automatically provisioned
- Custom domains supported with automatic certificates

#### Manual (Self-hosted)
1. **Get SSL certificate** (Let's Encrypt recommended):
   ```bash
   certbot --nginx -d your-domain.com
   ```

2. **Configure nginx**:
   ```nginx
   server {
       listen 443 ssl;
       server_name your-domain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## 🔒 Security

### Production Security Checklist

- [ ] **Secure Environment Variables**: Never commit secrets to version control
- [ ] **Strong NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32`
- [ ] **Database Security**: Enable RLS policies, use connection pooling
- [ ] **API Rate Limiting**: Configure rate limits for API endpoints
- [ ] **Content Security Policy**: Set appropriate CSP headers
- [ ] **HTTPS Only**: Redirect all HTTP traffic to HTTPS
- [ ] **Security Headers**: Implement HSTS, X-Frame-Options, etc.

### Security Headers

Add to `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

## 📊 Monitoring

### Application Monitoring

1. **Sentry Integration**:
   ```bash
   # Already configured in the app
   # Just set SENTRY_DSN in environment variables
   ```

2. **Vercel Analytics**:
   ```bash
   npm install @vercel/analytics
   ```

3. **Custom Monitoring**:
   ```javascript
   // pages/api/health.js
   export default function handler(req, res) {
     res.status(200).json({ 
       status: 'healthy', 
       timestamp: new Date().toISOString(),
       version: process.env.npm_package_version 
     })
   }
   ```

### Infrastructure Monitoring

1. **Uptime Monitoring**: Use services like UptimeRobot, Pingdom
2. **Performance Monitoring**: Web Vitals, Lighthouse CI
3. **Database Monitoring**: Supabase dashboard or custom PostgreSQL monitoring

## 🚀 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run type check
        run: npm run typecheck
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🔄 Backup & Recovery

### Database Backups

1. **Supabase Automatic Backups**: Available on Pro plan
2. **Manual Backups**:
   ```bash
   # Create backup
   pg_dump -h db.your-project.supabase.co -U postgres your-db > backup.sql
   
   # Restore backup
   psql -h db.your-project.supabase.co -U postgres your-db < backup.sql
   ```

### File Storage Backups

1. **S3 Cross-Region Replication**: Enable for Supabase storage
2. **Manual File Backup**:
   ```bash
   aws s3 sync s3://your-bucket s3://backup-bucket
   ```

## 📈 Scaling

### Horizontal Scaling

1. **Vercel**: Automatically scales with traffic
2. **Docker**: Use load balancer + multiple instances
3. **Kubernetes**: Deploy with replica sets

### Database Scaling

1. **Read Replicas**: Use for analytics and reporting
2. **Connection Pooling**: PgBouncer for PostgreSQL
3. **Caching**: Redis for session and query caching

### Performance Optimization

1. **Static Assets**: Use CDN (Vercel automatically provides this)
2. **Image Optimization**: Next.js Image component with WebP
3. **Bundle Optimization**: Analyze bundle size with `@next/bundle-analyzer`

## 🛠 Troubleshooting

### Common Deployment Issues

**Build Failures**:
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Environment Variable Issues**:
- Verify all required variables are set
- Check for typos in variable names
- Ensure sensitive variables are not committed

**Database Connection Issues**:
- Verify connection string format
- Check firewall/security group settings
- Ensure SSL is properly configured

**Performance Issues**:
- Enable caching headers
- Optimize images and static assets
- Check for memory leaks in long-running processes

### Getting Help

- 📚 [Deployment Documentation](https://nextjs.org/docs/deployment)
- 💬 [Community Discord](https://discord.gg/zendesk-academy)
- 🐛 [Issue Tracker](https://github.com/your-org/zendesk-academy/issues)
- 📧 [Support Email](mailto:support@zendesk-academy.com)