/**
 * Trader Playbook & Edge Matrix Service
 * Connects reading notes & AI rule cards with the trade journal and simulator.
 */

export interface StrategyRule {
  id: string;
  name: string;
  sourceBookTitle: string;
  category: 'Smart Money Concepts' | 'Forex & Trading' | 'Technical Analysis' | 'Orderflow' | 'Psychology';
  timeframe: string;
  rules: string[];
  invalidation: string;
  targetRR: string;
  winRateEstimate: number;
  tags: string[];
  createdAt: string;
}

export interface TraderProgression {
  xp: number;
  level: number;
  rankTitle: string;
  completedQuizzes: number;
  booksFinished: number;
  playbookRulesCount: number;
  badges: string[];
}

const DEFAULT_PLAYBOOK: StrategyRule[] = [
  {
    id: 'smc-fvg-mitigation',
    name: 'Fair Value Gap (FVG) Mitigation',
    sourceBookTitle: '04 LIQUIDITY CONCEPTS',
    category: 'Smart Money Concepts',
    timeframe: '15M / 5M Entry',
    rules: [
      'Identify 4H or 1H institutional directional bias.',
      'Wait for clear liquidity sweep of previous high/low.',
      'Observe aggressive displacement candle leaving an unfilled 3-candle imbalance (FVG).',
      'Set limit order at 50% equilibrium of the FVG box.'
    ],
    invalidation: 'Candle body closes beyond the origin order block swing point.',
    targetRR: '1:3.5 Minimum',
    winRateEstimate: 68,
    tags: ['SMC', 'Imbalance', 'FVG', 'Displacement'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'smc-asian-sweep',
    name: 'London Open Asian Range Sweep',
    sourceBookTitle: 'Advanced ICT Institutional Smc Trading',
    category: 'Smart Money Concepts',
    timeframe: '15M / 1M Entry',
    rules: [
      'Mark Asian session high and low (00:00 - 06:00 UTC).',
      'London open (07:00 - 09:00 UTC) violently sweeps either high or low.',
      'Wait for 1M / 5M Change of Character (CHoCH) back inside Asian range.',
      'Enter on retest of internal breaker block / FVG.'
    ],
    invalidation: 'Price sustains continuation beyond the liquidity sweep wick.',
    targetRR: '1:4.0 Minimum',
    winRateEstimate: 72,
    tags: ['ICT', 'Killzone', 'Asian Range', 'CHoCH'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'wyckoff-spring-test',
    name: 'Wyckoff Accumulation Spring Phase C',
    sourceBookTitle: 'The Wyckoff Method_ A Tutorial',
    category: 'Technical Analysis',
    timeframe: '1H / 15M Entry',
    rules: [
      'Define clear trading range with Preliminary Support (PS) and Selling Climax (SC).',
      'Identify Spring (Phase C) that briefly dips below Support on dropping volume.',
      'Wait for Test of Spring holding higher low with strong bullish response.',
      'Enter long on confirmed sign of strength (SOS).'
    ],
    invalidation: 'Heavy breakdown below Spring low on surging volume.',
    targetRR: '1:5.0 Minimum',
    winRateEstimate: 65,
    tags: ['Wyckoff', 'Accumulation', 'Spring', 'Volume'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'orderflow-delta-divergence',
    name: 'CVD Absorption & Liquidity Pool Reversal',
    sourceBookTitle: 'Volume Profile, Market Profile & Order Flow',
    category: 'Orderflow',
    timeframe: '5M / Footprint',
    rules: [
      'Price creates higher high into key overhead resistance level.',
      'Cumulative Volume Delta (CVD) fails to make higher high (absorption).',
      'Watch for passive limit seller absorbing aggressive market buy orders.',
      'Enter short on market sell imbalance continuation.'
    ],
    invalidation: 'Aggressive delta breakout above absorption high.',
    targetRR: '1:3.0 Minimum',
    winRateEstimate: 70,
    tags: ['Orderflow', 'Footprint', 'CVD', 'Absorption'],
    createdAt: new Date().toISOString()
  }
];

const RANKS = [
  { minLevel: 1, title: 'Novice Analyst' },
  { minLevel: 3, title: 'SMC Apprentice' },
  { minLevel: 5, title: 'Institutional Tactician' },
  { minLevel: 8, title: 'Prop Combine Finalist' },
  { minLevel: 12, title: 'Alpha Flow Master Trader' },
];

class PlaybookService {
  private readonly PLAYBOOK_KEY = 'alphaflow_trader_playbook';
  private readonly PROGRESSION_KEY = 'alphaflow_trader_progression';

  getStrategies(): StrategyRule[] {
    try {
      const data = localStorage.getItem(this.PLAYBOOK_KEY);
      if (data) return JSON.parse(data);
    } catch (_) {}
    return DEFAULT_PLAYBOOK;
  }

  saveStrategy(rule: Omit<StrategyRule, 'id' | 'createdAt'>): StrategyRule {
    const list = this.getStrategies();
    const newRule: StrategyRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    list.unshift(newRule);
    localStorage.setItem(this.PLAYBOOK_KEY, JSON.stringify(list));
    this.addXP(40, 'Added New Strategy to Playbook');
    return newRule;
  }

  deleteStrategy(id: string) {
    const list = this.getStrategies().filter(s => s.id !== id);
    localStorage.setItem(this.PLAYBOOK_KEY, JSON.stringify(list));
  }

  getProgression(): TraderProgression {
    try {
      const data = localStorage.getItem(this.PROGRESSION_KEY);
      if (data) return JSON.parse(data);
    } catch (_) {}
    return {
      xp: 450,
      level: 3,
      rankTitle: 'SMC Apprentice',
      completedQuizzes: 4,
      booksFinished: 7,
      playbookRulesCount: 4,
      badges: ['First Read', 'SMC Initiate', 'Risk Sentinel']
    };
  }

  addXP(amount: number, reason?: string): TraderProgression {
    const current = this.getProgression();
    const newXp = current.xp + amount;
    const newLevel = Math.floor(newXp / 250) + 1;

    let rankTitle = current.rankTitle;
    for (const r of RANKS) {
      if (newLevel >= r.minLevel) rankTitle = r.title;
    }

    const updated: TraderProgression = {
      ...current,
      xp: newXp,
      level: newLevel,
      rankTitle,
      playbookRulesCount: this.getStrategies().length
    };

    localStorage.setItem(this.PROGRESSION_KEY, JSON.stringify(updated));
    return updated;
  }

  recordQuizComplete(score: number): TraderProgression {
    const current = this.getProgression();
    current.completedQuizzes += 1;
    if (score >= 4 && !current.badges.includes('Quiz Ace')) {
      current.badges.push('Quiz Ace');
    }
    localStorage.setItem(this.PROGRESSION_KEY, JSON.stringify(current));
    return this.addXP(score * 20, 'Completed Strategy Quiz');
  }
}

export const playbookService = new PlaybookService();
