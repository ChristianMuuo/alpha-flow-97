/**
 * Athena Desk Squawk™ - Real-Time Audio Floor Broadcaster & Squawk Box
 * Emulates high-frequency Wall Street squawk boxes and prop desk audio feeds
 * using Web Audio frequency filters and synthesized institutional voice commentary.
 */

export interface SquawkBroadcast {
  id: string;
  timestamp: string;
  category: "SESSION_UPDATE" | "LIQUIDITY_ALERT" | "NEWS_FLASH" | "ORDERFLOW_ABSORPTION";
  headline: string;
  fullSpeech: string;
  importance: "CRITICAL" | "HIGH" | "STANDARD";
}

const DESK_COMMENTARIES: Omit<SquawkBroadcast, "id" | "timestamp">[] = [
  {
    category: "SESSION_UPDATE",
    importance: "HIGH",
    headline: "London Open Expansion - EUR/USD Asian High Swept",
    fullSpeech: "Desk Squawk. London Open institutional expansion underway. Asian Session High swept on EUR/USD at 1.0862. Watch for 15M Bearish Fair Value Gap retest."
  },
  {
    category: "LIQUIDITY_ALERT",
    importance: "CRITICAL",
    headline: "Iceberg Wall Absorption at 1.0840",
    fullSpeech: "Alert on the Tape. Large resting institutional iceberg detected on EUR/USD at 1.0840. Over 3,800 lots absorbing aggressive market sell orders. Cumulative delta divergence forming."
  },
  {
    category: "NEWS_FLASH",
    importance: "CRITICAL",
    headline: "Red Folder US CPI Release in 45 Minutes",
    fullSpeech: "Macro Flash. High-impact US CPI prints in 45 minutes. Expected volatility shock cone is plus-minus 48 pips. Prop firm combine traders are advised to stand down or reduce risk to 0.25 percent."
  },
  {
    category: "ORDERFLOW_ABSORPTION",
    importance: "STANDARD",
    headline: "New York Killzone Overlap Commencing",
    fullSpeech: "New York Session open. Volume peak active during London New York overlap. Institutional draw on liquidity targeting previous daily low at 1.0795."
  },
  {
    category: "LIQUIDITY_ALERT",
    importance: "HIGH",
    headline: "Gold (XAU/USD) Liquidity Void Cleared",
    fullSpeech: "Gold desk alert. 4H buy-side liquidity swept above 2,640. Order block mitigation confirmed with bullish delta continuation."
  }
];

class DeskSquawkService {
  private isBroadcasting: boolean = false;
  private isMuted: boolean = false;
  private intervalTimer: any = null;
  private broadcastHistory: SquawkBroadcast[] = [];
  private listeners: ((broadcast: SquawkBroadcast) => void)[] = [];
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("alphaflow_squawk_muted");
      this.isMuted = saved === "true";
    }
  }

  private initAudio() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  /**
   * Generates authentic squawk radio squelch static sound effect
   */
  private playSquelchSound() {
    this.initAudio();
    if (!this.audioCtx || this.isMuted) return;

    try {
      const ctx = this.audioCtx;
      const bufferSize = ctx.sampleRate * 0.08; // 80ms squelch
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // White noise burst
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass filter to create analog walkie-talkie / radio squelch
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1800;
      filter.Q.value = 3.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch (_) {}
  }

  public speakBroadcast(item: Omit<SquawkBroadcast, "id" | "timestamp">) {
    const broadcast: SquawkBroadcast = {
      ...item,
      id: "squawk-" + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    };

    this.broadcastHistory.unshift(broadcast);
    if (this.broadcastHistory.length > 30) this.broadcastHistory.pop();

    this.listeners.forEach(fn => fn(broadcast));

    if (this.isMuted) return;

    // Play radio squelch before speech
    this.playSquelchSound();

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setTimeout(() => {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(broadcast.fullSpeech);
          utterance.rate = 1.05;
          utterance.pitch = 0.95; // Authoritative institutional squawk tone
          window.speechSynthesis.speak(utterance);
        } catch (_) {}
      }, 90);
    }
  }

  public triggerRandomBroadcast(): SquawkBroadcast {
    const randomIdx = Math.floor(Math.random() * DESK_COMMENTARIES.length);
    const item = DESK_COMMENTARIES[randomIdx];
    this.speakBroadcast(item);
    return this.broadcastHistory[0];
  }

  public getHistory(): SquawkBroadcast[] {
    return this.broadcastHistory;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem("alphaflow_squawk_muted", String(this.isMuted));
    if (this.isMuted && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public subscribe(fn: (b: SquawkBroadcast) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }
}

export const deskSquawk = new DeskSquawkService();
