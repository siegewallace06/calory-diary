# Calorie Diary Web App Setup Guide

## Quick Start

### 1. Prerequisites
- Docker and Docker Compose installed
- Google Service Account credentials
- Google Spreadsheet with Calorie Diary script installed

### 2. Setup Environment

1. **Copy environment template:**
   ```bash
   cd app
   cp .env.example .env
   ```

2. **Edit `.env` file:**
   ```env
   SPREADSHEET_ID=your_google_spreadsheet_id_here
   GOOGLE_CREDENTIALS_PATH=./credentials/service-account.json
   PORT=3000
   NODE_ENV=production
   LOG_SHEET_NAME=Log
   DASHBOARD_SHEET_NAME=Dashboard
   DAILY_SUMMARY_SHEET_NAME=Daily Summary
   ```

### 2. **Add Google Service Account credentials:**

**For Local Development:**
   - Create `app/credentials/` directory
   - Download your Google service account JSON file
   - Place it as `app/credentials/service-account.json`
   - Set `GOOGLE_CREDENTIALS_PATH=./credentials/service-account.json` in .env

**For Cloud Run Deployment:**
   - Attach a service account to your Cloud Run instance
   - Leave `GOOGLE_CREDENTIALS_PATH` empty or remove it from .env
   - The app will automatically use default Google Cloud authentication

### 3. Run with Docker Compose

**Production mode:**
```bash
docker-compose up -d
```

**Development mode (with hot reload):**
```bash
docker-compose -f docker-compose.dev.yml up
```

### 4. Access the Application
- Web interface: http://localhost:3000
- Health check: http://localhost:3000/health

## Google Sheets Setup

### Authentication Options

**Option 1: Local Development (Service Account JSON)**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Sheets API
4. Create service account credentials
5. Download JSON key file to `app/credentials/service-account.json`
6. Set `GOOGLE_CREDENTIALS_PATH=./credentials/service-account.json` in .env

**Option 2: Cloud Run Deployment (Default Auth)**
1. Create a service account in Google Cloud Console
2. Grant necessary permissions to the service account
3. Attach the service account to your Cloud Run instance
4. Leave `GOOGLE_CREDENTIALS_PATH` empty in .env (app will use default auth)

### 2. Share Spreadsheet
1. Open your Google Spreadsheet
2. Click "Share" button
3. Add service account email (from JSON file or Cloud Console) as editor
4. Copy spreadsheet ID from URL

### 3. Get Spreadsheet ID
From URL like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
Copy the `SPREADSHEET_ID` part.

## API Endpoints

### Food Logging
- `POST /api/log` - Add new food entry
- `GET /api/log` - Get recent entries

### Dashboard
- `GET /api/dashboard` - Get dashboard data

### Summary
- `GET /api/summary` - Get daily summary

### Settings
- `POST /api/settings` - Update personal metrics

### Utility
- `POST /api/refresh` - Refresh calculations
- `GET /health` - Health check

## Docker Commands

**Build and start:**
```bash
docker-compose up --build -d
```

**View logs:**
```bash
docker-compose logs -f
```

**Stop services:**
```bash
docker-compose down
```

**Development with live reload:**
```bash
docker-compose -f docker-compose.dev.yml up
```

## Troubleshooting

### Common Issues

1. **"Spreadsheet not found" error:**
   - Verify spreadsheet ID in .env
   - Ensure service account has access to spreadsheet

2. **"Authentication failed" error:**
   - Check credentials file path
   - Verify service account JSON is valid

3. **"Sheet not found" error:**
   - Ensure sheet names in .env match Google Sheets exactly
   - Run the Google Apps Script setup first

4. **Container won't start:**
   - Check Docker logs: `docker-compose logs`
   - Verify all environment variables are set

### Health Check
Visit `/health` endpoint to verify:
- Server is running
- Spreadsheet ID is configured
- Basic connectivity

### Debugging
```bash
# View application logs
docker-compose logs calorie-diary-web

# Access container shell
docker-compose exec calorie-diary-web sh

# Check environment variables
docker-compose exec calorie-diary-web printenv
```

## Security Notes

- Keep service account JSON file secure
- Don't commit credentials to version control
- Use environment variables for configuration
- Consider using secrets management in production

## Production Deployment

For production deployment:

1. Use proper secrets management
2. Set up SSL/TLS certificates
3. Configure reverse proxy (nginx example commented in docker-compose.yml)
4. Set up monitoring and logging
5. Configure backups for Google Sheets data
6. Use docker-compose.yml (not dev version)

## File Structure
```
app/
├── credentials/              # Google service account files
├── services/                # Business logic
├── views/                   # EJS templates
├── public/                  # Static files (if any)
├── package.json            # Dependencies
├── server.js               # Main application file
├── Dockerfile              # Container definition
└── .env                    # Environment variables
```