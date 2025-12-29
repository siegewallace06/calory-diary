# Google Apps Script Integration Setup

## Overview
The Calorie Diary web app works seamlessly with Google Apps Script through built-in triggers. The script automatically handles all calculations when data is modified through the web interface.

## How It Works

### Automatic Processing
- When you add a meal through the web app, it writes to the Log sheet
- The Google Apps Script `onEdit()` trigger automatically detects the change
- It runs `refreshCaloryDiary()` to update all calculations
- No API calls or external triggers needed!

### What Happens Automatically
1. **Add Log Entry**: Web app → Log sheet → `onEdit` trigger → `refreshCaloryDiary()`
2. **Update Personal Metrics**: Web app → Dashboard sheet → `onEdit` trigger → `refreshCaloryDiary()`
3. **Dashboard Updates**: Script automatically updates Daily Summary and Dashboard tracker

## Required Environment Variables

Add the following to your `.env` file:

```env
# Google Sheets Configuration
SPREADSHEET_ID=your_spreadsheet_id_here
LOG_SHEET_NAME=Log
DASHBOARD_SHEET_NAME=Dashboard
DAILY_SUMMARY_SHEET_NAME=Daily Summary

# Google Service Account Configuration
GOOGLE_SERVICE_ACCOUNT_FILE=service-account-key.json

# App Configuration
PORT=3000
NODE_ENV=development
```

## Setup Instructions

### 1. Google Apps Script Setup
Your script (`CaloryDiaryAutomation_v2.gs`) must be attached to your Google Sheets:
- Open your spreadsheet
- Go to **Extensions** → **Apps Script**
- Make sure your script includes the `onEdit(e)` trigger function

### 2. Service Account Permissions
Your service account only needs:
- `https://www.googleapis.com/auth/spreadsheets`

No Google Apps Script API access required!

### 3. Deploy the Web App
The web app will:
- Add data directly to sheets
- Let Google Apps Script handle all calculations automatically
- Display updated data on refresh

## Benefits of This Approach
- ✅ **Simpler Setup**: No Apps Script API configuration needed
- ✅ **More Reliable**: Uses built-in Google Sheets triggers
- ✅ **Lower Permissions**: Only needs Sheets access
- ✅ **Automatic Updates**: Calculations happen instantly when data changes
- ✅ **No Script ID Required**: Everything happens within the spreadsheet

## Troubleshooting

### If Calculations Don't Update
1. Check that your Google Apps Script has the `onEdit()` function
2. Make sure the script is saved and deployed in the spreadsheet
3. Verify the sheet names match your environment variables
4. Check the Apps Script execution log for any errors

### Manual Refresh
If needed, you can click the "Refresh" button in the web app to reload data from the spreadsheet.