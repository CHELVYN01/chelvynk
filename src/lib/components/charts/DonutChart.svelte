<script lang="ts">
  // Donut part-to-whole (dipakai untuk perangkat & sumber trafik).
  // Legend selalu ada + nilainya ditulis langsung (direct label) — syarat
  // aksesibilitas karena beberapa warna seri kontrasnya < 3:1 di mode terang.
  import { compact, donutArc } from "./chart-utils";

  let {
    data = [],
    centerLabel = "",
  }: {
    data: { label: string; value: number }[];
    centerLabel?: string;
  } = $props();

  const SIZE = 180;
  const R_OUT = 82;
  const R_IN = 54;
  const C = SIZE / 2;

  const total = $derived(data.reduce((s, d) => s + d.value, 0));

  // Hitung sudut tiap potong. Celah 2px (≈1.5°) memisahkan potongan —
  // pemisah-nya ruang kosong, bukan garis tepi.
  const slices = $derived.by(() => {
    if (total <= 0) return [];
    let cursor = 0;
    return data.map((d, i) => {
      const sweep = (d.value / total) * 360;
      const gap = data.length > 1 ? 1.5 : 0;
      const start = cursor;
      const end = cursor + sweep;
      cursor = end;
      return {
        ...d,
        index: i,
        pct: (d.value / total) * 100,
        // Celah dipangkas dari kedua sisi, tapi jangan sampai potongan hilang.
        path: donutArc(
          C,
          C,
          R_OUT,
          R_IN,
          start + Math.min(gap, sweep / 4),
          Math.max(start + Math.min(gap, sweep / 4), end - Math.min(gap, sweep / 4)),
        ),
      };
    });
  });

  let hover = $state<number | null>(null);
</script>

<div class="donut-wrap">
  <div class="donut-figure">
    <svg viewBox="0 0 {SIZE} {SIZE}" role="img" aria-label="Diagram donat proporsi">
      {#if total > 0}
        {#each slices as s}
          <path
            d={s.path}
            class="slice viz-fill-{(s.index % 4) + 1}"
            class:dim={hover !== null && hover !== s.index}
            role="presentation"
            onpointerenter={() => (hover = s.index)}
            onpointerleave={() => (hover = null)}
          />
        {/each}
      {:else}
        <circle cx={C} cy={C} r={(R_OUT + R_IN) / 2} class="empty-ring" />
      {/if}

      <!-- Angka di tengah: total, atau nilai potongan yang di-hover -->
      <text x={C} y={C - 2} class="center-value" text-anchor="middle">
        {hover !== null && slices[hover]
          ? compact(slices[hover].value)
          : compact(total)}
      </text>
      <text x={C} y={C + 16} class="center-label" text-anchor="middle">
        {hover !== null && slices[hover] ? slices[hover].label : centerLabel}
      </text>
    </svg>
  </div>

  <ul class="legend">
    {#each slices as s}
      <li
        class:dim={hover !== null && hover !== s.index}
        onpointerenter={() => (hover = s.index)}
        onpointerleave={() => (hover = null)}
      >
        <span class="swatch viz-bg-{(s.index % 4) + 1}"></span>
        <span class="legend-label">{s.label}</span>
        <span class="legend-value">{compact(s.value)}</span>
        <span class="legend-pct">{s.pct.toFixed(0)}%</span>
      </li>
    {/each}
    {#if total === 0}
      <li class="legend-empty">Belum ada data</li>
    {/if}
  </ul>
</div>

<style>
  .donut-wrap {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }
  .donut-figure {
    flex-shrink: 0;
    width: 180px;
  }
  svg {
    width: 100%;
    height: auto;
    display: block;
  }

  .slice {
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;
    transform-origin: center;
    cursor: default;
  }
  .slice.dim {
    opacity: 0.28;
  }

  /* Slot warna kategorikal — urutannya tetap, tidak pernah diputar ulang,
     supaya satu kategori selalu dapat warna yang sama. */
  .viz-fill-1 {
    fill: var(--viz-1);
  }
  .viz-fill-2 {
    fill: var(--viz-2);
  }
  .viz-fill-3 {
    fill: var(--viz-3);
  }
  .viz-fill-4 {
    fill: var(--viz-4);
  }
  .viz-bg-1 {
    background: var(--viz-1);
  }
  .viz-bg-2 {
    background: var(--viz-2);
  }
  .viz-bg-3 {
    background: var(--viz-3);
  }
  .viz-bg-4 {
    background: var(--viz-4);
  }
  .empty-ring {
    fill: none;
    stroke: var(--viz-grid);
    stroke-width: 28;
  }

  .center-value {
    fill: var(--text-main);
    font-size: 24px;
    font-weight: 800;
  }
  .center-label {
    fill: var(--viz-muted);
    font-size: 11px;
    font-weight: 600;
  }

  .legend {
    flex: 1;
    min-width: 150px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .legend li {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    font-size: 0.82rem;
    color: var(--text-muted);
    transition: opacity 0.15s ease;
  }
  .legend li.dim {
    opacity: 0.45;
  }
  .swatch {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex-shrink: 0;
  }
  .legend-label {
    color: var(--text-main);
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .legend-value {
    margin-left: auto;
    font-weight: 700;
    color: var(--text-main);
    font-variant-numeric: tabular-nums;
  }
  .legend-pct {
    min-width: 2.5rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .legend-empty {
    font-size: 0.82rem;
    color: var(--viz-muted);
  }
</style>
