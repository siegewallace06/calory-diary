/**
 * Calory Diary Automation Script
 * 
 * This Google Apps Script automates the calory diary spreadsheet by:
 * 1. Calculating daily calorie totals from the Log sheet
 * 2. Updating the Dashboard with daily summaries
 * 3. Computing recommended max calories using Mifflin-St Jeor equation
 * 4. Providing status indicators for daily goals
 */

// Configuration constants
const SHEETS = {
  LOG: 'Log',
  DASHBOARD: 'Dashboard',
  DAILY_SUMMARY: 'Daily Summary'
};

/**
 * Creates custom menu when spreadsheet opens
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Calory Diary')
    .addItem('Setup Dashboard', 'setupDashboard')
    .addItem('Setup Log Sheet', 'setupLogSheet')
    .addItem('Setup Daily Summary Sheet', 'setupDailySummarySheet')
    .addSeparator()
    .addItem('Initialize All', 'initializeAllSheets')
    .addSeparator()
    .addItem('Refresh Calculations', 'refreshCaloryDiary')
    .addItem('Set Today\'s Date', 'setTodaysDate')
    .addItem('Add Sample Data', 'addSampleData')
    .addToUi();
  
  // Trigger Refresh Calory Diary on open
  refreshCaloryDiary(); 
}

const LOG_COLUMNS = {
  DATE: 1,      // Column A
  TIME: 2,      // Column B  
  MEAL_TYPE: 3, // Column C
  DESCRIPTION: 4, // Column D
  CALORIES: 5   // Column E
};

const DASHBOARD_METRICS = {
  GENDER_CELL: 'H2',
  WEIGHT_CELL: 'H3',
  HEIGHT_CELL: 'H4', 
  AGE_CELL: 'H5',
  ACTIVITY_MULTIPLIER_CELL: 'H6',
  GOAL_OFFSET_CELL: 'H7',
  MAX_CALORY_CELL: 'H8'
};

const DAILY_TRACKER = {
  DATE_INPUT_CELL: 'A2',
  TOTAL_CONSUMED_CELL: 'B2',
  MAX_LIMIT_CELL: 'C2',
  STATUS_CELL: 'D2'
};

/**
 * Main function to refresh all calculations
 */
function refreshCaloryDiary() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    // Get max calories from dashboard personal parameters
    const maxCalories = getMaxCaloriesFromDashboard(spreadsheet);
    Logger.log(`Max calories calculated: ${maxCalories} kcal`);
    
    // Compute daily totals from log
    const dailyTotalsMap = computeDailyTotalsFromLog(spreadsheet);
    Logger.log(`Computed totals for ${Object.keys(dailyTotalsMap).length} dates`);
    
    // Update Daily Summary sheet
    upsertDailySummary(spreadsheet, dailyTotalsMap, maxCalories);
    
    // Update Dashboard today view
    updateDashboardTodayView(spreadsheet);
    
    Logger.log('Calory diary refreshed successfully!');
    
  } catch (error) {
    Logger.log(`Error in refreshCaloryDiary: ${error.toString()}`);
  }
}

/**
 * Get max calories from Dashboard personal parameters using Mifflin-St Jeor equation
 */
function getMaxCaloriesFromDashboard(spreadsheet) {
  const dashboardSheet = spreadsheet.getSheetByName(SHEETS.DASHBOARD);
  
  if (!dashboardSheet) {
    throw new Error('Dashboard sheet not found');
  }
  
  try {
    // Get personal metrics (extract values from dropdown text)
    const genderText = dashboardSheet.getRange(DASHBOARD_METRICS.GENDER_CELL).getValue().toString();
    const gender = genderText.toLowerCase();
    const weight = parseFloat(dashboardSheet.getRange(DASHBOARD_METRICS.WEIGHT_CELL).getValue());
    const height = parseFloat(dashboardSheet.getRange(DASHBOARD_METRICS.HEIGHT_CELL).getValue());
    const age = parseFloat(dashboardSheet.getRange(DASHBOARD_METRICS.AGE_CELL).getValue());
    
    // Extract numeric values from dropdown selections safely
    const activityText = dashboardSheet.getRange(DASHBOARD_METRICS.ACTIVITY_MULTIPLIER_CELL).getValue().toString();
    let activityMultiplier;
    if (activityText.includes('(')) {
      activityMultiplier = parseFloat(activityText.split(' ')[0]); // Extract number before space
    } else {
      activityMultiplier = parseFloat(activityText); // Direct numeric input
    }
    
    const goalText = dashboardSheet.getRange(DASHBOARD_METRICS.GOAL_OFFSET_CELL).getValue().toString();
    let goalOffset;
    if (goalText.includes('(')) {
      goalOffset = parseFloat(goalText.split(' ')[0]); // Extract number before space
    } else {
      goalOffset = parseFloat(goalText) || 0; // Direct numeric input
    }
    
    // Validate inputs
    if (!weight || !height || !age || !activityMultiplier) {
      throw new Error('Missing required personal metrics: weight, height, age, or activity multiplier');
    }
    
    // Calculate BMR using Mifflin-St Jeor equation
    let bmr;
    if (gender.includes('male') || gender === 'm') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    
    // Calculate TDEE and apply goal offset
    const tdee = bmr * activityMultiplier;
    const maxCalories = Math.round(tdee + goalOffset);
    
    return maxCalories;
    
  } catch (error) {
    Logger.log(`Error calculating max calories: ${error.toString()}`);
    throw error;
  }
}

/**
 * Compute daily totals from Log sheet
 */
function computeDailyTotalsFromLog(spreadsheet) {
  const logSheet = spreadsheet.getSheetByName(SHEETS.LOG);
  
  if (!logSheet) {
    throw new Error('Log sheet not found');
  }
  
  try {
    // Get all log data
    const logData = logSheet.getDataRange().getValues();
    
    if (logData.length <= 1) {
      Logger.log('No data entries found in Log sheet');
      return 


{};
    }
    
    const dailyTotalsMap = {};
    
    // Skip header row and process entries
    for (let i = 1; i < logData.length; i++) {
      const row = logData[i];
      const dateValue = row[LOG_COLUMNS.DATE - 1];
      const caloriesValue = row[LOG_COLUMNS.CALORIES - 1];
      
      // Skip rows missing date or calories
      if (!dateValue || (!caloriesValue && caloriesValue !== 0)) continue;
      
      // Normalize date to yyyy-MM-dd
      const entryDate = new Date(dateValue);
      if (isNaN(entryDate.getTime())) continue; // Skip invalid dates
      
      const dateKey = Utilities.formatDate(entryDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      
      // Parse calories (handle both numbers and numeric strings)
      const calories = parseFloat(caloriesValue) || 0;
      
      // Add to daily total
      if (!dailyTotalsMap[dateKey]) {
        dailyTotalsMap[dateKey] = 0;
      }
      dailyTotalsMap[dateKey] += calories;
    }
    
    return dailyTotalsMap;
    
  } catch (error) {
    Logger.log(`Error computing daily totals from log: ${error.toString()}`);
    throw error;
  }
}

/**
 * Upsert Daily Summary sheet with daily totals
 */
function upsertDailySummary(spreadsheet, dailyTotalsMap, maxCalories) {
  const summarySheet = spreadsheet.getSheetByName(SHEETS.DAILY_SUMMARY);
  
  if (!summarySheet) {
    throw new Error('Daily Summary sheet not found. Please run Setup Daily Summary Sheet first.');
  }
  
  try {
    // Get existing data from summary sheet
    const existingData = summarySheet.getDataRange().getValues();
    const existingDatesMap = {}; // Maps dateKey -> row number
    
    // Build map of existing dates (skip header row)
    for (let i = 1; i < existingData.length; i++) {
      const existingDate = existingData[i][0];
      if (existingDate) {
        const dateKey = Utilities.formatDate(new Date(existingDate), Session.getScriptTimeZone(), 'yyyy-MM-dd');
        existingDatesMap[dateKey] = i + 1; // +1 for 1-based row indexing
      }
    }
    
    // Process each date in dailyTotalsMap
    for (const [dateKey, totalCalories] of Object.entries(dailyTotalsMap)) {
      const dateObj = new Date(dateKey);
      const remaining = maxCalories - totalCalories;
      const status = remaining >= 0 ? `Under Goal (+${remaining})` : `Over Goal (${remaining})`;
      
      const rowData = [dateObj, totalCalories, maxCalories, status];
      
      if (existingDatesMap[dateKey]) {
        // Update existing row
        const rowNum = existingDatesMap[dateKey];
        summarySheet.getRange(rowNum, 1, 1, 4).setValues([rowData]);
        
        // Apply conditional formatting to status cell
        const statusCell = summarySheet.getRange(rowNum, 4);
        if (remaining >= 0) {
          statusCell.setBackground('#d4edda').setFontColor('#155724'); // Green
        } else {
          statusCell.setBackground('#f8d7da').setFontColor('#721c24'); // Red
        }
      } else {
        // Append new row
        const lastRow = summarySheet.getLastRow();
        const newRow = lastRow + 1;
        summarySheet.getRange(newRow, 1, 1, 4).setValues([rowData]);
        
        // Apply conditional formatting to status cell
        const statusCell = summarySheet.getRange(newRow, 4);
        if (remaining >= 0) {
          statusCell.setBackground('#d4edda').setFontColor('#155724'); // Green
        } else {
          statusCell.setBackground('#f8d7da').setFontColor('#721c24'); // Red
        }
      }
    }
    
    Logger.log(`Updated Daily Summary for ${Object.keys(dailyTotalsMap).length} dates`);
    
  } catch (error) {
    Logger.log(`Error upserting daily summary: ${error.toString()}`);
    throw error;
  }
}

/**
 * Update Dashboard today view from Daily Summary
 */
function updateDashboardTodayView(spreadsheet) {
  const dashboardSheet = spreadsheet.getSheetByName(SHEETS.DASHBOARD);
  const summarySheet = spreadsheet.getSheetByName(SHEETS.DAILY_SUMMARY);
  
  if (!dashboardSheet || !summarySheet) {
    Logger.log('Dashboard or Daily Summary sheet not found');
    return;
  }
  
  try {
    // Get today's date
    const today = new Date();
    const todayKey = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
    // Look for today's data in Daily Summary
    const summaryData = summarySheet.getDataRange().getValues();
    let todayRow = null;
    
    for (let i = 1; i < summaryData.length; i++) {
      const rowDate = summaryData[i][0];
      if (rowDate) {
        const rowDateKey = Utilities.formatDate(new Date(rowDate), Session.getScriptTimeZone(), 'yyyy-MM-dd');
        if (rowDateKey === todayKey) {
          todayRow = summaryData[i];
          break;
        }
      }
    }
    
    if (todayRow) {
      // Update Dashboard with today's data from Daily Summary
      dashboardSheet.getRange(DAILY_TRACKER.DATE_INPUT_CELL).setValue(todayRow[0]); // Date
      dashboardSheet.getRange(DAILY_TRACKER.TOTAL_CONSUMED_CELL).setValue(todayRow[1]); // Total In
      dashboardSheet.getRange(DAILY_TRACKER.MAX_LIMIT_CELL).setValue(todayRow[2]); // Max Limit
      dashboardSheet.getRange(DAILY_TRACKER.STATUS_CELL).setValue(todayRow[3]); // Status
      
      // Apply conditional formatting to status cell
      const statusCell = dashboardSheet.getRange(DAILY_TRACKER.STATUS_CELL);
      const statusText = todayRow[3].toString();
      if (statusText.includes('Under Goal')) {
        statusCell.setBackground('#d4edda').setFontColor('#155724'); // Green
      } else {
        statusCell.setBackground('#f8d7da').setFontColor('#721c24'); // Red
      }
    } else {
      // No data for today - show defaults
      const maxCalories = getMaxCaloriesFromDashboard(spreadsheet);
      dashboardSheet.getRange(DAILY_TRACKER.DATE_INPUT_CELL).setValue(today);
      dashboardSheet.getRange(DAILY_TRACKER.TOTAL_CONSUMED_CELL).setValue(0);
      dashboardSheet.getRange(DAILY_TRACKER.MAX_LIMIT_CELL).setValue(maxCalories);
      dashboardSheet.getRange(DAILY_TRACKER.STATUS_CELL).setValue(`Under Goal (+${maxCalories})`);
      
      // Apply green formatting for under goal
      const statusCell = dashboardSheet.getRange(DAILY_TRACKER.STATUS_CELL);
      statusCell.setBackground('#d4edda').setFontColor('#155724');
    }
    
    Logger.log(`Dashboard today view updated for ${todayKey}`);
    
  } catch (error) {
    Logger.log(`Error updating dashboard today view: ${error.toString()}`);
  }
}



/**
 * Trigger function for when any sheet is edited
 */
function onEdit(e) {
  if (!e) return;
  
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  
  try {
    // Refresh if the Log sheet was edited
    if (sheet.getName() === SHEETS.LOG) {
      // Small delay to ensure the edit is complete
      Utilities.sleep(100);
      refreshCaloryDiary(); // Full refresh to update Daily Summary
    }
    
    // Refresh if personal metrics in Dashboard are changed
    if (sheet.getName() === SHEETS.DASHBOARD) {
      const editedCell = range.getA1Notation();
      const metricsRange = ['H2', 'H3', 'H4', 'H5', 'H6', 'H7']; // Personal parameters
      
      if (metricsRange.includes(editedCell)) {
        // Personal parameters changed - need to recalculate all historical data
        Logger.log(`Personal parameter changed in ${editedCell}, recalculating all daily summaries`);
        
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        const maxCalories = getMaxCaloriesFromDashboard(spreadsheet);
        const dailyTotalsMap = computeDailyTotalsFromLog(spreadsheet);
        upsertDailySummary(spreadsheet, dailyTotalsMap, maxCalories);
        updateDashboardTodayView(spreadsheet);
      }
    }
  } catch (error) {
    Logger.log(`Error in onEdit trigger: ${error.toString()}`);
  }
}

/**
 * Setup Daily Summary sheet with headers and formatting
 */
function setupDailySummarySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create sheet if it doesn't exist
  let sh = ss.getSheetByName(SHEETS.DAILY_SUMMARY);
  if (!sh) {
    sh = ss.insertSheet(SHEETS.DAILY_SUMMARY);
    Logger.log('Created Daily Summary sheet');
  }
  
  // ---- Headers ----
  const headers = [['Date', 'Total In', 'Max Limit', 'Status']];
  sh.getRange('A1:D1').setValues(headers);
  
  // ---- Formatting ----
  sh.getRange('A1:D1').setFontWeight('bold').setBackground('#e8f0fe');
  sh.getRange('A1:D1').setBorder(true, true, true, true, true, true);
  
  // ---- Column Widths ----
  sh.setColumnWidth(1, 100); // Date
  sh.setColumnWidth(2, 100); // Total In
  sh.setColumnWidth(3, 100); // Max Limit
  sh.setColumnWidth(4, 150); // Status
  
  SpreadsheetApp.getUi().alert('Daily Summary sheet setup complete ✅\\nHeaders added and formatted.');
}
function setupDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEETS.DASHBOARD);
  if (!sh) throw new Error('Dashboard sheet not found');

  // ---- Daily Calory Table Headers (A-D) ----
  const dailyHeaders = [['Date', 'Total In', 'Max Limit', 'Status']];
  sh.getRange('A1:D1').setValues(dailyHeaders);
  sh.getRange('A1:D1').setFontWeight('bold').setBackground('#e8f0fe');
  
  // ---- Personal Parameters Labels (G column) ----
  const labels = [
    ['Personal Parameters', ''],
    ['Gender', ''],
    ['Weight (kg)', ''],
    ['Height (cm)', ''],
    ['Age', ''],
    ['Activity Level', ''],
    ['Goal Offset', ''],
    ['Daily Goal (Max)', '']
  ];

  sh.getRange('G1:H8').clearContent();
  sh.getRange('G1:H8').setValues(labels);

  // ---- Styling ----
  sh.getRange('G1').setFontWeight('bold').setFontSize(12).setBackground('#e8f0fe');
  sh.getRange('G2:G8').setFontWeight('bold');
  sh.getRange('H2:H7').setBackground('#e3f2fd'); // input cells
  sh.getRange('A2').setBackground('#e3f2fd'); // date input
  sh.getRange('H8').setBackground('#f5f5f5').setFontWeight('bold'); // calculated
  sh.getRange('B2:D2').setBackground('#f5f5f5'); // calculated tracker cells

  // ---- Dropdowns (Data Validation) ----
  // Gender dropdown (H2)
  const genderRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Male', 'Female'], true)
    .setAllowInvalid(false)
    .build();
  sh.getRange('H2').setDataValidation(genderRule);

  // Activity level dropdown (H6) with descriptions
  const activityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['1.2 (Sedentary)', '1.375 (Light)', '1.55 (Moderate)', '1.725 (Very Active)', '1.9 (Extremely Active)'], true)
    .setAllowInvalid(false)
    .build();
  sh.getRange('H6').setDataValidation(activityRule);

  // Goal offset dropdown (H7)
  const goalRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['-500 (Weight Loss)', '0 (Maintenance)', '500 (Weight Gain)'], true)
    .setAllowInvalid(false)
    .build();
  sh.getRange('H7').setDataValidation(goalRule);

  // ---- Formulas ----
  // Max calory formula in H8 (handles dropdown text extraction)
  sh.getRange('H8').setFormula(
    '=IF(H2="","",IF(UPPER(LEFT(H2,1))="M",(10*H3)+(6.25*H4)-(5*H5)+5,(10*H3)+(6.25*H4)-(5*H5)-161)*VALUE(LEFT(H6,FIND(" ",H6)-1))+VALUE(LEFT(H7,FIND(" ",H7)-1)))'
  );

  // Daily tracker formula reference (C2)
  sh.getRange('C2').setFormula('=$H$8');

  // ---- Borders ----
  sh.getRange('A1:D2').setBorder(true, true, true, true, true, true);
  sh.getRange('G1:H8').setBorder(true, true, true, true, true, true);

  SpreadsheetApp.getUi().alert('Dashboard setup complete ✅\nDropdowns added for Gender, Activity Level, and Goal Offset.');
}

/**
 * Setup Log sheet with headers and formatting
 */
function setupLogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEETS.LOG);
  if (!sh) throw new Error('Log sheet not found');

  // ---- Headers ----
  const headers = [['Date', 'Time', 'Meal Type', 'Description', 'Calories']];
  sh.getRange('A1:E1').setValues(headers);
  
  // ---- Formatting ----
  sh.getRange('A1:E1').setFontWeight('bold').setBackground('#e8f0fe');
  sh.getRange('A1:E1').setBorder(true, true, true, true, true, true);
  
  // ---- Column Widths ----
  sh.setColumnWidth(1, 100); // Date
  sh.setColumnWidth(2, 80);  // Time
  sh.setColumnWidth(3, 100); // Meal Type
  sh.setColumnWidth(4, 200); // Description
  sh.setColumnWidth(5, 80);  // Calories
  
  // ---- Meal Type Dropdown ----
  const mealTypeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Drink'], true)
    .setAllowInvalid(false)
    .build();
  
  // Apply to a large range for future entries
  sh.getRange('C2:C1000').setDataValidation(mealTypeRule);
  
  SpreadsheetApp.getUi().alert('Log sheet setup complete ✅\nMeal Type dropdown added to column C.');
}

/**
 * Initialize all sheets at once
 */
function initializeAllSheets() {
  setupDashboard();
  setupLogSheet();
  setupDailySummarySheet();
  SpreadsheetApp.getUi().alert('All sheets (Dashboard, Log, and Daily Summary) have been set up successfully!');
}

/**
 * Initialize both sheets at once (legacy function)
 */
function initializeSpreadsheet() {
  initializeAllSheets();
}

/**
 * Manual refresh function (can be run from script editor or assigned to a button)
 */
function manualRefresh() {
  refreshCaloryDiary();
  SpreadsheetApp.getUi().alert('Calory diary has been refreshed!');
}

/**
 * Helper function to set today's date in the daily tracker (updates from Daily Summary)
 */
function setTodaysDate() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  updateDashboardTodayView(spreadsheet);
  
  const today = new Date();
  SpreadsheetApp.getUi().alert(`Dashboard updated with today's data: ${Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd')}`);
}

/**
 * Function to add sample data for testing
 */
function addSampleData() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const dashboardSheet = spreadsheet.getSheetByName(SHEETS.DASHBOARD);
  const logSheet = spreadsheet.getSheetByName(SHEETS.LOG);
  
  if (dashboardSheet && logSheet) {
    // Add sample personal parameters using dropdown values
    dashboardSheet.getRange('H2').setValue('Male');
    dashboardSheet.getRange('H3').setValue(70); // Weight
    dashboardSheet.getRange('H4').setValue(175); // Height
    dashboardSheet.getRange('H5').setValue(30); // Age
    dashboardSheet.getRange('H6').setValue('1.55 (Moderate)'); // Activity Level with dropdown text
    dashboardSheet.getRange('H7').setValue('-500 (Weight Loss)'); // Goal Offset with dropdown text
    
    // Add sample log entries for today and yesterday
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const sampleData = [
      // Today's entries
      [today, '08:30', 'Breakfast', 'Oatmeal with banana and coffee', 350],
      [today, '12:30', 'Lunch', 'Chicken salad with dressing', 450],
      [today, '15:00', 'Snack', 'Apple and almonds', 200],
      [today, '19:00', 'Dinner', 'Salmon with rice and vegetables', 600],
      // Yesterday's entries
      [yesterday, '09:00', 'Breakfast', 'Greek yogurt with berries', 300],
      [yesterday, '13:00', 'Lunch', 'Turkey sandwich', 400],
      [yesterday, '16:00', 'Snack', 'Protein bar', 250],
      [yesterday, '20:00', 'Dinner', 'Pasta with chicken', 700]
    ];
    
    // Find next empty row in log sheet
    const lastRow = logSheet.getLastRow();
    const startRow = lastRow + 1;
    
    // Add sample data to log sheet
    logSheet.getRange(startRow, 1, sampleData.length, 5).setValues(sampleData);
    
    // Refresh calculations to populate Daily Summary
    refreshCaloryDiary();
    
    SpreadsheetApp.getUi().alert('Sample data added successfully!\\nCheck your Daily Summary sheet and Dashboard to see the calculations.');
  }
}

/**
 * Web App endpoint - Deploy as web app to trigger functions via URL
 * 
 * Usage examples:
 * - https://script.google.com/.../exec?action=refresh
 * - https://script.google.com/.../exec?action=setTodaysDate
 * - https://script.google.com/.../exec (defaults to refresh)
 */
function doGet(e) {
  try {
    const action = e.parameter.action || 'refresh';
    
    switch (action.toLowerCase()) {
      case 'refresh':
      case 'refreshcalories':
      case 'refreshcalorydiary':
        refreshCaloryDiary();
        return ContentService
          .createTextOutput(JSON.stringify({
            success: true,
            message: 'Calory diary refreshed successfully',
            timestamp: new Date().toISOString(),
            action: 'refresh'
          }))
          .setMimeType(ContentService.MimeType.JSON);
          
      case 'settodaysdate':
      case 'updatedate':
        setTodaysDate();
        return ContentService
          .createTextOutput(JSON.stringify({
            success: true,
            message: 'Dashboard updated with today\'s date',
            timestamp: new Date().toISOString(),
            action: 'setTodaysDate'
          }))
          .setMimeType(ContentService.MimeType.JSON);
          
      case 'status':
      case 'health':
        return ContentService
          .createTextOutput(JSON.stringify({
            success: true,
            message: 'Calory Diary automation is running',
            timestamp: new Date().toISOString(),
            version: '2.0',
            action: 'status'
          }))
          .setMimeType(ContentService.MimeType.JSON);
          
      default:
        return ContentService
          .createTextOutput(JSON.stringify({
            success: false,
            error: `Unknown action: ${action}`,
            availableActions: ['refresh', 'setTodaysDate', 'status'],
            timestamp: new Date().toISOString()
          }))
          .setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    Logger.log(`Error in doGet: ${error.toString()}`);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}