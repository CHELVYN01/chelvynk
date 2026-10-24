<script lang="ts">
  import { ArrowLeft, ArrowRight, ArrowUpRight, Github, Globe } from "lucide-svelte";
  import { reveal } from "$lib/reveal";
  import { exitProgress, pageProgress, scramble, inview } from "$lib/motion";
  import { formatUrl } from "$lib/url";
  import ClosingCta from "$lib/components/ClosingCta.svelte";

  let { data } = $props();
  const product = $derived(data.product);

  const pad = (n: number) => String(n).padStart(2, "0");

  const paragraphs = $derived(
    product.description
      ? product.description.split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean)
      : [],
  );

  // Nomor section dinamis: section kosong dilewati
  const sec = $derived.by(() => {
    let i = 0;
    return {
      why: product.problem || product.solution ? ++i : 0,
      detail: paragraphs.length ? ++i : 0,
      features: product.features.length ? ++i : 0,
    };
  });
</script>

<div class="page-progress" use:pageProgress aria-hidden="true"></div>

<!-- ===== Hero: nama produk raksasa ===== -->
<section class="pd-hero" use:exitProgress>
  <div class="container">
    <div class="mono pd-top intro" style="--d: 0.1s">
      <a href="/products" class="back"><ArrowLeft size={14} /> Semua Produk</a>
      <span use:scramble={300}>(Produk {pad(data.number)} / {pad(data.total)})</span>
    </div>

    <h1
      class="pd-name"
      aria-label={product.name}
      style="--len: {Math.max(product.name.length, 4)}"
    >
      <span class="line-mask" aria-hidden="true">
        {#each product.name.split("") as ch, ci}
          <span class="ch" style="--d: {(0.2 + ci * 0.06).toFixed(3)}s"
            >{ch === " " ? " " : ch}</span
          >
        {/each}
      </span>
    </h1>

    <div class="pd-foot">
      <div class="mono pd-meta intro" style="--d: 0.9s">
        {#if product.status}<span>{product.status}</span>{/if}
        {#each product.tags as tag}
          <span>— {tag}</span>
        {/each}
      </div>

      <div class="intro" style="--d: 1.05s">
        <p class="pd-tagline">{product.tagline}</p>
        <div class="pd-btns">
          {#if product.github_url}
            <a
              href={formatUrl(product.github_url)}
              class="btn-solid"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={16} /> Lihat di GitHub
            </a>
          {/if}
          {#if product.link_url}
            <a
              href={formatUrl(product.link_url)}
              class={product.github_url ? "btn-line" : "btn-solid"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Globe size={16} /> Kunjungi
            </a>
          {/if}
          {#if !product.github_url && !product.link_url}
            <a href="/contact" class="btn-text">
              Tanya soal {product.name} <ArrowRight size={16} />
            </a>
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ===== Masalah → Solusi ===== -->
{#if sec.why}
  <section class="block">
    <div class="container">
      <header class="sec-head" use:inview>
        <h2><span class="mask"><span>Kenapa</span></span></h2>
        <span class="mono" use:scramble={300}>({pad(sec.why)})</span>
      </header>

      <div class="why" use:inview={0.3}>
        {#if product.problem}
          <div class="why-cell">
            <span class="mono why-label">(A) — Masalah</span>
            <p>{product.problem}</p>
          </div>
        {/if}
        {#if product.problem && product.solution}
          <span class="why-arrow" aria-hidden="true"><ArrowRight size={28} /></span>
        {/if}
        {#if product.solution}
          <div class="why-cell why-solution">
            <span class="mono why-label">(B) — Solusi</span>
            <p>{product.solution}</p>
          </div>
        {/if}
      </div>
    </div>
  </section>
{/if}

<!-- ===== Detail ===== -->
{#if sec.detail}
  <section class="block">
    <div class="container">
      <header class="sec-head" use:inview>
        <h2><span class="mask"><span>Detail</span></span></h2>
        <span class="mono" use:scramble={300}>({pad(sec.detail)})</span>
      </header>
      <div class="detail">
        {#each paragraphs as para, i}
          <p use:reveal={{ delay: i * 80 }}>{para}</p>
        {/each}
      </div>
    </div>
  </section>
{/if}

<!-- ===== Fitur ===== -->
{#if sec.features}
  <section class="block">
    <div class="container">
      <header class="sec-head" use:inview>
        <h2><span class="mask"><span>Fitur</span></span></h2>
        <span class="mono" use:scramble={300}>({pad(sec.features)})</span>
      </header>
      <ol class="features">
        {#each product.features as feature, i}
          <li use:reveal={{ delay: i * 80 }}>
            <span class="mono">{pad(i + 1)}</span>
            <p>{feature}</p>
          </li>
        {/each}
      </ol>
    </div>
  </section>
{/if}

<!-- ===== Produk berikutnya ===== -->
{#if data.next}
  <a href="/products/{data.next.slug}" class="next">
    <div class="container next-inner">
      <span class="mono">Produk berikutnya</span>
      <span class="next-name">{data.next.name}</span>
      <span class="next-arrow" aria-hidden="true"><ArrowUpRight size={24} /></span>
    </div>
  </a>
{/if}

{#if product.github_url}
  <ClosingCta
    kicker="Coba {product.name} sekarang."
    lines={["Ambil", "Kodenya."]}
    lead="Kode sumber, cara pakai, dan pembaruan terbaru ada di GitHub."
    primary={{ href: formatUrl(product.github_url), label: "Buka GitHub" }}
    secondary={{ href: "/contact", label: "Hubungi Saya" }}
  />
{:else}
  <ClosingCta
    kicker="Tertarik dengan {product.name}?"
    lines={["Ayo", "Ngobrol."]}
    lead="Tanya cara pakai, kolaborasi, atau kebutuhan serupa untuk tim Anda."
    primary={{ href: "/contact", label: "Hubungi Saya" }}
    secondary={{ href: "/products", label: "Semua Produk" }}
  />
{/if}

<style>
  /* ===== Hero ===== */
  .pd-hero {
    position: relative;
    padding: 0;
    overflow: hidden;
    background-image:
      linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
      linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
    background-size: 64px 64px;
    background-position: -1px calc(-1px + var(--p, 0) * 160px);
  }

  .pd-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding-top: 4rem;
    color: var(--text-muted);
  }

  .back {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-main);
    border-bottom: 1px solid currentColor;
    padding-bottom: 0.15rem;
  }

  .back:hover {
    gap: 0.8rem;
  }

  /* Nama raksasa: ukuran menyesuaikan panjang nama (--len) supaya selalu
     muat selebar container; saat di-scroll hurufnya merenggang & bergeser */
  .pd-name {
    margin: 2rem 0 3.5rem;
    font-family: var(--font-serif);
    font-weight: 400;
    font-size: clamp(
      2.5rem,
      calc((min(100vw, 1100px) - 2.5rem) / (var(--len) * 0.65)),
      22rem
    );
    line-height: 0.85;
    letter-spacing: calc(-0.055em + var(--p, 0) * 0.18em);
    text-transform: uppercase;
    white-space: nowrap;
    color: var(--text-main);
    transform: translate3d(calc(var(--p, 0) * -8%), 0, 0);
    will-change: transform, letter-spacing;
  }

  /* Mask animasi butuh ruang ekstra di ukuran raksasa: puncak huruf (A, K)
     dan kaki serif (L) jangan sampai terpotong */
  .pd-name .line-mask {
    padding: 0.1em 0.1em 0.04em 0.02em;
    margin: -0.1em -0.1em 0 -0.02em;
  }

  .pd-foot {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: 2rem;
    padding: 1.75rem 0 5rem;
    opacity: calc(1 - var(--p, 0) * 1.8);
    transform: translate3d(0, calc(var(--p, 0) * -60px), 0);
  }

  .pd-foot::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--text-muted);
    transform-origin: left;
    animation: draw-x 1.4s cubic-bezier(0.65, 0, 0.35, 1) 0.6s both;
  }

  .pd-meta {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    color: var(--text-main);
  }

  .pd-tagline {
    font-family: var(--font-serif);
    font-size: clamp(1.4rem, 2.6vw, 2.1rem);
    line-height: 1.25;
    letter-spacing: -0.01em;
    color: var(--text-main);
    margin-bottom: 2rem;
  }

  .pd-btns {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem 1.5rem;
  }

  /* ===== Section umum ===== */
  .block {
    padding: 6rem 0;
  }

  /* ===== Masalah → Solusi ===== */
  .why {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: stretch;
    border: 1px solid var(--text-main);
  }

  .why-cell {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 2.5rem 2rem;
    isolation: isolate;
  }

  .why-cell p {
    font-family: var(--font-serif);
    font-size: clamp(1.5rem, 2.8vw, 2.4rem);
    line-height: 1.2;
    letter-spacing: -0.015em;
  }

  .why-label {
    color: var(--text-muted);
  }

  .why-arrow {
    display: grid;
    place-items: center;
    padding: 0 1.25rem;
    border-left: 1px solid var(--text-main);
    border-right: 1px solid var(--text-main);
    color: var(--text-main);
  }

  /* Sel Solusi: latar hitam menyapu dari kiri saat masuk layar */
  .why-solution::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background: var(--primary);
    transform-origin: left;
    transition: transform 1.1s cubic-bezier(0.65, 0, 0.35, 1) 0.2s;
  }

  .why-solution,
  .why-solution .why-label {
    transition: color 0.6s ease 0.6s;
  }

  .why-solution {
    color: var(--on-primary);
  }

  .why-solution .why-label {
    color: color-mix(in srgb, var(--on-primary) 60%, transparent);
  }

  .why:global(.motion) .why-solution::before {
    transform: scaleX(0);
  }

  .why:global(.motion) .why-solution,
  .why:global(.motion) .why-solution .why-label {
    color: var(--text-main);
  }

  .why:global(.in) .why-solution::before {
    transform: scaleX(1);
  }

  .why:global(.in) .why-solution {
    color: var(--on-primary);
  }

  .why:global(.in) .why-solution .why-label {
    color: color-mix(in srgb, var(--on-primary) 60%, transparent);
  }

  /* ===== Detail ===== */
  .detail {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 46rem;
    margin-left: auto;
  }

  .detail p {
    font-family: var(--font-serif);
    font-size: clamp(1.15rem, 1.8vw, 1.4rem);
    line-height: 1.6;
    color: var(--text-main);
  }

  /* ===== Fitur ===== */
  .features {
    border-top: 1px solid var(--text-main);
  }

  .features li {
    display: grid;
    grid-template-columns: 4rem 1fr;
    gap: 1rem;
    padding: 1.6rem 0;
    border-bottom: 1px solid var(--border);
  }

  .features .mono {
    color: var(--text-muted);
    padding-top: 0.5rem;
  }

  .features p {
    font-family: var(--font-serif);
    font-size: clamp(1.25rem, 2.2vw, 1.75rem);
    line-height: 1.35;
    color: var(--text-main);
  }

  /* ===== Produk berikutnya ===== */
  .next {
    display: block;
    border-top: 1px solid var(--text-main);
    color: var(--text-main);
    transition:
      background 0.4s ease,
      color 0.4s ease;
  }

  .next-inner {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding-top: 2.5rem;
    padding-bottom: 2.5rem;
  }

  .next .mono {
    color: inherit;
    opacity: 0.6;
  }

  .next-name {
    flex: 1;
    font-family: var(--font-serif);
    font-size: clamp(2.5rem, 7vw, 6rem);
    line-height: 1;
    letter-spacing: -0.04em;
    text-transform: uppercase;
  }

  .next-arrow {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    border: 1px solid currentColor;
  }

  .next:hover {
    background: var(--primary);
    color: var(--on-primary);
  }

  /* ===== Responsif ===== */
  @media (max-width: 860px) {
    .why {
      grid-template-columns: 1fr;
    }

    .why-arrow {
      padding: 0.9rem 0;
      border-left: none;
      border-right: none;
      border-top: 1px solid var(--text-main);
      border-bottom: 1px solid var(--text-main);
    }

    /* Susunan atas-bawah: panah menunjuk ke bawah */
    .why-arrow :global(svg) {
      transform: rotate(90deg);
    }
  }

  @media (max-width: 768px) {
    .pd-top {
      padding-top: 2.5rem;
    }

    .pd-name {
      margin: 1.5rem 0 2.5rem;
    }

    .pd-foot {
      grid-template-columns: 1fr;
      padding-bottom: 3.5rem;
    }

    .block {
      padding: 4rem 0;
    }

    .why-cell {
      padding: 1.75rem 1.25rem;
    }

    .features li {
      grid-template-columns: 2.5rem 1fr;
    }

    .next-inner {
      flex-wrap: wrap;
      gap: 0.75rem 1rem;
    }

    .next .mono {
      width: 100%;
    }

    .next-arrow {
      width: 44px;
      height: 44px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pd-foot::before {
      animation: none;
    }

    .why-solution::before {
      transition: none;
    }
  }
</style>
