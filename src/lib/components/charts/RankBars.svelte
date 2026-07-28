<script lang="ts">
  // Bar horizontal untuk daftar peringkat (halaman terpopuler).
  // Bar horizontal dipilih karena label-nya panjang (path URL) — kalau vertikal
  // teksnya harus dimiringkan dan jadi susah dibaca.
  import { compact } from "./chart-utils";

  let {
    data = [],
  }: {
    data: { label: string; value: number }[];
  } = $props();

  const max = $derived(Math.max(1, ...data.map((d) => d.value)));
</script>

<div class="rank-list">
  {#each data as d, i}
    <div class="rank-row">
      <div class="rank-head">
        <span class="rank-label" title={d.label}>{d.label}</span>
        <span class="rank-value">{compact(d.value)}</span>
      </div>
      <!-- Track = step lebih terang dari ramp yang sama (bukan abu-abu netral) -->
      <div class="track">
        <div
          class="fill"
          class:top={i === 0}
          style="width: {Math.max(2, (d.value / max) * 100)}%"
        ></div>
      </div>
    </div>
  {/each}

  {#if data.length === 0}
    <p class="rank-empty">Belum ada data kunjungan.</p>
  {/if}
</div>

<style>
  .rank-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .rank-row {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .rank-head {
    display: flex;
    align-items: baseline;
    gap: 1rem;
  }
  .rank-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-main);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .rank-value {
    margin-left: auto;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
  }
  .track {
    height: 8px;
    border-radius: 999px;
    background: var(--viz-track);
    overflow: hidden;
  }
  .fill {
    height: 100%;
    border-radius: 999px;
    background: var(--viz-1);
    opacity: 0.5;
    /* Bar tumbuh saat pertama tampil — memberi kesan "hidup" tanpa delay */
    animation: growBar 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .fill.top {
    opacity: 1;
  }

  @keyframes growBar {
    from {
      transform: scaleX(0);
      transform-origin: left;
    }
    to {
      transform: scaleX(1);
      transform-origin: left;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .fill {
      animation: none;
    }
  }

  .rank-empty {
    font-size: 0.85rem;
    color: var(--text-muted);
  }
</style>
