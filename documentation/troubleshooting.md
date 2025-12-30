# Troubleshooting Guide - Calorie Diary Web Application

## 🔍 Common Issues & Solutions

This guide covers the most frequently encountered issues and their solutions. Use the quick navigation to jump to relevant sections.

### 🗂️ Quick Navigation
- [🚀 Startup Issues](#-startup-issues)
- [🔐 Authentication Problems](#-authentication-problems)
- [📊 Google Sheets Issues](#-google-sheets-issues)
- [🧮 Calculation Problems](#-calculation-problems)
- [💾 Data & Caching Issues](#-data--caching-issues)
- [📱 PWA & Mobile Issues](#-pwa--mobile-issues)
- [🎨 UI & Display Issues](#-ui--display-issues)
- [🚀 Deployment Issues](#-deployment-issues)
- [⚡ Performance Issues](#-performance-issues)

---

## 🚀 Startup Issues

### Application Won't Start

**Problem**: Server fails to start or crashes immediately

**Symptoms**:
```bash
Error: Cannot find module 'dotenv'
Error: listen EADDRINUSE :::3000
Error: GOOGLE_SHEET_ID is not defined
```

**Solutions**:

1. **Missing Dependencies**:
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install

# Check for missing packages
npm list --depth=0
```

2. **Port Already in Use**:
```bash
# Find what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm start
```

3. **Environment Variables Missing**:
```bash
# Check if .env file exists
ls -la .env

# Verify variables are loaded
node -e "console.log(Object.keys(process.env).filter(k => k.startsWith('GOOGLE')))"
```

### Docker Container Issues

**Problem**: Docker container fails to start or exits immediately

**Symptoms**:
```bash
docker: Error response from daemon: driver failed programming external connectivity
Container exits with code 1
```

**Solutions**:

1. **Port Conflicts**:
```bash
# Check Docker port usage
docker ps -a

# Use different port mapping
docker run -p 3001:3000 calorie-diary
```

2. **Environment Variables in Docker**:
```bash
# Check if env file is properly mounted
docker run --env-file .env calorie-diary env | grep GOOGLE

# Use explicit environment variables
docker run -e GOOGLE_SHEET_ID="your-id" calorie-diary
```

3. **Docker Build Issues**:
```bash
# Clean rebuild
docker system prune -f
docker build --no-cache -t calorie-diary .
```

---

## 🔐 Authentication Problems

### Google Service Account Authentication

**Problem**: Authentication fails with Google APIs

**Symptoms**:
```javascript
Error: The caller does not have permission
Error: Request had insufficient authentication scopes
Error: Service account credentials are invalid
```

**Solutions**:

1. **Check Service Account Setup**:
```bash
# Verify service account email format
echo $GOOGLE_CLIENT_EMAIL
# Should look like: service-account@project-id.iam.gserviceaccount.com
```

2. **Private Key Format Issues**:
```javascript
// Common private key problems
const privateKey = process.env.GOOGLE_PRIVATE_KEY;

// ❌ Wrong: Key not properly formatted
"-----BEGIN PRIVATE KEY-----\nMIIE...ABCD\n-----END PRIVATE KEY-----"

// ✅ Correct: Replace \\n with actual newlines
const formattedKey = privateKey.replace(/\\n/g, '\n');
```

3. **Permissions and Scopes**:
```bash
# Verify service account has proper IAM roles
gcloud projects get-iam-policy YOUR_PROJECT_ID

# Check if Sheets API is enabled
gcloud services list --enabled | grep sheets
```

4. **Test Authentication**:
```javascript
// Debug authentication script
const { google } = require('googleapis');

async function testAuth() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const authClient = await auth.getClient();
    console.log('✅ Authentication successful');
    
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID
    });
    
    console.log('✅ Sheets access successful');
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
  }
}

testAuth();
```

### Spreadsheet Sharing Issues

**Problem**: Service account can't access spreadsheet

**Symptoms**:
```javascript
Error: The caller does not have permission
Error: Requested entity was not found
```

**Solutions**:

1. **Share Spreadsheet with Service Account**:
   - Open Google Sheets document
   - Click "Share" button
   - Add service account email address
   - Grant "Editor" permission

2. **Verify Spreadsheet ID**:
```javascript
// Extract ID from URL
const url = "https://docs.google.com/spreadsheets/d/1ABC123DEF456/edit#gid=0";
const id = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)[1];
console.log('Spreadsheet ID:', id);
```

---

## 📊 Google Sheets Issues

### Data Not Syncing

**Problem**: Changes in web app don't appear in Google Sheets

**Symptoms**:
- Food entries not saved to spreadsheet
- Personal metrics not updating
- Calculations not refreshing

**Solutions**:

1. **Check API Quota**:
```bash
# View Google Cloud Console quota usage
gcloud auth login
# Go to: https://console.cloud.google.com/apis/api/sheets.googleapis.com/quotas
```

2. **Verify Apps Script Deployment**:
```javascript
// Test Apps Script web app URL
const testUrl = process.env.GOOGLE_SCRIPT_WEB_APP_URL;
console.log('Testing Apps Script:', testUrl);

fetch(`${testUrl}?action=status`)
  .then(res => res.json())
  .then(data => console.log('✅ Apps Script responding:', data))
  .catch(err => console.error('❌ Apps Script error:', err));
```

3. **Manual Sync Trigger**:
```javascript
// Force refresh calculations
async function forceRefresh() {
  try {
    const response = await fetch('/api/refresh', { method: 'POST' });
    const result = await response.json();
    console.log('Refresh result:', result);
  } catch (error) {
    console.error('Refresh failed:', error);
  }
}
```

### Slow Google Sheets Response

**Problem**: API calls to Google Sheets are very slow

**Symptoms**:
- Long loading times for data
- Timeout errors
- Sluggish UI responsiveness

**Solutions**:

1. **Optimize Data Queries**:
```javascript
// ❌ Inefficient: Multiple separate calls
const metrics = await getPersonalMetrics();
const entries = await getFoodEntries();
const summaries = await getDailySummaries();

// ✅ Efficient: Batch request
const batchData = await sheets.spreadsheets.values.batchGet({
  spreadsheetId: SHEET_ID,
  ranges: ['Personal_Metrics', 'Food_Entries', 'Daily_Summary']
});
```

2. **Implement Caching**:
```javascript
// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedData(key, fetchFunction) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetchFunction();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

3. **Reduce Data Transfer**:
```javascript
// Only fetch required columns and rows
const range = `Food_Entries!A2:E${lastRow}`; // Specific range
const majorDimension = 'ROWS';
const valueRenderOption = 'UNFORMATTED_VALUE'; // Faster than formatted
```

---

## 🧮 Calculation Problems

### BMR/TDEE Calculations Incorrect

**Problem**: Daily calorie goals seem wrong or unchanged

**Symptoms**:
- Goal doesn't change when personal metrics updated
- Unrealistic calorie targets (too high/low)
- Calculations don't match manual calculation

**Solutions**:

1. **Verify Personal Metrics**:
```javascript
// Check all required metrics are present
const requiredMetrics = ['gender', 'weight', 'height', 'age', 'activityLevel', 'goal'];
const missingMetrics = requiredMetrics.filter(metric => !personalMetrics[metric]);

if (missingMetrics.length > 0) {
  console.error('Missing metrics:', missingMetrics);
}
```

2. **Manual Calculation Verification**:
```javascript
// Test BMR calculation
function calculateBMR(gender, weight, height, age) {
  if (gender.toLowerCase() === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
}

// Test with your metrics
const bmr = calculateBMR('male', 70, 175, 30); // Example values
console.log('Expected BMR:', bmr);
```

3. **Force Recalculation**:
```javascript
// Trigger Apps Script recalculation
async function recalculateAll() {
  const response = await fetch(`${GOOGLE_SCRIPT_WEB_APP_URL}?action=refresh`, {
    method: 'GET'
  });
  
  if (response.ok) {
    console.log('✅ Recalculation triggered');
  } else {
    console.error('❌ Recalculation failed');
  }
}
```

### Apps Script Triggers Not Working

**Problem**: onEdit triggers not firing for API updates

**Symptoms**:
- Manual edits in Sheets trigger calculations
- API updates don't trigger calculations
- Daily summaries not updating

**Solutions**:

1. **Use Explicit Refresh Calls**:
```javascript
// After any data modification
async function addFoodEntry(entry) {
  // 1. Add entry to sheet
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Food_Entries',
    valueInputOption: 'RAW',
    resource: { values: [entryValues] }
  });
  
  // 2. Trigger calculations explicitly
  await refreshCalculations();
}
```

2. **Check Apps Script Deployment**:
```bash
# Verify web app is deployed as latest version
# In Apps Script Editor:
# 1. Deploy > Manage Deployments
# 2. Check version is "Head" not a specific version
# 3. Redeploy if necessary
```

---

## 💾 Data & Caching Issues

### Stale Data in Browser

**Problem**: UI shows outdated information

**Symptoms**:
- Old food entries displayed
- Outdated calorie totals
- Yesterday's date shown as "today"
- Changes not reflected immediately

**Solutions**:

1. **Clear Browser Cache**:
```bash
# Hard refresh (most browsers)
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# Clear specific site data
# Chrome: Settings > Privacy > Site Settings > Storage > [your-site]
# Firefox: Settings > Privacy > Cookies and Site Data > Manage Data
```

2. **Disable Caching for Development**:
```javascript
// Add cache-control headers for dynamic content
app.use('/api', (req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  next();
});
```

3. **Force Data Refresh**:
```javascript
// Add timestamp to API requests
const response = await fetch(`/api/food-entries?t=${Date.now()}`);

// Or use proper cache-busting
const response = await fetch('/api/food-entries', {
  headers: {
    'Cache-Control': 'no-cache'
  }
});
```

### Service Worker Cache Issues

**Problem**: PWA showing cached content that's outdated

**Symptoms**:
- Updates not visible after deployment
- Old version of app running
- API responses cached inappropriately

**Solutions**:

1. **Update Service Worker Version**:
```javascript
// In sw.js - increment version number
const CACHE_NAME = 'calorie-diary-v1.1.0'; // Update this
```

2. **Clear Service Worker Cache**:
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
  }
});

// Clear caches
caches.keys().then(function(cacheNames) {
  return Promise.all(
    cacheNames.map(function(cacheName) {
      return caches.delete(cacheName);
    })
  );
});
```

3. **Configure Network-First for Dynamic Content**:
```javascript
// In sw.js
self.addEventListener('fetch', event => {
  // Network-first for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
});
```

---

## 📱 PWA & Mobile Issues

### PWA Installation Problems

**Problem**: "Install App" prompt doesn't appear or installation fails

**Symptoms**:
- No install banner on mobile
- "Add to Home Screen" not available
- PWA not behaving like native app

**Solutions**:

1. **Check PWA Requirements**:
```javascript
// Verify manifest.json is accessible
fetch('/manifest.json')
  .then(res => res.json())
  .then(manifest => console.log('✅ Manifest loaded:', manifest))
  .catch(err => console.error('❌ Manifest error:', err));

// Check service worker registration
navigator.serviceWorker.getRegistration()
  .then(reg => console.log('✅ SW registered:', reg))
  .catch(err => console.error('❌ SW error:', err));
```

2. **HTTPS Requirement**:
```bash
# PWAs require HTTPS in production
# Check certificate
curl -I https://your-domain.com

# Test locally (localhost works without HTTPS)
npm run dev
```

3. **Manifest.json Issues**:
```json
{
  "name": "Calorie Diary",
  "short_name": "CalorieDiary",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#007bff",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### Mobile Display Issues

**Problem**: App doesn't look or work correctly on mobile

**Symptoms**:
- Layout broken on small screens
- Buttons too small to tap
- Horizontal scrolling
- Keyboard issues with input fields

**Solutions**:

1. **Viewport Meta Tag**:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
```

2. **Touch Target Size**:
```css
/* Ensure buttons are at least 44px for touch */
.btn {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}

/* Fix input field zoom on iOS */
input, select, textarea {
  font-size: 16px;
}
```

3. **Test on Real Devices**:
```bash
# Use browser dev tools
# Chrome: F12 > Device Toolbar
# Firefox: F12 > Responsive Design Mode

# Test on actual devices when possible
# Use remote debugging for detailed investigation
```

---

## 🎨 UI & Display Issues

### Calendar Grid Layout Broken

**Problem**: Journal calendar doesn't display as proper grid

**Symptoms**:
- Days stacked vertically
- Irregular spacing
- Missing day numbers
- Calendar not responsive

**Solutions**:

1. **Check CSS Grid Classes**:
```html
<!-- Ensure proper Bootstrap grid structure -->
<div class="row">
  <div class="col"><!-- Day content --></div>
  <div class="col"><!-- Day content --></div>
  <!-- ... 7 columns total -->
</div>
```

2. **Verify JavaScript Grid Generation**:
```javascript
// Debug calendar generation
function generateCalendarGrid(year, month) {
  console.log('Generating calendar for:', year, month);
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  console.log('Days in month:', daysInMonth);
  console.log('First day of week:', firstDay.getDay());
  
  // Ensure 7-column grid structure
  const weeks = [];
  let currentWeek = new Array(7).fill(null);
  
  // Fill grid logic here...
}
```

3. **Bootstrap CSS Loading**:
```html
<!-- Verify Bootstrap CSS is loaded -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
```

### Date/Time Display Issues

**Problem**: Dates showing in wrong format or timezone

**Symptoms**:
- Dates in Indonesian instead of English
- Wrong timezone displayed
- Date format inconsistent

**Solutions**:

1. **Check Locale Settings**:
```javascript
// Verify locale configuration
const options = {
  timeZone: 'Asia/Jakarta',
  locale: 'en-US', // English language, US format
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

const date = new Date();
console.log('Formatted date:', date.toLocaleDateString('en-US', {
  timeZone: 'Asia/Jakarta'
}));
```

2. **Consistent Date Formatting**:
```javascript
// Create utility function for consistent formatting
function formatDate(date, format = 'long') {
  const options = {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: format === 'long' ? 'long' : 'short',
    day: 'numeric'
  };
  
  return new Date(date).toLocaleDateString('en-US', options);
}
```

---

## 🚀 Deployment Issues

### Environment Variables in Production

**Problem**: App works locally but fails in production

**Symptoms**:
- "undefined" errors for environment variables
- Authentication failures in production
- Features work in development but not deployed version

**Solutions**:

1. **Check Platform-Specific Variable Setting**:
```bash
# Heroku
heroku config:get GOOGLE_SHEET_ID

# Vercel
vercel env ls

# Railway
railway variables

# DigitalOcean
doctl apps spec get YOUR_APP_ID
```

2. **Debug Environment Loading**:
```javascript
// Add debug endpoint (remove in production)
app.get('/debug/env', (req, res) => {
  const safeEnv = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    hasGoogleSheetId: !!process.env.GOOGLE_SHEET_ID,
    hasGoogleClientEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
    hasGooglePrivateKey: !!process.env.GOOGLE_PRIVATE_KEY
  };
  res.json(safeEnv);
});
```

3. **Private Key Formatting in Production**:
```bash
# Many platforms require proper escaping
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...your-key...\n-----END PRIVATE KEY-----"

# Some platforms need double escaping
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIE...your-key...\\n-----END PRIVATE KEY-----"
```

### Docker Deployment Issues

**Problem**: Docker container fails in production

**Solutions**:

1. **Multi-stage Build Issues**:
```dockerfile
# Ensure proper file copying
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Verify files are copied
RUN ls -la /app
```

2. **Health Check Failures**:
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

---

## ⚡ Performance Issues

### Slow Page Load Times

**Problem**: App takes too long to load

**Symptoms**:
- Long initial page load
- Slow navigation between pages
- API calls timing out

**Solutions**:

1. **Optimize Asset Loading**:
```html
<!-- Preload critical resources -->
<link rel="preload" href="/css/app.css" as="style">
<link rel="preload" href="/js/app.js" as="script">

<!-- Use CDN for external libraries -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
```

2. **Implement Lazy Loading**:
```javascript
// Lazy load calendar data
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadCalendarData(entry.target.dataset.month);
    }
  });
});

document.querySelectorAll('.calendar-month').forEach(el => {
  observer.observe(el);
});
```

3. **Database Query Optimization**:
```javascript
// Batch API calls
async function loadDashboardData() {
  try {
    const [metrics, recentEntries, todaySummary] = await Promise.all([
      fetch('/api/personal-metrics').then(r => r.json()),
      fetch('/api/food-entries?limit=5').then(r => r.json()),
      fetch('/api/summary/today').then(r => r.json())
    ]);
    
    return { metrics, recentEntries, todaySummary };
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
}
```

### High Memory Usage

**Problem**: Server uses too much memory

**Solutions**:

1. **Implement Proper Caching**:
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ 
  stdTTL: 300, // 5 minutes
  maxKeys: 100 // Limit cache size
});
```

2. **Clean Up Event Listeners**:
```javascript
// Proper cleanup in components
function cleanup() {
  document.removeEventListener('click', handleClick);
  clearInterval(refreshInterval);
}

window.addEventListener('beforeunload', cleanup);
```

## 📞 Getting Additional Help

### Enable Debug Logging

```javascript
// Set environment variable for detailed logs
DEBUG=calorie-diary:* npm start

// Or in code
const debug = require('debug')('calorie-diary:main');
debug('Application starting...');
```

### Collect System Information

```bash
# System info for bug reports
node --version
npm --version
docker --version
uname -a

# Application info
npm list --depth=0
```

### Contact Support

When reporting issues, include:
1. **Error messages**: Full error text and stack traces
2. **Steps to reproduce**: Exact steps that cause the issue
3. **Environment**: Browser, OS, Node.js version
4. **Configuration**: Sanitized environment variables (no secrets)
5. **Logs**: Relevant application logs

---

**Still having issues? Check the deployment guide or technical architecture documentation for additional context! 🛠️**