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
  DASHBOARD: 'Dashboard'
};

/**
 * Creates custom menu when spreadsheet opens
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Calory Diary')
    .addItem('Setup Dashboard', 'setupDashboard')
    .addItem('Setup Log Sheet', 'setupLogSheet')
    .addSeparator()
    .addItem('Refresh Calculations', 'refreshCaloryDiary')
    .addItem('Set Today\'s Date', 'setTodaysDate')
    .addItem('Add Sample Data', 'addSampleData')
    .addToUi();
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
  
  // Calculate max calories first
  calculateMaxCalories(spreadsheet);
  
  // Update daily tracker for the selected date
  updateDailyTracker(spreadsheet);
  
  console.log('Calory diary refreshed successfully!');
}

/**
 * Calculate max calories using Mifflin-St Jeor equation
 */
function calculateMaxCalories(spreadsheet) {
  const dashboardSheet = spreadsheet.getSheetByName(SHEETS.DASHBOARD);
  
  if (!dashboardSheet) {
    console.error('Dashboard sheet not found');
    return;
  }
  
  try {
    // Get personal metrics (extract values from dropdown text)
    const genderText = dashboardSheet.getRange(DASHBOARD_METRICS.GENDER_CELL).getValue().toString();
    const gender = genderText.toLowerCase();
    const weight = parseFloat(dashboardSheet.getRange(DASHBOARD_METRICS.WEIGHT_CELL).getValue());
    const height = parseFloat(dashboardSheet.getRange(DASHBOARD_METRICS.HEIGHT_CELL).getValue());
    const age = parseFloat(dashboardSheet.getRange(DASHBOARD_METRICS.AGE_CELL).getValue());
    
    // Extract numeric values from dropdown selections
    const activityText = dashboardSheet.getRange(DASHBOARD_METRICS.ACTIVITY_MULTIPLIER_CELL).getValue().toString();
    const activityMultiplier = parseFloat(activityText.split(' ')[0]); // Extract number before space
    
    const goalText = dashboardSheet.getRange(DASHBOARD_METRICS.GOAL_OFFSET_CELL).getValue().toString();
    const goalOffset = parseFloat(goalText.split(' ')[0]) || 0; // Extract number before space
    
    // Validate inputs
    if (!weight || !height || !age || !activityMultiplier) {
      console.error('Missing required personal metrics');
      return;
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
    
    // Update the max calories cell
    dashboardSheet.getRange(DASHBOARD_METRICS.MAX_CALORY_CELL).setValue(maxCalories);
    
    console.log(`Max calories calculated: ${maxCalories} kcal`);
    
  } catch (error) {
    console.error('Error calculating max calories:', error);
  }
}

/**
 * Update daily tracker in the Dashboard for the selected date
 */
function updateDailyTracker(spreadsheet) {
  const logSheet = spreadsheet.getSheetByName(SHEETS.LOG);
  const dashboardSheet = spreadsheet.getSheetByName(SHEETS.DASHBOARD);
  
  if (!logSheet || !dashboardSheet) {
    console.error('Required sheets not found');
    return;
  }
  
  try {
    // Get the target date from A2
    const targetDate = dashboardSheet.getRange(DAILY_TRACKER.DATE_INPUT_CELL).getValue();
    
    if (!targetDate) {
      console.log('No date specified in D2');
      return;
    }
    
    // Format target date for comparison
    const targetDateStr = Utilities.formatDate(new Date(targetDate), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
    // Get all log data
    const logData = logSheet.getDataRange().getValues();
    
    // Skip header row and filter entries for the target date
    const logEntries = logData.slice(1).filter(row => {
      if (!row[LOG_COLUMNS.DATE - 1] || !row[LOG_COLUMNS.CALORIES - 1]) return false;
      
      const entryDate = new Date(row[LOG_COLUMNS.DATE - 1]);
      const entryDateStr = Utilities.formatDate(entryDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      
      return entryDateStr === targetDateStr;
    });
    
    // Calculate total calories for the day
    const totalCalories = logEntries.reduce((sum, row) => {
      return sum + (parseFloat(row[LOG_COLUMNS.CALORIES - 1]) || 0);
    }, 0);
    
    // Get max calories
    const maxCalories = dashboardSheet.getRange(DASHBOARD_METRICS.MAX_CALORY_CELL).getValue() || 0;
    
    // Calculate remaining calories and status
    const remaining = maxCalories - totalCalories;
    const status = remaining >= 0 ? `Under Goal (+${remaining})` : `Over Goal (${remaining})`;
    
    // Update the daily tracker cells
    dashboardSheet.getRange(DAILY_TRACKER.TOTAL_CONSUMED_CELL).setValue(totalCalories);
    dashboardSheet.getRange(DAILY_TRACKER.MAX_LIMIT_CELL).setValue(maxCalories);
    dashboardSheet.getRange(DAILY_TRACKER.STATUS_CELL).setValue(status);
    
    // Apply conditional formatting to status cell
    const statusCell = dashboardSheet.getRange(DAILY_TRACKER.STATUS_CELL);
    if (remaining >= 0) {
      statusCell.setBackground('#d4edda').setFontColor('#155724'); // Green for under goal
    } else {
      statusCell.setBackground('#f8d7da').setFontColor('#721c24'); // Red for over goal
    }
    
    console.log(`Daily tracker updated for ${targetDateStr}: ${totalCalories} kcal consumed`);
    
  } catch (error) {
    console.error('Error updating daily tracker:', error);
  }
}



/**
 * Trigger function for when any sheet is edited
 */
function onEdit(e) {
  if (!e) return;
  
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  
  // Refresh if the Log sheet was edited
  if (sheet.getName() === SHEETS.LOG) {
    // Small delay to ensure the edit is complete
    Utilities.sleep(100);
    updateDailyTracker(SpreadsheetApp.getActiveSpreadsheet());
  }
  
  // Refresh if personal metrics in Dashboard are changed
  if (sheet.getName() === SHEETS.DASHBOARD) {
    const editedCell = range.getA1Notation();
    const metricsRange = ['H2', 'H3', 'H4', 'H5', 'H6', 'H7']; // Personal parameters
    const trackerRange = ['A2']; // Date input cell
    
    if (metricsRange.includes(editedCell)) {
      // Recalculate max calories and update tracker
      calculateMaxCalories(SpreadsheetApp.getActiveSpreadsheet());
      updateDailyTracker(SpreadsheetApp.getActiveSpreadsheet());
    } else if (trackerRange.includes(editedCell)) {
      // Update tracker for new date
      updateDailyTracker(SpreadsheetApp.getActiveSpreadsheet());
    }
  }
}

/**
 * Setup Dashboard sheet with dropdowns and formatting
 */
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
 * Initialize both sheets at once
 */
function initializeSpreadsheet() {
  setupDashboard();
  setupLogSheet();
  SpreadsheetApp.getUi().alert('Both Dashboard and Log sheets have been set up successfully!');
}

/**
 * Manual refresh function (can be run from script editor or assigned to a button)
 */
function manualRefresh() {
  refreshCaloryDiary();
  SpreadsheetApp.getUi().alert('Calory diary has been refreshed!');
}

/**
 * Helper function to set today's date in the daily tracker
 */
function setTodaysDate() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const dashboardSheet = spreadsheet.getSheetByName(SHEETS.DASHBOARD);
  
  if (dashboardSheet) {
    const today = new Date();
    dashboardSheet.getRange(DAILY_TRACKER.DATE_INPUT_CELL).setValue(today);
    updateDailyTracker(spreadsheet);
    SpreadsheetApp.getUi().alert(`Date set to ${Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd')}`);
  }
}

/**
 * Function to add sample data for testing
 */
function addSampleData() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const dashboardSheet = spreadsheet.getSheetByName(SHEETS.DASHBOARD);
  const logSheet = spreadsheet.getSheetByName(SHEETS.LOG);
  
  if (dashboardSheet && logSheet) {
    // Add sample personal parameters
    dashboardSheet.getRange('H2').setValue('Male');
    dashboardSheet.getRange('H3').setValue(70); // Weight
    dashboardSheet.getRange('H4').setValue(175); // Height
    dashboardSheet.getRange('H5').setValue(30); // Age
    dashboardSheet.getRange('H6').setValue(1.55); // Activity Level
    dashboardSheet.getRange('H7').setValue(-500); // Goal Offset
    
    // Set today's date in tracker
    dashboardSheet.getRange('A2').setValue(new Date());
    
    // Add sample log entries for today
    const today = new Date();
    const sampleData = [
      [today, '08:30', 'Breakfast', 'Oatmeal with banana and coffee', 350],
      [today, '12:30', 'Lunch', 'Chicken salad with dressing', 450],
      [today, '15:00', 'Snack', 'Apple and almonds', 200],
      [today, '19:00', 'Dinner', 'Salmon with rice and vegetables', 600]
    ];
    
    // Find next empty row in log sheet
    const lastRow = logSheet.getLastRow();
    const startRow = lastRow + 1;
    
    // Add sample data to log sheet
    logSheet.getRange(startRow, 1, sampleData.length, 5).setValues(sampleData);
    
    // Refresh calculations
    refreshCaloryDiary();
    
    SpreadsheetApp.getUi().alert('Sample data added successfully!\\nCheck your Dashboard to see the calculations.');
  }
}