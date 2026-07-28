<script lang="ts">
  // Kolom distribusi jam kunjungan (24 slot).
  // Satu seri saja -> tidak perlu legend; judul kartu sudah menjelaskan isinya.
  import { compact, niceMax, ticks } from "./chart-utils";

  let {
    data = [],
    height = 200,
  }: {
    data: { hour: number; count: number }[];
    height?: number;
  } = $props();

  const W = 760;
  const PAD = { top: 16, right: 12, bottom: 26, left: 40 };

  const H = $derived(height);
  const innerW = $derived(W - PAD.left - PAD.right);
  const innerH = $derived(H - PAD.top - PAD.bottom);

  const max = $derived(niceMax(Math.max(1, ...data.map((d) => d.count))));
  const yTicks = $derived(ticks(max, 3));

  const band = $derived(data.length ? innerW / data.length : innerW);
  // Bar dibatasi 24px & selalu sisakan udara di tiap slot (gap 2px minimum).
  const barW = $derived(Math.min(24, Math.max(3, band - 4)));

  const yOf = $derived((v: number) => PAD.top + innerH - (v / max) * innerH);
  const xOf = $derived((i: number) => PAD.left + i * band + (band - barW) / 2);

  // Jam tersibuk ditandai — inilah info yang sebenarnya dicari pembaca.
  const peak = $derived.by(() => {
    if (!data.length) return null;
    const best = data.reduce((a, b) => (b.count > a.count ? b : a), data[0]);
    return best.count > 0 ? best.hour : null;
  });

  let hover = $state<number | null>(null);
</script>

<div class="chart-wrap">
  <svg
    viewBox="0 0 {W} {H}"
    preserveAspectRatio="none"
    role="img"
    aria-label="Distribusi jam kunjungan dalam 7 hari terakhir"
  >
    {#each yTicks as t}
      <line x1={PAD.left} x2={W - PAD.right} y1={yOf(t)} y2={yOf(t)} class="grid" />
      <text x={PAD.left - 8} y={yOf(t) + 4} class="axis-label" text-anchor="end"
        >{compact(t)}</text
      >
    {/each}

    {#each data as d, i}
      {@const h = Math.max(0, PAD.top + innerH - yOf(d.count))}
      <!-- rx 4 = ujung data membulat; sisi baseline tetap rapat ke sumbu -->
      <rect
        x={xOf(i)}
        y={yOf(d.count)}
        width={barW}
        height={h}
        rx={Math.min(4, barW / 2)}
        class="bar"
        class:is-peak={d.hour === peak}
        class:dim={hover !== null && hover !== i}
        role="presentation"
        onpointerenter={() => (hover = i)}
        onpointerleave={() => (hover = null)}
      />
      {#if i % 4 === 0}
        <text x={xOf(i) + barW / 2} y={H - 8} class="axis-label" text-anchor="middle"
          >{String(d.hour).padStart(2, "0")}</text
        >
      {/if}
    {/each}
  </svg>

  {#if hover !== null && data[hover]}
    <div class="tooltip" style="left: {((xOf(hover) + barW / 2) / W) * 100}%">
      <strong>{String(data[hover].hour).padStart(2, "0")}:00</strong>
      · {compact(data[hover].count)} kunjungan
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

  .bar {
    fill: var(--viz-1);
    opacity: 0.45;
    transition: opacity 0.15s ease;
  }
  /* Jam tersibuk = satu-satunya bar penuh warna (pola "emphasis") */
  .bar.is-peak {
    opacity: 1;
  }
  .bar:hover {
    opacity: 1;
  }
  .bar.dim {
    opacity: 0.25;
  }

  .tooltip {
    position: absolute;
    top: -6px;
    transform: translateX(-50%);
    background: var(--viz-surface);
    border: 1px solid var(--border);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-radius: 0.6rem;
    padding: 0.4rem 0.7rem;
    font-size: 0.75rem;
    color: var(--text-muted);
    pointer-events: none;
    white-space: nowrap;
    z-index: 5;
  }
  .tooltip strong {
    color: var(--text-main);
    font-variant-numeric: tabular-nums;
  }
</style>
