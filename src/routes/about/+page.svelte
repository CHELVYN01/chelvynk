<script lang="ts">
  import { ArrowRight, Download } from "lucide-svelte";
  import { reveal } from "$lib/reveal";
  import ClosingCta from "$lib/components/ClosingCta.svelte";
  import {
    exitProgress,
    scrub,
    pageProgress,
    inview,
    scramble,
    countUp,
    velocityMarquee,
  } from "$lib/motion";

  // Seluruh konten halaman ini diambil dari resume (static/resume/my resume.pdf).
  // Kalau resume diperbarui, perbarui juga data di bawah.
  const resumeUrl = "/resume/my%20resume.pdf";

  const pad = (n: number) => String(n).padStart(2, "0");

  // Pecah kalimat jadi kata; teks di antara *...* dicetak miring.
  const toWords = (s: string) => {
    let on = false;
    return s.split(" ").map((raw) => {
      if (raw.startsWith("*")) on = true;
      const word = { w: raw.replaceAll("*", ""), em: on };
      if (raw.endsWith("*")) on = false;
      return word;
    });
  };

  // Headline hero: tiap baris punya indent & arah geser saat scroll sendiri
  const heroLines = [
    { text: "Engineer", italic: false },
    { text: "Pemikir", italic: true },
    { text: "Produk.", italic: false },
  ];

  const bioWords = toWords(
    "Lebih dari satu tahun hands-on dengan *Odoo 17, 18, 19,* Python backend, PostgreSQL, Docker, dan DevOps. Terbiasa membangun aplikasi mobile — *React Native* dan *Flutter* — serta mengimplementasikan *machine learning.* Menangani deployment kompleks, troubleshooting sistem production, dan menghadirkan solusi yang scalable.",
  );

  const quickFacts = [
    { label: "Lokasi", value: "Indonesia · Remote" },
    { label: "Fokus", value: "Odoo ERP & Produk Web" },
    { label: "Pendidikan", value: "Universitas Sanata Dharma" },
  ];

  const stats: {
    value: string;
    label: string;
    count?: { to: number; from?: number; suffix?: string };
  }[] = [
    { value: "1+", label: "Tahun hands-on Odoo", count: { to: 1, suffix: "+" } },
    { value: "17·18·19", label: "Versi Odoo yang ditangani" },
    { value: "5", label: "Modul inti dikustomisasi", count: { to: 5 } },
    { value: "2024", label: "Mulai freelance", count: { to: 2024, from: 2000 } },
  ];

  const experiences = [
    {
      role: "Odoo Developer",
      period: "2025 — Sekarang",
      points: [
        "Mengkustomisasi modul inti (Sales, Purchase, Inventory, Accounting, MRP) agar sesuai dengan proses bisnis spesifik perusahaan.",
        "Mengimplementasikan backend logic dengan Python dan Odoo ORM untuk integrasi data yang mulus dan sistem yang stabil.",
        "Merancang dan mengkustomisasi XML views, QWeb reports, dan OWL components untuk insight bisnis real-time yang actionable.",
      ],
      tech: ["Odoo 17/18/19", "Python", "Odoo ORM", "PostgreSQL", "QWeb", "OWL"],
    },
    {
      role: "Freelance Fullstack Developer",
      period: "2024 — Sekarang",
      points: [
        "Membangun aplikasi web full-stack dengan React.js, SvelteKit, Laravel, dan Rust.",
        "Membuat solusi machine learning dengan Python.",
        "Membangun dan men-deploy solusi terkontainerisasi dengan Docker, PostgreSQL, dan Vercel.",
        "Menangani beberapa project klien sekaligus dengan fokus pada skalabilitas dan optimasi performa.",
      ],
      tech: ["React.js", "SvelteKit", "Laravel", "Rust", "Docker", "Vercel"],
    },
  ];

  const skillGroups = [
    {
      title: "Odoo Development",
      desc: "Kustomisasi & implementasi ERP",
      items: ["Odoo 17/18/19", "Odoo ORM", "XML Views", "QWeb", "OWL"],
    },
    {
      title: "Backend",
      desc: "API & business logic",
      items: ["Python", "PHP", "Laravel", "Rust"],
    },
    {
      title: "Frontend & Mobile",
      desc: "Web modern & aplikasi mobile",
      items: ["Next.js", "SvelteKit", "React Native", "Flutter"],
    },
    {
      title: "Data & Machine Learning",
      desc: "Database & model ML",
      items: ["PostgreSQL", "MySQL", "PyTorch", "Python"],
    },
    {
      title: "DevOps",
      desc: "Deploy & operasional production",
      items: ["Docker", "Git", "Vercel", "Troubleshooting"],
    },
    {
      title: "AI & Problem Solving",
      desc: "Workflow modern & analitis",
      items: ["Agent AI (Claude Code)", "Analytics", "Problem Solving"],
    },
  ];

</script>

<svelte:head>
  <title>Tentang — Chelvyn Kleden | Product Software Engineer & Odoo Developer</title>
</svelte:head>

<div class="page-progress" use:pageProgress aria-hidden="true"></div>

<!-- ===== Hero: tiga baris raksasa, tanpa gambar ===== -->
<section class="a-hero" use:exitProgress>
  <div class="container">
    <div class="mono a-top intro" style="--d: 0.1s">
      <span use:scramble={200}>(Tentang) — Profil 2026</span>
      <span class="scroll-cue" aria-hidden="true">
        <span use:scramble={400}>Scroll</span>
        <span class="scroll-line"></span>
      </span>
    </div>

    <h1
      class="a-title"
      aria-label="Engineer yang berpikir seperti pemilik produk."
    >
      {#each heroLines as line, li}
        <span class="line line-{li}" class:italic={line.italic} aria-hidden="true">
          <span class="line-mask">
            {#each line.text.split("") as ch, ci}
              <span
                class="ch"
                style="--d: {(0.25 + li * 0.2 + ci * 0.045).toFixed(3)}s"
                >{ch}</span
              >
            {/each}
          </span>
        </span>
      {/each}
    </h1>

    <div class="a-foot">
      <div class="mono a-meta intro" style="--d: 1.15s">
        <span use:scramble={1200}>Blasius Chelvyn</span>
        <span use:scramble={1300}>Kera Kleden</span>
        <span use:scramble={1400}>Indonesia · Remote</span>
      </div>

      <div class="intro" style="--d: 1.3s">
        <p class="a-lead">
          Software Developer &amp; Odoo Consultant yang berspesialisasi dalam
          implementasi dan optimasi ERP enterprise — membangun produk seolah
          milik sendiri.
        </p>
        <div class="btn-row">
          <a href={resumeUrl} class="btn-solid" download="CV-Chelvyn-Kleden.pdf">
            <Download size={16} /> Unduh CV
          </a>
          <a href="/contact" class="btn-text">
            Hubungi Saya <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Pita nama raksasa (outline), bereaksi ke kecepatan scroll -->
<div class="name-band" aria-hidden="true">
  <div class="name-track" use:velocityMarquee={0.9}>
    {#each Array(4) as _, i}
      <span class="name" class:solid={i % 2 === 1}>Blasius Chelvyn Kera Kleden</span>
      <span class="name-sep">✳</span>
    {/each}
  </div>
</div>

<!-- ===== 01 · Profil ===== -->
<section class="block">
  <div class="container">
    <header class="sec-head" use:inview>
      <h2><span class="mask"><span>Profil</span></span></h2>
      <span class="mono" use:scramble={300}>(01)</span>
    </header>

    <div class="split">
      <div class="mono split-meta">
        <span use:scramble>Bio</span>
        <span use:scramble={150}>Sejak 2024</span>
      </div>
      <p class="bio" use:scrub style="--n: {bioWords.length}">
        {#each bioWords as word, i}<span
            class="w"
            class:em={word.em}
            style="--i: {i}">{word.w}</span
          >{" "}{/each}
      </p>
    </div>

    <dl class="grid-lines facts">
      {#each quickFacts as fact, i}
        <div class="cell" use:reveal={{ delay: i * 100 }}>
          <dt class="mono label" use:scramble={i * 100}>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      {/each}
    </dl>

    <div class="grid-lines stats">
      {#each stats as stat, i}
        <div class="cell" use:reveal={{ delay: i * 100 }}>
          {#if stat.count}
            <strong class="stat-num" use:countUp={stat.count}>{stat.value}</strong>
          {:else}
            <strong class="stat-num">{stat.value}</strong>
          {/if}
          <span class="mono caption">{stat.label}</span>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ===== 02 · Pengalaman ===== -->
<section class="block">
  <div class="container">
    <header class="sec-head" use:inview>
      <h2><span class="mask"><span>Pengalaman</span></span></h2>
      <span class="mono" use:scramble={300}>(02)</span>
    </header>

    {#each experiences as exp, i}
      <article class="exp" use:inview={0.15}>
        <!-- Kolom kiri lengket selama poin-poin di kanan di-scroll -->
        <div class="exp-side">
          <span class="mono exp-index">{pad(i + 1)} / {pad(experiences.length)}</span>
          <h3><span class="mask"><span>{exp.role}</span></span></h3>
          <span class="mono exp-period" use:scramble={200}>{exp.period}</span>
        </div>

        <div class="exp-body">
          <ol class="exp-points">
            {#each exp.points as point, pi}
              <li use:reveal={{ delay: pi * 90 }}>
                <span class="mono">{pad(pi + 1)}</span>
                <p>{point}</p>
              </li>
            {/each}
          </ol>
          <ul class="mono exp-tech" use:reveal>
            {#each exp.tech as t}
              <li>{t}</li>
            {/each}
          </ul>
        </div>
      </article>
    {/each}
  </div>
</section>

<!-- ===== 03 · Keahlian ===== -->
<section class="block">
  <div class="container">
    <header class="sec-head" use:inview>
      <h2><span class="mask"><span>Keahlian</span></span></h2>
      <span class="mono" use:scramble={300}>(03)</span>
    </header>

    <div class="grid-lines skills">
      {#each skillGroups as group, i}
        <article class="cell skill" use:reveal={{ delay: (i % 3) * 110 }}>
          <span class="mono label">{pad(i + 1)}</span>
          <h3>{group.title}</h3>
          <p>{group.desc}</p>
          <ul class="mono skill-list">
            {#each group.items as item}
              <li>{item}</li>
            {/each}
          </ul>
        </article>
      {/each}
    </div>
  </div>
</section>

<!-- ===== 04 · Pendidikan ===== -->
<section class="block">
  <div class="container">
    <header class="sec-head" use:inview>
      <h2><span class="mask"><span>Pendidikan</span></span></h2>
      <span class="mono" use:scramble={300}>(04)</span>
    </header>

    <div class="edu" use:inview>
      <span class="mono edu-label" use:scramble>Perguruan Tinggi</span>
      <h3><span class="mask"><span>Universitas Sanata Dharma</span></span></h3>
      <span class="mono edu-year" use:scramble={250}>2020 — 2024</span>
    </div>
  </div>
</section>

<ClosingCta
  kicker="Punya ide produk atau butuh implementasi Odoo?"
  lines={["Mari", "Bangun."]}
  lead="Ceritakan kebutuhan Anda — saya bantu dari perencanaan sampai rilis."
  primary={{ href: "/contact", label: "Diskusikan Project" }}
  secondary={{ href: "/projects", label: "Lihat Project" }}
/>

<style>
  h1,
  h2,
  h3 {
    font-family: var(--font-serif);
    font-weight: 400;
  }

  .label {
    display: block;
    color: var(--text-muted);
    margin-bottom: 1.25rem;
  }

  .caption {
    color: var(--text-muted);
    margin-top: auto;
  }

  .btn-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1.75rem;
  }

  .btn-row :global(svg) {
    flex-shrink: 0;
  }

  /* ===== Hero ===== */
  .a-hero {
    position: relative;
    padding: 0;
    overflow: hidden;
    background-image:
      linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
      linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
    background-size: 64px 64px;
    background-position: -1px calc(-1px + var(--p, 0) * 160px);
  }

  .a-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding-top: 4rem;
    color: var(--text-muted);
  }

  .a-title {
    margin: 2.5rem 0 4.5rem;
    font-size: clamp(3.25rem, 12.5vw, 10.5rem);
    line-height: 0.9;
    letter-spacing: -0.04em;
    text-transform: uppercase;
    color: var(--text-main);
  }

  .a-title .line {
    display: block;
    white-space: nowrap;
    will-change: transform;
  }

  /* Tiap baris: indent berbeda + geser ke arah berlawanan saat di-scroll */
  .a-title .line-0 {
    transform: translate3d(calc(var(--p, 0) * -26%), 0, 0);
  }

  .a-title .line-1 {
    padding-left: 1.5em;
    transform: translate3d(calc(var(--p, 0) * 22%), 0, 0);
  }

  .a-title .line-2 {
    padding-left: 0.6em;
    transform: translate3d(calc(var(--p, 0) * -14%), 0, 0);
  }

  .a-title .italic {
    font-style: italic;
    text-transform: none;
    color: var(--text-muted);
  }

  .a-foot {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding: 1.75rem 0 5rem;
    opacity: calc(1 - var(--p, 0) * 1.8);
    transform: translate3d(0, calc(var(--p, 0) * -60px), 0);
  }

  .a-foot::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--text-muted);
    transform-origin: left;
    animation: draw-x 1.4s cubic-bezier(0.65, 0, 0.35, 1) 0.8s both;
  }

  .a-meta {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    color: var(--text-main);
  }

  .a-lead {
    font-family: var(--font-serif);
    font-size: clamp(1.1rem, 1.6vw, 1.3rem);
    line-height: 1.5;
    color: var(--text-main);
    max-width: 30rem;
    margin-bottom: 2rem;
  }

  /* ===== Pita nama raksasa ===== */
  .name-band {
    overflow: hidden;
    padding: 2.5rem 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  .name-track {
    display: inline-flex;
    align-items: center;
    gap: 3rem;
    padding-right: 3rem;
    white-space: nowrap;
    animation: name-slide 50s linear infinite;
    will-change: transform;
  }

  .name {
    font-family: var(--font-serif);
    font-size: clamp(3.5rem, 10vw, 8.5rem);
    line-height: 1;
    letter-spacing: -0.03em;
    text-transform: uppercase;
    color: transparent;
    -webkit-text-stroke: 1px var(--text-main);
  }

  .name.solid {
    color: var(--text-main);
    -webkit-text-stroke: 0;
  }

  .name-sep {
    font-size: clamp(2rem, 5vw, 4rem);
    color: var(--text-main);
  }

  @keyframes name-slide {
    to {
      transform: translateX(-50%);
    }
  }

  /* ===== Section umum ===== */
  .block {
    padding: 6rem 0;
  }

  /* Grid garis tipis: gap 1px di atas latar warna garis */
  .grid-lines {
    display: grid;
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
  }

  .cell {
    background: var(--bg-white);
    padding: 2rem;
    display: flex;
    flex-direction: column;
  }

  /* ===== 01 · Profil ===== */
  .split {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .split-meta {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    color: var(--text-muted);
  }

  .bio {
    font-family: var(--font-serif);
    font-size: clamp(1.5rem, 2.8vw, 2.3rem);
    line-height: 1.3;
    letter-spacing: -0.01em;
    color: var(--text-main);
  }

  /* Kata menyala berurutan mengikuti scroll (--p dari action scrub) */
  .bio .w {
    opacity: clamp(0.12, calc(var(--p, 1) * (var(--n) + 4) - var(--i)), 1);
    transition: opacity 0.2s linear;
  }

  .bio .w.em {
    font-style: italic;
  }

  .facts {
    grid-template-columns: repeat(3, 1fr);
    margin-bottom: 1rem;
  }

  .facts dd {
    font-family: var(--font-serif);
    font-size: 1.35rem;
    line-height: 1.25;
    color: var(--text-main);
  }

  .stats {
    grid-template-columns: repeat(4, 1fr);
  }

  .stats .cell {
    min-height: 13rem;
  }

  /* ===== 02 · Pengalaman ===== */
  .exp {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1.6fr;
    gap: 3rem;
    padding: 2.5rem 0 4.5rem;
  }

  /* Garis atas tiap pengalaman tergambar dari kiri */
  .exp::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--text-main);
    transform-origin: left;
    transition: transform 1.2s cubic-bezier(0.65, 0, 0.35, 1);
  }

  .exp .mask > span {
    transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
  }

  .exp:global(.motion)::before {
    transform: scaleX(0);
  }

  .exp:global(.motion) .mask > span {
    transform: translateY(110%);
  }

  .exp:global(.in)::before {
    transform: scaleX(1);
  }

  .exp:global(.in) .mask > span {
    transform: none;
  }

  .exp-side {
    position: sticky;
    top: 6.5rem;
    align-self: start;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .exp-index,
  .exp-period {
    color: var(--text-muted);
  }

  .exp-side h3 {
    font-size: clamp(2rem, 3.6vw, 3.25rem);
    line-height: 1.05;
    letter-spacing: -0.025em;
  }

  .exp-points li {
    display: grid;
    grid-template-columns: 3rem 1fr;
    gap: 1rem;
    padding: 1.4rem 0;
    border-bottom: 1px solid var(--border);
  }

  .exp-points li:first-child {
    padding-top: 0.25rem;
  }

  .exp-points .mono {
    color: var(--text-muted);
    padding-top: 0.35rem;
  }

  .exp-points p {
    font-family: var(--font-serif);
    font-size: 1.2rem;
    line-height: 1.5;
    color: var(--text-main);
  }

  .exp-tech {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
    padding-top: 1.5rem;
    color: var(--text-muted);
  }

  .exp-tech li::before {
    content: "■ ";
    font-size: 0.6em;
    vertical-align: 0.15em;
  }

  /* ===== 03 · Keahlian ===== */
  .skills {
    grid-template-columns: repeat(3, 1fr);
  }

  /* Hover: kartu berbalik warna (hitam ↔ putih) */
  .skill {
    min-height: 17rem;
    transition:
      background 0.35s ease,
      color 0.35s ease;
  }

  .skill h3 {
    font-size: 1.75rem;
    line-height: 1.1;
    margin-bottom: 0.5rem;
    transition: color 0.35s ease;
  }

  .skill p {
    font-family: var(--font-serif);
    color: var(--text-muted);
    margin-bottom: 1.5rem;
    transition: color 0.35s ease;
  }

  .skill-list {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    color: var(--text-muted);
    transition: color 0.35s ease;
  }

  .skill .label {
    transition: color 0.35s ease;
  }

  @media (hover: hover) {
    .skill:hover {
      background: var(--primary);
    }

    .skill:hover h3 {
      color: var(--on-primary);
    }

    .skill:hover p,
    .skill:hover .skill-list,
    .skill:hover .label {
      color: color-mix(in srgb, var(--on-primary) 65%, transparent);
    }
  }

  /* ===== 04 · Pendidikan ===== */
  .edu {
    display: grid;
    grid-template-columns: 1fr 2.5fr auto;
    gap: 2rem;
    align-items: baseline;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--border);
  }

  .edu-label,
  .edu-year {
    color: var(--text-muted);
  }

  .edu h3 {
    font-size: clamp(2rem, 5vw, 4rem);
    line-height: 1.05;
    letter-spacing: -0.03em;
  }

  .edu .mask > span {
    transition: transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;
  }

  .edu:global(.motion) .mask > span {
    transform: translateY(110%);
  }

  .edu:global(.in) .mask > span {
    transform: none;
  }

  /* ===== Responsif ===== */
  @media (max-width: 960px) {
    .stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .skills {
      grid-template-columns: repeat(2, 1fr);
    }

    .exp {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .exp-side {
      position: static;
    }

    .edu {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }
  }

  @media (max-width: 768px) {
    .a-top {
      padding-top: 2.5rem;
    }

    .a-title {
      margin: 2rem 0 3rem;
    }

    .a-title .line-1 {
      padding-left: 0.8em;
    }

    .a-title .line-2 {
      padding-left: 0.3em;
    }

    .a-foot,
    .split,
    .facts {
      grid-template-columns: 1fr;
    }

    .a-foot {
      padding-bottom: 3.5rem;
    }

    .block {
      padding: 4rem 0;
    }

    .cell {
      padding: 1.5rem;
    }

    .stats .cell {
      min-height: 9rem;
    }

    .stats .stat-num {
      font-size: 2.25rem;
    }

    .name-band {
      padding: 1.5rem 0;
    }
  }

  @media (max-width: 520px) {
    .skills {
      grid-template-columns: 1fr;
    }

    .skill {
      min-height: 0;
    }

    .exp-points li {
      grid-template-columns: 2.25rem 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .name-track,
    .a-foot::before {
      animation: none;
    }

    .exp::before,
    .exp .mask > span,
    .edu .mask > span {
      transition: none;
    }
  }
</style>
