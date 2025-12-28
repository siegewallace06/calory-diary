# Setup Guide - Calorie Diary App

## Prerequisites

- Google account with Google Sheets access
- Basic familiarity with Google Sheets
- A blank Google Sheets document

## Step-by-Step Setup Instructions

### Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+ Blank"** to create a new spreadsheet
3. Rename your spreadsheet (click "Untitled spreadsheet" at the top):
   - Suggested name: "My Calorie Diary"

### Step 2: Create Required Sheets

Your spreadsheet needs exactly three sheets with these names:

1. **Rename the default sheet**:
   - Right-click "Sheet1" tab at the bottom
   - Select "Rename"
   - Change to: `Log`

2. **Add Dashboard sheet**:
   - Click the "+" icon at the bottom left
   - Rename the new sheet to: `Dashboard`

3. **Add Daily Summary sheet**:
   - Click the "+" icon again
   - Rename this sheet to: `Daily Summary`

**Important**: Sheet names must match exactly (case-sensitive).

### Step 3: Add the Automation Script

1. **Open Script Editor**:
   - Click "Extensions" in the top menu
   - Select "Apps Script"

2. **Replace Default Code**:
   - Delete all content in the editor
   - Copy the entire content from `CaloryDiaryAutomation_v2.gs`
   - Paste it into the script editor

3. **Save the Script**:
   - Click the save icon (💾) or press Ctrl+S (Cmd+S on Mac)
   - Name your project: "Calorie Diary Automation"

### Step 4: Set Up Permissions

1. **Run Initial Setup**:
   - In the script editor, click "Run" button
   - You'll see a permission dialog

2. **Authorize the Script**:
   - Click "Review permissions"
   - Choose your Google account
   - Click "Advanced" → "Go to Calorie Diary Automation (unsafe)"
   - Click "Allow"

**Note**: This is normal - Google flags custom scripts as "unsafe" but your script only accesses your own spreadsheet.

### Step 5: Initialize Your Sheets

1. **Return to Your Spreadsheet**:
   - Go back to your Google Sheet
   - Refresh the page (F5 or Cmd+R)

2. **You Should See a New Menu**:
   - Look for "Calory Diary" in the top menu bar
   - If you don't see it, refresh the page again

3. **Run Setup**:
   - Click "Calory Diary" menu
   - Select **"Initialize All"**
   - Wait for the success message

### Step 6: Configure Your Personal Information

1. **Go to Dashboard Sheet**:
   - Click the "Dashboard" tab at the bottom

2. **Fill in Your Information** (cells H2-H7):

   | Parameter | Cell | What to Enter |
   |-----------|------|---------------|
   | **Gender** | H2 | Select "Male" or "Female" from dropdown |
   | **Weight (kg)** | H3 | Your weight in kilograms |
   | **Height (cm)** | H4 | Your height in centimeters |
   | **Age** | H5 | Your age in years |
   | **Activity Level** | H6 | Choose from dropdown based on your lifestyle |
   | **Goal Offset** | H7 | Select your goal from dropdown |

3. **Activity Level Guide**:
   - **Sedentary**: Desk job, little/no exercise
   - **Light**: Light exercise 1-3 days/week
   - **Moderate**: Moderate exercise 3-5 days/week
   - **Very Active**: Hard exercise 6-7 days/week
   - **Extremely Active**: Very hard exercise + physical job

4. **Goal Guide**:
   - **Weight Loss**: -500 calories (lose ~1 lb/week)
   - **Maintenance**: 0 calories (maintain current weight)
   - **Weight Gain**: +500 calories (gain ~1 lb/week)

### Step 7: Test with Sample Data (Optional)

1. **Add Test Data**:
   - Click "Calory Diary" menu
   - Select **"Add Sample Data"**
   - This adds example entries to test the system

2. **Verify Everything Works**:
   - Check that Dashboard shows today's summary
   - Look at Daily Summary sheet for historical data
   - Verify calculations make sense

### Step 8: Start Logging Your Food

1. **Go to Log Sheet**:
   - Click the "Log" tab

2. **Add Your First Entry** (Row 2):
   - **Date**: Today's date
   - **Time**: Current time (e.g., "08:30")
   - **Meal Type**: Choose from dropdown (Breakfast, Lunch, etc.)
   - **Description**: What you ate (e.g., "Oatmeal with banana")
   - **Calories**: Number of calories (e.g., 350)

3. **Watch the Magic**:
   - As soon as you press Enter, the system updates automatically
   - Check Dashboard for your daily progress
   - Check Daily Summary for the permanent record

## Verification Checklist

✅ **Sheet Names**: Log, Dashboard, Daily Summary (exact names)  
✅ **Script Installed**: Apps Script editor contains the automation code  
✅ **Permissions Granted**: Script can access your spreadsheet  
✅ **Menu Visible**: "Calory Diary" appears in top menu  
✅ **Sheets Formatted**: Headers and dropdowns appear after "Initialize All"  
✅ **Personal Info**: Your metrics entered in Dashboard H2-H7  
✅ **Daily Goal Calculated**: Cell H8 shows your calorie target  
✅ **Test Entry**: At least one food entry in Log sheet  
✅ **Auto-Update Works**: Dashboard and Daily Summary update automatically  

## Troubleshooting Common Issues

### "Calory Diary" Menu Not Appearing
- **Solution**: Refresh the page, ensure script is saved, check sheet names

### Permission Errors
- **Solution**: Re-run authorization in Apps Script editor

### Calculations Not Working
- **Solution**: 
  - Verify all personal metrics are filled (H2-H7)
  - Check that sheet names are exactly: Log, Dashboard, Daily Summary
  - Try "Refresh Calculations" from the menu

### Dropdown Not Working
- **Solution**: Run "Initialize All" again from the Calory Diary menu

### Data Not Updating
- **Solution**:
  - Check that you're entering data in the Log sheet
  - Verify date and calorie columns have valid data
  - Try manual refresh from the menu

### Script Errors
- **Solution**:
  - Go to Apps Script editor
  - Check "Executions" tab for error details
  - Ensure you copied the complete script code

## Daily Usage Tips

### Quick Logging
- Use the Log sheet for all food entries
- Meal type dropdown keeps entries consistent
- Time field helps with meal planning analysis

### Monitoring Progress
- Dashboard shows real-time daily progress
- Green = under goal, Red = over goal
- Daily Summary sheet shows historical trends

### Updating Goals
- Change weight, activity level, or goal anytime in Dashboard
- System automatically recalculates ALL historical data
- No need to manually update anything

## Advanced Features

### Manual Refresh
- Use "Refresh Calculations" menu item if data seems out of sync

### Setting Today's Date
- Use "Set Today's Date" to jump to current day view

### Backup Your Data
- Regularly download a copy: File → Download → Excel or PDF

## Support

If you encounter issues:
1. Check this setup guide first
2. Try the troubleshooting section
3. Ensure all verification checklist items are complete
4. Check Apps Script execution logs for detailed error messages

Your calorie tracking system is now ready to use! Start logging your meals and watch as it automatically tracks your progress toward your daily goals.