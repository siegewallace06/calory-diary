const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const GoogleSheetsService = require('./services/googleSheets');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Google Sheets service
const sheetsService = new GoogleSheetsService();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes

// PWA Routes
app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

// Home page - Dashboard view
app.get('/', async (req, res) => {
    try {
        const dashboard = await sheetsService.getDashboardData();
        const recentEntries = await sheetsService.getLogEntries(5);

        res.render('dashboard', {
            dashboard,
            recentEntries,
            error: null
        });
    } catch (error) {
        res.render('dashboard', {
            dashboard: null,
            recentEntries: [],
            error: error.message
        });
    }
});

// Log entry form page
app.get('/log', (req, res) => {
    res.render('log', { error: null, success: null });
});

// Add new log entry
app.post('/api/log', async (req, res) => {
    try {
        const { date, time, mealType, description, calories } = req.body;

        // Validate required fields
        if (!date || !mealType || !description || !calories) {
            return res.status(400).json({
                error: 'Missing required fields: date, mealType, description, calories'
            });
        }

        const result = await sheetsService.addLogEntry(date, time, mealType, description, calories);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get recent log entries
app.get('/api/log', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const entries = await sheetsService.getLogEntries(limit);
        res.json({ success: true, data: entries });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Daily summary page
app.get('/summary', async (req, res) => {
    try {
        const summaries = await sheetsService.getDailySummary(30);
        res.render('summary', { summaries, error: null });
    } catch (error) {
        res.render('summary', { summaries: [], error: error.message });
    }
});

// Get daily summary data
app.get('/api/summary', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 30;
        const summaries = await sheetsService.getDailySummary(limit);
        res.json({ success: true, data: summaries });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get dashboard data
app.get('/api/dashboard', async (req, res) => {
    try {
        const dashboard = await sheetsService.getDashboardData();
        res.json({ success: true, data: dashboard });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Settings page
app.get('/settings', async (req, res) => {
    try {
        const dashboard = await sheetsService.getDashboardData();
        res.render('settings', {
            personal: dashboard.personal,
            error: null,
            success: null
        });
    } catch (error) {
        res.render('settings', {
            personal: {},
            error: error.message,
            success: null
        });
    }
});

// Update personal metrics
app.post('/api/settings', async (req, res) => {
    try {
        const metrics = req.body;
        const result = await sheetsService.updatePersonalMetrics(metrics);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Refresh calculations
app.post('/api/refresh', async (req, res) => {
    try {
        const result = await sheetsService.refreshCalculations();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update dashboard to today's date
app.post('/api/update-dashboard-date', async (req, res) => {
    try {
        const result = await sheetsService.updateDashboardDate();
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error updating dashboard date:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        spreadsheetId: process.env.SPREADSHEET_ID ? 'configured' : 'missing'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        error: 'Page not found',
        message: 'The page you are looking for does not exist.'
    });
});

// Start server
async function startServer() {
    try {
        await sheetsService.initialize();

        app.listen(PORT, () => {
            console.log(`🚀 Calorie Diary Web App running on port ${PORT}`);
            console.log(`📊 Dashboard: http://localhost:${PORT}`);
            console.log(`📝 Add Entry: http://localhost:${PORT}/log`);
            console.log(`📈 Summary: http://localhost:${PORT}/summary`);
            console.log(`⚙️  Settings: http://localhost:${PORT}/settings`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();