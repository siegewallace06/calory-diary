# User Guide - Calorie Diary Web Application

## Welcome to Your Smart Nutrition Companion! 🍎

This guide will help you master the Calorie Diary web application - a powerful tool that combines Google Sheets data management with a beautiful, modern web interface.

## 🌟 Getting Started

### Your First Login

1. **Access the App**: Navigate to your deployed app URL
2. **Dashboard Overview**: You'll see your main dashboard with today's progress
3. **Navigation**: Use the top menu to explore different sections

### Initial Setup (First Time Users)

1. **Personal Metrics**: Go to Settings and enter:
   - Gender
   - Weight (kg)
   - Height (cm)
   - Age
   - Activity level
   - Goal (weight loss, maintenance, gain)

2. **Verify Connection**: Check that your Google Sheets data appears
3. **Add Test Entry**: Log your first meal to see the system in action

## 🏠 Dashboard Overview

### Today's Summary Cards

- **Today's Date**: Automatically updates with your timezone
- **Calories Consumed**: Real-time total from your food entries
- **Daily Goal**: Calculated based on your personal metrics
- **Status**: Green (under goal) or red (over goal) indicator

### Progress Visualization

- **Progress Bar**: Visual representation of calories consumed vs. goal
- **Percentage**: How much of your daily goal you've achieved
- **Remaining/Over**: Calories left or excess consumption

### Personal Metrics Panel

View your current settings:
- Physical stats (weight, height, age)
- Activity level and goal
- Calculated daily calorie target
- Quick link to update metrics

### Recent Entries

- Last 5 food entries
- Quick overview of recent meals
- Direct links to add more entries

## 🍽️ Food Logging

### Adding a New Entry

1. **Navigate**: Click "Add Entry" or go to Log page
2. **Fill Details**:
   - **Date**: Defaults to today, can be changed
   - **Time**: Optional but helpful for tracking patterns
   - **Meal Type**: Breakfast, Lunch, Dinner, Snack, Drink
   - **Description**: What you ate (be descriptive!)
   - **Calories**: Numeric value

3. **Submit**: Click "Add Entry" to save

### Tips for Accurate Logging

- **Be Specific**: "Grilled chicken breast 150g" vs. "chicken"
- **Include Cooking Method**: Grilled vs. fried makes a difference
- **Use Serving Sizes**: "1 medium apple" vs. "apple"
- **Log Immediately**: Don't rely on memory at end of day

### Meal Type Guidelines

- **Breakfast**: Morning meals and drinks
- **Lunch**: Midday meals
- **Dinner**: Evening meals
- **Snack**: Between-meal foods
- **Drink**: Beverages with calories (juice, smoothies, alcohol)

## 📚 Food Journal

### Calendar View

The journal provides a bird's-eye view of your eating patterns:

- **Monthly Calendar**: See your entire month at a glance
- **Color Coding**: 
  - Green border = under daily goal
  - Red border = over daily goal
  - Blue = today
- **Daily Summary**: Each day shows calories consumed/goal
- **Quick Status**: "Over" or "Under" indicator

### Navigation Controls

- **Previous/Next Month**: Arrow buttons
- **Today**: Jump back to current month
- **Refresh**: Update with latest data

### Daily Detail View

Click any day with data to see:

- **Daily Summary Cards**: Consumed, goal, remaining/over
- **Complete Food List**: All entries for that day
- **Meal Timing**: When you ate each item
- **Entry Details**: Description, meal type, calories

### Using Journal for Analysis

- **Pattern Recognition**: Spot trends in overeating days
- **Weekly Patterns**: Notice weekend vs. weekday differences
- **Goal Achievement**: Track your consistency over time
- **Seasonal Changes**: See how habits change through months

## 📊 Summary Reports

### Daily Summary Table

- **Historical Data**: Past 30+ days of tracking
- **Date Column**: Chronological list of logged days
- **Calories**: Consumed vs. target for each day
- **Status**: Over/under goal indicator
- **Trends**: Spot patterns over time

### Using Summary Data

- **Weekly Review**: Look at past week's performance
- **Monthly Goals**: Set and track monthly targets
- **Progress Tracking**: See improvement over time
- **Data Export**: Use Google Sheets for detailed analysis

## ⚙️ Settings Management

### Personal Metrics

**Weight**: Current weight in kilograms
- Update regularly for accurate calculations
- Weight changes affect your daily calorie needs

**Height**: Your height in centimeters
- Usually set once unless you're still growing
- Critical for BMR calculations

**Age**: Current age in years
- Metabolism slows with age
- Update annually for accuracy

**Gender**: Male or Female
- Significantly affects BMR calculations
- Men typically have higher calorie needs

### Activity Level Selection

**Sedentary (1.2)**: 
- Desk job, little to no exercise
- Minimal physical activity

**Light Activity (1.375)**:
- Light exercise 1-3 days/week
- Some walking, light sports

**Moderate Activity (1.55)**:
- Moderate exercise 3-5 days/week
- Regular gym sessions, sports

**Very Active (1.725)**:
- Hard exercise 6-7 days/week
- Athletic training, physical job

**Extremely Active (1.9)**:
- Very hard exercise, physical job
- Professional athletes, manual laborers

### Goal Setting

**Weight Loss (-500 cal)**:
- Targets ~0.5kg loss per week
- Sustainable, healthy rate
- Requires discipline and consistency

**Maintenance (0 cal)**:
- Maintain current weight
- Good for transitioning from loss/gain
- Focus on healthy eating habits

**Weight Gain (+500 cal)**:
- Targets ~0.5kg gain per week
- Useful for building muscle
- Should combine with strength training

## 📱 Mobile Experience (PWA)

### Installing the App

**On iPhone/iPad**:
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Confirm installation

**On Android**:
1. Open in Chrome
2. Tap menu (3 dots)
3. Select "Add to Home Screen" or "Install"
4. Confirm installation

### Offline Features

- **View Cached Data**: See previously loaded information
- **Add Entries**: Queue entries for when connection returns
- **Background Sync**: Automatically sync when online
- **Fast Loading**: Instant app startup from home screen

### Mobile Optimizations

- **Touch-Friendly**: Large buttons and touch targets
- **Responsive**: Adapts to all screen sizes
- **Fast**: Optimized loading and navigation
- **Native Feel**: App-like experience

## 🔄 Data Synchronization

### How Sync Works

1. **Real-Time Updates**: Changes appear immediately in web app
2. **Google Sheets Integration**: Data flows to spreadsheet
3. **Calculation Triggers**: Apps Script recalculates totals
4. **Bi-directional**: Changes in either system sync

### Troubleshooting Sync Issues

**Data Not Appearing**:
- Check internet connection
- Verify Google Sheets permissions
- Try refreshing the page

**Calculations Wrong**:
- Ensure personal metrics are complete
- Check Google Apps Script is deployed
- Use "Refresh" button on dashboard

**Outdated Information**:
- Hard refresh (Ctrl+Shift+R)
- Clear browser cache
- Restart mobile app

## 🎯 Best Practices

### Daily Routine

1. **Morning Setup**: Check yesterday's summary
2. **Log As You Go**: Don't wait until evening
3. **Review Progress**: Check dashboard throughout day
4. **Plan Ahead**: Use remaining calories for dinner planning

### Weekly Review

1. **Check Journal**: Review past week in calendar view
2. **Identify Patterns**: Note successful vs. challenging days
3. **Adjust Goals**: Modify targets if needed
4. **Plan Improvements**: Set intentions for coming week

### Long-term Success

- **Consistency Over Perfection**: Aim for 80% accuracy
- **Learn Portion Sizes**: Improve estimation skills
- **Track Trends**: Focus on weekly averages, not daily perfection
- **Stay Flexible**: Adjust goals as life changes

## ❓ Common Questions

### Q: Why don't my calories match fitness trackers?
A: Fitness trackers often overestimate. Our calculations use gold-standard scientific formulas (Mifflin-St Jeor equation).

### Q: Should I eat back exercise calories?
A: Your activity level setting should include regular exercise. Only eat back calories for unusual extra activity.

### Q: How accurate do I need to be?
A: Aim for 80% accuracy. Perfect tracking isn't necessary - consistency matters more.

### Q: Can I use this for specific diets?
A: Yes! Track any eating style - keto, vegan, intermittent fasting. Focus on total calories while maintaining your preferred foods.

### Q: What if I miss a day of logging?
A: No problem! Start fresh the next day. One day doesn't break your progress.

## 🆘 Getting Help

### Self-Help Resources

1. **Check Settings**: Verify all personal metrics are complete
2. **Refresh Data**: Use refresh buttons throughout app
3. **Clear Cache**: Try hard refresh or clear browser cache
4. **Restart App**: Close and reopen mobile PWA

### Technical Support

- Review documentation files for technical issues
- Check Google Sheets permissions and setup
- Verify Google Apps Script deployment
- Ensure environment variables are configured correctly

---

**Ready to start your nutrition journey? Begin with adding your personal metrics in Settings, then log your next meal! 🚀**