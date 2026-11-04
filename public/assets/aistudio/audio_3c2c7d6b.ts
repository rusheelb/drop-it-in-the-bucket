class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private soundCache: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    try {
      const saved = localStorage.getItem('cw_drop_muted');
      if (saved !== null) {
        this.muted = saved === 'true';
      }
    } catch {
      // Ignore localStorage errors
    }
    this.preloadSounds();
  }

  private preloadSounds() {
    if (typeof window === 'undefined') return;
    const basePath = (import.meta.env.BASE_URL || './').replace(/\/+$/, '') + '/';
    const soundFiles = [
      'button',
      'collect',
      'bonus',
      'miss',
      'win',
      'milestone',
      'jerrycan',
    ];
    soundFiles.forEach((name) => {
      try {
        const audio = new Audio(`${basePath}sounds/${name}.wav`);
        audio.preload = 'auto';
        this.soundCache.set(name, audio);
      } catch {
        // Fallback to synth
      }
    });
  }

  private playSoundFile(name: string, fallbackSynth: () => void): void {
    if (this.muted) return;

    try {
      // Use cloned audio instance for zero-latency overlapping playback
      const basePath = (import.meta.env.BASE_URL || './').replace(/\/+$/, '') + '/';
      const audio = new Audio(`${basePath}sounds/${name}.wav`);
      audio.volume = 0.55;
      const promise = audio.play();
      if (promise !== undefined) {
        promise.catch(() => {
          fallbackSynth();
        });
      }
    } catch {
      fallbackSynth();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      localStorage.setItem('cw_drop_muted', String(muted));
    } catch {
      // Ignore
    }
  }

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playButtonClick(): void {
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
      } catch {
        // Ignore
      }
    });
  }

  public playCatch(isBonus: boolean): void {
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
      } catch {
        // Ignore
      }
    });
  }

  public playMiss(): void {
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
      } catch {
        // Ignore
      }
    });
  }

  public playVictory(): void {
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
      } catch {
        // Ignore
      }
    });
  }

  public playMilestone(): void {
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
      } catch {
        // Ignore
      }
    });
  }

  public playJerryCanCollect(): void {
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
      } catch {
        // Ignore
      }
    });
  }

  public playBrownDrop(): void {
    this.playMiss();
  }

  public playPurify(): void {
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
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundManager();
