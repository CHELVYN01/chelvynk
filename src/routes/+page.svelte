<script lang="ts">
  import {
    Github,
    Play,
    Globe,
    ArrowUpRight,
    ArrowRight,
    ArrowLeft,
  } from "lucide-svelte";
  import { fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { reveal } from "$lib/reveal";
  import { formatUrl } from "$lib/url";
  import ProjectModal from "$lib/components/ProjectModal.svelte";
  import {
    exitProgress,
    scrub,
    pageProgress,
    inview,
    scramble,
    countUp,
    velocityMarquee,
  } from "$lib/motion";
  let { data } = $props();
  const projects = $derived(data.projects);
  const reviews = $derived(data.reviews ?? []);

  // Ringkasan kepuasan dari semua testimoni yang sudah di-approve.
  // "Puas" = rating 4 atau 5 bintang.
  const reviewStats = $derived.by(() => {
    const ratings: number[] = reviews.map((r: any) => Number(r.rating) || 0);
    const total = ratings.length;
    const happy = ratings.filter((r) => r >= 4).length;
    return {
      total,
      avg: total ? ratings.reduce((a, b) => a + b, 0) / total : 0,
      happyPct: total ? Math.round((happy / total) * 100) : 0,
    };
  });

  // Testimoni: satu kutipan besar tampil bergantian.
  const LONG_TESTIMONIAL = 220;
  let activeTesti = $state(0);
  let testiPaused = $state(false);
  const activeReview = $derived(reviews[activeTesti]);

  function goTesti(i: number) {
    const n = reviews.length;
    if (n) activeTesti = (i + n) % n;
  }

  // Swipe kiri/kanan di HP untuk ganti testimoni (abaikan gerak vertikal = scroll)
  let swipeX = 0;
  let swipeY = 0;
  function onTouchStart(e: TouchEvent) {
    testiPaused = true;
    swipeX = e.touches[0].clientX;
    swipeY = e.touches[0].clientY;
  }
  function onTouchEnd(e: TouchEvent) {
    testiPaused = false;
    const dx = e.changedTouches[0].clientX - swipeX;
    const dy = e.changedTouches[0].clientY - swipeY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      goTesti(activeTesti + (dx < 0 ? 1 : -1));
    }
  }

  // Ganti kutipan otomatis; berhenti saat di-hover/fokus.
  $effect(() => {
    if (reviews.length < 2 || testiPaused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (!document.hidden) goTesti(activeTesti + 1);
    }, 7000);
    return () => clearInterval(id);
  });

  const pad = (n: number) => String(n).padStart(2, "0");

  // Headline hero dipecah per huruf untuk animasi masuk
  const heroLines = ["Dari Ide", "Ke Produk."];

  // Kalimat "Tentang" dipecah per kata: tiap kata menyala saat di-scroll
  const statementWords = [
    ..."Odoo specialist dengan".split(" ").map((w) => ({ w, em: false })),
    ..."pola pikir produk".split(" ").map((w) => ({ w, em: true })),
    ..."— satu engineer, dari ERP, web, mobile, hingga infrastruktur."
      .split(" ")
      .map((w) => ({ w, em: false })),
  ];

  // Tech stack untuk pita berjalan (marquee)
  const techMarquee = [
    "Odoo ERP",
    "Laravel",
    "CodeIgniter 4",
    "Svelte",
    "Next.js",
    "Tauri",
    "React Native",
    "Rust",
    "Python",
    "Docker",
    "CI/CD",
    "VPS / Linux",
    "Nginx",
    "Git",
  ];

  // Modul inti Odoo yang pernah dikustomisasi (dari resume)
  const odooModules = ["Sales", "Purchase", "Inventory", "Accounting", "MRP"];

  // Kapabilitas terkelompok untuk section About
  const skillGroups = [
    {
      title: "Odoo & ERP",
      items: ["Odoo (Custom Module)", "Odoo API", "PostgreSQL", "Python"],
    },
    {
      title: "Backend & Web",
      items: ["Laravel", "CodeIgniter 4", "Rust", "PHP"],
    },
    {
      title: "Frontend & Mobile",
      items: ["Svelte", "Next.js", "React Native", "Tauri"],
    },
    {
      title: "DevOps & Infra",
      items: ["Docker", "CI/CD", "VPS / Linux", "Nginx", "Git"],
    },
  ];

  // --- Project Detail Modal ---
  let selectedProject = $state<any>(null);

  function openProject(project: any) {
    selectedProject = project;
  }

  function closeProject() {
    selectedProject = null;
  }

  // Structured Data for Google
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Blasius Chelvyn Kera Kleden",
    alternateName: ["Chelvyn Kleden", "Kleden Chelvyn"],
    url: "https://chelvynkleden.com",
    image: "https://chelvynkleden.com/profile-bg-atas.jpg",
    jobTitle: "Odoo Technical Consultant & Product Software Engineer",
    description:
      "Blasius Chelvyn Kera Kleden (Chelvyn Kleden) — Odoo Technical Consultant & Odoo Developer freelance di Indonesia. Spesialis kustomisasi modul Odoo ERP, integrasi Odoo API, Laravel, CodeIgniter 4, Svelte, dan Next.js.",
    nationality: "Indonesian",
    address: {
      "@type": "PostalAddress",
      addressCountry: "ID",
    },
    hasOccupation: {
      "@type": "Occupation",
      name: "Odoo Technical Consultant",
      occupationalCategory: "Software Developer / ERP Consultant",
      occupationLocation: {
        "@type": "Country",
        name: "Indonesia",
      },
    },
    knowsAbout: [
      "Odoo ERP",
      "Odoo Development",
      "Odoo Custom Module",
      "Odoo API Integration",
      "Laravel",
      "CodeIgniter 4",
      "PHP",
      "Svelte",
      "Next.js",
      "React Native",
      "Rust",
      "Python",
      "Docker",
    ],
    sameAs: [
      "https://github.com/CHELVYN01",
      "https://linkedin.com/in/chelvynkleden",
      "https://t.me/kledenvin",
    ],
  };
</script>

<svelte:head>
  <script type="application/ld+json">
    {@html JSON.stringify(structuredData)}
  </script>
</svelte:head>

<!-- Garis progres scroll di puncak layar -->
<div class="page-progress" use:pageProgress aria-hidden="true"></div>

<!-- ===== Hero: tipografi saja, tanpa gambar ===== -->
<section id="home" class="hero" use:exitProgress>
  <div class="container">
    <div class="mono hero-top intro" style="--d: 0.1s">
      <p class="hero-status">
        <span class="status-dot" aria-hidden="true"></span>
        <span use:scramble={200}>{data.siteStatus}</span>
      </p>
      <span class="scroll-cue" aria-hidden="true">
        <span use:scramble={400}>Scroll</span>
        <span class="scroll-line"></span>
      </span>
    </div>

    <h1 class="hero-title" aria-label={heroLines.join(" ")}>
      {#each heroLines as line, li}
        <span class="line line-{li}" aria-hidden="true">
          <span class="line-mask">
            {#each line.split("") as ch, ci}
              <span class="ch" style="--d: {(0.25 + li * 0.22 + ci * 0.045).toFixed(3)}s"
                >{ch === " " ? " " : ch}</span
              >
            {/each}
          </span>
        </span>
      {/each}
    </h1>

    <div class="hero-foot">
      <div class="mono hero-meta intro" style="--d: 1.05s">
        <span use:scramble={1100}>(Product Software Engineer)</span>
        <span use:scramble={1250}>Odoo · Web · Mobile</span>
      </div>

      <div class="hero-body intro" style="--d: 1.2s">
        <p class="hero-lead">
          Halo, saya Chelvyn — mengubah kebutuhan bisnis menjadi produk software
          end-to-end: ERP Odoo, aplikasi web, hingga mobile. Tanpa basa-basi,
          dirancang cepat, aman, dan siap diskalakan.
        </p>
        <div class="hero-btns">
          <a href="/projects" class="btn-solid">Lihat Project</a>
          <a href="/contact" class="btn-text">
            Diskusikan Ide <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Tech marquee: pita teks berjalan -->
  <div class="tech-marquee" aria-hidden="true">
    <div class="marquee-track" use:velocityMarquee>
      {#each [...techMarquee, ...techMarquee] as tech}
        <span class="marquee-item">{tech}</span>
        <span class="marquee-sep">/</span>
      {/each}
    </div>
  </div>
</section>

<!-- ===== 01 · Tentang ===== -->
<section id="about" class="block">
  <div class="container">
    <header class="sec-head" use:inview>
      <h2><span class="mask"><span>Tentang</span></span></h2>
      <span class="mono" use:scramble={300}>(01)</span>
    </header>

    <div class="split">
      <div class="mono split-meta">
        <span use:scramble>Profil</span>
        <span use:scramble={150}>End-to-end</span>
      </div>
      <div>
        <p
          class="statement"
          use:scrub
          style="--n: {statementWords.length}"
        >
          {#each statementWords as word, i}<span
              class="w"
              class:em={word.em}
              style="--i: {i}">{word.w}</span
            >{" "}{/each}
        </p>
        <a href="/about" class="btn-text">
          Selengkapnya tentang saya <ArrowRight size={16} />
        </a>
      </div>
    </div>

    <!-- Fokus utama + angka ringkas -->
    <div class="ledger">
      <article class="cell cell-focus" use:reveal>
        <span class="mono label" use:scramble>Fokus Utama</span>
        <h3>Odoo Technical Consultant</h3>
        <p>
          Merancang, mengkustomisasi, dan mengintegrasikan modul ERP Odoo agar
          benar-benar pas dengan proses bisnis klien — dari custom module,
          workflow &amp; automation, hingga integrasi Odoo API dengan sistem
          eksternal.
        </p>
        <ul class="mono module-list">
          {#each odooModules as mod}
            <li>{mod}</li>
          {/each}
        </ul>
        <code class="mono focus-stack"
          >Python · Odoo ORM · QWeb · OWL · PostgreSQL</code
        >
      </article>

      <article class="cell cell-stat" use:reveal={{ delay: 120 }}>
        <span class="mono label" use:scramble>Pengalaman</span>
        <strong class="stat-num">1+</strong>
        <span class="mono caption">Tahun hands-on Odoo di production</span>
      </article>

      <article class="cell cell-stat" use:reveal={{ delay: 240 }}>
        <span class="mono label" use:scramble>Versi Odoo</span>
        <strong class="stat-num">17·18·19</strong>
        <span class="mono caption">Custom module lintas versi</span>
      </article>
    </div>

    <!-- Perjalanan (dari DB) -->
    <div class="sub-block">
      <h3 class="mono sub-title" use:inview>
        <span use:scramble>Perjalanan</span>
      </h3>
      {#if data.experiences.length > 0}
        <ol class="journey">
          {#each data.experiences.slice(0, 3) as exp, i}
            <li use:reveal={{ delay: i * 110 }}>
              <span class="mono journey-date">{exp.period}</span>
              <span class="journey-role">{exp.role}</span>
              <span class="journey-company">{exp.company}</span>
            </li>
          {/each}
        </ol>
      {:else}
        <p class="muted">Riwayat pengalaman akan segera ditambahkan.</p>
      {/if}
    </div>

    <!-- Kapabilitas -->
    <div class="sub-block">
      <h3 class="mono sub-title" use:inview>
        <span use:scramble>Kapabilitas</span>
      </h3>
      <div class="skills">
        {#each skillGroups as group, i}
          <article class="cell skill" use:reveal={{ delay: i * 110 }}>
            <span class="mono label" use:scramble={i * 110}>{pad(i + 1)}</span>
            <h4>{group.title}</h4>
            <ul class="mono skill-list">
              {#each group.items as item}
                <li>{item}</li>
              {/each}
            </ul>
          </article>
        {/each}
      </div>
    </div>
  </div>
</section>

<!-- ===== 02 · Project ===== -->
<section id="projects" class="block">
  <div class="container">
    <header class="sec-head" use:inview>
      <h2><span class="mask"><span>Project</span></span></h2>
      <span class="mono" use:scramble={300}>(02)</span>
    </header>

    <p class="sec-intro" use:reveal>
      Produk &amp; sistem yang pernah saya bangun — klik salah satu untuk
      melihat detailnya.
    </p>

    <div class="work-list">
      {#each projects as project, i (project.id)}
        <div
          class="work-row"
          use:reveal={{ delay: i * 70 }}
          role="button"
          tabindex="0"
          aria-label={`Lihat detail project ${project.title}`}
          onclick={() => openProject(project)}
          onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openProject(project);
            }
          }}
        >
          <span class="mono work-num" aria-hidden="true">{pad(i + 1)}</span>

          <div class="work-main">
            <h3>{project.title}</h3>
            <!-- Deskripsi terbuka saat hover/focus (desktop), selalu tampil di mobile -->
            <div class="work-reveal">
              <div>
                <p class="work-desc">{project.description}</p>
                {#if project.tech.length > 0}
                  <div class="mono work-tech">
                    {#each project.tech.slice(0, 5) as t}
                      <span>{t}</span>
                    {/each}
                    {#if project.tech.length > 5}
                      <span>+{project.tech.length - 5}</span>
                    {/if}
                  </div>
                {/if}
              </div>
            </div>
          </div>

          <span class="mono work-cats">{project.categories.join(" / ")}</span>

          <div class="work-actions">
            {#if project.link}
              <a
                href={formatUrl(project.link)}
                class="icon-btn"
                target="_blank"
                rel="noopener noreferrer"
                title="Kunjungi Website"
                aria-label={`Website ${project.title}`}
                onclick={(e) => e.stopPropagation()}
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
                onclick={(e) => e.stopPropagation()}
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
                onclick={(e) => e.stopPropagation()}
              >
                <Play size={16} />
              </a>
            {/if}
            <span class="work-arrow" aria-hidden="true"
              ><ArrowUpRight size={20} /></span
            >
          </div>
        </div>
      {/each}

      {#if projects.length === 0}
        <p class="muted work-empty">Project terpilih akan segera ditampilkan.</p>
      {/if}
    </div>

    <div class="work-foot" use:reveal>
      <a href="/projects" class="btn-line">
        Lihat Semua Project <ArrowRight size={16} />
      </a>
    </div>
  </div>
</section>

{#if selectedProject}
  <ProjectModal project={selectedProject} onclose={closeProject} />
{/if}

<!-- ===== 03 · Testimoni ===== -->
{#if reviews.length > 0}
  <section id="testimoni" class="block">
    <div class="container">
      <header class="sec-head" use:inview>
        <h2><span class="mask"><span>Testimoni</span></span></h2>
        <span class="mono" use:scramble={300}>(03)</span>
      </header>

      <div
        class="testi-stats"
        title="Persentase klien yang memberi rating 4–5 bintang"
        use:reveal
      >
        <div class="cell">
          <strong
            class="stat-num"
            use:countUp={{ to: reviewStats.happyPct, suffix: "%" }}
            >{reviewStats.happyPct}%</strong
          >
          <span class="mono caption">Klien puas</span>
        </div>
        <div class="cell">
          <strong
            class="stat-num"
            use:countUp={{ to: reviewStats.avg, decimals: 1 }}
            >{reviewStats.avg.toFixed(1)}</strong
          >
          <span class="mono caption">Rating rata-rata / 5</span>
        </div>
        <div class="cell">
          <strong class="stat-num" use:countUp={{ to: reviewStats.total }}
            >{reviewStats.total}</strong
          >
          <span class="mono caption">Ulasan klien</span>
        </div>
      </div>

      <div
        class="testi"
        role="region"
        aria-roledescription="carousel"
        aria-label="Testimoni klien"
        onmouseenter={() => (testiPaused = true)}
        onmouseleave={() => (testiPaused = false)}
        onfocusin={() => (testiPaused = true)}
        onfocusout={() => (testiPaused = false)}
        ontouchstart={onTouchStart}
        ontouchend={onTouchEnd}
        use:reveal
      >
        {#key activeTesti}
          <figure
            class="testi-quote"
            in:fly={{ y: 40, duration: 900, easing: quintOut }}
          >
            <blockquote
              class:long={activeReview.testimonial.length > LONG_TESTIMONIAL}
            >
              “{activeReview.testimonial}”
            </blockquote>
            <figcaption class="mono">
              <span>— {activeReview.reviewer_name}</span>
              {#if activeReview.reviewer_role}
                <span>{activeReview.reviewer_role}</span>
              {/if}
              {#if activeReview.project_title}
                <span>{activeReview.project_title}</span>
              {/if}
              <span aria-label={`Rating ${activeReview.rating} dari 5`}
                >{"★".repeat(Number(activeReview.rating) || 0)}{"☆".repeat(
                  5 - (Number(activeReview.rating) || 0),
                )}</span
              >
            </figcaption>
          </figure>
        {/key}

        {#if reviews.length > 1}
          <div class="testi-controls">
            <span class="mono" aria-live="polite"
              >{pad(activeTesti + 1)} / {pad(reviews.length)}<span
                class="swipe-hint"
                aria-hidden="true"> · ← Geser →</span
              ></span
            >
            <div class="testi-nav">
              <button
                type="button"
                class="icon-btn"
                onclick={() => goTesti(activeTesti - 1)}
                aria-label="Testimoni sebelumnya"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                type="button"
                class="icon-btn"
                onclick={() => goTesti(activeTesti + 1)}
                aria-label="Testimoni berikutnya"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </section>
{/if}

<style>
  .muted {
    color: var(--text-muted);
  }

  h2,
  h3,
  h4 {
    font-family: var(--font-serif);
    font-weight: 400;
    letter-spacing: -0.02em;
  }


  /* ===== Hero ===== */
  .hero {
    position: relative;
    padding: 0;
    border-bottom: 1px solid var(--border);
    /* Grid samar ala kertas milimeter */
    background-image:
      linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
      linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
    background-size: 64px 64px;
    /* Grid ikut bergeser pelan saat hero di-scroll (--p dari exitProgress) */
    background-position: -1px calc(-1px + var(--p, 0) * 160px);
    overflow: hidden;
  }


  .hero-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding-top: 4rem;
    color: var(--text-muted);
  }

  .hero-status {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }


  .hero-title {
    margin: 3rem 0 4.5rem;
    font-family: var(--font-serif);
    font-size: clamp(3.25rem, 11.5vw, 9.5rem);
    font-weight: 400;
    line-height: 0.92;
    letter-spacing: -0.035em;
    text-transform: uppercase;
    color: var(--text-main);
  }

  /* Saat di-scroll, dua baris headline terbelah ke arah berlawanan */
  .hero-title .line {
    display: block;
    white-space: nowrap;
    will-change: transform;
  }

  .hero-title .line-0 {
    transform: translate3d(calc(var(--p, 0) * -28%), 0, 0);
  }

  .hero-title .line-1 {
    padding-left: 0.95em;
    transform: translate3d(calc(var(--p, 0) * 18%), 0, 0);
  }


  .hero-foot {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding: 1.75rem 0 5rem;
    opacity: calc(1 - var(--p, 0) * 1.8);
    transform: translate3d(0, calc(var(--p, 0) * -60px), 0);
  }

  /* Garis pemisah tergambar dari kiri ke kanan */
  .hero-foot::before {
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


  .hero-meta {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    color: var(--text-main);
  }

  .hero-lead {
    font-family: var(--font-serif);
    font-size: clamp(1.1rem, 1.6vw, 1.3rem);
    line-height: 1.5;
    color: var(--text-main);
    max-width: 30rem;
    margin-bottom: 2rem;
  }

  .hero-btns {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1.75rem;
  }

  /* ===== Tech Marquee ===== */
  .tech-marquee {
    border-top: 1px solid var(--border);
    background: var(--bg-white);
    padding: 1rem 0;
    overflow: hidden;
  }

  /* Fallback CSS; dengan JS diambil alih velocityMarquee (ikut kecepatan scroll) */
  .marquee-track {
    display: inline-flex;
    align-items: center;
    gap: 1.5rem;
    padding-right: 1.5rem;
    white-space: nowrap;
    animation: marquee 40s linear infinite;
    will-change: transform;
  }

  .marquee-item {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-main);
  }

  .marquee-sep {
    font-family: var(--font-mono);
    color: var(--text-muted);
    opacity: 0.6;
  }

  @keyframes marquee {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }

  /* ===== Section umum ===== */
  .block {
    padding: 6rem 0;
  }


  .sec-intro {
    font-family: var(--font-serif);
    font-size: 1.15rem;
    color: var(--text-muted);
    max-width: 32rem;
    margin: -1.5rem 0 3rem;
  }

  /* ===== 01 · Tentang ===== */
  .split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .split-meta {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    color: var(--text-muted);
  }

  .statement {
    font-family: var(--font-serif);
    font-size: clamp(1.5rem, 2.8vw, 2.25rem);
    line-height: 1.25;
    letter-spacing: -0.01em;
    color: var(--text-main);
    margin-bottom: 1.75rem;
  }

  /* Tiap kata menyala berurutan mengikuti scroll (--p dari action scrub).
     Tanpa JS --p tidak di-set → default 1 → semua kata terang. */
  .statement .w {
    opacity: clamp(0.12, calc(var(--p, 1) * (var(--n) + 2) - var(--i)), 1);
    transition: opacity 0.2s linear;
  }

  .statement .w.em {
    font-style: italic;
  }

  /* Grid garis tipis: gap 1px di atas latar warna garis */
  .ledger,
  .skills,
  .testi-stats {
    display: grid;
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
  }

  .ledger {
    grid-template-columns: 2fr 1fr;
    grid-template-rows: auto auto;
  }

  .cell {
    background: var(--bg-white);
    padding: 2rem;
  }

  .label {
    display: block;
    color: var(--text-muted);
    margin-bottom: 1.25rem;
  }

  .cell-focus {
    grid-row: span 2;
    display: flex;
    flex-direction: column;
  }

  .cell-focus h3 {
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    line-height: 1.1;
    margin-bottom: 1rem;
  }

  .cell-focus p {
    font-family: var(--font-serif);
    font-size: 1.05rem;
    line-height: 1.6;
    color: var(--text-muted);
    max-width: 34rem;
  }

  .module-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.25rem;
    margin: 1.75rem 0;
    color: var(--text-main);
  }

  .module-list li::before {
    content: "■ ";
    font-size: 0.6em;
    vertical-align: 0.15em;
  }

  .focus-stack {
    margin-top: auto;
    padding-top: 1.25rem;
    border-top: 1px dashed var(--border);
    color: var(--text-muted);
    text-transform: none;
  }

  .cell-stat {
    display: flex;
    flex-direction: column;
  }


  .caption {
    color: var(--text-muted);
    margin-top: auto;
  }

  .sub-block {
    margin-top: 4.5rem;
  }


  .journey li {
    display: grid;
    grid-template-columns: 13rem 1fr auto;
    gap: 1.5rem;
    align-items: baseline;
    padding: 1.25rem 0;
    border-bottom: 1px solid var(--border);
  }

  .journey-date {
    color: var(--text-muted);
  }

  .journey-role {
    font-family: var(--font-serif);
    font-size: 1.3rem;
    color: var(--text-main);
  }

  .journey-company {
    font-family: var(--font-serif);
    color: var(--text-muted);
    text-align: right;
  }

  .sub-block > .muted {
    padding: 1.25rem 0;
  }

  .skills {
    grid-template-columns: repeat(4, 1fr);
    border-top: none;
  }

  .skill h4 {
    font-size: 1.4rem;
    line-height: 1.2;
    margin-bottom: 1.25rem;
  }

  .skill-list {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    color: var(--text-muted);
  }

  /* ===== 02 · Project ===== */
  .work-list {
    border-top: 1px solid var(--text-main);
  }

  .work-row {
    position: relative;
    display: grid;
    /* Kolom aksi lebar tetap (maks 3 ikon + panah) supaya kolom kategori sejajar antar baris */
    grid-template-columns: 4rem minmax(0, 1fr) 12rem 11rem;
    gap: 1.5rem;
    align-items: start;
    padding: 2rem 0;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    outline: none;
  }

  /* Transisi redup dipasang di anak, bukan di baris (baris dipakai .reveal) */
  .work-row > * {
    transition: opacity 0.35s ease;
  }

  /* Garis hitam menyapu di bawah baris yang di-hover */
  .work-row::after {
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

  .work-row:hover::after,
  .work-row:focus-visible::after {
    transform: scaleX(1);
  }

  /* Fokus: baris lain meredup saat satu baris di-hover */
  @media (hover: hover) {
    .work-list:hover .work-row:not(:hover) > * {
      opacity: 0.28;
    }
  }

  .work-row:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 4px;
  }

  .work-num {
    color: var(--text-muted);
    padding-top: 0.75rem;
  }

  .work-main h3 {
    font-size: clamp(1.6rem, 3.2vw, 2.6rem);
    line-height: 1.1;
    transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Trik grid 0fr → 1fr supaya tinggi bisa dianimasikan */
  .work-reveal {
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    transition:
      grid-template-rows 0.45s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 0.35s ease;
  }

  .work-reveal > div {
    overflow: hidden;
  }

  .work-row:hover .work-reveal,
  .work-row:focus-visible .work-reveal {
    grid-template-rows: 1fr;
    opacity: 1;
  }

  .work-desc {
    max-width: 560px;
    padding-top: 0.85rem;
    font-family: var(--font-serif);
    font-size: 1.05rem;
    line-height: 1.55;
    color: var(--text-muted);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .work-tech {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 1rem;
    padding-top: 0.85rem;
    color: var(--text-muted);
  }

  .work-cats {
    padding-top: 0.75rem;
    color: var(--text-muted);
  }

  .work-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .work-actions .icon-btn {
    opacity: 0;
    transform: translateX(8px);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease,
      background 0.2s ease,
      color 0.2s ease;
  }

  .work-row:hover .icon-btn,
  .work-row:focus-within .icon-btn {
    opacity: 1;
    transform: none;
  }

  .work-arrow {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border: 1px solid var(--text-main);
    color: var(--text-main);
    transition:
      background 0.25s ease,
      color 0.25s ease,
      transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .work-row:hover .work-num,
  .work-row:focus-visible .work-num {
    color: var(--text-main);
  }

  .work-row:hover .work-main h3,
  .work-row:focus-visible .work-main h3 {
    transform: translateX(0.5rem);
  }

  .work-row:hover .work-arrow,
  .work-row:focus-visible .work-arrow {
    background: var(--primary);
    color: var(--on-primary);
  }

  .work-empty {
    padding: 2rem 0;
  }

  .work-foot {
    display: flex;
    justify-content: flex-start;
    margin-top: 3rem;
  }

  /* Perangkat tanpa hover (HP/tablet): detail selalu tampil */
  @media (hover: none) {
    .work-reveal {
      grid-template-rows: 1fr;
      opacity: 1;
    }

    .work-actions .icon-btn {
      opacity: 1;
      transform: none;
    }
  }

  /* ===== 03 · Testimoni ===== */
  .testi-stats {
    grid-template-columns: repeat(3, 1fr);
    margin-bottom: 4rem;
  }

  .testi-stats .cell {
    display: flex;
    flex-direction: column;
  }

  .testi-quote blockquote {
    font-family: var(--font-serif);
    font-size: clamp(1.6rem, 3.4vw, 2.75rem);
    line-height: 1.25;
    letter-spacing: -0.015em;
    color: var(--text-main);
    max-width: 58rem;
  }

  .testi-quote blockquote.long {
    font-size: clamp(1.25rem, 2.2vw, 1.75rem);
    line-height: 1.4;
  }

  .testi-quote figcaption {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1.5rem;
    margin-top: 2rem;
    color: var(--text-muted);
  }

  .testi-quote figcaption span:first-child {
    color: var(--text-main);
  }

  .testi-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 3rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--border);
    color: var(--text-muted);
  }

  .testi-nav {
    display: flex;
    gap: 0.5rem;
  }

  /* ===== Responsif ===== */
  @media (max-width: 960px) {
    .skills {
      grid-template-columns: repeat(2, 1fr);
    }

    /* Baris atas: nomor · kategori · tombol; judul selebar layar di bawahnya */
    .work-row {
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: 0.85rem 0.75rem;
      align-items: center;
      padding: 1.5rem 0 1.75rem;
    }

    .work-num {
      grid-column: 1;
      grid-row: 1;
      padding-top: 0;
    }

    .work-cats {
      grid-column: 2;
      grid-row: 1;
      padding-top: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .work-actions {
      grid-column: 3;
      grid-row: 1;
    }

    .work-main {
      grid-column: 1 / -1;
      grid-row: 2;
    }

    .work-desc,
    .work-tech {
      padding-top: 0.6rem;
    }

    .work-arrow {
      width: 40px;
      height: 40px;
    }

    .work-actions .icon-btn {
      width: 40px;
      height: 40px;
    }
  }

  /* Petunjuk geser testimoni: hanya di perangkat sentuh */
  .swipe-hint {
    display: none;
  }

  /* Sentuh: baris berkedip halus saat ditekan (pengganti hover) */
  @media (hover: none) {
    .swipe-hint {
      display: inline;
    }

    .work-row:active {
      background: color-mix(in srgb, var(--text-main) 4%, transparent);
    }

    .work-row:active .work-arrow {
      background: var(--primary);
      color: var(--on-primary);
    }
  }

  @media (max-width: 768px) {
    .hero-top {
      padding-top: 2.5rem;
    }

    .hero-title {
      margin: 2rem 0 3rem;
    }

    .hero-title .line-1 {
      padding-left: 0.5em;
    }

    .scroll-cue {
      display: none;
    }

    .hero-foot,
    .split,
    .ledger {
      grid-template-columns: 1fr;
    }

    .hero-foot {
      padding-bottom: 3.5rem;
    }

    .cell-focus {
      grid-row: auto;
    }

    .block {
      padding: 4rem 0;
    }

    .sec-head {
      margin-bottom: 2.5rem;
    }

    .cell {
      padding: 1.5rem;
    }

    .journey li {
      grid-template-columns: 1fr;
      gap: 0.3rem;
    }

    .journey-company {
      text-align: left;
    }

    .testi-stats .cell {
      padding: 1.25rem 1rem;
    }

    .testi-stats .stat-num {
      font-size: 2rem;
    }

    .testi-stats .caption {
      font-size: 0.62rem;
    }

    .sub-block {
      margin-top: 3rem;
    }

    .split {
      margin-bottom: 2.5rem;
    }

    .testi-controls {
      margin-top: 2rem;
    }
  }

  @media (max-width: 520px) {
    .skills {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .marquee-track,
    .status-dot,
    .intro,
    .ch,
    .hero-foot::before,
    .scroll-line::after {
      animation: none;
    }

    .work-reveal,
    .work-main h3,
    .work-arrow {
      transition: none;
    }
  }
</style>
