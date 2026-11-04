import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { DifficultySelector } from './components/DifficultySelector';
import { ScorePanel } from './components/ScorePanel';
import { Bucket } from './components/Bucket';
import { FallingDrop } from './components/FallingDrop';
import { JerryCanTarget } from './components/JerryCanTarget';
import { ScorePopups } from './components/ScorePopups';
import { Splashes } from './components/Splashes';
import { CountryInfo } from './components/CountryInfo';
import { GameOverModal } from './components/GameOverModal';
import { MilestoneBanner } from './components/MilestoneBanner';
import { CharityWaterFooter } from './components/CharityWaterFooter';
import { soundManager } from './utils/audio';
import {
  Drop,
  Country,
  GameState,
  Difficulty,
  DifficultyConfig,
  ScorePopup,
  SplashEffect,
  JerryCanItem,
  Milestone,
} from './types';
import './styles.css';

const COUNTRIES: Country[] = [
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

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    id: 'easy',
    name: 'Easy',
    badge: 'Relaxed',
    description: 'Gentler fall speed, fewer contaminants, 15 points to win.',
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
    description: 'Standard speed and balanced challenges, 20 points to win.',
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
    description: 'Faster drops, heavier penalties, 30 points to win in 30s!',
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

const MILESTONE_MESSAGES: Milestone[] = [
  {
    score: 5,
    title: 'First Splash! 💧',
    message: 'Great start! 5 points collected—every drop counts towards clean water.',
  },
  {
    score: 10,
    title: 'Halfway There! 🌊',
    message: 'Halfway there! 10 points on the board—keep that bucket moving!',
  },
  {
    score: 15,
    title: 'Ethiopia Reached! 🌍',
    message: '15 points! Clean water is opening doors for schools and families!',
  },
  {
    score: 20,
    title: 'Goal Achieved! 🎉',
    message: '20 points! You’ve unlocked safe drinking water for communities in need!',
  },
  {
    score: 25,
    title: 'Super Supporter! ⭐',
    message: '25 points! Your momentum is unstoppable—keep catching!',
  },
  {
    score: 30,
    title: 'Haiti Hills Unlocked! ⛰️',
    message: '30 points! Fresh water brings health, hygiene, and hope!',
  },
  {
    score: 40,
    title: 'Water Champion! 🏆',
    message: '40 points! Extraordinary dedication to global clean water!',
  },
  {
    score: 45,
    title: 'Uganda Horizon Reached! ☀️',
    message: '45 points! Families spend hours less walking for water each day!',
  },
  {
    score: 50,
    title: 'Century Well Legend! 👑',
    message: '50 points! An entire village supported with abundant clean water!',
  },
];

export const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cw_drop_highscore');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });
  const [timeRemaining, setTimeRemaining] = useState<number>(DIFFICULTY_CONFIGS.normal.time);
  const [feedback, setFeedback] = useState<string>('Move the bucket or tap drops to collect clean water.');
  const [bucketX, setBucketX] = useState<number>(0);
  const [isStunned, setIsStunned] = useState<boolean>(false);
  const [currentCountry, setCurrentCountry] = useState<Country>(COUNTRIES[0]);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [jerryCans, setJerryCans] = useState<JerryCanItem[]>([]);
  const [popups, setPopups] = useState<ScorePopup[]>([]);
  const [splashes, setSplashes] = useState<SplashEffect[]>([]);
  const [endMessage, setEndMessage] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.isMuted());
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);

  // Current config ref for loop execution
  const currentConfig = DIFFICULTY_CONFIGS[difficulty];
  const configRef = useRef<DifficultyConfig>(currentConfig);
  configRef.current = currentConfig;

  // Refs for animation loop and fresh mutable values
  const containerRef = useRef<HTMLDivElement>(null);
  const bucketRef = useRef<HTMLDivElement>(null);
  const gameStateRef = useRef<GameState>(gameState);
  gameStateRef.current = gameState;

  const scoreRef = useRef<number>(score);
  scoreRef.current = score;

  const bucketXRef = useRef<number>(bucketX);
  bucketXRef.current = bucketX;

  const stunnedUntilRef = useRef<number>(0);
  const dropsRef = useRef<Drop[]>([]);
  dropsRef.current = drops;

  const jerryCansRef = useRef<JerryCanItem[]>([]);
  jerryCansRef.current = jerryCans;

  const unlockedMilestonesRef = useRef<Set<number>>(new Set());
  const milestoneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextDropId = useRef<number>(1);
  const nextCanId = useRef<number>(1);
  const nextPopupId = useRef<number>(1);
  const nextSplashId = useRef<number>(1);

  const dropTimerRef = useRef<number>(0);
  const canTimerRef = useRef<number>(0);
  const lastTimestampRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Position bucket in center initially or upon window resize
  const centerBucket = useCallback(() => {
    if (containerRef.current && bucketRef.current) {
      const containerW = containerRef.current.clientWidth;
      const bucketW = bucketRef.current.offsetWidth || 150;
      const initialX = Math.max(0, (containerW - bucketW) / 2);
      setBucketX(initialX);
      bucketXRef.current = initialX;
    }
  }, []);

  useEffect(() => {
    centerBucket();
    window.addEventListener('resize', centerBucket);
    return () => window.removeEventListener('resize', centerBucket);
  }, [centerBucket]);

  // Handle difficulty switch when idle
  const handleSelectDifficulty = (newDiff: Difficulty) => {
    if (gameState === 'playing') return;
    setDifficulty(newDiff);
    setTimeRemaining(DIFFICULTY_CONFIGS[newDiff].time);
  };

  // Visual helper: trigger floating score popup that removes from DOM after animation
  const spawnScorePopup = useCallback((x: number, y: number, text: string, type: ScorePopup['type']) => {
    const id = nextPopupId.current++;
    const popup: ScorePopup = { id, x, y, text, type };
    setPopups((prev) => [...prev, popup]);

    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 850);
  }, []);

  // Visual helper: trigger splash ripple that removes from DOM
  const spawnSplash = useCallback((x: number, y: number, type: SplashEffect['type']) => {
    const id = nextSplashId.current++;
    const splash: SplashEffect = { id, x, y, type };
    setSplashes((prev) => [...prev, splash]);

    setTimeout(() => {
      setSplashes((prev) => prev.filter((s) => s.id !== id));
    }, 500);
  }, []);

  // Update country based on current score
  const updateCountryForScore = useCallback((newScore: number) => {
    const countryIndex = Math.min(
      Math.floor(Math.max(newScore, 0) / 15),
      COUNTRIES.length - 1
    );
    setCurrentCountry(COUNTRIES[countryIndex]);
  }, []);

  // Update score helper
  const addScore = useCallback(
    (delta: number, customFeedback?: string) => {
      setScore((prev) => {
        const next = prev + delta;
        scoreRef.current = next;
        updateCountryForScore(next);

        // Check milestones conditionally
        for (const milestone of MILESTONE_MESSAGES) {
          if (
            prev < milestone.score &&
            next >= milestone.score &&
            !unlockedMilestonesRef.current.has(milestone.score)
          ) {
            unlockedMilestonesRef.current.add(milestone.score);
            setActiveMilestone(milestone);
            soundManager.playMilestone();
            if (milestoneTimerRef.current) clearTimeout(milestoneTimerRef.current);
            milestoneTimerRef.current = setTimeout(() => {
              setActiveMilestone(null);
            }, 3600);
            break;
          }
        }

        // Update high score
        if (next > highScore) {
          setHighScore(next);
          try {
            localStorage.setItem('cw_drop_highscore', String(next));
          } catch {
            // Ignore
          }
        }
        return next;
      });

      if (customFeedback) {
        setFeedback(customFeedback);
      } else if (delta > 0) {
        setFeedback(`+${delta} point${delta === 1 ? '' : 's'}!`);
      } else if (delta < 0) {
        setFeedback(`${delta} points for catching a brown drop.`);
      }
    },
    [highScore, updateCountryForScore]
  );

  // Stun bucket
  const stunBucket = useCallback((timestamp: number) => {
    const stunMs = configRef.current.stunDuration;
    stunnedUntilRef.current = timestamp + stunMs;
    setIsStunned(true);
    setTimeout(() => {
      setIsStunned(false);
    }, stunMs);
  }, []);

  // Launch celebration confetti
  const launchCelebration = useCallback(() => {
    try {
      const count = 120;
      const defaults = {
        origin: { y: 0.65 },
        colors: ['#ffc907', '#2e9df7', '#4fcb53', '#ff902a', '#f5402c'],
      };

      confetti({
        ...defaults,
        particleCount: Math.floor(count * 0.4),
        spread: 60,
      });
      confetti({
        ...defaults,
        particleCount: Math.floor(count * 0.3),
        spread: 100,
      });
      confetti({
        ...defaults,
        particleCount: Math.floor(count * 0.3),
        spread: 120,
        startVelocity: 45,
      });
    } catch {
      // Fallback
    }
  }, []);

  // End game handler
  const endGame = useCallback(() => {
    setGameState('gameover');
    gameStateRef.current = 'gameover';

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    setDrops([]);
    dropsRef.current = [];
    setJerryCans([]);
    jerryCansRef.current = [];

    const finalScore = scoreRef.current;
    const targetWinScore = configRef.current.winScore;
    const isWin = finalScore >= targetWinScore;

    const messageTemplates = isWin ? WIN_MESSAGES : LOSE_MESSAGES;
    const randomIndex = Math.floor(Math.random() * messageTemplates.length);
    const chosenMessage = messageTemplates[randomIndex]
      .replace('{score}', String(finalScore))
      .replace('{goal}', String(targetWinScore));

    setEndMessage(chosenMessage);
    setFeedback(
      isWin
        ? `Goal reached! You collected ${finalScore} points on ${configRef.current.name} mode.`
        : `Time's up! You collected ${finalScore} points (Goal: ${targetWinScore}).`
    );

    if (isWin) {
      soundManager.playVictory();
      launchCelebration();
    } else {
      soundManager.playMiss();
    }
  }, [launchCelebration]);

  // Direct Click/Tap on a drop: Interactive Element Interaction
  const handleDropClick = useCallback(
    (clickedDrop: Drop, e: React.MouseEvent | React.PointerEvent) => {
      if (gameStateRef.current !== 'playing') return;

      const container = containerRef.current;
      const bounds = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
      const clickX = e.clientX - bounds.left;
      const clickY = e.clientY - bounds.top;

      // Remove the drop from active list in DOM
      dropsRef.current = dropsRef.current.filter((d) => d.id !== clickedDrop.id);
      setDrops([...dropsRef.current]);

      if (clickedDrop.isBrown) {
        // Player tapped a contaminant to neutralize/purify it!
        soundManager.playPurify();
        spawnSplash(clickX, clickY, 'purify');
        spawnScorePopup(clickX, clickY, '+2 Purified!', 'special');
        addScore(2, 'Contaminant neutralized! +2 points.');
      } else {
        // Player tapped clean water directly
        soundManager.playCatch(clickedDrop.points === 3);
        spawnSplash(clickX, clickY, 'water');
        spawnScorePopup(
          clickX,
          clickY,
          `+${clickedDrop.points}`,
          clickedDrop.points === 3 ? 'bonus' : 'positive'
        );
        addScore(clickedDrop.points, `Direct catch! +${clickedDrop.points} point${clickedDrop.points === 1 ? '' : 's'}.`);
      }
    },
    [addScore, spawnScorePopup, spawnSplash]
  );

  // Direct Click/Tap on interactive Jerry Can: Collect bonus & remove from DOM
  const handleJerryCanCollect = useCallback(
    (item: JerryCanItem, e: React.MouseEvent | React.PointerEvent) => {
      if (gameStateRef.current !== 'playing') return;

      const container = containerRef.current;
      const bounds = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
      const clickX = e.clientX - bounds.left;
      const clickY = e.clientY - bounds.top;

      // Remove Jerry Can from DOM
      jerryCansRef.current = jerryCansRef.current.filter((c) => c.id !== item.id);
      setJerryCans([...jerryCansRef.current]);

      soundManager.playJerryCanCollect();
      spawnSplash(clickX, clickY, 'gold');
      spawnScorePopup(clickX, clickY, '+5 Jerry Can!', 'special');
      addScore(item.points, 'Collected Jerry Can! +5 Clean Water points!');
    },
    [addScore, spawnScorePopup, spawnSplash]
  );

  // Main game loop
  const gameLoop = useCallback(
    (timestamp: number) => {
      if (gameStateRef.current !== 'playing') return;

      const container = containerRef.current;
      const bucket = bucketRef.current;
      if (!container || !bucket) {
        animFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const delta = Math.min((timestamp - lastTimestampRef.current) / 1000 || 0, 0.05);
      lastTimestampRef.current = timestamp;

      const cfg = configRef.current;

      // Spawn drops based on difficulty interval
      dropTimerRef.current += delta;
      if (dropTimerRef.current >= cfg.dropInterval) {
        dropTimerRef.current = 0;
        const isBrown = Math.random() < cfg.brownRate;
        const points = isBrown ? -5 : Math.random() < 0.25 ? 3 : 1;
        const size = isBrown ? 32 : 28;
        const maxX = Math.max(0, container.clientWidth - size);
        const newDrop: Drop = {
          id: nextDropId.current++,
          x: Math.random() * maxX,
          y: 54,
          size,
          points,
          missPenalty: isBrown ? 0 : points,
          speed: cfg.baseSpeed + Math.random() * cfg.speedVariance,
          isBrown,
        };
        dropsRef.current.push(newDrop);
      }

      // Periodically spawn floating interactive Jerry Can (every ~14s)
      canTimerRef.current += delta;
      if (canTimerRef.current >= 14 && jerryCansRef.current.length === 0) {
        canTimerRef.current = 0;
        const fromLeft = Math.random() > 0.5;
        const canW = 54;
        const canH = 54;
        const newCan: JerryCanItem = {
          id: nextCanId.current++,
          x: fromLeft ? -canW : container.clientWidth,
          y: 80 + Math.random() * 80,
          speedX: (fromLeft ? 1 : -1) * (55 + Math.random() * 25),
          points: 5,
          width: canW,
          height: canH,
        };
        jerryCansRef.current.push(newCan);
      }

      // Update floating Jerry Cans
      const updatedCans: JerryCanItem[] = [];
      for (const can of jerryCansRef.current) {
        const nextX = can.x + can.speedX * delta;
        // Check if out of bounds
        if (can.speedX > 0 && nextX > container.clientWidth + 50) {
          continue; // Remove out-of-bounds can from DOM
        }
        if (can.speedX < 0 && nextX < -can.width - 50) {
          continue; // Remove out-of-bounds can from DOM
        }
        updatedCans.push({ ...can, x: nextX });
      }
      jerryCansRef.current = updatedCans;
      setJerryCans([...updatedCans]);

      // Update falling water drops
      const containerH = container.clientHeight;
      const bucketTop = containerH - bucket.offsetHeight - 10;
      const curBucketX = bucketXRef.current;
      const bucketRight = curBucketX + bucket.offsetWidth;

      const updatedDrops: Drop[] = [];

      for (const drop of dropsRef.current) {
        const nextY = drop.y + drop.speed * delta;

        // Collision with bucket
        const overlapsBucket = drop.x < bucketRight && drop.x + drop.size > curBucketX;
        const hitsBucketVertically =
          nextY + drop.size >= bucketTop && nextY < bucketTop + bucket.offsetHeight;

        if (overlapsBucket && hitsBucketVertically) {
          // Caught by bucket!
          const dropMidX = drop.x + drop.size / 2;
          const dropMidY = nextY + drop.size / 2;

          if (drop.isBrown) {
            soundManager.playBrownDrop();
            spawnSplash(dropMidX, dropMidY, 'mud');
            spawnScorePopup(dropMidX, dropMidY, '-5 Contaminated', 'negative');
          } else {
            soundManager.playCatch(drop.points === 3);
            spawnSplash(dropMidX, dropMidY, 'water');
            spawnScorePopup(
              dropMidX,
              dropMidY,
              `+${drop.points}`,
              drop.points === 3 ? 'bonus' : 'positive'
            );
          }
          addScore(drop.points);
          continue; // Remove drop from DOM
        }

        // Drop reaches bottom of container (missed)
        if (nextY > containerH) {
          const dropMidX = drop.x + drop.size / 2;
          if (drop.missPenalty > 0) {
            soundManager.playMiss();
            stunBucket(timestamp);
            spawnSplash(dropMidX, containerH - 12, 'mud');
            spawnScorePopup(dropMidX, containerH - 30, `-${drop.missPenalty} Miss`, 'negative');
            addScore(
              -drop.missPenalty,
              `Missed drop: -${drop.missPenalty} point${drop.missPenalty === 1 ? '' : 's'}.`
            );
          }
          continue; // Remove drop from DOM
        }

        updatedDrops.push({
          ...drop,
          y: nextY,
        });
      }

      dropsRef.current = updatedDrops;
      setDrops([...updatedDrops]);

      animFrameRef.current = requestAnimationFrame(gameLoop);
    },
    [addScore, stunBucket, spawnScorePopup, spawnSplash]
  );

  // Start game
  const startGame = useCallback(() => {
    if (gameState === 'playing') return;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const cfg = DIFFICULTY_CONFIGS[difficulty];
    setScore(0);
    scoreRef.current = 0;
    setTimeRemaining(cfg.time);
    setDrops([]);
    dropsRef.current = [];
    setJerryCans([]);
    jerryCansRef.current = [];
    setPopups([]);
    setSplashes([]);
    unlockedMilestonesRef.current.clear();
    setActiveMilestone(null);
    if (milestoneTimerRef.current) clearTimeout(milestoneTimerRef.current);
    dropTimerRef.current = 0;
    canTimerRef.current = 0;
    lastTimestampRef.current = performance.now();
    stunnedUntilRef.current = 0;
    setIsStunned(false);
    updateCountryForScore(0);
    setFeedback(`Mode: ${cfg.name}. Catch clean drops or tap them in air! Goal: ${cfg.winScore} pts.`);
    centerBucket();

    setGameState('playing');
    gameStateRef.current = 'playing';

    // Countdown timer
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, difficulty, centerBucket, updateCountryForScore, endGame, gameLoop]);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState('idle');
    gameStateRef.current = 'idle';

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const cfg = DIFFICULTY_CONFIGS[difficulty];
    setDrops([]);
    dropsRef.current = [];
    setJerryCans([]);
    jerryCansRef.current = [];
    setPopups([]);
    setSplashes([]);
    unlockedMilestonesRef.current.clear();
    setActiveMilestone(null);
    if (milestoneTimerRef.current) clearTimeout(milestoneTimerRef.current);
    setScore(0);
    scoreRef.current = 0;
    setTimeRemaining(cfg.time);
    stunnedUntilRef.current = 0;
    setIsStunned(false);
    updateCountryForScore(0);
    setFeedback('Move the bucket or tap falling drops.');
    centerBucket();
  }, [difficulty, centerBucket, updateCountryForScore]);

  // Pointer movement (mouse & touch drag)
  const handlePointer = useCallback((clientX: number) => {
    if (gameStateRef.current !== 'playing') return;
    if (performance.now() < stunnedUntilRef.current) return;

    const container = containerRef.current;
    const bucket = bucketRef.current;
    if (!container || !bucket) return;

    const bounds = container.getBoundingClientRect();
    const bucketW = bucket.offsetWidth;
    const rawX = clientX - bounds.left - bucketW / 2;
    const clampedX = Math.max(0, Math.min(bounds.width - bucketW, rawX));

    setBucketX(clampedX);
    bucketXRef.current = clampedX;
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointer(e.clientX);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointer(e.clientX);
  };

  // Keyboard navigation support (Arrow keys and A/D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current !== 'playing') return;
      if (performance.now() < stunnedUntilRef.current) return;

      const container = containerRef.current;
      const bucket = bucketRef.current;
      if (!container || !bucket) return;

      const step = 28;
      const bounds = container.getBoundingClientRect();
      const bucketW = bucket.offsetWidth;
      let nextX = bucketXRef.current;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        nextX = Math.max(0, bucketXRef.current - step);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        nextX = Math.min(bounds.width - bucketW, bucketXRef.current + step);
      } else {
        return;
      }

      setBucketX(nextX);
      bucketXRef.current = nextX;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMuted(nextMuted);
  };

  return (
    <main className="game-wrapper">
      <Header />

      <DifficultySelector
        currentDifficulty={difficulty}
        configs={DIFFICULTY_CONFIGS}
        disabled={gameState === 'playing'}
        onSelectDifficulty={handleSelectDifficulty}
      />

      <ScorePanel
        score={score}
        highScore={highScore}
        timeRemaining={timeRemaining}
        winScoreGoal={currentConfig.winScore}
        gameState={gameState}
        isMuted={isMuted}
        onStart={startGame}
        onReset={resetGame}
        onToggleMute={toggleMute}
      />

      <section
        id="game-container"
        ref={containerRef}
        className={currentCountry.themeClass}
        aria-label="Water catching game"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
      >
        <div className="cloud cloud-left" aria-hidden="true" />
        <div className="cloud cloud-right" aria-hidden="true" />

        <div className="landscape" aria-hidden="true">
          <div className="landscape-trees">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        {!activeMilestone && (
          <div id="feedback" className="feedback" aria-live="polite">
            {feedback}
          </div>
        )}

        <div id="confetti" aria-hidden="true" />

        {/* Milestone Achievement Notification */}
        <MilestoneBanner
          milestone={activeMilestone}
          onDismiss={() => setActiveMilestone(null)}
        />

        <CountryInfo country={currentCountry} />

        {/* Floating Jerry Cans (Interactive Bonus Targets) */}
        {jerryCans.map((can) => (
          <JerryCanTarget key={can.id} item={can} onCollect={handleJerryCanCollect} />
        ))}

        {/* Falling Drops (Catchable by bucket or directly tappable) */}
        {drops.map((drop) => (
          <FallingDrop key={drop.id} drop={drop} onClick={handleDropClick} />
        ))}

        {/* Bucket */}
        <Bucket x={bucketX} isStunned={isStunned} bucketRef={bucketRef} />

        {/* Interactive feedback animations */}
        <Splashes splashes={splashes} />
        <ScorePopups popups={popups} />

        {/* Game Over modal */}
        {gameState === 'gameover' && (
          <GameOverModal
            score={score}
            highScore={highScore}
            message={endMessage}
            isWin={score >= currentConfig.winScore}
            difficultyName={currentConfig.name}
            winScoreGoal={currentConfig.winScore}
            onPlayAgain={startGame}
          />
        )}
      </section>

      <CharityWaterFooter />
    </main>
  );
};

export default App;
