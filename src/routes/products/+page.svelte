<script lang="ts">
  import { ArrowUpRight } from "lucide-svelte";
  import { reveal } from "$lib/reveal";
  import { exitProgress, pageProgress, scramble, countUp } from "$lib/motion";
  import ClosingCta from "$lib/components/ClosingCta.svelte";

  let { data } = $props();
  const products = $derived(data.products);

  const pad = (n: number) => String(n).padStart(2, "0");
  const heroLines = ["Produk", "Sendiri."];
</script>

<svelte:head>
  <title>Produk — Chelvyn Kleden | Alat & Produk Buatan Sendiri</title>
</svelte:head>

<div class="page-progress" use:pageProgress aria-hidden="true"></div>

<!-- ===== Hero ===== -->
<section class="pr-hero" use:exitProgress>
  <div class="container">
    <div class="mono pr-top intro" style="--d: 0.1s">
      <span use:scramble={200}>(Produk) — Dibuat &amp; Dirawat Sendiri</span>
      <span class="scroll-cue" aria-hidden="true">
        <span use:scramble={400}>Scroll</span>
        <span class="scroll-line"></span>
      </span>
    </div>

    <h1 class="pr-title" aria-label="Produk sendiri">
      {#each heroLines as line, li}
        <span class="line line-{li}" aria-hidden="true">
          <span class="line-mask">
            {#each line.split("") as ch, ci}
              <span
                class="ch"
                style="--d: {(0.25 + li * 0.22 + ci * 0.045).toFixed(3)}s"
                >{ch}</span
              >
            {/each}
          </span>
          {#if li === heroLines.length - 1 && products.length > 0}
            <sup class="mono pr-count intro" style="--d: 1s"
              >(<span use:countUp={{ to: products.length }}
                >{products.length}</span
              >)</sup
            >
          {/if}
        </span>
      {/each}
    </h1>

    <div class="pr-foot">
      <div class="mono pr-meta intro" style="--d: 1.05s">
        <span>{pad(products.length)} — Produk</span>
        <span>Buatan Chelvyn Kleden</span>
      </div>
      <p class="pr-lead intro" style="--d: 1.2s">
        Alat dan produk yang saya bangun untuk memecahkan masalah nyata — dari
        workflow AI sampai engineering sehari-hari.
      </p>
    </div>
  </div>
</section>

<!-- ===== Daftar produk ===== -->
<section class="pr-list">
  <div class="container">
    {#if products.length === 0}
      <div class="empty" use:reveal>
        <p class="mono">(00) — Belum ada produk</p>
        <h2>Segera hadir.</h2>
      </div>
    {:else}
      {#each products as product, i (product.id)}
        <a href="/products/{product.slug}" class="product" use:reveal>
          <div class="mono product-top">
            <span>({pad(i + 1)})</span>
            {#if product.status}<span>{product.status}</span>{/if}
            {#if product.tags.length > 0}
              <span class="product-tags">{product.tags.join(" / ")}</span>
            {/if}
          </div>

          <h2 class="product-name">{product.name}</h2>

          <div class="product-foot">
            <p class="product-tagline">{product.tagline}</p>
            <span class="product-arrow" aria-hidden="true"
              ><ArrowUpRight size={22} /></span
            >
          </div>
        </a>
      {/each}
    {/if}
  </div>
</section>

<ClosingCta
  kicker="Punya masalah yang butuh alat khusus?"
  lines={["Bikin", "Bareng."]}
  lead="Ceritakan masalahnya — siapa tahu jadi produk berikutnya."
  primary={{ href: "/contact", label: "Hubungi Saya" }}
  secondary={{ href: "/projects", label: "Lihat Project" }}
/>

<style>
  /* ===== Hero ===== */
  .pr-hero {
    position: relative;
    padding: 0;
    overflow: hidden;
    background-image:
      linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
      linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
    background-size: 64px 64px;
    background-position: -1px calc(-1px + var(--p, 0) * 160px);
  }

  .pr-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding-top: 4rem;
    color: var(--text-muted);
  }

  .pr-title {
    margin: 2.5rem 0 4.5rem;
    font-family: var(--font-serif);
    font-weight: 400;
    font-size: clamp(3.5rem, 14vw, 12rem);
    line-height: 0.9;
    letter-spacing: -0.045em;
    text-transform: uppercase;
    color: var(--text-main);
  }

  .pr-title .line {
    display: block;
    white-space: nowrap;
    will-change: transform;
  }

  .pr-title .line-0 {
    transform: translate3d(calc(var(--p, 0) * -24%), 0, 0);
  }

  .pr-title .line-1 {
    padding-left: 0.9em;
    font-style: italic;
    transform: translate3d(calc(var(--p, 0) * 18%), 0, 0);
  }

  .pr-count {
    display: inline-block;
    vertical-align: top;
    margin-left: 0.6rem;
    margin-top: 0.4em;
    font-size: clamp(0.85rem, 1.6vw, 1.25rem);
    font-style: normal;
    letter-spacing: 0.04em;
    color: var(--text-muted);
  }

  .pr-foot {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding: 1.75rem 0 5rem;
    opacity: calc(1 - var(--p, 0) * 1.8);
    transform: translate3d(0, calc(var(--p, 0) * -60px), 0);
  }

  .pr-foot::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--text-muted);
    transform-origin: left;
    animation: draw-x 1.4s cubic-bezier(0.65, 0, 0.35, 1) 0.7s both;
  }

  .pr-meta {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    color: var(--text-main);
  }

  .pr-lead {
    font-family: var(--font-serif);
    font-size: clamp(1.1rem, 1.6vw, 1.3rem);
    line-height: 1.5;
    color: var(--text-main);
    max-width: 30rem;
  }

  /* ===== Daftar: tiap produk satu blok besar ===== */
  .pr-list {
    padding: 0 0 6rem;
  }

  .product {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 2.5rem 2rem 2.25rem;
    border: 1px solid var(--text-main);
    color: var(--text-main);
    isolation: isolate;
    overflow: hidden;
  }

  .product + .product {
    margin-top: 1.5rem;
  }

  /* Hover/sentuh: lapisan hitam menyapu dari bawah, teks berbalik putih */
  .product::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background: var(--primary);
    transform: scaleY(0);
    transform-origin: bottom;
    transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1);
  }

  .product > * {
    transition: color 0.4s ease;
  }

  .product-top {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
    color: var(--text-muted);
  }

  .product-tags {
    margin-left: auto;
  }

  .product-name {
    font-family: var(--font-serif);
    font-weight: 400;
    font-size: clamp(3.5rem, 13vw, 11rem);
    line-height: 0.85;
    letter-spacing: -0.05em;
    text-transform: uppercase;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .product-foot {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
    transition: border-color 0.4s ease;
  }

  .product-tagline {
    font-family: var(--font-serif);
    font-size: clamp(1.15rem, 2vw, 1.5rem);
    line-height: 1.4;
    max-width: 38rem;
  }

  .product-arrow {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 60px;
    height: 60px;
    border: 1px solid currentColor;
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @media (hover: hover) {
    .product:hover::before {
      transform: scaleY(1);
    }

    .product:hover > *,
    .product:hover .product-top {
      color: var(--on-primary);
    }

    .product:hover .product-foot {
      border-color: color-mix(in srgb, var(--on-primary) 25%, transparent);
    }

    .product:hover .product-name {
      transform: translateX(0.75rem);
    }

    .product:hover .product-arrow {
      transform: rotate(45deg);
    }
  }

  @media (hover: none) {
    .product:active::before {
      transform: scaleY(1);
    }

    .product:active > *,
    .product:active .product-top {
      color: var(--on-primary);
    }
  }

  .product:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 4px;
  }

  .empty {
    padding: 4rem 0 2rem;
    border-top: 1px solid var(--text-main);
  }

  .empty .mono {
    color: var(--text-muted);
    margin-bottom: 1rem;
  }

  .empty h2 {
    font-family: var(--font-serif);
    font-weight: 400;
    font-style: italic;
    font-size: clamp(2.5rem, 7vw, 5.5rem);
    letter-spacing: -0.03em;
    color: var(--text-muted);
  }

  /* ===== Responsif ===== */
  @media (max-width: 768px) {
    .pr-top {
      padding-top: 2.5rem;
    }

    .pr-title {
      margin: 2rem 0 3rem;
    }

    .pr-title .line-1 {
      padding-left: 0.4em;
    }

    .pr-foot {
      grid-template-columns: 1fr;
      padding-bottom: 3.5rem;
    }

    .pr-list {
      padding-bottom: 4rem;
    }

    .product {
      padding: 1.75rem 1.25rem 1.5rem;
      gap: 1.25rem;
    }

    .product-tags {
      margin-left: 0;
    }

    .product-arrow {
      width: 48px;
      height: 48px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pr-foot::before {
      animation: none;
    }

    .product::before,
    .product-name,
    .product-arrow {
      transition: none;
    }
  }
</style>
