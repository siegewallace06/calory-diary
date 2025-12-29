const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

class GoogleSheetsService {
    constructor() {
        this.spreadsheetId = process.env.SPREADSHEET_ID;
        this.credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH;
        this.sheets = null;
        this.auth = null;
    }

    async initialize() {
        try {
            // Check if we have local credentials file or should use default auth (Cloud Run)
            if (this.credentialsPath && fs.existsSync(this.credentialsPath)) {
                // Local development - use service account JSON file
                console.log('Using local service account credentials');
                const credentials = JSON.parse(fs.readFileSync(this.credentialsPath, 'utf8'));

                this.auth = new google.auth.JWT(
                    credentials.client_email,
                    null,
                    credentials.private_key,
                    ['https://www.googleapis.com/auth/spreadsheets']
                );

                await this.auth.authorize();
            } else {
                // Cloud deployment - use default authentication (attached service account)
                console.log('Using default Google Cloud authentication');
                this.auth = new google.auth.GoogleAuth({
                    scopes: ['https://www.googleapis.com/auth/spreadsheets']
                });
            }

            this.sheets = google.sheets({ version: 'v4', auth: this.auth });

            console.log('Google Sheets API initialized successfully');
        } catch (error) {
            console.error('Error initializing Google Sheets API:', error.message);
            throw error;
        }
    }

    async addLogEntry(date, time, mealType, description, calories) {
        try {
            const values = [[date, time, mealType, description, calories]];

            const response = await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: `${process.env.LOG_SHEET_NAME}!A:E`,
                valueInputOption: 'USER_ENTERED',
                resource: { values }
            });

            // Trigger calculation refresh after adding entry (API calls don't trigger onEdit)
            try {
                await this.refreshCalculations();
                console.log('Log entry added and calculations refreshed successfully');
            } catch (refreshError) {
                console.log('Log entry added but calculation refresh failed:', refreshError.message);
            }

            return response.data;
        } catch (error) {
            console.error('Error adding log entry:', error.message);
            throw error;
        }
    }

    async getLogEntries(limit = 50) {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${process.env.LOG_SHEET_NAME}!A:E`,
            });

            const rows = response.data.values;
            if (!rows || rows.length === 0) {
                return [];
            }

            // Skip header row and return recent entries
            const entries = rows.slice(1).slice(-limit).map(row => ({
                date: row[0] || '',
                time: row[1] || '',
                mealType: row[2] || '',
                description: row[3] || '',
                calories: row[4] || '0'
            }));

            return entries.reverse(); // Most recent first
        } catch (error) {
            console.error('Error getting log entries:', error.message);
            throw error;
        }
    }

    async getDashboardData() {
        try {
            // Get dashboard data from specific cells
            const response = await this.sheets.spreadsheets.values.batchGet({
                spreadsheetId: this.spreadsheetId,
                ranges: [
                    `${process.env.DASHBOARD_SHEET_NAME}!A2:D2`, // Today's tracking data
                    `${process.env.DASHBOARD_SHEET_NAME}!H2:H8`  // Personal parameters
                ]
            });

            const [todayData, personalData] = response.data.valueRanges;

            const dashboard = {
                today: {
                    date: todayData.values?.[0]?.[0] || new Date().toISOString().split('T')[0],
                    totalIn: todayData.values?.[0]?.[1] || 0,
                    maxLimit: todayData.values?.[0]?.[2] || 0,
                    status: todayData.values?.[0]?.[3] || 'No data'
                },
                personal: {
                    gender: personalData.values?.[0]?.[0] || '',
                    weight: personalData.values?.[1]?.[0] || '',
                    height: personalData.values?.[2]?.[0] || '',
                    age: personalData.values?.[3]?.[0] || '',
                    activityLevel: personalData.values?.[4]?.[0] || '',
                    goalOffset: personalData.values?.[5]?.[0] || '',
                    dailyGoal: personalData.values?.[6]?.[0] || 0
                }
            };

            return dashboard;
        } catch (error) {
            console.error('Error getting dashboard data:', error.message);
            throw error;
        }
    }

    async getDailySummary(limit = 30) {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${process.env.DAILY_SUMMARY_SHEET_NAME}!A:D`,
            });

            const rows = response.data.values;
            if (!rows || rows.length === 0) {
                return [];
            }

            // Skip header row and return recent summaries
            const summaries = rows.slice(1).slice(-limit).map(row => ({
                date: row[0] || '',
                totalIn: row[1] || 0,
                maxLimit: row[2] || 0,
                status: row[3] || ''
            }));

            return summaries.reverse(); // Most recent first
        } catch (error) {
            console.error('Error getting daily summary:', error.message);
            throw error;
        }
    }

    async updatePersonalMetrics(metrics) {
        try {
            const values = [
                [metrics.gender],
                [metrics.weight],
                [metrics.height],
                [metrics.age],
                [metrics.activityLevel],
                [metrics.goalOffset]
            ];

            const response = await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${process.env.DASHBOARD_SHEET_NAME}!H2:H7`,
                valueInputOption: 'USER_ENTERED',
                resource: { values }
            });

            // Trigger calculation refresh after updating metrics (API calls don't trigger onEdit)
            try {
                await this.refreshCalculations();
                console.log('Personal metrics updated and calculations refreshed successfully');
            } catch (refreshError) {
                console.log('Personal metrics updated but calculation refresh failed:', refreshError.message);
            }

            return response.data;
        } catch (error) {
            console.error('Error updating personal metrics:', error.message);
            throw error;
        }
    }

    async refreshCalculations() {
        // Manual refresh - update a dummy cell to trigger onEdit
        try {
            const timestamp = new Date().getTime();
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${process.env.LOG_SHEET_NAME}!F1`, // Use an unused cell
                valueInputOption: 'USER_ENTERED',
                resource: { values: [[`Refresh ${timestamp}`]] }
            });

            // Clear the dummy cell
            await this.sheets.spreadsheets.values.clear({
                spreadsheetId: this.spreadsheetId,
                range: `${process.env.LOG_SHEET_NAME}!F1`
            });

            return { success: true, message: 'Manual refresh triggered via onEdit' };
        } catch (error) {
            console.error('Error triggering manual refresh:', error.message);
            throw error;
        }
    }

    async updateDashboardDate() {
        try {
            // Update A2 in Dashboard sheet directly to today's date
            const today = new Date();
            const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${process.env.DASHBOARD_SHEET_NAME}!A2`, // Today's date cell
                valueInputOption: 'USER_ENTERED',
                resource: { values: [[todayString]] }
            });

            console.log(`Dashboard date updated to: ${todayString}`);

            // Then trigger onEdit to refresh calculations
            const timestamp = new Date().getTime();
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${process.env.LOG_SHEET_NAME}!F1`, // Use an unused cell
                valueInputOption: 'USER_ENTERED',
                resource: { values: [[`Refresh ${timestamp}`]] }
            });

            // Clear the dummy cell
            await this.sheets.spreadsheets.values.clear({
                spreadsheetId: this.spreadsheetId,
                range: `${process.env.LOG_SHEET_NAME}!F1`
            });

            return { success: true, message: `Dashboard date updated to ${todayString}` };
        } catch (error) {
            console.error('Error updating dashboard date:', error.message);
            throw error;
        }
    }
}

module.exports = GoogleSheetsService;