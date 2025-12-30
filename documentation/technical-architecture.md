# Technical Architecture - Calorie Diary Web Application

## 🏗️ System Overview

The Calorie Diary application is a modern, full-stack Progressive Web Application (PWA) that combines the power of Google Sheets for data storage with a sophisticated Node.js web interface. The system provides real-time nutrition tracking with scientific calorie calculations and offline capabilities.

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client PWA    │────│  Express Server │────│  Google Sheets  │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌─────────┐              ┌─────────┐          ┌─────────────┐
    │Service  │              │ Google  │          │ Apps Script │
    │Worker   │              │Sheets   │          │ (Triggers)  │
    │(Cache)  │              │API      │          │             │
    └─────────┘              └─────────┘          └─────────────┘
```

## 🔧 Technology Stack

### Frontend Technologies

**Core Framework**
- **Bootstrap 5.3**: Responsive CSS framework with modern components
- **EJS Templating**: Server-side rendering with dynamic content
- **Progressive Web App**: Offline capabilities with service worker
- **JavaScript ES6+**: Modern client-side interactions

**UI Components**
- **Bootstrap Icons**: Consistent iconography throughout app
- **Custom CSS**: Application-specific styling and theming
- **Responsive Grid**: Mobile-first design approach
- **Accessible Components**: WCAG compliant interface elements

### Backend Technologies

**Server Framework**
- **Node.js 18+**: JavaScript runtime environment
- **Express.js 4.x**: Web application framework
- **EJS**: Embedded JavaScript templates for server-side rendering
- **Body Parser**: Request parsing middleware

**Data Integration**
- **Google Sheets API v4**: Primary data storage and retrieval
- **Google Apps Script**: Server-side automation and calculations
- **Service Account Authentication**: Secure API access

### Infrastructure & DevOps

**Containerization**
- **Docker**: Application containerization
- **Docker Compose**: Multi-container orchestration
- **Environment Variables**: Configuration management

**Deployment Options**
- **Local Development**: Node.js with hot reload
- **Docker Deployment**: Container-based deployment
- **Cloud Ready**: Supports various cloud platforms

## 📁 Project Structure

```
calory-diary/
├── documentation/          # Project documentation
│   ├── README.md          # Main project overview
│   ├── user-guide.md      # End-user documentation
│   ├── technical-architecture.md
│   ├── deployment-guide.md
│   └── troubleshooting.md
├── scripts/               # Google Apps Script files
│   ├── CaloryDiaryAutomation_v1.gs
│   └── CaloryDiaryAutomation_v2.gs
├── src/                   # Application source code
│   ├── controllers/       # Route controllers
│   ├── services/          # Business logic services
│   ├── middleware/        # Express middleware
│   └── utils/             # Utility functions
├── public/                # Static assets
│   ├── css/              # Custom stylesheets
│   ├── js/               # Client-side JavaScript
│   ├── icons/            # PWA icons
│   └── manifest.json     # PWA manifest
├── views/                 # EJS templates
│   ├── pages/            # Main page templates
│   ├── components/       # Reusable components
│   └── layouts/          # Layout templates
├── config/                # Configuration files
│   ├── googleSheets.js   # Google Sheets API config
│   └── database.js       # Data connection setup
├── docker-compose.yml     # Container orchestration
├── Dockerfile            # Container definition
├── package.json          # Dependencies and scripts
├── .env.example          # Environment template
└── server.js             # Application entry point
```

## 🔄 Data Flow Architecture

### Request-Response Cycle

```
1. User Action (Browser)
   ↓
2. Express Route Handler
   ↓
3. Service Layer (Business Logic)
   ↓
4. Google Sheets API Call
   ↓
5. Apps Script Trigger (if needed)
   ↓
6. Data Transformation
   ↓
7. Template Rendering (EJS)
   ↓
8. Response to Client
   ↓
9. Service Worker Cache (if applicable)
```

### Data Synchronization Flow

```
Web App Entry → Google Sheets API → Spreadsheet Update
     ↓                ↓                    ↓
Service Worker → Apps Script → Calculation Trigger
     ↓              ↓                     ↓
Local Cache ← Response ← Updated Data ← BMR/TDEE Calc
```

## 🎛️ Core Services

### GoogleSheetsService

**Purpose**: Centralized Google Sheets API integration
**Location**: `/src/services/googleSheets.js`

**Key Methods**:
- `authenticateSheets()`: Service account authentication
- `getPersonalMetrics()`: Retrieve user settings
- `addFoodEntry(entry)`: Add new food log entry
- `getFoodEntries(filters)`: Retrieve food logs with filtering
- `updatePersonalMetrics(metrics)`: Update user settings
- `refreshCalculations()`: Trigger Apps Script calculations

**Authentication Flow**:
```javascript
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
```

### CalculationService

**Purpose**: Scientific nutrition calculations
**Location**: Integrated within Google Apps Script

**Formulas Used**:
- **BMR (Basal Metabolic Rate)**: Mifflin-St Jeor Equation
  - Men: (10 × weight) + (6.25 × height) - (5 × age) + 5
  - Women: (10 × weight) + (6.25 × height) - (5 × age) - 161
- **TDEE (Total Daily Energy Expenditure)**: BMR × Activity Factor
- **Daily Goal**: TDEE ± Goal Modifier (-500/0/+500 calories)

### CacheService (Service Worker)

**Purpose**: PWA caching strategy and offline support
**Location**: `/public/sw.js`

**Caching Strategies**:
- **Cache First**: Static assets (CSS, JS, images)
- **Network First**: Dynamic content (API responses)
- **Stale While Revalidate**: Semi-dynamic content

```javascript
// Network-first strategy for dynamic content
if (request.url.includes('/api/') || request.url.includes('/?refresh=')) {
  return fetch(request)
    .then(response => {
      const responseClone = response.clone();
      caches.open(CACHE_NAME)
        .then(cache => cache.put(request, responseClone));
      return response;
    })
    .catch(() => caches.match(request));
}
```

## 🗃️ Database Schema (Google Sheets)

### Personal Metrics Sheet
```
| Column | Type   | Description                    |
|--------|--------|--------------------------------|
| A      | Text   | Setting Name                   |
| B      | Text   | Setting Value                  |
| C      | Text   | Data Type                      |
| D      | Text   | Description                    |
```

### Food Entries Sheet
```
| Column | Type     | Description                    |
|--------|----------|--------------------------------|
| A      | Date     | Entry Date                     |
| B      | Time     | Entry Time                     |
| C      | Text     | Meal Type                      |
| D      | Text     | Food Description               |
| E      | Number   | Calories                       |
| F      | Date     | Created Timestamp              |
| G      | Text     | Entry ID                       |
```

### Daily Summary Sheet (Auto-calculated)
```
| Column | Type     | Description                    |
|--------|----------|--------------------------------|
| A      | Date     | Summary Date                   |
| B      | Number   | Total Calories Consumed        |
| C      | Number   | Daily Calorie Goal             |
| D      | Number   | Remaining/Over Calories        |
| E      | Text     | Status (Under/Over Goal)       |
| F      | Number   | Goal Achievement Percentage    |
```

## 🔐 Security Architecture

### API Authentication

**Google Service Account**:
- Private key authentication for Google Sheets API
- Scoped permissions limited to spreadsheet access
- No user OAuth required for backend operations

**Environment Variable Security**:
```bash
# Never commit these to version control
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_CLIENT_EMAIL="service-account@project.iam.gserviceaccount.com"
GOOGLE_SHEET_ID="1abc123def456ghi789..."
```

### Data Validation

**Input Sanitization**:
- Client-side validation for user experience
- Server-side validation for security
- Type checking and range validation

**Example Validation**:
```javascript
function validateFoodEntry(entry) {
  const errors = [];
  
  if (!entry.description || entry.description.trim().length < 3) {
    errors.push('Description must be at least 3 characters');
  }
  
  if (!entry.calories || entry.calories < 0 || entry.calories > 5000) {
    errors.push('Calories must be between 0 and 5000');
  }
  
  return { isValid: errors.length === 0, errors };
}
```

## 📊 Performance Optimization

### Caching Strategy

**Service Worker Layers**:
1. **Static Cache**: CSS, JS, fonts, images (Cache First)
2. **Dynamic Cache**: API responses, page content (Network First)
3. **Runtime Cache**: User-specific data (Stale While Revalidate)

**Cache Invalidation**:
- Version-based cache keys
- Explicit cache clearing on deployment
- Time-based expiration for dynamic content

### Database Optimization

**Google Sheets Performance**:
- Batch API requests where possible
- Use filters to limit data retrieval
- Cache frequently accessed data
- Implement data pagination for large datasets

**Query Optimization**:
```javascript
// Efficient date range query
const range = `'Food Entries'!A:G`;
const response = await sheets.spreadsheets.values.get({
  spreadsheetId: SHEET_ID,
  range: range,
  majorDimension: 'ROWS',
  valueRenderOption: 'FORMATTED_VALUE',
  dateTimeRenderOption: 'FORMATTED_STRING'
});
```

## 🔌 API Architecture

### RESTful Endpoints

```javascript
// Authentication endpoints
GET  /auth/status              // Check auth status

// Data management endpoints
GET  /api/personal-metrics     // Get user settings
PUT  /api/personal-metrics     // Update user settings
GET  /api/food-entries         // Get food entries (with filters)
POST /api/food-entries         // Add new food entry
PUT  /api/food-entries/:id     // Update food entry
DELETE /api/food-entries/:id   // Delete food entry

// Journal/Calendar endpoints
GET  /api/journal/calendar     // Get monthly calendar data
GET  /api/journal/date/:date   // Get entries for specific date

// Summary endpoints
GET  /api/summary/daily        // Get daily summaries
GET  /api/summary/weekly       // Get weekly aggregations
GET  /api/summary/monthly      // Get monthly aggregations

// Utility endpoints
POST /api/refresh              // Trigger calculation refresh
GET  /api/health               // Health check endpoint
```

### Request/Response Format

**Standard Response Structure**:
```json
{
  "success": true,
  "data": {
    "entries": [...],
    "pagination": {...},
    "summary": {...}
  },
  "message": "Request completed successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response Structure**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "calories",
      "issue": "Must be a positive number"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🧪 Testing Architecture

### Testing Strategy

**Unit Tests**: Individual function testing
- Service layer methods
- Utility functions
- Calculation algorithms

**Integration Tests**: API endpoint testing
- Request/response validation
- Database interaction tests
- Authentication flow tests

**End-to-End Tests**: Complete user flow testing
- Food entry creation workflow
- Calendar navigation and display
- PWA installation and offline features

### Test Configuration

```javascript
// Jest configuration example
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**/*.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## 🔄 Development Workflow

### Local Development Setup

1. **Environment Setup**:
   ```bash
   cp .env.example .env
   npm install
   ```

2. **Development Server**:
   ```bash
   npm run dev    # Hot reload development
   npm start      # Production mode
   ```

3. **Code Quality**:
   ```bash
   npm run lint   # ESLint checking
   npm run format # Prettier formatting
   npm test       # Run test suite
   ```

### Git Workflow

**Branch Strategy**:
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature development
- `hotfix/*`: Critical production fixes

**Commit Convention**:
```
type(scope): description

Examples:
feat(journal): add monthly calendar view
fix(api): resolve authentication timeout
docs(readme): update deployment instructions
```

### Deployment Pipeline

1. **Development**: Local testing and development
2. **Staging**: Integration testing environment
3. **Production**: Live application deployment

**Automated Checks**:
- Code linting and formatting
- Unit and integration tests
- Security vulnerability scanning
- Performance monitoring setup

## 🏗️ Scalability Considerations

### Horizontal Scaling

**Load Balancing**: Multiple Node.js instances
**Session Management**: Stateless design with external session storage
**CDN Integration**: Static asset delivery optimization

### Database Scaling

**Google Sheets Limitations**:
- 10 million cells per spreadsheet
- 5 million cells per sheet
- 18,278 columns per sheet

**Migration Path**: 
When limits approached, consider migration to:
- Google Cloud Firestore
- PostgreSQL with Google Cloud SQL
- MongoDB Atlas

### Performance Monitoring

**Metrics to Track**:
- Response time per endpoint
- Google Sheets API quota usage
- Service Worker cache hit rates
- User engagement analytics
- Error rates and types

## 🔮 Future Architecture Enhancements

### Planned Improvements

1. **Microservices Migration**: Split into smaller, focused services
2. **Real-time Updates**: WebSocket integration for live data sync
3. **Advanced Analytics**: Machine learning for nutrition insights
4. **Multi-user Support**: Team and family account features
5. **Third-party Integrations**: Fitness tracker and food database APIs

### Technology Upgrades

- **Frontend**: Consider React/Vue.js for complex interactions
- **Database**: Evaluate dedicated database migration
- **Authentication**: Implement OAuth for multi-user support
- **Analytics**: Integration with Google Analytics or custom solution

---

This technical architecture provides a solid foundation for a modern, scalable nutrition tracking application while maintaining simplicity and ease of maintenance.