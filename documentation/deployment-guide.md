# Deployment Guide - Calorie Diary Web Application

## 🚀 Deployment Overview

This guide covers multiple deployment options for the Calorie Diary web application, from local development to production cloud deployment. Choose the method that best fits your needs and infrastructure.

## 📋 Prerequisites

### Required Accounts & Services

1. **Google Cloud Project**:
   - Google Cloud Console access
   - Google Sheets API enabled
   - Service Account created with Sheets access
   - Google Apps Script project deployed

2. **System Requirements**:
   - Node.js 18+ (for local deployment)
   - Docker & Docker Compose (for containerized deployment)
   - Git (for version control)

3. **Domain & Hosting** (for production):
   - Domain name (optional but recommended)
   - Hosting service (Cloud Run, Heroku, DigitalOcean, etc.)

## 🔧 Environment Configuration

### Step 1: Google Cloud Setup

**Create Service Account**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "IAM & Admin" > "Service Accounts"
3. Click "Create Service Account"
4. Name: `calorie-diary-service`
5. Grant role: "Editor" (or more restrictive custom role)
6. Create and download JSON key file

**Enable APIs**:
```bash
# Enable required Google APIs
gcloud services enable sheets.googleapis.com
gcloud services enable script.googleapis.com
```

### Step 2: Google Sheets Setup

**Create Spreadsheet**:
1. Create new Google Sheets document
2. Copy the spreadsheet ID from the URL
3. Share spreadsheet with service account email
4. Set up initial sheets structure (see technical documentation)

**Note the Spreadsheet ID**:
```
https://docs.google.com/spreadsheets/d/1ABC123DEF456GHI789/edit
                                    ^^^^^^^^^^^^^^^^^^^^
                                    This is your Sheet ID
```

### Step 3: Google Apps Script Deployment

**Deploy Apps Script**:
1. Open [Google Apps Script](https://script.google.com)
2. Create new project: "Calorie Diary Automation"
3. Copy contents from `/scripts/CaloryDiaryAutomation_v2.gs`
4. Save and deploy as web app:
   - Execute as: "Me"
   - Who has access: "Anyone"
5. Copy the web app URL

### Step 4: Environment Variables

Create `.env` file in project root:

```bash
# Google Cloud Configuration
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...your-private-key...ABCD\n-----END PRIVATE KEY-----"
GOOGLE_CLIENT_EMAIL="calorie-diary-service@your-project.iam.gserviceaccount.com"

# Google Sheets Configuration
GOOGLE_SHEET_ID="1ABC123DEF456GHI789"

# Google Apps Script Configuration
GOOGLE_SCRIPT_WEB_APP_URL="https://script.google.com/macros/s/AKfycby.../exec"

# Application Configuration
PORT=3000
NODE_ENV=production

# Session Security (generate random 32-character string)
SESSION_SECRET="your-random-32-character-secret-key"
```

**Security Note**: Never commit the `.env` file to version control. Use `.env.example` as a template.

## 🏠 Local Development Deployment

### Quick Start

```bash
# Clone repository
git clone https://github.com/your-username/calorie-diary.git
cd calorie-diary

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

**Development Features**:
- Hot reload with nodemon
- Debug logging enabled
- Source maps for easier debugging
- Mock data options for testing

### Development Scripts

```bash
# Start development server with hot reload
npm run dev

# Start production server locally
npm start

# Run tests
npm test

# Check code quality
npm run lint
npm run format

# Build for production
npm run build
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  calorie-diary:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:  # Optional: for SSL termination and load balancing
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - calorie-diary
    restart: unless-stopped
```

**Deploy with Docker Compose**:
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f calorie-diary

# Stop services
docker-compose down

# Update deployment
git pull
docker-compose build
docker-compose up -d
```

### Standard Docker Deployment

```bash
# Build Docker image
docker build -t calorie-diary:latest .

# Run container
docker run -d \
  --name calorie-diary \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  calorie-diary:latest

# View logs
docker logs -f calorie-diary

# Stop container
docker stop calorie-diary
docker rm calorie-diary
```

## ☁️ Cloud Platform Deployment

### Google Cloud Run

**Prepare for Cloud Run**:

1. **Build and push image**:
```bash
# Configure Docker for Google Cloud
gcloud auth configure-docker

# Build and tag image
docker build -t gcr.io/YOUR_PROJECT_ID/calorie-diary .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/calorie-diary
```

2. **Deploy to Cloud Run**:
```bash
# Deploy service
gcloud run deploy calorie-diary \
  --image gcr.io/YOUR_PROJECT_ID/calorie-diary \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-env-vars PORT=8080

# Set environment variables (one by one for security)
gcloud run services update calorie-diary \
  --set-env-vars GOOGLE_SHEET_ID="your-sheet-id"
```

3. **Configure custom domain** (optional):
```bash
# Map custom domain
gcloud run domain-mappings create \
  --service calorie-diary \
  --domain your-domain.com \
  --region us-central1
```

### Heroku Deployment

**Heroku Setup**:

1. **Install Heroku CLI and login**:
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login
```

2. **Create Heroku app**:
```bash
# Create app
heroku create your-calorie-diary-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set GOOGLE_SHEET_ID="your-sheet-id"
heroku config:set GOOGLE_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
heroku config:set GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----"
heroku config:set GOOGLE_SCRIPT_WEB_APP_URL="your-script-url"
heroku config:set SESSION_SECRET="your-session-secret"
```

3. **Deploy**:
```bash
# Deploy from Git
git push heroku main

# View logs
heroku logs --tail

# Open app
heroku open
```

### DigitalOcean App Platform

**Deploy via GitHub**:

1. **Connect repository**:
   - Link your GitHub repository
   - Select branch: `main`
   - Auto-deploy on push: enabled

2. **Configure app specs** (`app.yaml`):
```yaml
name: calorie-diary
region: nyc1
services:
- name: web
  source_dir: /
  github:
    repo: your-username/calorie-diary
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: GOOGLE_SHEET_ID
    value: your-sheet-id
    type: SECRET
  - key: GOOGLE_CLIENT_EMAIL
    value: your-service-account-email
    type: SECRET
  - key: GOOGLE_PRIVATE_KEY
    value: your-private-key
    type: SECRET
  - key: GOOGLE_SCRIPT_WEB_APP_URL
    value: your-script-url
    type: SECRET
  - key: SESSION_SECRET
    value: your-session-secret
    type: SECRET
  http_port: 3000
  health_check:
    http_path: /health
```

### AWS Elastic Beanstalk

**Deploy to Elastic Beanstalk**:

1. **Install EB CLI**:
```bash
pip install awsebcli
```

2. **Initialize and deploy**:
```bash
# Initialize EB application
eb init -p "Node.js 18" calorie-diary

# Create environment and deploy
eb create production

# Set environment variables
eb setenv NODE_ENV=production
eb setenv GOOGLE_SHEET_ID=your-sheet-id
eb setenv GOOGLE_CLIENT_EMAIL=your-service-account-email
eb setenv GOOGLE_PRIVATE_KEY="your-private-key"
eb setenv GOOGLE_SCRIPT_WEB_APP_URL=your-script-url
eb setenv SESSION_SECRET=your-session-secret

# Deploy updates
eb deploy
```

## 🔒 Security Hardening

### Environment Security

**Secure Environment Variables**:
```bash
# Use secret management services
# Google Cloud: Secret Manager
# AWS: Systems Manager Parameter Store
# Azure: Key Vault
# Heroku: Config Vars (encrypted)

# Never log sensitive information
console.log(process.env.GOOGLE_PRIVATE_KEY); // ❌ DON'T DO THIS
```

### HTTPS Configuration

**Nginx SSL Configuration** (`nginx.conf`):
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    location / {
        proxy_pass http://calorie-diary:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Security Headers

**Express Security Middleware**:
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 📊 Monitoring & Maintenance

### Health Checks

**Application Health Endpoint**:
```javascript
app.get('/health', async (req, res) => {
  try {
    // Test Google Sheets connectivity
    await googleSheetsService.testConnection();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

### Logging Configuration

**Production Logging**:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Performance Monitoring

**Basic Performance Metrics**:
```javascript
const promClient = require('prom-client');

// Create metrics
const httpDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'status_code', 'route']
});

// Middleware to track metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpDuration
      .labels(req.method, res.statusCode, req.route?.path || req.path)
      .observe(duration);
  });
  
  next();
});
```

## 🔄 Backup & Recovery

### Data Backup Strategy

**Google Sheets Backup**:
```javascript
// Automated backup script
async function backupSpreadsheet() {
  const sheets = await googleSheetsService.getSheets();
  const backup = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    includeGridData: true
  });
  
  // Store backup data
  await fs.writeFile(
    `backup-${new Date().toISOString().split('T')[0]}.json`,
    JSON.stringify(backup.data, null, 2)
  );
}

// Schedule daily backups
cron.schedule('0 2 * * *', backupSpreadsheet);
```

### Disaster Recovery

**Recovery Procedures**:
1. **Application Recovery**: Deploy from Git repository
2. **Data Recovery**: Restore from Google Sheets backup
3. **Environment Recovery**: Recreate from `.env.example` template
4. **Service Recovery**: Redeploy Google Apps Script if needed

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Google Cloud service account created
- [ ] Google Sheets permissions set
- [ ] Google Apps Script deployed
- [ ] SSL certificates obtained (for HTTPS)
- [ ] Domain DNS configured (if using custom domain)

### Deployment

- [ ] Application deployed successfully
- [ ] Health check endpoint responds correctly
- [ ] Google Sheets integration working
- [ ] Apps Script triggers functioning
- [ ] PWA features working (offline, install prompt)
- [ ] Mobile responsiveness verified

### Post-Deployment

- [ ] Monitoring alerts configured
- [ ] Backup procedures scheduled
- [ ] Performance baselines established
- [ ] Security headers verified
- [ ] User acceptance testing completed
- [ ] Documentation updated with deployment details

### Ongoing Maintenance

- [ ] Regular security updates
- [ ] Performance monitoring review
- [ ] Backup verification
- [ ] User feedback collection
- [ ] Feature usage analytics

## 🆘 Troubleshooting Deployment Issues

### Common Problems

**Environment Variable Issues**:
```bash
# Check if variables are loaded
node -e "console.log(process.env.GOOGLE_SHEET_ID)"

# Verify Google credentials
node -e "console.log(JSON.parse(process.env.GOOGLE_PRIVATE_KEY))"
```

**Google Sheets Connection**:
```javascript
// Test connection script
async function testConnection() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID
    });
    
    console.log('✅ Google Sheets connection successful');
    console.log('Spreadsheet title:', response.data.properties.title);
  } catch (error) {
    console.error('❌ Google Sheets connection failed:', error.message);
  }
}
```

**Port and Network Issues**:
```bash
# Check if port is in use
lsof -i :3000

# Test application locally
curl http://localhost:3000/health

# Check Docker container
docker logs calorie-diary
```

For additional troubleshooting, see the [Troubleshooting Guide](troubleshooting.md).

---

**Ready to deploy? Start with the local development setup, then choose your preferred cloud platform! 🚀**