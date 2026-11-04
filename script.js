/**
 * Drop It in the Bucket – charity: water
 * Pure Vanilla JavaScript implementation (No React, No Vite required)
 */

(function () {
  'use strict';

  // --- Constants & Game Configurations ---
  const COUNTRIES = [
    {
      name: 'India',
      description: 'Clean water helps families stay healthy and children stay in school.',
      themeClass: 'theme-india',
      threshold: 0,
    },
    {
      name: 'Ethiopia',
      description: 'Reliable water gives communities more time for school, work, and family.',
      themeClass: 'theme-ethiopia',
      threshold: 15,
    },
    {
      name: 'Haiti',
      description: 'Safe water supports healthier homes and stronger communities.',
      themeClass: 'theme-haiti',
      threshold: 30,
    },
    {
      name: 'Uganda',
      description: 'Nearby clean water helps families spend less time collecting water each day.',
      themeClass: 'theme-uganda',
      threshold: 45,
    },
  ];

  const DIFFICULTY_CONFIGS = {
    easy: {
      id: 'easy',
      name: 'Easy',
      badge: 'Relaxed',
      time: 60,
      winScore: 15,
      dropInterval: 1.0,
      baseSpeed: 95,
      speedVariance: 35,
      brownRate: 0.08,
      stunDuration: 350,
    },
    normal: {
      id: 'normal',
      name: 'Normal',
      badge: 'Standard',
      time: 45,
      winScore: 20,
      dropInterval: 0.8,
      baseSpeed: 130,
      speedVariance: 45,
      brownRate: 0.15,
      stunDuration: 500,
    },
    hard: {
      id: 'hard',
      name: 'Hard',
      badge: 'Challenging',
      time: 30,
      winScore: 30,
      dropInterval: 0.56,
      baseSpeed: 185,
      speedVariance: 65,
      brownRate: 0.25,
      stunDuration: 600,
    },
  };

  const WIN_MESSAGES = [
    'Amazing! You collected {score} points and reached the goal. Clean water transforms lives and empowers communities!',
    'Incredible work! With {score} points, you helped bring clean, safe water to families around the world.',
    'Spectacular catching! {score} points! Every single drop brings health, dignity, and opportunity.',
    'Victory! You collected {score} points. You made a true splash for global water access!',
  ];

  const LOSE_MESSAGES = [
    "Time's up! You collected {score} points. Keep going—every drop counts!",
    'Nice try! {score} points collected. Give it another shot to reach {goal} points!',
    'Good effort! You collected {score} points. Practice makes perfect—try again!',
    "Almost there! With {score} points, you're on your way to bringing clean water!",
  ];

  const MILESTONE_MESSAGES = [
    { score: 5, title: 'First Splash! 💧', message: 'Great start! 5 points collected—every drop counts.' },
    { score: 10, title: 'Halfway There! 🌊', message: 'Halfway there! 10 points on the board—keep that bucket moving!' },
    { score: 15, title: 'Ethiopia Reached! 🌍', message: '15 points! Clean water is opening doors for schools and families!' },
    { score: 20, title: 'Goal Achieved! 🎉', message: '20 points! You’ve unlocked safe drinking water for communities in need!' },
    { score: 25, title: 'Super Supporter! ⭐', message: '25 points! Your momentum is unstoppable—keep catching!' },
    { score: 30, title: 'Haiti Hills Unlocked! ⛰️', message: '30 points! Fresh water brings health, hygiene, and hope!' },
    { score: 40, title: 'Water Champion! 🏆', message: '40 points! Extraordinary dedication to global clean water!' },
    { score: 45, title: 'Uganda Horizon Reached! ☀️', message: '45 points! Families spend hours less walking for water each day!' },
    { score: 50, title: 'Century Well Legend! 👑', message: '50 points! An entire village supported with abundant clean water!' },
  ];

  // --- Sound Manager with Web Audio API Fallback ---
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.soundCache = new Map();

      try {
        const saved = localStorage.getItem('cw_drop_muted');
        if (saved !== null) {
          this.muted = saved === 'true';
        }
      } catch (e) {
        // Ignore localStorage error
      }

      this.preloadSounds();
    }

    preloadSounds() {
      if (typeof window === 'undefined') return;
      const soundFiles = ['button', 'collect', 'bonus', 'miss', 'win', 'milestone', 'jerrycan'];
      soundFiles.forEach((name) => {
        try {
          const audio = new Audio(`sounds/${name}.wav`);
          audio.preload = 'auto';
          this.soundCache.set(name, audio);
        } catch (e) {
          // Fallback to synth
        }
      });
    }

    playSoundFile(name, fallbackSynth) {
      if (this.muted) return;

      try {
        const cached = this.soundCache.get(name);
        const audio = cached ? cached.cloneNode() : new Audio(`sounds/${name}.wav`);
        audio.volume = 0.55;
        const promise = audio.play();
        if (promise !== undefined) {
          promise.catch(() => fallbackSynth());
        }
      } catch (e) {
        fallbackSynth();
      }
    }

    isMuted() {
      return this.muted;
    }

    setMuted(muted) {
      this.muted = muted;
      try {
        localStorage.setItem('cw_drop_muted', String(muted));
      } catch (e) {}
    }

    initCtx() {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }

    playButtonClick() {
      this.playSoundFile('button', () => {
        const ctx = this.initCtx();
        if (!ctx) return;
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.05);
          gain.gain.setValueAtTime(0.18, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.06);
        } catch (e) {}
      });
    }

    playCatch(isBonus) {
      const file = isBonus ? 'bonus' : 'collect';
      this.playSoundFile(file, () => {
        const ctx = this.initCtx();
        if (!ctx) return;
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          if (isBonus) {
            osc.frequency.setValueAtTime(650, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          } else {
            osc.frequency.setValueAtTime(480, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
          }
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + (isBonus ? 0.2 : 0.12));
        } catch (e) {}
      });
    }

    playMiss() {
      this.playSoundFile('miss', () => {
        const ctx = this.initCtx();
        if (!ctx) return;
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(200, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.16);
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.18);
        } catch (e) {}
      });
    }

    playVictory() {
      this.playSoundFile('win', () => {
        const ctx = this.initCtx();
        if (!ctx) return;
        try {
          const notes = [523.25, 659.25, 783.99, 1046.5];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
            gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + idx * 0.1);
            osc.stop(ctx.currentTime + idx * 0.1 + 0.28);
          });
        } catch (e) {}
      });
    }

    playMilestone() {
      this.playSoundFile('milestone', () => {
        const ctx = this.initCtx();
        if (!ctx) return;
        try {
          const notes = [659.25, 880, 1174.66];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
            gain.gain.setValueAtTime(0.22, ctx.currentTime + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + idx * 0.08);
            osc.stop(ctx.currentTime + idx * 0.08 + 0.22);
          });
        } catch (e) {}
      });
    }

    playJerryCanCollect() {
      this.playSoundFile('jerrycan', () => {
        const ctx = this.initCtx();
        if (!ctx) return;
        try {
          [587.33, 880.0, 1174.66].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
            gain.gain.setValueAtTime(0.22, ctx.currentTime + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.06 + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + idx * 0.06);
            osc.stop(ctx.currentTime + idx * 0.06 + 0.22);
          });
        } catch (e) {}
      });
    }

    playBrownDrop() {
      this.playMiss();
    }

    playPurify() {
      if (this.muted) return;
      const ctx = this.initCtx();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } catch (e) {}
    }
  }

  const soundManager = new SoundManager();

  // --- DOM Elements ---
  const gameContainer = document.getElementById('game-container');
  const bucket = document.getElementById('bucket');
  const dropsLayer = document.getElementById('drops-layer');
  const jerrycanLayer = document.getElementById('jerrycan-layer');
  const splashesContainer = document.getElementById('splashes-container');
  const popupsContainer = document.getElementById('popups-container');
  const feedbackEl = document.getElementById('feedback');
  const confettiContainer = document.getElementById('confetti');

  const scoreEl = document.getElementById('score');
  const goalScoreEl = document.getElementById('goal-score');
  const highScoreEl = document.getElementById('high-score');
  const timerEl = document.getElementById('timer');

  const startBtn = document.getElementById('start-btn');
  const startBtnText = document.getElementById('start-btn-text');
  const resetBtn = document.getElementById('reset-btn');
  const muteBtn = document.getElementById('mute-btn');
  const iconSoundOn = document.getElementById('icon-sound-on');
  const iconSoundOff = document.getElementById('icon-sound-off');

  const tabEasy = document.getElementById('tab-easy');
  const tabNormal = document.getElementById('tab-normal');
  const tabHard = document.getElementById('tab-hard');
  const difficultyTabs = [tabEasy, tabNormal, tabHard];
  const difficultyHint = document.getElementById('difficulty-hint');

  const countryLabel = document.getElementById('country-label');
  const countryDesc = document.getElementById('country-description');

  const milestoneBanner = document.getElementById('milestone-banner');
  const milestoneScoreTag = document.getElementById('milestone-score-tag');
  const milestoneTitle = document.getElementById('milestone-title');
  const milestoneDesc = document.getElementById('milestone-desc');
  const milestoneCloseBtn = document.getElementById('milestone-close-btn');

  const gameOverModal = document.getElementById('game-over-modal');
  const gameOverTitle = document.getElementById('game-over-title');
  const gameOverModeTag = document.getElementById('game-over-mode-tag');
  const gameOverGoalText = document.getElementById('game-over-goal-text');
  const gameOverScore = document.getElementById('game-over-score');
  const gameOverMessage = document.getElementById('game-over-message');
  const highScoreAnnouncement = document.getElementById('high-score-announcement');
  const modalPlayAgainBtn = document.getElementById('modal-play-again-btn');

  // --- State Variables ---
  let currentDifficulty = 'normal';
  let gameState = 'idle'; // 'idle' | 'playing' | 'gameover'
  let score = 0;
  let highScore = 0;
  let timeRemaining = DIFFICULTY_CONFIGS.normal.time;
  let bucketX = 0;
  let isStunned = false;
  let stunnedUntil = 0;
  let currentCountry = COUNTRIES[0];

  let drops = [];
  let jerryCans = [];
  const unlockedMilestones = new Set();
  let milestoneTimer = null;

  let nextDropId = 1;
  let nextCanId = 1;
  let dropTimer = 0;
  let canTimer = 0;
  let lastTimestamp = 0;
  let animFrameId = null;
  let timerIntervalId = null;

  // Initialize High Score
  try {
    const saved = localStorage.getItem('cw_drop_highscore');
    highScore = saved ? parseInt(saved, 10) || 0 : 0;
  } catch (e) {
    highScore = 0;
  }
  highScoreEl.textContent = String(highScore);

  // Update Audio Mute Icon
  function updateMuteUI() {
    const muted = soundManager.isMuted();
    if (muted) {
      iconSoundOn.style.display = 'none';
      iconSoundOff.style.display = 'block';
      muteBtn.setAttribute('title', 'Unmute audio');
      muteBtn.setAttribute('aria-label', 'Unmute audio');
    } else {
      iconSoundOn.style.display = 'block';
      iconSoundOff.style.display = 'none';
      muteBtn.setAttribute('title', 'Mute audio');
      muteBtn.setAttribute('aria-label', 'Mute audio');
    }
  }
  updateMuteUI();

  // Bucket centering helper
  function centerBucket() {
    if (!gameContainer || !bucket) return;
    const containerW = gameContainer.clientWidth;
    const bucketW = bucket.offsetWidth || 150;
    bucketX = Math.max(0, (containerW - bucketW) / 2);
    bucket.style.left = `${bucketX}px`;
  }
  centerBucket();
  window.addEventListener('resize', centerBucket);

  // --- Visual Effects & Popups ---
  function spawnScorePopup(x, y, text, type) {
    const popup = document.createElement('span');
    popup.className = `score-popup score-popup-${type}`;
    popup.textContent = text;
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popupsContainer.appendChild(popup);

    setTimeout(() => {
      if (popup.parentNode) popup.parentNode.removeChild(popup);
    }, 850);
  }

  function spawnSplash(x, y, type) {
    const splash = document.createElement('div');
    splash.className = `splash-effect splash-${type}`;
    splash.style.left = `${x}px`;
    splash.style.top = `${y}px`;

    splash.innerHTML = `
      <span class="splash-ring"></span>
      <span class="splash-particle p1"></span>
      <span class="splash-particle p2"></span>
      <span class="splash-particle p3"></span>
      <span class="splash-particle p4"></span>
    `;
    splashesContainer.appendChild(splash);

    setTimeout(() => {
      if (splash.parentNode) splash.parentNode.removeChild(splash);
    }, 500);
  }

  // Confetti celebration (using window.confetti if available, plus self-contained DOM fallback)
  function launchCelebration() {
    if (typeof window.confetti === 'function') {
      try {
        const count = 120;
        const defaults = { origin: { y: 0.65 }, colors: ['#ffc907', '#2e9df7', '#4fcb53', '#ff902a', '#f5402c'] };
        window.confetti({ ...defaults, particleCount: Math.floor(count * 0.4), spread: 60 });
        window.confetti({ ...defaults, particleCount: Math.floor(count * 0.3), spread: 100 });
        window.confetti({ ...defaults, particleCount: Math.floor(count * 0.3), spread: 120, startVelocity: 45 });
        return;
      } catch (e) {}
    }

    // Built-in DOM Confetti Fallback
    const colors = ['#ffc907', '#2e9df7', '#4fcb53', '#ff902a', '#f5402c'];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.setProperty('--confetti-x', `${Math.random() * 100}%`);
      piece.style.setProperty('--confetti-color', colors[Math.floor(Math.random() * colors.length)]);
      piece.style.setProperty('--confetti-delay', `${Math.random() * 0.5}s`);
      confettiContainer.appendChild(piece);

      setTimeout(() => {
        if (piece.parentNode) piece.parentNode.removeChild(piece);
      }, 3000);
    }
  }

  // --- Country & Milestones Updates ---
  function updateCountryForScore(newScore) {
    const countryIndex = Math.min(Math.floor(Math.max(newScore, 0) / 15), COUNTRIES.length - 1);
    const country = COUNTRIES[countryIndex];
    if (country !== currentCountry) {
      gameContainer.classList.remove(currentCountry.themeClass);
      currentCountry = country;
      gameContainer.classList.add(currentCountry.themeClass);
      countryLabel.textContent = country.name;
      countryDesc.textContent = country.description;
    }
  }

  function checkMilestones(prevScore, newScore) {
    for (const milestone of MILESTONE_MESSAGES) {
      if (prevScore < milestone.score && newScore >= milestone.score && !unlockedMilestones.has(milestone.score)) {
        unlockedMilestones.add(milestone.score);
        showMilestoneBanner(milestone);
        soundManager.playMilestone();
        break;
      }
    }
  }

  function showMilestoneBanner(milestone) {
    milestoneScoreTag.textContent = `${milestone.score} PTS`;
    milestoneTitle.textContent = milestone.title;
    milestoneDesc.textContent = milestone.message;
    milestoneBanner.classList.remove('hidden');

    if (milestoneTimer) clearTimeout(milestoneTimer);
    milestoneTimer = setTimeout(() => {
      dismissMilestoneBanner();
    }, 3600);
  }

  function dismissMilestoneBanner() {
    milestoneBanner.classList.add('hidden');
    if (milestoneTimer) {
      clearTimeout(milestoneTimer);
      milestoneTimer = null;
    }
  }
  milestoneCloseBtn.addEventListener('click', dismissMilestoneBanner);

  // --- Score Management ---
  function addScore(delta, customFeedback) {
    const prevScore = score;
    score += delta;
    scoreEl.textContent = String(score);

    updateCountryForScore(score);
    checkMilestones(prevScore, score);

    if (score > highScore) {
      highScore = score;
      highScoreEl.textContent = String(highScore);
      try {
        localStorage.setItem('cw_drop_highscore', String(highScore));
      } catch (e) {}
    }

    if (customFeedback) {
      feedbackEl.textContent = customFeedback;
    } else if (delta > 0) {
      feedbackEl.textContent = `+${delta} point${delta === 1 ? '' : 's'}!`;
    } else if (delta < 0) {
      feedbackEl.textContent = `${delta} points for catching a brown drop.`;
    }
  }

  // Stun Bucket
  function stunBucket(timestamp) {
    const cfg = DIFFICULTY_CONFIGS[currentDifficulty];
    stunnedUntil = timestamp + cfg.stunDuration;
    isStunned = true;
    bucket.classList.add('stunned');
    setTimeout(() => {
      isStunned = false;
      bucket.classList.remove('stunned');
    }, cfg.stunDuration);
  }

  // Format Time Helper
  function formatTime(seconds) {
    return `0:${String(Math.max(0, seconds)).padStart(2, '0')}`;
  }

  // --- Difficulty Selection ---
  function selectDifficulty(diff) {
    if (gameState === 'playing') return;
    currentDifficulty = diff;
    const cfg = DIFFICULTY_CONFIGS[diff];

    difficultyTabs.forEach((tab) => {
      if (tab.dataset.difficulty === diff) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    goalScoreEl.textContent = String(cfg.winScore);
    timeRemaining = cfg.time;
    timerEl.textContent = formatTime(timeRemaining);
  }

  difficultyTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      soundManager.playButtonClick();
      selectDifficulty(tab.dataset.difficulty);
    });
  });

  // --- Bucket Controls (Mouse, Touch, Keyboard) ---
  function moveBucket(clientX) {
    if (gameState !== 'playing') return;
    if (performance.now() < stunnedUntil) return;

    const bounds = gameContainer.getBoundingClientRect();
    const bucketW = bucket.offsetWidth || 150;
    const rawX = clientX - bounds.left - bucketW / 2;
    bucketX = Math.max(0, Math.min(bounds.width - bucketW, rawX));
    bucket.style.left = `${bucketX}px`;
  }

  gameContainer.addEventListener('pointermove', (e) => moveBucket(e.clientX));
  gameContainer.addEventListener('pointerdown', (e) => moveBucket(e.clientX));

  window.addEventListener('keydown', (e) => {
    if (gameState !== 'playing') return;
    if (performance.now() < stunnedUntil) return;

    const step = 28;
    const bounds = gameContainer.getBoundingClientRect();
    const bucketW = bucket.offsetWidth || 150;

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      bucketX = Math.max(0, bucketX - step);
      bucket.style.left = `${bucketX}px`;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      bucketX = Math.min(bounds.width - bucketW, bucketX + step);
      bucket.style.left = `${bucketX}px`;
    }
  });

  // --- Direct Drops & Jerry Can Interaction ---
  function onDropClick(drop, e) {
    if (gameState !== 'playing') return;
    e.stopPropagation();

    const bounds = gameContainer.getBoundingClientRect();
    const clickX = e.clientX - bounds.left;
    const clickY = e.clientY - bounds.top;

    // Remove drop from array & DOM
    removeDrop(drop);

    if (drop.isBrown) {
      soundManager.playPurify();
      spawnSplash(clickX, clickY, 'purify');
      spawnScorePopup(clickX, clickY, '+2 Purified!', 'special');
      addScore(2, 'Contaminant neutralized! +2 points.');
    } else {
      soundManager.playCatch(drop.points === 3);
      spawnSplash(clickX, clickY, 'water');
      spawnScorePopup(clickX, clickY, `+${drop.points}`, drop.points === 3 ? 'bonus' : 'positive');
      addScore(drop.points, `Direct catch! +${drop.points} point${drop.points === 1 ? '' : 's'}.`);
    }
  }

  function onJerryCanClick(can, e) {
    if (gameState !== 'playing') return;
    e.stopPropagation();

    const bounds = gameContainer.getBoundingClientRect();
    const clickX = e.clientX - bounds.left;
    const clickY = e.clientY - bounds.top;

    removeJerryCan(can);

    soundManager.playJerryCanCollect();
    spawnSplash(clickX, clickY, 'gold');
    spawnScorePopup(clickX, clickY, '+5 Jerry Can!', 'special');
    addScore(can.points, 'Collected Jerry Can! +5 Clean Water points!');
  }

  function removeDrop(drop) {
    if (drop.element && drop.element.parentNode) {
      drop.element.parentNode.removeChild(drop.element);
    }
    drops = drops.filter((d) => d.id !== drop.id);
  }

  function removeJerryCan(can) {
    if (can.element && can.element.parentNode) {
      can.element.parentNode.removeChild(can.element);
    }
    jerryCans = jerryCans.filter((c) => c.id !== can.id);
  }

  // --- Main Game Loop ---
  function gameLoop(timestamp) {
    if (gameState !== 'playing') return;

    const delta = Math.min((timestamp - lastTimestamp) / 1000 || 0, 0.05);
    lastTimestamp = timestamp;

    const cfg = DIFFICULTY_CONFIGS[currentDifficulty];

    // Spawn falling drops
    dropTimer += delta;
    if (dropTimer >= cfg.dropInterval) {
      dropTimer = 0;
      const isBrown = Math.random() < cfg.brownRate;
      const points = isBrown ? -5 : Math.random() < 0.25 ? 3 : 1;
      const size = isBrown ? 32 : 28;
      const maxX = Math.max(0, gameContainer.clientWidth - size);

      const dropEl = document.createElement('div');
      dropEl.className = isBrown ? 'drop brown-drop' : points === 3 ? 'drop bonus-drop' : 'drop';
      dropEl.style.width = `${size}px`;
      dropEl.style.height = `${size}px`;

      const newDrop = {
        id: nextDropId++,
        x: Math.random() * maxX,
        y: 54,
        size,
        points,
        missPenalty: isBrown ? 0 : points,
        speed: cfg.baseSpeed + Math.random() * cfg.speedVariance,
        isBrown,
        element: dropEl,
      };

      dropEl.style.left = `${newDrop.x}px`;
      dropEl.style.top = `${newDrop.y}px`;
      dropEl.addEventListener('pointerdown', (e) => onDropClick(newDrop, e));

      dropsLayer.appendChild(dropEl);
      drops.push(newDrop);
    }

    // Spawn floating Jerry Can target (~every 14s)
    canTimer += delta;
    if (canTimer >= 14 && jerryCans.length === 0) {
      canTimer = 0;
      const fromLeft = Math.random() > 0.5;
      const canW = 54;
      const canH = 54;

      const canEl = document.createElement('div');
      canEl.className = 'floating-jerry-can';
      canEl.style.width = `${canW}px`;
      canEl.style.height = `${canH}px`;
      canEl.setAttribute('role', 'button');
      canEl.setAttribute('tabindex', '0');
      canEl.setAttribute('aria-label', 'Bonus Yellow Jerry Can! Tap to collect +5 points');
      canEl.setAttribute('title', 'Tap to collect +5 bonus water points!');

      canEl.innerHTML = `
        <img src="img/water-can-transparent.png" alt="charity: water yellow jerry can" class="jerry-can-img" draggable="false" />
        <div class="jerry-can-badge">+5</div>
      `;

      const newCan = {
        id: nextCanId++,
        x: fromLeft ? -canW : gameContainer.clientWidth,
        y: 80 + Math.random() * 80,
        speedX: (fromLeft ? 1 : -1) * (55 + Math.random() * 25),
        points: 5,
        width: canW,
        height: canH,
        element: canEl,
      };

      canEl.style.left = `${newCan.x}px`;
      canEl.style.top = `${newCan.y}px`;
      canEl.addEventListener('pointerdown', (e) => onJerryCanClick(newCan, e));

      jerrycanLayer.appendChild(canEl);
      jerryCans.push(newCan);
    }

    // Update floating Jerry Cans
    for (let i = jerryCans.length - 1; i >= 0; i--) {
      const can = jerryCans[i];
      can.x += can.speedX * delta;
      if ((can.speedX > 0 && can.x > gameContainer.clientWidth + 50) || (can.speedX < 0 && can.x < -can.width - 50)) {
        removeJerryCan(can);
        continue;
      }
      can.element.style.left = `${can.x}px`;
    }

    // Update falling drops
    const containerH = gameContainer.clientHeight;
    const bucketTop = containerH - bucket.offsetHeight - 10;
    const bucketRight = bucketX + bucket.offsetWidth;

    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i];
      drop.y += drop.speed * delta;

      // Collision with Bucket
      const overlapsBucket = drop.x < bucketRight && drop.x + drop.size > bucketX;
      const hitsBucketVertically = drop.y + drop.size >= bucketTop && drop.y < bucketTop + bucket.offsetHeight;

      if (overlapsBucket && hitsBucketVertically) {
        const dropMidX = drop.x + drop.size / 2;
        const dropMidY = drop.y + drop.size / 2;

        if (drop.isBrown) {
          soundManager.playBrownDrop();
          spawnSplash(dropMidX, dropMidY, 'mud');
          spawnScorePopup(dropMidX, dropMidY, '-5 Contaminated', 'negative');
        } else {
          soundManager.playCatch(drop.points === 3);
          spawnSplash(dropMidX, dropMidY, 'water');
          spawnScorePopup(dropMidX, dropMidY, `+${drop.points}`, drop.points === 3 ? 'bonus' : 'positive');
        }

        addScore(drop.points);
        removeDrop(drop);
        continue;
      }

      // Missed drop hits bottom
      if (drop.y > containerH) {
        const dropMidX = drop.x + drop.size / 2;
        if (drop.missPenalty > 0) {
          soundManager.playMiss();
          stunBucket(timestamp);
          spawnSplash(dropMidX, containerH - 12, 'mud');
          spawnScorePopup(dropMidX, containerH - 30, `-${drop.missPenalty} Miss`, 'negative');
          addScore(-drop.missPenalty, `Missed drop: -${drop.missPenalty} point${drop.missPenalty === 1 ? '' : 's'}.`);
        }
        removeDrop(drop);
        continue;
      }

      drop.element.style.top = `${drop.y}px`;
    }

    animFrameId = requestAnimationFrame(gameLoop);
  }

  // --- End Game Handler ---
  function endGame() {
    gameState = 'gameover';

    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      timerIntervalId = null;
    }
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }

    // Clear active drop elements
    drops.forEach((d) => d.element && d.element.remove());
    drops = [];
    jerryCans.forEach((c) => c.element && c.element.remove());
    jerryCans = [];

    startBtn.disabled = false;
    startBtnText.textContent = 'Play Again';
    difficultyTabs.forEach((tab) => (tab.disabled = false));
    difficultyHint.textContent = 'Select before starting';

    const cfg = DIFFICULTY_CONFIGS[currentDifficulty];
    const isWin = score >= cfg.winScore;

    const messageTemplates = isWin ? WIN_MESSAGES : LOSE_MESSAGES;
    const randomIndex = Math.floor(Math.random() * messageTemplates.length);
    const chosenMessage = messageTemplates[randomIndex]
      .replace('{score}', String(score))
      .replace('{goal}', String(cfg.winScore));

    gameOverTitle.textContent = isWin ? '🎉 Goal Achieved!' : '⏰ Time’s Up!';
    gameOverModeTag.textContent = `${cfg.name} Mode`;
    gameOverGoalText.textContent = `Goal: ${cfg.winScore} pts`;
    gameOverScore.textContent = `${score} points`;
    gameOverMessage.textContent = chosenMessage;

    if (score > 0 && score >= highScore) {
      highScoreAnnouncement.style.display = 'flex';
    } else {
      highScoreAnnouncement.style.display = 'none';
    }

    feedbackEl.textContent = isWin
      ? `Goal reached! You collected ${score} points on ${cfg.name} mode.`
      : `Time's up! You collected ${score} points (Goal: ${cfg.winScore}).`;

    gameOverModal.classList.remove('hidden');

    if (isWin) {
      soundManager.playVictory();
      launchCelebration();
    } else {
      soundManager.playMiss();
    }
  }

  // --- Start Game ---
  function startGame() {
    if (gameState === 'playing') return;

    if (timerIntervalId) clearInterval(timerIntervalId);
    if (animFrameId) cancelAnimationFrame(animFrameId);

    const cfg = DIFFICULTY_CONFIGS[currentDifficulty];
    score = 0;
    scoreEl.textContent = '0';
    timeRemaining = cfg.time;
    timerEl.textContent = formatTime(timeRemaining);

    drops.forEach((d) => d.element && d.element.remove());
    drops = [];
    jerryCans.forEach((c) => c.element && c.element.remove());
    jerryCans = [];
    splashesContainer.innerHTML = '';
    popupsContainer.innerHTML = '';

    unlockedMilestones.clear();
    dismissMilestoneBanner();
    gameOverModal.classList.add('hidden');

    dropTimer = 0;
    canTimer = 0;
    lastTimestamp = performance.now();
    stunnedUntil = 0;
    isStunned = false;
    bucket.classList.remove('stunned');

    updateCountryForScore(0);
    feedbackEl.textContent = `Mode: ${cfg.name}. Catch clean drops or tap them in air! Goal: ${cfg.winScore} pts.`;
    centerBucket();

    gameState = 'playing';
    startBtn.disabled = true;
    startBtnText.textContent = 'Playing...';
    difficultyTabs.forEach((tab) => (tab.disabled = true));
    difficultyHint.textContent = '(Changes apply when next game starts)';

    timerIntervalId = setInterval(() => {
      timeRemaining--;
      timerEl.textContent = formatTime(timeRemaining);
      if (timeRemaining <= 0) {
        endGame();
      }
    }, 1000);

    animFrameId = requestAnimationFrame(gameLoop);
  }

  // --- Reset Game ---
  function resetGame() {
    gameState = 'idle';

    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      timerIntervalId = null;
    }
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }

    const cfg = DIFFICULTY_CONFIGS[currentDifficulty];
    drops.forEach((d) => d.element && d.element.remove());
    drops = [];
    jerryCans.forEach((c) => c.element && c.element.remove());
    jerryCans = [];
    splashesContainer.innerHTML = '';
    popupsContainer.innerHTML = '';

    unlockedMilestones.clear();
    dismissMilestoneBanner();
    gameOverModal.classList.add('hidden');

    score = 0;
    scoreEl.textContent = '0';
    timeRemaining = cfg.time;
    timerEl.textContent = formatTime(timeRemaining);

    stunnedUntil = 0;
    isStunned = false;
    bucket.classList.remove('stunned');

    updateCountryForScore(0);
    feedbackEl.textContent = 'Move the bucket or tap falling drops.';
    centerBucket();

    startBtn.disabled = false;
    startBtnText.textContent = 'Start Game';
    difficultyTabs.forEach((tab) => (tab.disabled = false));
    difficultyHint.textContent = 'Select before starting';
  }

  // --- Event Bindings ---
  startBtn.addEventListener('click', () => {
    soundManager.playButtonClick();
    startGame();
  });

  resetBtn.addEventListener('click', () => {
    soundManager.playButtonClick();
    resetGame();
  });

  modalPlayAgainBtn.addEventListener('click', () => {
    soundManager.playButtonClick();
    startGame();
  });

  muteBtn.addEventListener('click', () => {
    soundManager.playButtonClick();
    soundManager.setMuted(!soundManager.isMuted());
    updateMuteUI();
  });
})();
