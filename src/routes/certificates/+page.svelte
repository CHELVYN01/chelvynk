<script lang="ts">
  import { ArrowUpRight } from "lucide-svelte";
  import { reveal } from "$lib/reveal";
  import {
    exitProgress,
    pageProgress,
    scramble,
    countUp,
    inview,
    cursorFollow,
  } from "$lib/motion";
  import ClosingCta from "$lib/components/ClosingCta.svelte";

  let { data } = $props();
  const certificates = $derived(data.certificates);

  const pad = (n: number) => String(n).padStart(2, "0");
  const heroLines = ["Bukti", "Belajar."];

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  /** 'YYYY-MM' -> 'Mar 2025' */
  const formatMonth = (ym: string | null) => {
    if (!ym) return "";
    const [y, m] = ym.split("-");
    return `${MONTHS[Number(m) - 1] ?? ""} ${y}`;
  };

  // Nomor urut tetap untuk tiap sertifikat (urutan terbaru dulu)
  const numberOf = $derived(
    new Map(certificates.map((c: any, i: number) => [c.id, i + 1])),
  );

  // Dikelompokkan per tahun terbit; yang tanpa tanggal masuk paling akhir
  const groups = $derived.by(() => {
    const map = new Map<string, any[]>();
    for (const c of certificates) {
      const year = c.issued_at ? String(c.issued_at).slice(0, 4) : "—";
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(c);
    }
    return [...map.entries()];
  });

  const issuerCount = $derived(
    new Set(certificates.map((c: any) => c.issuer)).size,
  );

  // Klik baris: buka link verifikasi, atau gambar sertifikat kalau tidak ada
  const hrefOf = (c: any) => c.credential_url || c.image_url || null;

  // --- Kartu pratinjau mengikuti kursor ---
  let hovered = $state<any>(null);
  let preview = $state<any>(null);
  // Delegasi: cari baris [data-cert] terdekat dari elemen yang di-hover
  function onOver(e: PointerEvent) {
    if (e.pointerType !== "mouse") return;
    const row = (e.target as HTMLElement).closest<HTMLElement>("[data-cert]");
    if (!row) return;
    const cert = certificates.find((c: any) => String(c.id) === row.dataset.cert);
    if (cert) hovered = preview = cert;
  }
</script>

<svelte:head>
  <title>Sertifikat — Chelvyn Kleden | Odoo Technical Consultant</title>
</svelte:head>

<div class="page-progress" use:pageProgress aria-hidden="true"></div>

<!-- ===== Hero ===== -->
<section class="c-hero" use:exitProgress>
  <div class="container">
    <div class="mono c-top intro" style="--d: 0.1s">
      <span use:scramble={200}>(Arsip) — Sertifikat &amp; Kredensial</span>
      <span class="scroll-cue" aria-hidden="true">
        <span use:scramble={400}>Scroll</span>
        <span class="scroll-line"></span>
      </span>
    </div>

    <h1 class="c-title" aria-label="Sertifikat: bukti belajar">
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
          {#if li === heroLines.length - 1 && certificates.length > 0}
            <sup class="mono c-count intro" style="--d: 1s"
              >(<span use:countUp={{ to: certificates.length }}
                >{certificates.length}</span
              >)</sup
            >
          {/if}
        </span>
      {/each}
    </h1>

    <div class="c-foot">
      <div class="mono c-meta intro" style="--d: 1.05s">
        <span>{pad(certificates.length)} — Sertifikat</span>
        <span>{pad(issuerCount)} — Penerbit</span>
      </div>
      <p class="c-lead intro" style="--d: 1.2s">
        Sertifikat dan kredensial yang saya kumpulkan sepanjang jalan — dari ERP
        sampai engineering. Klik salah satu untuk verifikasi.
      </p>
    </div>
  </div>
</section>

<!-- ===== Daftar per tahun ===== -->
<section class="c-list">
  <div class="container">
    {#if certificates.length === 0}
      <div class="empty" use:reveal>
        <p class="mono">(00) — Belum ada data</p>
        <h2>Segera hadir.</h2>
      </div>
    {:else}
      <div
        class="archive"
        role="list"
        use:cursorFollow={280}
        onpointerover={onOver}
        onpointerleave={() => (hovered = null)}
      >
        {#each groups as [year, items]}
          <div class="year-group" role="listitem">
            <!-- Tahun besar, lengket selama baris tahun itu di-scroll -->
            <div class="year" use:inview>
              <span class="mask"><span>{year}</span></span>
              <span class="mono year-count">({pad(items.length)})</span>
            </div>

            <div class="rows">
              {#each items as cert, i (cert.id)}
                {@const href = hrefOf(cert)}
                <svelte:element
                  this={href ? "a" : "div"}
                  class="row"
                  class:linked={!!href}
                  href={href ?? undefined}
                  target={href ? "_blank" : undefined}
                  rel={href ? "noopener noreferrer" : undefined}
                  data-cert={cert.id}
                  use:reveal={{ delay: i * 80 }}
                >
                  <span class="mono row-num"
                    >{pad(numberOf.get(cert.id) ?? 0)}</span
                  >
                  <span class="row-main">
                    <span class="row-title">{cert.title}</span>
                    <span class="mono row-issuer">{cert.issuer}</span>
                  </span>
                  <span class="mono row-date">{formatMonth(cert.issued_at)}</span>
                  {#if href}
                    <span class="row-arrow" aria-hidden="true"
                      ><ArrowUpRight size={18} /></span
                    >
                  {/if}
                </svelte:element>
              {/each}
            </div>
          </div>
        {/each}

        <!-- Kartu pratinjau mengikuti kursor -->
        <div class="follower" aria-hidden="true">
          {#if preview}
            <div class="follower-card cert-card" class:show={!!hovered}>
              {#if preview.image_url}
                <img
                  src={preview.image_url}
                  alt=""
                  loading="lazy"
                  onerror={(e) =>
                    ((e.currentTarget as HTMLImageElement).style.display = "none")}
                />
              {/if}
              <span class="mono follower-meta"
                >({pad(numberOf.get(preview.id) ?? 0)}) — {preview.issuer}</span
              >
              <p class="cert-title">{preview.title}</p>
              {#if preview.credential_id}
                <span class="mono follower-meta">ID · {preview.credential_id}</span>
              {/if}
              {#if hrefOf(preview)}
                <span class="mono follower-meta cert-cta"
                  >{preview.credential_url
                    ? "Klik untuk verifikasi ↗"
                    : "Klik untuk melihat ↗"}</span
                >
              {/if}
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</section>

<ClosingCta
  kicker="Belajar tidak berhenti di sertifikat."
  lines={["Terus", "Tumbuh."]}
  lead="Ingin melihat bagaimana ilmu ini dipakai? Lihat project yang sudah saya bangun."
  primary={{ href: "/projects", label: "Lihat Project" }}
  secondary={{ href: "/contact", label: "Hubungi Saya" }}
/>

<style>
  /* ===== Hero ===== */
  .c-hero {
    position: relative;
    padding: 0;
    overflow: hidden;
    background-image:
      linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
      linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
    background-size: 64px 64px;
    background-position: -1px calc(-1px + var(--p, 0) * 160px);
  }

  .c-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding-top: 4rem;
    color: var(--text-muted);
  }

  .c-title {
    margin: 2.5rem 0 4.5rem;
    font-family: var(--font-serif);
    font-weight: 400;
    font-size: clamp(3.5rem, 14vw, 12rem);
    line-height: 0.9;
    letter-spacing: -0.045em;
    text-transform: uppercase;
    color: var(--text-main);
  }

  .c-title .line {
    display: block;
    white-space: nowrap;
    will-change: transform;
  }

  .c-title .line-0 {
    transform: translate3d(calc(var(--p, 0) * -24%), 0, 0);
  }

  .c-title .line-1 {
    padding-left: 0.9em;
    font-style: italic;
    transform: translate3d(calc(var(--p, 0) * 18%), 0, 0);
  }

  .c-count {
    display: inline-block;
    vertical-align: top;
    margin-left: 0.6rem;
    margin-top: 0.4em;
    font-size: clamp(0.85rem, 1.6vw, 1.25rem);
    font-style: normal;
    letter-spacing: 0.04em;
    color: var(--text-muted);
  }

  .c-foot {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding: 1.75rem 0 5rem;
    opacity: calc(1 - var(--p, 0) * 1.8);
    transform: translate3d(0, calc(var(--p, 0) * -60px), 0);
  }

  .c-foot::before {
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

  .c-meta {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    color: var(--text-main);
  }

  .c-lead {
    font-family: var(--font-serif);
    font-size: clamp(1.1rem, 1.6vw, 1.3rem);
    line-height: 1.5;
    color: var(--text-main);
    max-width: 30rem;
  }

  /* ===== Daftar ===== */
  .c-list {
    padding: 0 0 6rem;
  }

  .year-group {
    display: grid;
    grid-template-columns: 1fr 3fr;
    gap: 2rem;
    border-top: 1px solid var(--text-main);
    padding-bottom: 3rem;
  }

  .year {
    position: sticky;
    top: 6.5rem;
    align-self: start;
    padding-top: 1.5rem;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  /* Tahun raksasa bergaris tepi (outline) */
  .year .mask > span {
    font-family: var(--font-serif);
    font-size: clamp(3rem, 8vw, 7rem);
    line-height: 0.9;
    letter-spacing: -0.04em;
    color: transparent;
    -webkit-text-stroke: 1px var(--text-main);
    transition: transform 1.1s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .year:global(.motion) .mask > span {
    transform: translateY(110%);
  }

  .year:global(.in) .mask > span {
    transform: none;
  }

  .year-count {
    color: var(--text-muted);
    padding-top: 0.5rem;
  }

  .row {
    position: relative;
    display: grid;
    grid-template-columns: 3.5rem minmax(0, 1fr) 7rem 3rem;
    gap: 1.25rem;
    align-items: center;
    padding: 1.75rem 0;
    border-bottom: 1px solid var(--border);
    color: var(--text-main);
  }

  .row.linked {
    cursor: pointer;
  }

  .row:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 4px;
  }

  /* Transisi redup dipasang di anak, bukan di baris (baris dipakai .reveal) */
  .row > * {
    transition: opacity 0.35s ease;
  }

  .row::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 1px;
    background: var(--text-main);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1);
  }

  .row-num,
  .row-date,
  .row-issuer {
    color: var(--text-muted);
    transition: color 0.3s ease;
  }

  .row-date {
    text-align: right;
  }

  .row-main {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .row-title {
    font-family: var(--font-serif);
    font-size: clamp(1.4rem, 2.8vw, 2.25rem);
    line-height: 1.1;
    letter-spacing: -0.02em;
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .row-arrow {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border: 1px solid var(--text-main);
    transition:
      background 0.25s ease,
      color 0.25s ease,
      transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @media (hover: hover) {
    .archive:hover .row:not(:hover) > * {
      opacity: 0.22;
    }

    .row:hover::after {
      transform: scaleX(1);
    }

    .row:hover .row-num,
    .row:hover .row-date,
    .row:hover .row-issuer {
      color: var(--text-main);
    }

    .row:hover .row-title {
      transform: translateX(0.6rem);
    }

    .row:hover .row-arrow {
      background: var(--primary);
      color: var(--on-primary);
      transform: rotate(45deg);
    }
  }

  /* Kartu pratinjau: gambar sertifikat (monokrom) + info */
  .cert-card {
    width: 280px;
  }

  .cert-card img {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    margin-bottom: 1rem;
    filter: grayscale(1) contrast(1.05);
    border: 1px solid color-mix(in srgb, var(--on-primary) 20%, transparent);
  }

  .cert-title {
    margin: 0.6rem 0;
    font-family: var(--font-serif);
    font-size: 1.15rem;
    line-height: 1.3;
  }

  .cert-cta {
    margin-top: 0.75rem;
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
  @media (max-width: 860px) {
    .year-group {
      grid-template-columns: 1fr;
      gap: 0;
    }

    .year {
      position: static;
      padding-bottom: 0.5rem;
    }

    .row {
      grid-template-columns: 2.5rem minmax(0, 1fr) auto;
      gap: 0.35rem 1rem;
      align-items: start;
    }

    .row-date {
      grid-column: 2;
      grid-row: 2;
      text-align: left;
    }

    .row-arrow {
      grid-column: 3;
      grid-row: 1 / span 2;
      width: 40px;
      height: 40px;
    }
  }

  @media (max-width: 768px) {
    .c-top {
      padding-top: 2.5rem;
    }

    .c-title {
      margin: 2rem 0 3rem;
    }

    .c-title .line-1 {
      padding-left: 0.4em;
    }

    .c-foot {
      grid-template-columns: 1fr;
      padding-bottom: 3.5rem;
    }

    .c-list {
      padding-bottom: 4rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .c-foot::before {
      animation: none;
    }

    .row::after,
    .row-title,
    .row-arrow,
    .year .mask > span {
      transition: none;
    }
  }
</style>
