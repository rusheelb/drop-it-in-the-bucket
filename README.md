# Drop It in the Bucket – charity: water

An interactive, responsive web application built with pure **HTML5, CSS3, and Vanilla JavaScript**. Players move a charity: water bucket to catch clean water droplets and avoid contaminated drops to support water projects across India, Ethiopia, Haiti, and Uganda.

No React or bundlers are required to run this project—open `index.html` directly in any web browser or deploy directly to GitHub Pages!

## File Structure

- `index.html` - Primary starter file and game interface
- `style.css` - Responsive styles, country color themes, animations, and charity: water brand colors
- `script.js` - Game engine, collision detection, Web Audio effects, milestones, and difficulty modes
- `img/` - Official charity: water logos and Jerry Can assets
- `sounds/` - Audio sound effect clips (`collect`, `bonus`, `miss`, `button`, `win`, `milestone`, `jerrycan`)

## Features

- **Difficulty Modes**:
  - **Easy**: 60s timer, relaxed drop speed, 8% brown drops, win goal 15 points.
  - **Normal**: 45s timer, standard speed, 15% brown drops, win goal 20 points.
  - **Hard**: 30s timer, high-velocity drops, 25% brown drops, win goal 30 points.
- **Sound Effects (Audio Clips & Web Audio Synthesis)**:
  - Custom audio files stored in `sounds/`:
    - `collect.wav`: Clear water droplet chime on collecting normal blue drops (+1 pt)
    - `bonus.wav`: Sparkle chime when catching bonus +3 drops
    - `miss.wav`: Thud/buzzer when a drop hits the ground or a brown drop is caught
    - `button.wav`: Crisp button tap when clicking Start, Reset, Mute, or Difficulty tabs
    - `win.wav`: Celebratory brass fanfare upon completing a winning run
    - `milestone.wav`: Uplifting bell chime when crossing score milestones
    - `jerrycan.wav`: Rich golden chime when collecting floating Jerry Cans (+5 pts)
  - Full fallback to Web Audio synthesis if browser audio is restricted, with sound toggle mute control saved to `localStorage`.
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
- **Interactive Gameplay**:
  - **Bucket Catching**: Move bucket with mouse drag, touch swipe, or keyboard Arrow/AD keys.
  - **In-Air Tap Purification**: Directly tap brown drops in mid-air to neutralize them for +2 bonus points!
  - **Floating Jerry Cans**: Periodic yellow Jerry Cans drift across the sky—tap them for +5 bonus points.
  - **Bucket Stun Effect**: Catching a contaminant or missing a clean drop briefly shakes and stuns the bucket.
- **Dynamic Country Environments**:
  - Landscape background gradients and foliage dynamically update as your score grows:
    - **India** (0+ points)
    - **Ethiopia** (15+ points)
    - **Haiti** (30+ points)
    - **Uganda** (45+ points)
- **charity: water Branding**:
  - Official charity: water palette (Charcoal `#1a1a1a`, Yellow `#ffc907`, Blue `#003366`)
  - Bucket branded with charity: water logo
  - High score tracking stored across sessions in `localStorage`
  - Confetti celebration and encouraging winning/losing messages upon game completion

## How to Run

### Direct in Browser / GitHub Pages
Simply open `index.html` in your web browser. No server or build required!

### Optional Development Server
```bash
npm install
npm run dev
```
