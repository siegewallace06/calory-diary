# Technical Documentation - Calorie Diary Script

## Overview

This document provides detailed technical information about the Google Apps Script implementation for the Calorie Diary automation system. The script is written in JavaScript and utilizes Google Sheets API functionality.

## Architecture

### Script Structure

```
CaloryDiaryAutomation_v2.gs
├── Configuration Constants
├── Event Handlers (onOpen, onEdit)
├── Core Business Logic Functions
├── Setup and Initialization Functions
└── Utility Functions
```

### Data Model

#### Sheet Structure
- **Log Sheet**: Raw food entry data
- **Dashboard**: User interface with personal metrics and daily view
- **Daily Summary**: Aggregated historical data

#### Column Mappings
```javascript
const LOG_COLUMNS = {
  DATE: 1,        // Column A
  TIME: 2,        // Column B  
  MEAL_TYPE: 3,   // Column C
  DESCRIPTION: 4, // Column D
  CALORIES: 5     // Column E
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
```

## Core Functions

### 1. Main Orchestration Function

```javascript
function refreshCaloryDiary()
```

**Purpose**: Main entry point for all calculations and updates
**Flow**:
1. Calculate max calories from personal parameters
2. Compute daily totals from log entries
3. Update Daily Summary sheet with aggregated data
4. Refresh Dashboard today view

**Error Handling**: Try-catch blocks with comprehensive logging

### 2. BMR Calculation Function

```javascript
function getMaxCaloriesFromDashboard(spreadsheet)
```

**Algorithm Implementation**:
- Implements Mifflin-St Jeor equation
- Handles dropdown text parsing (extracts numeric values)
- Applies activity multiplier and goal offset
- Returns rounded final calorie target

**Input Validation**:
```javascript
// Gender extraction from dropdown text
const gender = genderText.toLowerCase();

// Safe numeric extraction from dropdown selections
if (activityText.includes('(')) {
  activityMultiplier = parseFloat(activityText.split(' ')[0]);
} else {
  activityMultiplier = parseFloat(activityText);
}
```

### 3. Data Aggregation Function

```javascript
function computeDailyTotalsFromLog(spreadsheet)
```

**Process**:
1. Retrieves all log data via `getDataRange()`
2. Iterates through entries (skipping header row)
3. Groups calories by normalized date key (`yyyy-MM-dd`)
4. Returns Map object: `{dateKey: totalCalories}`

**Date Normalization**:
```javascript
const dateKey = Utilities.formatDate(
  entryDate, 
  Session.getScriptTimeZone(), 
  'yyyy-MM-dd'
);
```

### 4. Upsert Operation

```javascript
function upsertDailySummary(spreadsheet, dailyTotalsMap, maxCalories)
```

**Advanced Logic**:
- Builds existing dates map for efficient lookups
- Performs insert vs. update operations based on date existence
- Applies conditional formatting programmatically
- Calculates status messages with precise remaining calories

**Conditional Formatting Logic**:
```javascript
if (remaining >= 0) {
  statusCell.setBackground('#d4edda').setFontColor('#155724'); // Green
} else {
  statusCell.setBackground('#f8d7da').setFontColor('#721c24'); // Red
}
```

## Event Handling System

### OnEdit Trigger

```javascript
function onEdit(e)
```

**Trigger Conditions**:
1. **Log Sheet Changes**: Any edit triggers full refresh
2. **Dashboard Parameter Changes**: Specific cell range monitoring
   - Range: H2:H7 (personal parameters)
   - Effect: Recalculates ALL historical data

**Performance Optimization**:
- 100ms delay before processing to ensure edit completion
- Selective triggering based on sheet and cell location

### OnOpen Trigger

```javascript
function onOpen()
```

**UI Menu Creation**:
- Creates custom "Calory Diary" menu
- Provides access to setup, initialization, and utility functions
- User-friendly interface for manual operations

## Setup and Initialization

### Sheet Creation Functions

Each setup function follows this pattern:
1. **Existence Check**: Create sheet if missing
2. **Header Setup**: Apply standard headers
3. **Formatting**: Apply styles, borders, colors
4. **Data Validation**: Create dropdown rules
5. **Formulas**: Insert calculated cells
6. **Column Sizing**: Optimize for content

### Data Validation Rules

```javascript
// Gender dropdown
const genderRule = SpreadsheetApp.newDataValidation()
  .requireValueInList(['Male', 'Female'], true)
  .setAllowInvalid(false)
  .build();

// Activity level with descriptive text
const activityRule = SpreadsheetApp.newDataValidation()
  .requireValueInList([
    '1.2 (Sedentary)', 
    '1.375 (Light)', 
    '1.55 (Moderate)', 
    '1.725 (Very Active)', 
    '1.9 (Extremely Active)'
  ], true)
  .setAllowInvalid(false)
  .build();
```

## Error Handling Strategy

### Comprehensive Logging
```javascript
Logger.log(`Max calories calculated: ${maxCalories} kcal`);
Logger.log(`Computed totals for ${Object.keys(dailyTotalsMap).length} dates`);
```

### Graceful Degradation
- Missing sheets trigger informative error messages
- Invalid data entries are skipped rather than breaking execution
- Default values provided when calculations fail

### Input Validation
- Date parsing with `isNaN()` checks
- Numeric validation with `parseFloat()` and fallbacks
- Null/undefined checks before processing

## Performance Considerations

### Batch Operations
- Single `getDataRange()` call instead of individual cell reads
- Bulk data updates using `setValues()` with arrays
- Conditional formatting applied per operation, not per cell

### Memory Management
- Data structures cleared after use
- Minimal object creation in loops
- Efficient Map usage for date lookups

### Execution Optimization
- Early returns for empty datasets
- Skip processing for invalid entries
- Minimal DOM manipulation

## Formula Integration

### Dashboard Calculation Cell (H8)
```javascript
sh.getRange('H8').setFormula(
  '=IF(H2="","",IF(UPPER(LEFT(H2,1))="M",(10*H3)+(6.25*H4)-(5*H5)+5,(10*H3)+(6.25*H4)-(5*H5)-161)*VALUE(LEFT(H6,FIND(" ",H6)-1))+VALUE(LEFT(H7,FIND(" ",H7)-1)))'
);
```

**Formula Breakdown**:
- Checks if gender is provided
- Gender-based BMR calculation
- Extracts numeric values from dropdown text
- Applies activity factor and goal offset

## Security and Data Integrity

### Input Sanitization
- Dropdown validation prevents invalid entries
- Numeric parsing with error handling
- Date validation before processing

### Data Consistency
- Automatic recalculation when parameters change
- Referential integrity between sheets
- Audit trail through Daily Summary sheet

## Testing and Debugging

### Sample Data Function
```javascript
function addSampleData()
```
- Provides realistic test data
- Covers multiple days and meal types
- Validates end-to-end functionality

### Debugging Utilities
- Comprehensive logging throughout execution
- Manual refresh functions for testing
- UI alerts for user feedback

## Extension Points

The architecture supports easy extension:
1. **New Metrics**: Add to `DASHBOARD_METRICS` constant
2. **Additional Calculations**: Extend `getMaxCaloriesFromDashboard()`
3. **New Triggers**: Add to `onEdit()` function
4. **Custom Validations**: Extend setup functions

## Dependencies

- Google Apps Script Runtime
- Google Sheets API v4
- SpreadsheetApp service
- Utilities service for date formatting
- Built-in JavaScript objects (Date, Math, etc.)