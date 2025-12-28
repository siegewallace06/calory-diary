# Calorie Diary App - User Guide

## What is the Calorie Diary App?

The Calorie Diary App is a Google Sheets-based automation system that helps you track your daily calorie intake and manage your dietary goals. It automatically calculates your daily calorie requirements, tracks your consumption, and provides real-time feedback on whether you're meeting your goals.

## How It Works

### Core Components

The app consists of three main sheets that work together:

1. **Log Sheet** - Where you record your daily food intake
2. **Dashboard** - Shows your daily summary and personal metrics
3. **Daily Summary** - Historical view of all your daily totals

### The Magic Behind the Calculations

#### Basal Metabolic Rate (BMR) Calculation
The app uses the scientifically-proven **Mifflin-St Jeor Equation** to calculate your base calorie needs:

**For Men:**
```
BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
```

**For Women:**
```
BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
```

#### Total Daily Energy Expenditure (TDEE)
Your BMR is then multiplied by an activity factor to get your total daily calorie needs:

- **1.2** - Sedentary (little or no exercise)
- **1.375** - Lightly active (light exercise 1-3 days/week)
- **1.55** - Moderately active (moderate exercise 3-5 days/week)
- **1.725** - Very active (hard exercise 6-7 days/week)
- **1.9** - Extremely active (very hard exercise, physical job)

#### Goal Adjustment
Finally, a goal offset is applied:
- **-500 calories** for weight loss (1 lb/week)
- **0 calories** for maintenance
- **+500 calories** for weight gain (1 lb/week)

**Final Formula:**
```
Daily Calorie Goal = (BMR × Activity Factor) + Goal Offset
```

### Real-Time Tracking

As you log your food intake throughout the day, the app:

1. **Automatically sums** all calories for each date
2. **Compares** your intake to your personalized goal
3. **Updates status** with clear visual indicators:
   - 🟢 **Green**: Under goal (shows calories remaining)
   - 🔴 **Red**: Over goal (shows excess calories)

### Example Calculation

Let's say you're a 30-year-old male, 175cm tall, weighing 70kg, moderately active, with a weight loss goal:

```
BMR = (10 × 70) + (6.25 × 175) - (5 × 30) + 5
    = 700 + 1093.75 - 150 + 5
    = 1648.75 calories

TDEE = 1648.75 × 1.55 = 2555.56 calories

Daily Goal = 2555.56 + (-500) = 2056 calories
```

If you consume 1800 calories that day:
- **Status**: Under Goal (+256)
- **Display**: Green background with positive remaining calories

## Key Features

### Automated Updates
- **Real-time calculations** as you add food entries
- **Automatic daily summaries** in the Daily Summary sheet
- **Instant dashboard updates** showing today's progress

### Smart Input Validation
- **Dropdown menus** for consistent data entry
- **Meal type categories** (Breakfast, Lunch, Dinner, Snack, Drink)
- **Date and time tracking** for detailed analysis

### Visual Feedback
- **Color-coded status indicators** (green/red)
- **Clear progress messages** showing exactly how many calories remain
- **Historical tracking** to see patterns over time

### Flexibility
- **Easy parameter updates** - change your weight, activity level, or goals anytime
- **Automatic recalculation** of all historical data when parameters change
- **Manual refresh options** when needed

## Benefits

1. **Science-Based**: Uses medically-approved formulas for accurate calorie calculations
2. **Automated**: No manual calculations required - just log your food
3. **Personalized**: Adapts to your specific body metrics and goals
4. **Visual**: Clear, immediate feedback on your progress
5. **Historical**: Track trends and patterns over time
6. **Flexible**: Easy to update goals and parameters as your needs change

## Getting Started

The app includes sample data functionality to help you understand how it works. Once set up, simply:

1. Enter your personal metrics (gender, weight, height, age)
2. Choose your activity level and goal
3. Start logging your meals with descriptions and calories
4. Watch your daily progress update automatically!

The system handles all the complex calculations behind the scenes, so you can focus on making healthy choices and reaching your goals.