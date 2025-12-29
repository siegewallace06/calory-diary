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

// Middleware to disable caching for dynamic content
// Source - https://stackoverflow.com/a/40277517
// Posted by XCEPTION
// Retrieved 2025-12-29, License - CC BY-SA 3.0
const disableCache = (req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
};

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
app.get('/', disableCache, async (req, res) => {
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
app.get('/log', disableCache, (req, res) => {
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
app.get('/api/log', disableCache, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const entries = await sheetsService.getLogEntries(limit);
        res.json({ success: true, data: entries });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Daily summary page
app.get('/summary', disableCache, async (req, res) => {
    try {
        const summaries = await sheetsService.getDailySummary(30);
        res.render('summary', { summaries, error: null });
    } catch (error) {
        res.render('summary', { summaries: [], error: error.message });
    }
});

// Get daily summary data
app.get('/api/summary', disableCache, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 30;
        const summaries = await sheetsService.getDailySummary(limit);
        res.json({ success: true, data: summaries });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get calendar data for journal (monthly view)
app.get('/api/journal/calendar', disableCache, async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const month = parseInt(req.query.month); // 0-11

        // Get daily summaries for the entire month
        const summaries = await sheetsService.getDailySummary(365); // Get more data to cover the month

        // Filter and format for calendar
        const calendarData = {};
        summaries.forEach(summary => {
            const date = new Date(summary.date);
            if (month !== undefined) {
                if (date.getFullYear() === year && date.getMonth() === month) {
                    const day = date.getDate();
                    calendarData[day] = {
                        totalCalories: summary.totalIn,
                        maxCalories: summary.maxLimit,
                        status: summary.status,
                        isOver: summary.totalIn > summary.maxLimit
                    };
                }
            } else {
                // Return all data if no month specified
                const dateKey = date.toISOString().split('T')[0];
                calendarData[dateKey] = {
                    totalCalories: summary.totalIn,
                    maxCalories: summary.maxLimit,
                    status: summary.status,
                    isOver: summary.totalIn > summary.maxLimit
                };
            }
        });

        res.json({ success: true, data: calendarData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get detailed entries for a specific date
app.get('/api/journal/date/:date', disableCache, async (req, res) => {
    try {
        const targetDate = req.params.date; // YYYY-MM-DD format

        // Get all log entries
        const allEntries = await sheetsService.getLogEntries(1000);

        // Filter entries for the specific date
        const dateEntries = allEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            const targetDateObj = new Date(targetDate);
            return entryDate.toDateString() === targetDateObj.toDateString();
        });

        // Get daily summary for this date
        const summaries = await sheetsService.getDailySummary(365);
        const dateSummary = summaries.find(summary => {
            const summaryDate = new Date(summary.date);
            const targetDateObj = new Date(targetDate);
            return summaryDate.toDateString() === targetDateObj.toDateString();
        });

        res.json({
            success: true,
            data: {
                entries: dateEntries,
                summary: dateSummary || null,
                date: targetDate
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get dashboard data
app.get('/api/dashboard', disableCache, async (req, res) => {
    try {
        const dashboard = await sheetsService.getDashboardData();
        res.json({ success: true, data: dashboard });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Settings page
app.get('/settings', disableCache, async (req, res) => {
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
// Journal page
app.get('/journal', disableCache, async (req, res) => {
    try {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        res.render('journal', {
            currentMonth,
            currentYear,
            error: null
        });
    } catch (error) {
        res.render('journal', {
            currentMonth: new Date().getMonth(),
            currentYear: new Date().getFullYear(),
            error: error.message
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