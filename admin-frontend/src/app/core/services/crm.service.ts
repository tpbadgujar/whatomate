import { Injectable, computed, signal } from '@angular/core';
import {
  ActivityItem,
  AnalyticsPoint,
  Contact,
  Deal,
  DealStage,
  KpiMetric,
  PipelineStageSummary,
  TimeframeKey
} from '../models/crm.models';

export type QuickActionKind = 'deal' | 'contact' | 'activity';

const ANALYTICS_SERIES: Record<TimeframeKey, AnalyticsPoint[]> = {
  '7d': [
    { label: 'Mon', revenue: 42000, pipeline: 68000, target: 45000 },
    { label: 'Tue', revenue: 51500, pipeline: 74000, target: 46000 },
    { label: 'Wed', revenue: 48200, pipeline: 71500, target: 47000 },
    { label: 'Thu', revenue: 63400, pipeline: 89000, target: 49000 },
    { label: 'Fri', revenue: 59800, pipeline: 94200, target: 50000 },
    { label: 'Sat', revenue: 38400, pipeline: 79000, target: 42000 },
    { label: 'Sun', revenue: 46900, pipeline: 86500, target: 44000 }
  ],
  '30d': [
    { label: 'W1', revenue: 164000, pipeline: 295000, target: 160000 },
    { label: 'W2', revenue: 192000, pipeline: 332000, target: 175000 },
    { label: 'W3', revenue: 218500, pipeline: 368000, target: 190000 },
    { label: 'W4', revenue: 249000, pipeline: 412000, target: 210000 }
  ],
  '90d': [
    { label: 'Jul', revenue: 540000, pipeline: 890000, target: 520000 },
    { label: 'Aug', revenue: 612000, pipeline: 960000, target: 560000 },
    { label: 'Sep', revenue: 698000, pipeline: 1120000, target: 610000 },
    { label: 'Oct', revenue: 748000, pipeline: 1245000, target: 650000 },
    { label: 'Nov', revenue: 824000, pipeline: 1380000, target: 700000 }
  ],
  '12m': [
    { label: 'Jan', revenue: 310000, pipeline: 540000, target: 300000 },
    { label: 'Feb', revenue: 342000, pipeline: 590000, target: 320000 },
    { label: 'Mar', revenue: 389000, pipeline: 645000, target: 350000 },
    { label: 'Apr', revenue: 418000, pipeline: 710000, target: 380000 },
    { label: 'May', revenue: 465000, pipeline: 785000, target: 410000 },
    { label: 'Jun', revenue: 512000, pipeline: 830000, target: 440000 },
    { label: 'Jul', revenue: 540000, pipeline: 890000, target: 480000 },
    { label: 'Aug', revenue: 612000, pipeline: 960000, target: 520000 },
    { label: 'Sep', revenue: 698000, pipeline: 1120000, target: 560000 },
    { label: 'Oct', revenue: 748000, pipeline: 1245000, target: 610000 },
    { label: 'Nov', revenue: 824000, pipeline: 1380000, target: 660000 },
    { label: 'Dec', revenue: 896000, pipeline: 1490000, target: 720000 }
  ]
};

const INITIAL_DEALS: Deal[] = [
  {
    id: 'DL-408',
    title: 'Global Billing Consolidation',
    company: 'Northstar Logistics',
    owner: 'Elena Vance',
    ownerInitials: 'EV',
    value: 148000,
    stage: 'Negotiation',
    probability: 82,
    closeDate: 'Nov 29',
    updatedAt: '18m ago'
  },
  {
    id: 'DL-407',
    title: 'Multi-Region Seat Expansion',
    company: 'Kestrel BioLabs',
    owner: 'Marcus Chen',
    ownerInitials: 'MC',
    value: 94500,
    stage: 'Proposal',
    probability: 68,
    closeDate: 'Dec 04',
    updatedAt: '1h ago'
  },
  {
    id: 'DL-406',
    title: 'Annual Enterprise Renewal',
    company: 'Vanguard Freight',
    owner: 'Elena Vance',
    ownerInitials: 'EV',
    value: 215000,
    stage: 'Closed Won',
    probability: 100,
    closeDate: 'Nov 21',
    updatedAt: '3h ago'
  },
  {
    id: 'DL-405',
    title: 'RevOps Telemetry Suite',
    company: 'Halcyon Financial',
    owner: 'Priya Nair',
    ownerInitials: 'PN',
    value: 68000,
    stage: 'Qualified',
    probability: 45,
    closeDate: 'Dec 12',
    updatedAt: '5h ago'
  },
  {
    id: 'DL-404',
    title: 'EMEA Territory Rollout',
    company: 'Alder & Co.',
    owner: 'Marcus Chen',
    ownerInitials: 'MC',
    value: 112000,
    stage: 'Negotiation',
    probability: 75,
    closeDate: 'Dec 02',
    updatedAt: 'Yesterday'
  },
  {
    id: 'DL-403',
    title: 'Customer Portal Integration',
    company: 'Boreal Energy',
    owner: 'Priya Nair',
    ownerInitials: 'PN',
    value: 52000,
    stage: 'Discovery',
    probability: 28,
    closeDate: 'Dec 19',
    updatedAt: 'Yesterday'
  }
];

const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'CT-101',
    name: 'Hannah Lindqvist',
    role: 'Chief Operating Officer',
    company: 'Northstar Logistics',
    email: 'h.lindqvist@northstar.io',
    phone: '+1 (415) 891-2409',
    status: 'Active',
    ltv: 310000,
    lastTouch: '18m ago',
    initials: 'HL'
  },
  {
    id: 'CT-102',
    name: 'David Okafor',
    role: 'VP of Procurement',
    company: 'Vanguard Freight',
    email: 'd.okafor@vanguardfreight.com',
    phone: '+1 (312) 604-8821',
    status: 'Active',
    ltv: 445000,
    lastTouch: '3h ago',
    initials: 'DO'
  },
  {
    id: 'CT-103',
    name: 'Claire Moreau',
    role: 'Head of Platform',
    company: 'Kestrel BioLabs',
    email: 'claire.moreau@kestrel.bio',
    phone: '+1 (617) 529-1140',
    status: 'Warm',
    ltv: 94500,
    lastTouch: '1h ago',
    initials: 'CM'
  },
  {
    id: 'CT-104',
    name: 'Kenji Takahashi',
    role: 'Director of Revenue Ops',
    company: 'Halcyon Financial',
    email: 'ktakahashi@halcyonfin.com',
    phone: '+1 (212) 480-9310',
    status: 'Warm',
    ltv: 68000,
    lastTouch: '5h ago',
    initials: 'KT'
  },
  {
    id: 'CT-105',
    name: 'Sofia Alvarez',
    role: 'IT Security Lead',
    company: 'Boreal Energy',
    email: 'salvarez@borealenergy.co',
    phone: '+1 (713) 341-7752',
    status: 'Lead',
    ltv: 52000,
    lastTouch: 'Yesterday',
    initials: 'SA'
  }
];

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'AC-01',
    type: 'deal',
    title: 'Vanguard Freight moved to Closed Won',
    detail: '$215,000 annual contract countersigned',
    actor: 'Elena Vance',
    time: '3h ago'
  },
  {
    id: 'AC-02',
    type: 'call',
    title: 'Procurement review with Northstar Logistics',
    detail: 'Confirmed SLA terms and Q4 rollout schedule',
    actor: 'Elena Vance',
    time: '18m ago'
  },
  {
    id: 'AC-03',
    type: 'email',
    title: 'Revised seat quote sent to Kestrel BioLabs',
    detail: '180 seats across Boston and Zurich teams',
    actor: 'Marcus Chen',
    time: '1h ago'
  },
  {
    id: 'AC-04',
    type: 'meeting',
    title: 'Security architecture walkthrough',
    detail: 'Boreal Energy SOC2 & SSO checklist reviewed',
    actor: 'Priya Nair',
    time: 'Yesterday'
  }
];

const STAGE_GRADIENTS: Record<DealStage, string> = {
  Discovery: 'linear-gradient(90deg, #64748b 0%, #94a3b8 100%)',
  Qualified: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)',
  Proposal: 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)',
  Negotiation: 'linear-gradient(90deg, #f97316 0%, #ef4444 100%)',
  'Closed Won': 'linear-gradient(90deg, #10b981 0%, #14b8a6 100%)'
};

@Injectable({ providedIn: 'root' })
export class CrmService {
  readonly timeframe = signal<TimeframeKey>('12m');
  readonly searchQuery = signal<string>('');
  readonly deals = signal<Deal[]>(INITIAL_DEALS);
  readonly contacts = signal<Contact[]>(INITIAL_CONTACTS);
  readonly activities = signal<ActivityItem[]>(INITIAL_ACTIVITIES);

  readonly quickActionOpen = signal<boolean>(false);
  readonly quickActionTab = signal<QuickActionKind>('deal');

  readonly analyticsSeries = computed(() => ANALYTICS_SERIES[this.timeframe()]);

  readonly totalPipelineValue = computed(() =>
    this.deals()
      .filter((d) => d.stage !== 'Closed Won')
      .reduce((sum, d) => sum + d.value, 0)
  );

  readonly closedWonValue = computed(() =>
    this.deals()
      .filter((d) => d.stage === 'Closed Won')
      .reduce((sum, d) => sum + d.value, 0)
  );

  readonly kpis = computed<KpiMetric[]>(() => {
    const won = this.closedWonValue();
    const pipeline = this.totalPipelineValue();
    const activeDeals = this.deals().filter((d) => d.stage !== 'Closed Won').length;
    const avgDeal = activeDeals > 0 ? Math.round(pipeline / activeDeals) : 0;

    return [
      {
        id: 'revenue',
        label: 'Closed revenue',
        value: this.formatCurrency(won + 681000),
        delta: '+14.2%',
        comparison: 'vs last month',
        trend: 'up'
      },
      {
        id: 'pipeline',
        label: 'Active pipeline',
        value: this.formatCurrency(pipeline),
        delta: '+8.6%',
        comparison: 'vs last month',
        trend: 'up'
      },
      {
        id: 'winrate',
        label: 'Win rate',
        value: '34.8%',
        delta: '+2.4%',
        comparison: 'vs last quarter',
        trend: 'up'
      },
      {
        id: 'avgdeal',
        label: 'Average deal size',
        value: this.formatCurrency(avgDeal),
        delta: '-1.8%',
        comparison: 'vs last month',
        trend: 'down'
      }
    ];
  });

  readonly pipelineStages = computed<PipelineStageSummary[]>(() => {
    const stages: DealStage[] = ['Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'];
    const allDeals = this.deals();
    const maxVal = Math.max(
      1,
      ...stages.map((s) => allDeals.filter((d) => d.stage === s).reduce((acc, d) => acc + d.value, 0))
    );

    return stages.map((stage) => {
      const matching = allDeals.filter((d) => d.stage === stage);
      const value = matching.reduce((acc, d) => acc + d.value, 0);
      return {
        stage,
        count: matching.length,
        value,
        sharePercent: Math.round((value / maxVal) * 100),
        gradient: STAGE_GRADIENTS[stage]
      };
    });
  });

  readonly filteredDeals = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.deals();
    return this.deals().filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.company.toLowerCase().includes(q) ||
        d.stage.toLowerCase().includes(q)
    );
  });

  readonly filteredContacts = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.contacts();
    return this.contacts().filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  });

  openQuickAction(tab: QuickActionKind = 'deal'): void {
    this.quickActionTab.set(tab);
    this.quickActionOpen.set(true);
  }

  closeQuickAction(): void {
    this.quickActionOpen.set(false);
  }

  addDeal(input: { title: string; company: string; value: number; stage: DealStage }): void {
    const nextNum = 409 + this.deals().length;
    const probMap: Record<DealStage, number> = {
      Discovery: 25,
      Qualified: 45,
      Proposal: 65,
      Negotiation: 85,
      'Closed Won': 100
    };
    const newDeal: Deal = {
      id: `DL-${nextNum}`,
      title: input.title.trim(),
      company: input.company.trim(),
      owner: 'Elena Vance',
      ownerInitials: 'EV',
      value: Math.max(1000, Number(input.value) || 25000),
      stage: input.stage,
      probability: probMap[input.stage],
      closeDate: 'Dec 18',
      updatedAt: 'Just now'
    };
    this.deals.update((list) => [newDeal, ...list]);
    this.activities.update((list) => [
      {
        id: `AC-${Date.now()}`,
        type: 'deal',
        title: `New deal created: ${newDeal.company}`,
        detail: `${newDeal.title} · ${this.formatCurrency(newDeal.value)}`,
        actor: 'Elena Vance',
        time: 'Just now'
      },
      ...list
    ]);
  }

  addContact(input: { name: string; company: string; role: string; email: string }): void {
    const initials = input.name
      .trim()
      .split(' ')
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('') || 'CT';

    const newContact: Contact = {
      id: `CT-${106 + this.contacts().length}`,
      name: input.name.trim(),
      role: input.role.trim() || 'Decision Maker',
      company: input.company.trim(),
      email: input.email.trim(),
      phone: '+1 (415) 555-0192',
      status: 'Lead',
      ltv: 0,
      lastTouch: 'Just now',
      initials
    };
    this.contacts.update((list) => [newContact, ...list]);
    this.activities.update((list) => [
      {
        id: `AC-${Date.now()}`,
        type: 'email',
        title: `Contact added: ${newContact.name}`,
        detail: `${newContact.role} at ${newContact.company}`,
        actor: 'Elena Vance',
        time: 'Just now'
      },
      ...list
    ]);
  }

  logActivity(input: { type: ActivityItem['type']; title: string; detail: string }): void {
    this.activities.update((list) => [
      {
        id: `AC-${Date.now()}`,
        type: input.type,
        title: input.title.trim(),
        detail: input.detail.trim() || 'Logged from Quick Action',
        actor: 'Elena Vance',
        time: 'Just now'
      },
      ...list
    ]);
  }

  advanceDealStage(dealId: string): void {
    const order: DealStage[] = ['Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'];
    this.deals.update((list) =>
      list.map((deal) => {
        if (deal.id !== dealId) return deal;
        const idx = order.indexOf(deal.stage);
        const nextStage = order[Math.min(order.length - 1, idx + 1)];
        return {
          ...deal,
          stage: nextStage,
          probability: Math.min(100, deal.probability + 18),
          updatedAt: 'Just now'
        };
      })
    );
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  }
}
