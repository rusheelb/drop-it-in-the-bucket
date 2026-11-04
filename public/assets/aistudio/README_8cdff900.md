# Drop It in the Bucket – charity: water

An interactive, responsive React application built with TypeScript and Vite. Players move a charity: water bucket to catch clean water droplets and avoid contaminated drops to support water projects across India, Ethiopia, Haiti, and Uganda.

## Features

- **Difficulty Modes**:
  - **Easy**: 60s timer, relaxed drop speed, 8% brown drops, win goal 15 points.
  - **Normal**: 45s timer, standard speed, 15% brown drops, win goal 20 points.
  - **Hard**: 30s timer, high-velocity drops, 25% brown drops, win goal 30 points.
- **Sound Effects (Audio Clips)**:
  - Custom audio files stored in `/public/sounds/`:
    - `collect.wav`: Clear water droplet chime on collecting normal blue drops
    - `bonus.wav`: Sparkle chime when catching bonus +3 drops
    - `miss.wav`: Thud/buzzer when a drop hits the ground or a brown drop is caught
    - `button.wav`: Crisp button tap when clicking Start, Reset, Mute, or Difficulty tabs
    - `win.wav`: Celebratory brass fanfare upon completing a winning run
    - `milestone.wav`: Uplifting bell chime when crossing score milestones
    - `jerrycan.wav`: Rich golden chime when collecting floating Jerry Cans
  - Full fallback to Web Audio synthesis if browser restrictions apply, with sound toggle mute control.
- **Milestone Tracking & Display**:
  - Array of score milestone messages triggered conditionally as score advances:
    - **5 pts**: *"First Splash! 💧 – Great start! 5 points collected—every drop counts."*
    - **10 pts**: *"Halfway There! 🌊 – Halfway there! 10 points on the board—keep that bucket moving!"*
    - **15 pts**: *"Ethiopia Reached! 🌍 – 15 points! Clean water is opening doors for schools and families!"*
    - **20 pts**: *"Goal Achieved! 🎉 – 20 points! You’ve unlocked safe drinking water for communities in need!"*
    - **25 pts**: *"Super Supporter! ⭐ – 25 points! Your momentum is unstoppable—keep catching!"*
    - **30 pts**: *"Haiti Hills Unlocked! ⛰️ – 30 points! Fresh water brings health, hygiene, and hope!"*
    - **40 pts**: *"Water Champion! 🏆 – 40 points! Extraordinary dedication to global clean water!"*
    - **45 pts**: *"Uganda Horizon Reached! ☀️ – 45 points! Families spend hours less walking for water each day!"*
    - **50 pts**: *"Century Well Legend! 👑 – 50 points! An entire village supported with abundant clean water!"*
  - Animated gold-bordered milestone banner appears dynamically with score badge, celebratory chime, and auto-dismissal.
- **Dynamic Country Environments**:
  - Landscape background gradients and foliage dynamically update as your score grows:
    - **India** (0+ points)
    - **Ethiopia** (15+ points)
    - **Haiti** (30+ points)
    - **Uganda** (45+ points)
- **charity: water Branding**:
  - Official charity: water palette (Charcoal `#231f20`, Yellow `#ffc907`, Blue `#0d91df`)
  - Bucket branded with charity: water logo
  - High score tracking stored across sessions in `localStorage`
  - Audio sound effects synthesized with Web Audio API (toggleable mute)
  - Confetti celebration and randomized encouraging winning/losing messages upon game completion

## Tech Stack

- **Framework**: React 18, TypeScript, Vite
- **Styling**: CSS3 with CSS variables, clip-path landscapes, and responsive clamp sizing
- **Celebration**: canvas-confetti
- **Icons**: lucide-react

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
