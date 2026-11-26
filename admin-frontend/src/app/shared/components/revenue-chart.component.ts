import { Component, computed, input, signal } from '@angular/core';
import { AnalyticsPoint } from '../../core/models/crm.models';

interface PlotPoint {
  x: number;
  yRev: number;
  yPipe: number;
  yTarget: number;
  data: AnalyticsPoint;
}

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  styles: [
    `
      .chart-wrap {
        position: relative;
        width: 100%;
      }

      svg {
        width: 100%;
        height: 300px;
        display: block;
        overflow: visible;
      }

      .axis-label {
        font-family: var(--font-mono);
        font-size: 11px;
        fill: var(--text-muted);
      }

      .rev-line {
        stroke-dasharray: 1400;
        animation: drawLine 700ms var(--ease-out-expo) forwards;
      }

      .chart-tooltip {
        position: absolute;
        top: 12px;
        pointer-events: none;
        padding: 10px 12px;
        border-radius: var(--radius-md);
        background: var(--bg-deep);
        border: 1px solid var(--hairline-strong);
        box-shadow: var(--shadow-float);
        min-width: 176px;
        z-index: 10;
        transition: left 120ms var(--ease-out-expo);
      }

      .tt-head {
        font-size: 12px;
        font-weight: 500;
        margin-bottom: 6px;
        color: var(--text-primary);
      }

      .tt-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        font-size: 12px;
        line-height: 1.6;
        color: var(--text-secondary);
      }

      .tt-dot {
        display: inline-block;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        margin-right: 6px;
      }
    `
  ],
  template: `
    <div class="chart-wrap" (mouseleave)="hoveredIndex.set(null)">
      <svg viewBox="0 0 720 300" preserveAspectRatio="none" aria-label="Revenue and pipeline analytics">
        <defs>
          <linearGradient id="revGradientStroke" x1="0" y1="0" x2="720" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="var(--accent-1)" />
            <stop offset="55%" stop-color="var(--accent-2)" />
            <stop offset="100%" stop-color="var(--accent-3)" />
          </linearGradient>
          <linearGradient id="revGradientArea" x1="0" y1="20" x2="0" y2="260" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="var(--accent-1)" stop-opacity="0.28" />
            <stop offset="70%" stop-color="var(--accent-2)" stop-opacity="0.06" />
            <stop offset="100%" stop-color="var(--accent-1)" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- Horizontal Grid Lines -->
        @for (tick of yTicks(); track tick.y) {
          <line
            x1="44"
            [attr.y1]="tick.y"
            x2="704"
            [attr.y2]="tick.y"
            stroke="var(--hairline)"
            stroke-dasharray="3 4"
          />
          <text x="0" [attr.y]="tick.y + 4" class="axis-label">{{ tick.label }}</text>
        }

        <!-- Target Baseline -->
        <path
          [attr.d]="targetPath()"
          fill="none"
          stroke="var(--text-muted)"
          stroke-opacity="0.4"
          stroke-width="1.25"
          stroke-dasharray="4 4"
        />

        <!-- Pipeline Curve -->
        <path
          [attr.d]="pipelinePath()"
          fill="none"
          stroke="var(--text-secondary)"
          stroke-opacity="0.55"
          stroke-width="1.75"
          stroke-linecap="round"
        />

        <!-- Revenue Area & Gradient Curve -->
        <path [attr.d]="revenueAreaPath()" fill="url(#revGradientArea)" />
        <path
          class="rev-line"
          [attr.d]="revenuePath()"
          fill="none"
          stroke="url(#revGradientStroke)"
          stroke-width="2.5"
          stroke-linecap="round"
        />

        <!-- Crosshair & Active Dots -->
        @if (activePoint(); as pt) {
          <line
            [attr.x1]="pt.x"
            y1="20"
            [attr.x2]="pt.x"
            y2="260"
            stroke="var(--hairline-strong)"
            stroke-width="1"
          />
          <circle [attr.cx]="pt.x" [attr.cy]="pt.yPipe" r="4" fill="var(--text-secondary)" />
          <circle
            [attr.cx]="pt.x"
            [attr.cy]="pt.yRev"
            r="5"
            fill="var(--accent-1)"
            stroke="var(--bg-card)"
            stroke-width="2"
          />
        }

        <!-- X-Axis Labels & Invisible Hover Columns -->
        @for (pt of plotted(); track pt.data.label; let i = $index) {
          <text [attr.x]="pt.x" y="286" text-anchor="middle" class="axis-label">
            {{ pt.data.label }}
          </text>
          <rect
            [attr.x]="pt.x - hitWidth() / 2"
            y="16"
            [attr.width]="hitWidth()"
            height="250"
            fill="transparent"
            style="cursor: crosshair"
            (mouseenter)="hoveredIndex.set(i)"
          />
        }
      </svg>

      @if (activePoint(); as pt) {
        <div
          class="chart-tooltip animate-menu"
          [style.left.%]="tooltipLeftPercent(pt.x)"
        >
          <div class="tt-head">{{ pt.data.label }}</div>
          <div class="tt-row">
            <span><span class="tt-dot" style="background: var(--accent-1)"></span>Revenue</span>
            <span class="mono">{{ formatShort(pt.data.revenue) }}</span>
          </div>
          <div class="tt-row">
            <span><span class="tt-dot" style="background: var(--text-secondary)"></span>Pipeline</span>
            <span class="mono">{{ formatShort(pt.data.pipeline) }}</span>
          </div>
          <div class="tt-row">
            <span><span class="tt-dot" style="background: var(--text-muted)"></span>Target</span>
            <span class="mono">{{ formatShort(pt.data.target) }}</span>
          </div>
        </div>
      }
    </div>
  `
})
export class RevenueChartComponent {
  readonly data = input.required<AnalyticsPoint[]>();
  readonly hoveredIndex = signal<number | null>(null);

  private readonly padLeft = 56;
  private readonly padRight = 16;
  private readonly width = 720;
  private readonly topY = 24;
  private readonly bottomY = 256;

  readonly maxValue = computed(() => {
    const pts = this.data();
    const rawMax = Math.max(
      10000,
      ...pts.flatMap((p) => [p.revenue, p.pipeline, p.target])
    );
    return Math.ceil(rawMax / 100000) * 100000 || rawMax * 1.15;
  });

  readonly yTicks = computed(() => {
    const max = this.maxValue();
    return [0, 0.33, 0.66, 1].map((ratio) => {
      const val = Math.round(max * (1 - ratio));
      const y = this.topY + (this.bottomY - this.topY) * ratio;
      return { y, label: this.formatAxis(val) };
    });
  });

  readonly plotted = computed<PlotPoint[]>(() => {
    const pts = this.data();
    const max = this.maxValue();
    const usableW = this.width - this.padLeft - this.padRight;
    const usableH = this.bottomY - this.topY;

    return pts.map((d, i) => {
      const x = pts.length === 1 ? this.padLeft + usableW / 2 : this.padLeft + (usableW * i) / (pts.length - 1);
      const toY = (val: number) => this.bottomY - (val / max) * usableH;
      return {
        x,
        yRev: toY(d.revenue),
        yPipe: toY(d.pipeline),
        yTarget: toY(d.target),
        data: d
      };
    });
  });

  readonly hitWidth = computed(() => {
    const len = Math.max(1, this.data().length);
    return (this.width - this.padLeft - this.padRight) / len;
  });

  readonly activePoint = computed(() => {
    const idx = this.hoveredIndex();
    const pts = this.plotted();
    if (idx === null || idx < 0 || idx >= pts.length) return null;
    return pts[idx];
  });

  readonly revenuePath = computed(() => this.smoothPath(this.plotted().map((p) => [p.x, p.yRev])));
  readonly pipelinePath = computed(() => this.smoothPath(this.plotted().map((p) => [p.x, p.yPipe])));
  readonly targetPath = computed(() => this.smoothPath(this.plotted().map((p) => [p.x, p.yTarget])));

  readonly revenueAreaPath = computed(() => {
    const pts = this.plotted();
    if (pts.length === 0) return '';
    const line = this.revenuePath();
    const last = pts[pts.length - 1];
    const first = pts[0];
    return `${line} L ${last.x} ${this.bottomY} L ${first.x} ${this.bottomY} Z`;
  });

  tooltipLeftPercent(x: number): number {
    const pct = (x / this.width) * 100;
    return Math.min(72, Math.max(6, pct - 8));
  }

  formatAxis(val: number): string {
    if (val === 0) return '$0';
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    return `$${Math.round(val / 1000)}k`;
  }

  formatShort(val: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  }

  private smoothPath(coords: [number, number][]): string {
    if (coords.length === 0) return '';
    if (coords.length === 1) return `M ${coords[0][0]} ${coords[0][1]}`;
    let d = `M ${coords[0][0].toFixed(1)} ${coords[0][1].toFixed(1)}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const [x0, y0] = coords[i];
      const [x1, y1] = coords[i + 1];
      const cx = (x0 + x1) / 2;
      d += ` C ${cx.toFixed(1)} ${y0.toFixed(1)}, ${cx.toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    return d;
  }
}
