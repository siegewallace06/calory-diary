# 🍎 Calorie Diary - Smart Nutrition Tracking Web Application

A modern, full-featured Progressive Web Application (PWA) for intelligent calorie tracking that combines the power of Google Sheets data management with a beautiful, responsive web interface. Track your nutrition scientifically with real-time calculations, offline capabilities, and mobile-optimized design.

## 🌟 Key Features

### 📊 Smart Web Dashboard
- **Real-time Progress Tracking**: Live calorie consumption vs. daily goals
- **Interactive Calendar Journal**: Monthly view with daily nutrition breakdowns
- **Responsive Design**: Perfect on desktop, tablet, and mobile devices
- **Progressive Web App**: Install on your device for native app experience
- **Offline Capabilities**: View cached data and sync when connection returns

### 🧮 Scientific Calculations
- **Mifflin-St Jeor Equation**: Gold-standard BMR calculation accuracy
- **Personalized Daily Goals**: Based on your metrics, activity level, and goals
- **Real-time Updates**: Instant recalculation as you log food or update settings
- **Goal Flexibility**: Weight loss (-500 cal), maintenance, or weight gain (+500 cal)

### 🍽️ Comprehensive Food Logging
- **Intuitive Web Interface**: Easy food entry with smart forms
- **Meal Categorization**: Breakfast, lunch, dinner, snacks, and drinks
- **Daily Summaries**: Automatic calculation of total calories consumed
- **Historical Tracking**: Complete nutrition history with search and filtering
- **Mobile-Optimized**: Touch-friendly interface for on-the-go logging

### ☁️ Google Sheets Integration
- **Seamless Data Sync**: Real-time synchronization with Google Sheets
- **Automatic Backup**: Your data is safely stored in Google Drive
- **Collaborative Access**: Share with nutritionist, trainer, or family members
- **Data Ownership**: Your data stays in your Google account
- **Export Ready**: Download data anytime in multiple formats

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client PWA    │────│  Express Server │────│  Google Sheets  │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
    ┌─────────┐              ┌─────────┐          ┌─────────────┐
    │Service  │              │ Google  │          │ Apps Script │
    │Worker   │              │Sheets   │          │ (Triggers)  │
    │(Cache)  │              │API      │          │             │
    └─────────┘              └─────────┘          └─────────────┘
```

### Technology Stack
- **Frontend**: Bootstrap 5, EJS Templates, Progressive Web App
- **Backend**: Node.js, Express.js, Google Sheets API v4
- **Database**: Google Sheets with Apps Script automation
- **Deployment**: Docker, Docker Compose, Cloud-ready
- **Mobile**: PWA with service worker for offline support

## 🚀 Quick Start

### Option 1: Docker Deployment (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/calorie-diary.git
cd calorie-diary

# Configure environment
cp .env.example .env
# Edit .env with your Google Cloud and Sheets configuration

# Deploy with Docker
docker-compose up -d

# Access at http://localhost:3000
```

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your Google Cloud service account credentials

# Start development server
npm run dev

# Access at http://localhost:3000
```

### Option 3: Cloud Deployment

Deploy to your preferred cloud platform:
- **Google Cloud Run**: `gcloud run deploy`
- **Heroku**: `git push heroku main`
- **DigitalOcean**: App Platform deployment
- **AWS**: Elastic Beanstalk or ECS

See [Deployment Guide](documentation/deployment-guide.md) for detailed instructions.

## 📋 Setup Requirements

### Google Cloud Configuration

1. **Create Service Account**:
   ```bash
   # In Google Cloud Console
   # IAM & Admin > Service Accounts > Create Service Account
   # Download JSON key file
   ```

2. **Enable APIs**:
   ```bash
   gcloud services enable sheets.googleapis.com
   gcloud services enable script.googleapis.com
   ```

3. **Configure Environment Variables**:
   ```bash
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   GOOGLE_CLIENT_EMAIL="service-account@project.iam.gserviceaccount.com"
   GOOGLE_SHEET_ID="1ABC123DEF456GHI789"
   GOOGLE_SCRIPT_WEB_APP_URL="https://script.google.com/macros/s/.../exec"
   ```

### Google Sheets Setup

1. **Create Spreadsheet**: New Google Sheets document
2. **Share with Service Account**: Add service account email as Editor
3. **Deploy Apps Script**: Use `CaloryDiaryAutomation_v2.gs` for automation
4. **Configure Web App**: Deploy Apps Script as web app for calculations

## 💻 Application Interface

### 🏠 Dashboard
- **Today's Progress**: Calories consumed vs. daily goal
- **Visual Progress Bar**: Instant feedback on goal achievement
- **Personal Metrics Panel**: Current settings and calculated targets
- **Recent Entries**: Last 5 food logs with quick access
- **Quick Actions**: Add entry, refresh data, view journal

### 📚 Interactive Journal
- **Monthly Calendar**: Bird's-eye view of nutrition patterns
- **Color-Coded Days**: Green (under goal) vs. Red (over goal)
- **Daily Detail Modal**: Complete food list for any day
- **Navigation Controls**: Previous/next month, jump to today
- **Responsive Grid**: Works perfectly on all screen sizes

### 📝 Food Entry System
- **Smart Forms**: Intuitive food logging interface
- **Meal Type Selection**: Breakfast, lunch, dinner, snack, drink
- **Date/Time Tracking**: When and what you ate
- **Instant Validation**: Real-time form validation and feedback
- **Mobile Optimized**: Touch-friendly for on-the-go logging

### ⚙️ Settings Management
- **Personal Metrics**: Weight, height, age, gender, activity level
- **Goal Selection**: Weight loss, maintenance, or weight gain
- **Real-time Preview**: See how changes affect your daily calorie target
- **Data Validation**: Ensures all inputs are valid and realistic

## 📱 Progressive Web App Features

### Mobile Experience
- **Install Prompt**: Add to home screen on mobile devices
- **Offline Support**: View cached data without internet
- **Background Sync**: Sync data when connection returns
- **Native Feel**: App-like experience with smooth transitions

### Performance Optimizations
- **Service Worker Caching**: Fast loading of static assets
- **Network-First Strategy**: Always fresh data for nutrition tracking
- **Lazy Loading**: Efficient loading of calendar data
- **Compression**: Optimized asset delivery

## 📊 Scientific Foundation

### BMR Calculation (Mifflin-St Jeor Equation)
- **Men**: BMR = (10 × weight kg) + (6.25 × height cm) - (5 × age) + 5
- **Women**: BMR = (10 × weight kg) + (6.25 × height cm) - (5 × age) - 161

### TDEE and Goal Calculation
- **TDEE**: BMR × Activity Factor (1.2 - 1.9)
- **Weight Loss**: TDEE - 500 calories (≈0.5kg/week)
- **Maintenance**: TDEE exactly
- **Weight Gain**: TDEE + 500 calories (≈0.5kg/week)

### Activity Level Multipliers
- **1.2**: Sedentary (desk job, minimal exercise)
- **1.375**: Light (light exercise 1-3 days/week)
- **1.55**: Moderate (moderate exercise 3-5 days/week)
- **1.725**: Very Active (intense exercise 6-7 days/week)
- **1.9**: Extremely Active (very intense exercise, physical job)

## 📁 Project Structure

```
calory-diary/
├── documentation/                 # Comprehensive guides
│   ├── user-guide.md             # End-user documentation
│   ├── technical-architecture.md # System architecture
│   ├── deployment-guide.md       # Deployment instructions
│   └── troubleshooting.md        # Issue resolution
├── scripts/                      # Google Apps Script
│   ├── CaloryDiaryAutomation_v1.gs
│   └── CaloryDiaryAutomation_v2.gs # Current version
├── src/                          # Application source
│   ├── services/                 # Business logic
│   ├── controllers/              # Route handlers
│   └── middleware/               # Express middleware
├── public/                       # Static assets
│   ├── css/                      # Stylesheets
│   ├── js/                       # Client-side JavaScript
│   ├── icons/                    # PWA icons
│   └── manifest.json             # PWA manifest
├── views/                        # EJS templates
│   ├── pages/                    # Main pages
│   └── components/               # Reusable components
├── docker-compose.yml            # Container orchestration
├── Dockerfile                    # Container definition
└── server.js                     # Application entry point
```

## 🎯 API Endpoints

### Core Data APIs
```javascript
GET  /api/personal-metrics        // User settings
PUT  /api/personal-metrics        // Update settings
GET  /api/food-entries           // Food logs (filterable)
POST /api/food-entries           // Add new entry
GET  /api/journal/calendar       // Monthly calendar data
GET  /api/journal/date/:date     // Daily entries
POST /api/refresh                // Trigger calculations
```

### Web Interface Routes
```javascript
GET  /                           // Dashboard
GET  /journal                    // Calendar interface
GET  /log                        // Food entry form
GET  /summary                    // Historical data
GET  /settings                   // Personal metrics
```

## 🛠️ Development Workflow

### Local Development
```bash
# Start development server with hot reload
npm run dev

# Run tests
npm test

# Check code quality
npm run lint
npm run format

# Build for production
npm run build
```

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
git commit -m "feat(scope): description"
git push origin feature/new-feature

# Create pull request for review
```

### Docker Development
```bash
# Build and test locally
docker-compose -f docker-compose.dev.yml up

# Production deployment
docker-compose up -d

# View logs
docker-compose logs -f calorie-diary
```

## 📚 Documentation

Comprehensive documentation is available in the `/documentation` folder:

- **[User Guide](documentation/user-guide.md)**: Complete end-user documentation
- **[Technical Architecture](documentation/technical-architecture.md)**: System design and components
- **[Deployment Guide](documentation/deployment-guide.md)**: Setup and deployment instructions
- **[Troubleshooting](documentation/troubleshooting.md)**: Common issues and solutions

## 🔒 Security & Privacy

### Data Security
- **Google Service Account**: Secure API authentication
- **Environment Variables**: Sensitive data protection
- **HTTPS Enforced**: Encrypted data transmission
- **Data Ownership**: Your data stays in your Google account

### Privacy Features
- **Local Processing**: Calculations performed locally when possible
- **No Tracking**: No analytics or tracking cookies
- **Offline Capable**: Works without constant internet connection
- **Export Ready**: Download your data anytime

## 🤝 Contributing

We welcome contributions to improve the Calorie Diary application:

### Development Setup
```bash
git clone https://github.com/your-username/calorie-diary.git
cd calorie-diary
npm install
cp .env.example .env
npm run dev
```

### Contribution Guidelines
- **Feature Requests**: Open an issue to discuss new features
- **Bug Reports**: Include steps to reproduce and system information
- **Code Contributions**: Follow coding standards and include tests
- **Documentation**: Help improve guides and API documentation

### Code Standards
- **ESLint**: Code linting for consistency
- **Prettier**: Code formatting
- **Jest**: Unit and integration testing
- **Conventional Commits**: Structured commit messages

## 📄 License

This project is open source and available under the MIT License. Feel free to use, modify, and distribute according to the license terms.

## 🆘 Support & Help

### Getting Started
1. **Quick Setup**: Follow the Quick Start guide above
2. **Detailed Setup**: Read the [Deployment Guide](documentation/deployment-guide.md)
3. **User Manual**: Check the [User Guide](documentation/user-guide.md)
4. **Issues**: See [Troubleshooting](documentation/troubleshooting.md)

### Community
- **Issues**: GitHub Issues for bug reports and feature requests
- **Discussions**: GitHub Discussions for questions and ideas
- **Documentation**: Comprehensive guides in the documentation folder

---

**🚀 Ready to start your scientific nutrition journey? Deploy the app and begin tracking your health goals with precision and style!** 🍎📊