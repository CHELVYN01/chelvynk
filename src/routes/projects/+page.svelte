<script lang="ts">
  import { Globe, Github, Play, ArrowUpRight, ArrowRight } from "lucide-svelte";
  import { flip } from "svelte/animate";
  import { quintOut } from "svelte/easing";
  import { reveal } from "$lib/reveal";
  import { formatUrl } from "$lib/url";
  import {
    exitProgress,
    pageProgress,
    scramble,
    countUp,
    cursorFollow,
  } from "$lib/motion";
  import ProjectModal from "$lib/components/ProjectModal.svelte";
  import ClosingCta from "$lib/components/ClosingCta.svelte";

  let { data } = $props();
  const projects = $derived(data.projects);

  const pad = (n: number) => String(n).padStart(2, "0");
  const heroLines = ["Semua", "Project"];

  // Nomor arsip tetap (urutan asli), tidak berubah saat difilter
  const indexOf = $derived(
    new Map(projects.map((p: any, i: number) => [p.id, i + 1])),
  );

  // Kategori di DB ditulis bebas ("Website Katalog Gaun", "web tools", ...),
  // jadi filter memakai kelompok besar yang ditebak dari teks kategorinya.
  const ALL = "Semua";
  const groupOf = (cat: string) => {
    if (/odoo|erp/i.test(cat)) return "Odoo";
    if (/mobile|android|ios/i.test(cat)) return "Mobile";
    if (/desktop|cli|terminal/i.test(cat)) return "Desktop & CLI";
    if (/web|site|dashboard|admin/i.test(cat)) return "Web";
    return "Lainnya";
  };
  const groupsOf = (p: any): string[] => [
    ...new Set<string>(p.categories.map(groupOf)),
  ];

  // Kelompok + jumlah project, urut dari yang terbanyak
  const categories = $derived.by(() => {
    const counts = new Map<string, number>();
    for (const p of projects)
      for (const g of groupsOf(p)) counts.set(g, (counts.get(g) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  });

  let activeCat = $state(ALL);
  const filtered = $derived(
    activeCat === ALL
      ? projects
      : projects.filter((p: any) => groupsOf(p).includes(activeCat)),
  );

  // --- Modal detail ---
  let selectedProject = $state<any>(null);

  // --- Kartu pratinjau yang mengikuti kursor (desktop) ---
  let hovered = $state<any>(null);
  let preview = $state<any>(null); // konten terakhir, tetap ada saat memudar
  function hover(project: any, e: PointerEvent) {
    if (e.pointerType !== "mouse") return;
    hovered = project;
    preview = project;
  }
</script>

<svelte:head>
  <!-- prettier-ignore -->
  <title>Portofolio Project — Chelvyn Kleden | Odoo, Laravel & Web Developer</title>
</svelte:head>

<div class="page-progress" use:pageProgress aria-hidden="true"></div>

<!-- ===== Hero ===== -->
<section class="p-hero" use:exitProgress>
  <div class="container">
    <div class="mono p-top intro" style="--d: 0.1s">
      <span use:scramble={200}>(Index) — Arsip Karya</span>
      <span class="scroll-cue" aria-hidden="true">
        <span use:scramble={400}>Scroll</span>
        <span class="scroll-line"></span>
      </span>
    </div>

    <h1 class="p-title" aria-label="Semua project">
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
          {#if li === heroLines.length - 1}
            <sup class="mono p-count intro" style="--d: 1s"
              >(<span use:countUp={{ to: projects.length }}
                >{projects.length}</span
              >)</sup
            >
          {/if}
        </span>
      {/each}
    </h1>

    <div class="p-foot">
      <div class="mono p-meta intro" style="--d: 1.05s">
        <span>{pad(projects.length)} — Project</span>
        <span>{pad(categories.length)} — Bidang</span>
      </div>
      <div class="intro" style="--d: 1.2s">
        <p class="p-lead">
          Kumpulan lengkap solusi digital yang pernah saya bangun — ERP, web,
          hingga mobile.
          <span class="hint-mouse"
            >Arahkan kursor untuk pratinjau, klik untuk detail.</span
          ><span class="hint-touch">Ketuk salah satu untuk detail.</span>
        </p>
        <a href="/contact" class="btn-text">
          Diskusikan project baru <ArrowRight size={16} />
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ===== Filter kategori (menempel di bawah header) ===== -->
{#if categories.length > 1}
  <nav class="filters" aria-label="Filter kategori project">
    <div class="container filters-inner">
      {#each [[ALL, projects.length], ...categories] as [cat, count]}
        <button
          type="button"
          class="mono filter"
          class:active={activeCat === cat}
          aria-pressed={activeCat === cat}
          onclick={(e) => {
            activeCat = cat as string;
            e.currentTarget.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "center",
            });
          }}
        >
          {cat} <span class="filter-count">({pad(count as number)})</span>
        </button>
      {/each}
    </div>
  </nav>
{/if}

<!-- ===== Daftar project ===== -->
<section class="p-list">
  <div class="container">
    <div
      class="index"
      role="list"
      use:cursorFollow
      onpointerleave={() => (hovered = null)}
    >
      {#each filtered as project (project.id)}
        <div
          class="row"
          role="listitem"
          animate:flip={{ duration: 650, easing: quintOut }}
          use:reveal
          onpointerenter={(e) => hover(project, e)}
        >
          <button
            type="button"
            class="row-hit"
            aria-label={`Lihat detail project ${project.title}`}
            onclick={() => (selectedProject = project)}
          ></button>

          <span class="mono row-num">{pad(indexOf.get(project.id) ?? 0)}</span>

          <div class="row-main">
            <h2>{project.title}</h2>
            <!-- Perangkat sentuh: deskripsi tampil langsung (tanpa kursor) -->
            <p class="row-desc">{project.description}</p>
          </div>

          <span class="mono row-cats">{project.categories.join(" / ")}</span>

          <div class="row-actions">
            {#if project.link}
              <a
                href={formatUrl(project.link)}
                class="icon-btn"
                target="_blank"
                rel="noopener noreferrer"
                title="Kunjungi Website"
                aria-label={`Website ${project.title}`}
              >
                <Globe size={16} />
              </a>
            {/if}
            {#if project.github}
              <a
                href={formatUrl(project.github)}
                class="icon-btn"
                target="_blank"
                rel="noopener noreferrer"
                title="Lihat Source Code"
                aria-label={`Source code ${project.title}`}
              >
                <Github size={16} />
              </a>
            {/if}
            {#if project.demo}
              <a
                href={formatUrl(project.demo)}
                class="icon-btn"
                target="_blank"
                rel="noopener noreferrer"
                title="Lihat Demo"
                aria-label={`Demo ${project.title}`}
              >
                <Play size={16} />
              </a>
            {/if}
            <span class="row-arrow" aria-hidden="true"
              ><ArrowUpRight size={20} /></span
            >
          </div>
        </div>
      {/each}

      <!-- Kartu pratinjau mengikuti kursor -->
      <div class="follower" aria-hidden="true">
        {#if preview}
          <div class="follower-card" class:show={!!hovered}>
            <span class="mono follower-meta"
              >({pad(indexOf.get(preview.id) ?? 0)}) — {preview.categories.join(
                " / ",
              )}</span
            >
            <p class="follower-desc">{preview.description}</p>
            {#if preview.tech.length > 0}
              <ul class="mono follower-tech">
                {#each preview.tech.slice(0, 6) as t}
                  <li>{t}</li>
                {/each}
              </ul>
            {/if}
            <span class="mono follower-cta">Klik untuk detail ↗</span>
          </div>
        {/if}
      </div>
    </div>

    {#if projects.length === 0}
      <p class="empty">Project akan segera ditampilkan.</p>
    {/if}
  </div>
</section>

{#if selectedProject}
  <ProjectModal
    project={selectedProject}
    onclose={() => (selectedProject = null)}
  />
{/if}

<ClosingCta
  kicker="Project berikutnya bisa jadi milik Anda."
  lines={["Ayo", "Mulai."]}
  lead="Punya ide produk, sistem ERP, atau aplikasi yang perlu dibangun? Ceritakan kebutuhannya."
  primary={{ href: "/contact", label: "Diskusikan Project" }}
  secondary={{ href: "/about", label: "Tentang Saya" }}
/>

<style>
  /* ===== Hero ===== */
  .p-hero {
    position: relative;
    padding: 0;
    overflow: hidden;
    background-image:
      linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
      linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
    background-size: 64px 64px;
    background-position: -1px calc(-1px + var(--p, 0) * 160px);
  }

  .p-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding-top: 4rem;
    color: var(--text-muted);
  }

  .p-title {
    margin: 2.5rem 0 4.5rem;
    font-family: var(--font-serif);
    font-weight: 400;
    font-size: clamp(3.5rem, 14vw, 12rem);
    line-height: 0.9;
    letter-spacing: -0.045em;
    text-transform: uppercase;
    color: var(--text-main);
  }

  .p-title .line {
    display: block;
    white-space: nowrap;
    will-change: transform;
  }

  .p-title .line-0 {
    transform: translate3d(calc(var(--p, 0) * -26%), 0, 0);
  }

  .p-title .line-1 {
    padding-left: 1.1em;
    transform: translate3d(calc(var(--p, 0) * 18%), 0, 0);
  }

  /* Jumlah project kecil di pojok kanan atas kata "PROJECT" */
  .p-count {
    display: inline-block;
    vertical-align: top;
    margin-left: 0.6rem;
    margin-top: 0.4em;
    font-size: clamp(0.85rem, 1.6vw, 1.25rem);
    letter-spacing: 0.04em;
    color: var(--text-muted);
  }

  .p-foot {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding: 1.75rem 0 5rem;
    opacity: calc(1 - var(--p, 0) * 1.8);
    transform: translate3d(0, calc(var(--p, 0) * -60px), 0);
  }

  .p-foot::before {
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

  .p-meta {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    color: var(--text-main);
  }

  .p-lead {
    font-family: var(--font-serif);
    font-size: clamp(1.1rem, 1.6vw, 1.3rem);
    line-height: 1.5;
    color: var(--text-main);
    max-width: 30rem;
    margin-bottom: 2rem;
  }

  /* ===== Filter ===== */
  .filters {
    position: sticky;
    top: calc(4.5rem + 1px); /* tepat di bawah header */
    z-index: 50;
    background: var(--bg-white);
    border-top: 1px solid var(--text-main);
    border-bottom: 1px solid var(--border);
  }

  .filters-inner {
    display: flex;
    gap: 0.5rem;
    padding-top: 0.85rem;
    padding-bottom: 0.85rem;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .filters-inner::-webkit-scrollbar {
    display: none;
  }

  .filter {
    flex-shrink: 0;
    padding: 0.55rem 0.9rem;
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    white-space: nowrap;
    transition:
      background 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease;
  }

  .filter:hover {
    color: var(--text-main);
    border-color: var(--border);
  }

  .filter.active {
    background: var(--primary);
    border-color: var(--primary);
    color: var(--on-primary);
  }

  .filter-count {
    opacity: 0.6;
  }

  /* ===== Daftar ===== */
  .p-list {
    padding: 0 0 6rem;
  }

  .row {
    position: relative;
    display: grid;
    grid-template-columns: 4rem minmax(0, 1fr) 14rem 11rem;
    gap: 1.5rem;
    align-items: center;
    padding: 2.25rem 0;
    border-bottom: 1px solid var(--border);
  }

  /* Seluruh baris bisa diklik; tombol link di atasnya tetap bisa diklik */
  .row-hit {
    position: absolute;
    inset: 0;
    z-index: 1;
    width: 100%;
    border: none;
    background: transparent;
    cursor: pointer;
  }

  .row-hit:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 4px;
  }

  .row-actions {
    position: relative;
    z-index: 2;
  }

  /* Transisi redup dipasang di anak, bukan di baris (baris dipakai .reveal) */
  .row > :not(.row-hit) {
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
  .row-cats {
    color: var(--text-muted);
    transition: color 0.3s ease;
  }

  .row-main h2 {
    font-family: var(--font-serif);
    font-weight: 400;
    font-size: clamp(1.75rem, 4.4vw, 3.75rem);
    line-height: 1.05;
    letter-spacing: -0.03em;
    color: var(--text-main);
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .row-desc {
    display: none;
  }

  .row-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .row-actions .icon-btn {
    opacity: 0;
    transform: translateX(8px);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease,
      background 0.2s ease,
      color 0.2s ease;
  }

  .row-arrow {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    border: 1px solid var(--text-main);
    color: var(--text-main);
    transition:
      background 0.25s ease,
      color 0.25s ease,
      transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @media (hover: hover) {
    .index:hover .row:not(:hover) > :not(.row-hit) {
      opacity: 0.22;
    }

    .row:hover::after {
      transform: scaleX(1);
    }

    .row:hover .row-num,
    .row:hover .row-cats {
      color: var(--text-main);
    }

    .row:hover .row-main h2 {
      transform: translateX(0.75rem);
    }

    .row:hover .icon-btn {
      opacity: 1;
      transform: none;
    }

    .row:hover .row-arrow {
      background: var(--primary);
      color: var(--on-primary);
      transform: rotate(45deg);
    }
  }

  .empty {
    padding: 3rem 0;
    font-family: var(--font-serif);
    color: var(--text-muted);
  }

  .follower-desc {
    margin: 0.9rem 0;
    font-family: var(--font-serif);
    font-size: 1.05rem;
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .follower-tech {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem 0.9rem;
    padding-top: 0.9rem;
    margin-bottom: 0.9rem;
    border-top: 1px solid color-mix(in srgb, var(--on-primary) 20%, transparent);
  }

  /* Tanpa kursor (HP/tablet): tanpa pratinjau, deskripsi tampil di baris */
  .hint-touch {
    display: none;
  }

  @media (hover: none) {
    .hint-mouse {
      display: none;
    }

    .hint-touch {
      display: inline;
    }

    .row:active {
      background: color-mix(in srgb, var(--text-main) 4%, transparent);
    }

    .row:active .row-arrow {
      background: var(--primary);
      color: var(--on-primary);
    }

    .row-desc {
      display: -webkit-box;
      margin-top: 0.6rem;
      font-family: var(--font-serif);
      font-size: 1rem;
      line-height: 1.5;
      color: var(--text-muted);
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .row-actions .icon-btn {
      opacity: 1;
      transform: none;
    }
  }

  /* ===== Responsif ===== */
  @media (max-width: 960px) {
    /* Baris atas: nomor · kategori · tombol; judul selebar layar di bawahnya */
    .row {
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: 0.85rem 0.75rem;
      align-items: center;
      padding: 1.5rem 0 1.75rem;
    }

    .row-num {
      grid-column: 1;
      grid-row: 1;
    }

    .row-cats {
      grid-column: 2;
      grid-row: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .row-actions {
      grid-column: 3;
      grid-row: 1;
    }

    .row-main {
      grid-column: 1 / -1;
      grid-row: 2;
    }

    .row-arrow,
    .row-actions .icon-btn {
      width: 40px;
      height: 40px;
    }

    /* Bar filter bisa digeser: pudar di tepi kanan sebagai petunjuk */
    .filters-inner {
      scroll-snap-type: x proximity;
      -webkit-mask-image: linear-gradient(90deg, #000 82%, transparent);
      mask-image: linear-gradient(90deg, #000 82%, transparent);
      padding-right: 3rem;
    }

    .filter {
      scroll-snap-align: start;
    }
  }

  @media (max-width: 768px) {
    .p-top {
      padding-top: 2.5rem;
    }

    .p-title {
      margin: 2rem 0 3rem;
    }

    .p-title .line-1 {
      padding-left: 0.4em;
    }

    .p-foot {
      grid-template-columns: 1fr;
      padding-bottom: 3.5rem;
    }

    .p-list {
      padding-bottom: 4rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .p-foot::before {
      animation: none;
    }

    .row::after,
    .row-main h2,
    .row-arrow,
    .follower-card {
      transition: none;
    }
  }
</style>
