<script lang="ts">
  // Sparkline 14 titik untuk stat tile. Tanpa sumbu, tanpa label —
  // tugasnya cuma menunjukkan bentuk tren, angka pastinya ada di tile.
  import { smoothPath } from "./chart-utils";

  let {
    values = [],
    accent = false,
  }: {
    values: number[];
    accent?: boolean;
  } = $props();

  const W = 120;
  const H = 34;

  const pts = $derived.by(() => {
    if (values.length === 0) return [];
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const span = max - min || 1;
    return values.map((v, i) => ({
      x: values.length === 1 ? W / 2 : (i / (values.length - 1)) * W,
      // Sisakan 3px atas/bawah supaya garis & titik akhir tidak terpotong.
      y: H - 3 - ((v - min) / span) * (H - 6),
    }));
  });

  const line = $derived(smoothPath(pts));
  const area = $derived(
    pts.length ? `${line} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z` : "",
  );
  const last = $derived(pts[pts.length - 1]);
</script>

<svg viewBox="0 0 {W} {H}" class:accent aria-hidden="true">
  <path d={area} class="spark-area" />
  <path d={line} class="spark-line" />
  {#if last}
    <circle cx={last.x} cy={last.y} r="3" class="spark-dot" />
  {/if}
</svg>

<style>
  svg {
    width: 100%;
    height: 34px;
    display: block;
    overflow: visible;
  }
  .spark-line {
    fill: none;
    stroke: var(--viz-muted);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .spark-area {
    fill: var(--viz-muted);
    opacity: 0.08;
  }
  .spark-dot {
    fill: var(--viz-muted);
    stroke: var(--viz-surface);
    stroke-width: 2;
  }

  /* Tile utama pakai warna aksen; sisanya abu-abu supaya tidak ramai */
  .accent .spark-line,
  .accent .spark-dot {
    stroke: var(--viz-1);
  }
  .accent .spark-dot {
    fill: var(--viz-1);
  }
  .accent .spark-area {
    fill: var(--viz-1);
    opacity: 0.12;
  }
</style>
