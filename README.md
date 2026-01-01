# 🏀 NCAA Betting Analytics Dashboard

> **Fixed by PaulieB14** - Originally created by topher66 with Grok AI, but had critical build issues. Now fully functional with enhanced betting features!

## ✨ Features

### 🎯 **Live Betting Analytics**
- **Real-time pace tracking** (points per 40 minutes)
- **Projected final totals** for over/under betting
- **Pace vs season average** comparisons
- **Over/Under edge detection**
- **Game tempo analysis** (HOT/COLD/NEUTRAL)
- **Blowout risk assessment** (0-100%)

### 📊 **Live Game Data**
- Fetches from ESPN's public API (no key required)
- Updates every 8 seconds
- Shows live scores, clock, and period
- Filters for active games only

### 🎨 **Beautiful UI**
- Dark theme optimized for betting
- Color-coded betting insights
- Responsive design (mobile-friendly)
- Real-time updates

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## 🔧 What Was Fixed

### Critical Issues Resolved:
1. **Duplicate Next.js dependency** - Caused build conflicts
2. **Missing 'use client' directive** - Required for React hooks
3. **TypeScript type safety** - Replaced `any` with proper interfaces
4. **Missing Tailwind config** - Added proper configuration
5. **ESLint setup** - Fixed linting rules and targets
6. **Performance optimizations** - Improved data fetching patterns

### Enhancements Added:
- **Betting insights algorithm** - Calculates edges and recommendations
- **Advanced pace analytics** - Compares to college basketball averages
- **Risk assessment** - Blowout risk and momentum indicators
- **Professional UI** - Betting-focused design and color coding

## 📈 Betting Insights Explained

- **Pace vs Average**: How much faster/slower than typical college game (70 pts/40min)
- **O/U Edge**: Recommendation based on projected total vs typical betting lines
- **Game Tempo**: 
  - 🔥 **HOT** (75+ pace) - High-scoring, fast game
  - 🧊 **COLD** (<65 pace) - Low-scoring, slow game
  - ⚖️ **NEUTRAL** (65-75 pace) - Average tempo
- **Blowout Risk**: Likelihood game becomes non-competitive (affects totals)

## 🎲 Betting Use Cases

1. **Live Over/Under**: Compare projected totals to sportsbook lines
2. **Pace-based betting**: Identify tempo shifts mid-game
3. **Blowout detection**: Avoid totals bets in lopsided games
4. **Value identification**: Find games where pace differs from market expectations

## 🏀 When Games Are Live

During college basketball season, you'll see cards like:

```
┌─────────────────────────────────┐
│ Duke Blue Devils        85      │
│ North Carolina Tar Heels 82     │
│                                 │
│ Current Pace: 78 pts/40 min     │
│ Projected Total: 167            │
│                                 │
│ 🎯 BETTING INSIGHTS             │
│ Pace vs Average: +8             │
│ O/U Edge: OVER LEAN             │
│ Game Tempo: HOT                 │
│ Blowout Risk: 15%               │
└─────────────────────────────────┘
```

## 🚀 Deployment

This app is optimized for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Deploy automatically on push
3. No environment variables needed (uses public ESPN API)

## 🤝 Contributing

Original concept by **topher66** (Chris Ewing)  
Fixed and enhanced by **PaulieB14**

Feel free to submit issues or pull requests!

## ⚠️ Disclaimer

This tool is for educational and entertainment purposes. Please gamble responsibly and within your means. Past performance does not guarantee future results.

---

**Built with Next.js 16, React 19, TypeScript, and Tailwind CSS** 🚀