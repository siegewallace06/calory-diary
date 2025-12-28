# Calorie Diary Automation

An intelligent Google Sheets-based calorie tracking system with automated calculations, goal monitoring, and personalized recommendations.

## 🍎 What This Does

Transform any Google Sheet into a powerful calorie tracking dashboard that:
- **Automatically calculates** your daily calorie needs using scientific formulas
- **Tracks your intake** with simple food logging
- **Provides real-time feedback** on your progress toward daily goals
- **Maintains historical records** for trend analysis
- **Updates everything automatically** as you log meals

## ✨ Key Features

- 🧮 **Smart Calculations**: Uses Mifflin-St Jeor equation for accurate BMR/TDEE
- 🎯 **Goal Tracking**: Visual progress indicators (green = under goal, red = over)
- 📊 **Three-Sheet System**: Log entries, Dashboard view, Historical summary
- 🔄 **Auto-Updates**: Real-time recalculation as you add food entries
- 📱 **User-Friendly**: Dropdown menus and guided input validation
- 🏃‍♂️ **Activity-Aware**: Adjusts for your activity level and goals
- 📈 **Historical Analysis**: Track trends and patterns over time

## 🚀 Quick Start

1. **Create a Google Sheet** with three sheets: `Log`, `Dashboard`, `Daily Summary`
2. **Install the script** from `scripts/CaloryDiaryAutomation_v2.gs`
3. **Run "Initialize All"** from the Calory Diary menu
4. **Enter your personal metrics** (weight, height, age, activity level, goal)
5. **Start logging food** in the Log sheet
6. **Watch your progress** update automatically in Dashboard

**Need detailed setup instructions?** See [Setup Guide](documentation/setup-guide.md)

## 📁 Repository Structure

```
calory-diary/
├── scripts/
│   ├── CaloryDiaryAutomation_v1.gs    # Legacy version
│   └── CaloryDiaryAutomation_v2.gs    # Current version ⭐
├── documentation/
│   ├── app-explanation.md              # How the app works
│   ├── technical-documentation.md      # Developer guide
│   └── setup-guide.md                 # Step-by-step setup
├── templates/                          # (Future: Pre-configured sheets)
└── README.md                          # This file
```

## 📚 Documentation

- **[App Explanation](documentation/app-explanation.md)** - Understand how it works, the formulas used, and benefits
- **[Setup Guide](documentation/setup-guide.md)** - Complete step-by-step installation instructions
- **[Technical Documentation](documentation/technical-documentation.md)** - Developer guide and script architecture

## 🎯 How It Calculates Your Goals

### 1. Basal Metabolic Rate (BMR)
Uses the **Mifflin-St Jeor Equation**:
- **Men**: BMR = (10 × weight) + (6.25 × height) - (5 × age) + 5
- **Women**: BMR = (10 × weight) + (6.25 × height) - (5 × age) - 161

### 2. Total Daily Energy Expenditure (TDEE)
Multiplies BMR by your activity factor:
- 1.2 = Sedentary
- 1.375 = Lightly active
- 1.55 = Moderately active
- 1.725 = Very active
- 1.9 = Extremely active

### 3. Goal Adjustment
Applies your objective:
- **Weight Loss**: -500 calories (≈0.5 kg/week)
- **Maintenance**: 0 calories
- **Weight Gain**: +500 calories (≈0.5 kg/week)

## 📊 Example Usage

**Your Profile**: 30-year-old male, 175cm, 70kg, moderately active, weight loss goal

**Calculation**:
- BMR = (10×70) + (6.25×175) - (5×30) + 5 = 1,649 calories
- TDEE = 1,649 × 1.55 = 2,556 calories  
- Goal = 2,556 - 500 = **2,056 calories/day**

**Daily Tracking**:
- Breakfast: 350 cal
- Lunch: 450 cal  
- Dinner: 600 cal
- Snacks: 200 cal
- **Total**: 1,600 cal
- **Status**: Under Goal (+456) ✅

## 🛠 Requirements

- Google account with Google Sheets access
- Basic familiarity with Google Sheets
- One-time setup (about 10 minutes)

## 🔧 Installation

### Option 1: Quick Setup (Recommended)
1. Create new Google Sheet with sheets named: `Log`, `Dashboard`, `Daily Summary`
2. Copy script from `scripts/CaloryDiaryAutomation_v2.gs` to Apps Script editor
3. Authorize permissions and run "Initialize All"
4. Enter your personal metrics
5. Start logging food!

### Option 2: Detailed Setup
Follow the complete [Setup Guide](documentation/setup-guide.md) for step-by-step instructions with screenshots and troubleshooting.

## 📱 Daily Workflow

1. **Log Your Meals**: Add entries to Log sheet (date, time, meal type, food, calories)
2. **Check Progress**: Dashboard automatically shows today's status
3. **Monitor Trends**: Daily Summary sheet tracks historical data
4. **Adjust Goals**: Update personal metrics anytime - system recalculates everything

## 🔄 Version History

- **v2.0** (Current) - Enhanced automation, better error handling, comprehensive documentation
- **v1.0** - Initial release with basic functionality

## 🤝 Contributing

This is a personal project, but feel free to:
- Fork and customize for your needs
- Report issues or suggest improvements
- Share your customizations

## 📄 License

MIT License - Feel free to use, modify, and distribute as needed.

## 🆘 Support

**Having issues?**
1. Check the [Setup Guide](documentation/setup-guide.md) troubleshooting section
2. Verify your sheet names match exactly: `Log`, `Dashboard`, `Daily Summary`
3. Ensure all personal metrics are filled in Dashboard cells H2-H7
4. Try "Refresh Calculations" from the Calory Diary menu

**Want to understand how it works?**
- Read the [App Explanation](documentation/app-explanation.md) for user-friendly details
- Check [Technical Documentation](documentation/technical-documentation.md) for developer insights

---

**Start tracking your calories intelligently today! 🎯**