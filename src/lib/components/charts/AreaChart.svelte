<script lang="ts">
  // Grafik tren kunjungan 14 hari (2 seri: manusia & bot).
  // Interaktif: crosshair + tooltip mengikuti kursor.
  import { compact, niceMax, ticks, smoothPath, shortDate } from "./chart-utils";

  let {
    data = [],
    height = 260,
  }: {
    data: { date: string; human: number; bot: number }[];
    height?: number;
  } = $props();

  // viewBox tetap; SVG-nya sendiri melar mengikuti lebar container (responsif
  // tanpa perlu ResizeObserver / listener resize).
  const W = 760;
  const PAD = { top: 16, right: 16, bottom: 28, left: 44 };

  const H = $derived(height);
  const innerW = $derived(W - PAD.left - PAD.right);
  const innerH = $derived(H - PAD.top - PAD.bottom);

  const max = $derived(
    niceMax(Math.max(1, ...data.flatMap((d) => [d.human, d.bot]))),
  );
  const yTicks = $derived(ticks(max));

  const xOf = $derived((i: number) =>
    data.length <= 1
      ? PAD.left + innerW / 2
      : PAD.left + (i / (data.length - 1)) * innerW,
  );
  const yOf = $derived((v: number) => PAD.top + innerH - (v / max) * innerH);

  const humanPts = $derived(
    data.map((d, i) => ({ x: xOf(i), y: yOf(d.human) })),
  );
  const botPts = $derived(data.map((d, i) => ({ x: xOf(i), y: yOf(d.bot) })));

  const humanLine = $derived(smoothPath(humanPts));
  const botLine = $derived(smoothPath(botPts));
  // Area = garis yang ditutup ke baseline.
  const humanArea = $derived(
    humanPts.length
      ? `${humanLine} L ${humanPts[humanPts.length - 1].x} ${PAD.top + innerH} L ${humanPts[0].x} ${PAD.top + innerH} Z`
      : "",
  );

  // Index titik yang sedang di-hover (null = tidak ada).
  let hover = $state<number | null>(null);
  const hovered = $derived(hover !== null ? data[hover] : null);

  function onMove(e: PointerEvent) {
    const svg = e.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    if (!rect.width || data.length === 0) return;
    // Konversi posisi layar -> koordinat viewBox.
    const vx = ((e.clientX - rect.left) / rect.width) * W;
    const ratio = (vx - PAD.left) / innerW;
    const idx = Math.round(ratio * (data.length - 1));
    hover = Math.min(data.length - 1, Math.max(0, idx));
  }

  // Label sumbu X: tampilkan tiap 3 hari saja supaya tidak tabrakan.
  const showTick = (i: number) => i % 3 === 0 || i === data.length - 1;
</script>

<div class="chart-wrap">
  <svg
    viewBox="0 0 {W} {H}"
    preserveAspectRatio="none"
    role="img"
    aria-label="Grafik tren kunjungan 14 hari terakhir"
    onpointermove={onMove}
    onpointerleave={() => (hover = null)}
  >
    <defs>
      <linearGradient id="areaFillHuman" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--viz-1)" stop-opacity="0.22" />
        <stop offset="100%" stop-color="var(--viz-1)" stop-opacity="0.01" />
      </linearGradient>
    </defs>

    <!-- Gridline hairline, resesif -->
    {#each yTicks as t}
      <line
        x1={PAD.left}
        x2={W - PAD.right}
        y1={yOf(t)}
        y2={yOf(t)}
        class="grid"
      />
      <text x={PAD.left - 10} y={yOf(t) + 4} class="axis-label" text-anchor="end"
        >{compact(t)}</text
      >
    {/each}

    <!-- Label sumbu X -->
    {#each data as d, i}
      {#if showTick(i)}
        <text
          x={xOf(i)}
          y={H - 8}
          class="axis-label"
          text-anchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
          >{shortDate(d.date)}</text
        >
      {/if}
    {/each}

    <!-- Area + garis: manusia (seri utama) -->
    <path d={humanArea} fill="url(#areaFillHuman)" />
    <path d={humanLine} class="line line-1" />
    <!-- Bot digambar putus-putus tipis: konteks, bukan bintang utamanya -->
    <path d={botLine} class="line line-2" />

    <!-- Crosshair + titik saat hover -->
    {#if hover !== null && hovered}
      <line
        x1={xOf(hover)}
        x2={xOf(hover)}
        y1={PAD.top}
        y2={PAD.top + innerH}
        class="crosshair"
      />
      <circle cx={xOf(hover)} cy={yOf(hovered.bot)} r="4.5" class="dot dot-2" />
      <circle
        cx={xOf(hover)}
        cy={yOf(hovered.human)}
        r="4.5"
        class="dot dot-1"
      />
    {/if}
  </svg>

  {#if hover !== null && hovered}
    <!-- Tooltip pakai HTML (bukan SVG text) supaya teksnya tajam & mudah di-style -->
    <div
      class="tooltip"
      style="left: {(xOf(hover) / W) * 100}%"
      class:flip={hover > data.length / 2}
    >
      <div class="tt-date">{shortDate(hovered.date)}</div>
      <div class="tt-row">
        <span class="key key-1"></span> Manusia
        <strong>{compact(hovered.human)}</strong>
      </div>
      <div class="tt-row">
        <span class="key key-2"></span> Bot <strong>{compact(hovered.bot)}</strong
        >
      </div>
    </div>
  {/if}
</div>

<style>
  .chart-wrap {
    position: relative;
    width: 100%;
  }
  svg {
    width: 100%;
    height: auto;
    display: block;
    overflow: visible;
    touch-action: pan-y;
  }

  .grid {
    stroke: var(--viz-grid);
    stroke-width: 1;
    shape-rendering: crispEdges;
  }
  .axis-label {
    fill: var(--viz-muted);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }

  .line {
    fill: none;
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  .line-1 {
    stroke: var(--viz-1);
  }
  .line-2 {
    stroke: var(--viz-2);
    stroke-dasharray: 4 4;
    opacity: 0.85;
  }

  .crosshair {
    stroke: var(--viz-muted);
    stroke-width: 1;
    stroke-dasharray: 3 3;
  }
  /* Ring warna surface supaya titik tetap terbaca saat menimpa garis */
  .dot {
    stroke: var(--viz-surface);
    stroke-width: 2;
  }
  .dot-1 {
    fill: var(--viz-1);
  }
  .dot-2 {
    fill: var(--viz-2);
  }

  .tooltip {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    background: var(--viz-surface);
    border: 1px solid var(--border);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-radius: 0.75rem;
    padding: 0.6rem 0.8rem;
    font-size: 0.78rem;
    pointer-events: none;
    white-space: nowrap;
    z-index: 5;
  }
  .tooltip.flip {
    transform: translateX(-100%);
  }
  .tt-date {
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 0.35rem;
  }
  .tt-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--text-muted);
    line-height: 1.7;
  }
  .tt-row strong {
    margin-left: auto;
    padding-left: 0.75rem;
    color: var(--text-main);
    font-variant-numeric: tabular-nums;
  }
  .key {
    width: 10px;
    height: 3px;
    border-radius: 2px;
    display: inline-block;
  }
  .key-1 {
    background: var(--viz-1);
  }
  .key-2 {
    background: var(--viz-2);
  }
</style>
