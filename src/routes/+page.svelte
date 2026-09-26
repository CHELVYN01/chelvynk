<script lang="ts">
  import {
    CheckCircle2,
    Send,
    Github,
    Play,
    Globe,
    X,
    ArrowUpRight,
    ArrowRight,
    Code2,
    Layers,
    Server,
    Terminal,
    MapPin,
    Star,
    Quote,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Rocket,
    Briefcase,
  } from "lucide-svelte";
  import { fade, scale } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { reveal } from "$lib/reveal";
  import { enhance } from "$app/forms";
  let { data, form } = $props();
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

  // Testimoni panjang dipotong; klik "Baca selengkapnya" untuk membuka.
  const LONG_TESTIMONIAL = 220;
  let expanded = $state<Record<number, boolean>>({});

  // Kartu testimoni mengambang: slot 0 = kartu utama (tajam, di tengah),
  // slot 1..5 = kartu latar yang tersebar & diburamkan.
  const TESTI_SLOTS = 6;
  let activeTesti = $state(0);
  let testiPaused = $state(false);

  function testiSlot(i: number) {
    const n = reviews.length;
    const k = (i - activeTesti + n) % n;
    return k < TESTI_SLOTS ? k : -1; // -1 = disembunyikan
  }

  function goTesti(i: number) {
    const n = reviews.length;
    if (n) activeTesti = (i + n) % n;
  }

  // Ganti kartu utama otomatis; berhenti saat di-hover/fokus atau teks dibuka.
  $effect(() => {
    if (reviews.length < 2 || testiPaused || expanded[activeTesti]) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (!document.hidden) goTesti(activeTesti + 1);
    }, 6000);
    return () => clearInterval(id);
  });

  // Status kirim form kontak (untuk disable tombol & ubah labelnya).
  let sending = $state(false);

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
      icon: Layers,
      title: "Odoo & ERP",
      items: ["Odoo (Custom Module)", "Odoo API", "PostgreSQL", "Python"],
    },
    {
      icon: Server,
      title: "Backend & Web",
      items: ["Laravel", "CodeIgniter 4", "Rust", "PHP"],
    },
    {
      icon: Code2,
      title: "Frontend & Mobile",
      items: ["Svelte", "Next.js", "React Native", "Tauri"],
    },
    {
      icon: Terminal,
      title: "DevOps & Infra",
      items: ["Docker", "CI/CD", "VPS / Linux", "Nginx", "Git"],
    },
  ];

  const formatUrl = (url: string) => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
  };

  // --- Project Detail Modal ---
  let selectedProject = $state<any>(null);

  function openProject(project: any) {
    selectedProject = project;
  }

  function closeProject() {
    selectedProject = null;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") closeProject();
  }

  // Kunci scroll body saat modal terbuka
  $effect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = selectedProject ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  });

  // Structured Data for Google
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Blasius Chelvyn Kera Kleden",
    alternateName: ["Chelvyn Kleden", "Kleden Chelvyn"],
    url: "https://chelvynkleden.com",
    image: "https://chelvynkleden.com/hero-dev-2.png",
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

<svelte:window onkeydown={handleKeydown} />

<section id="home" class="hero-section">
  <!-- Latar: grid halus + aurora -->
  <div class="hero-bg" aria-hidden="true">
    <div class="hero-grid-lines"></div>
    <div class="aurora aurora-1"></div>
    <div class="aurora aurora-2"></div>
  </div>

  <div class="container hero-grid">
    <div class="hero-content fade-in">
      <div class="hero-eyebrow">
        <div class="badge">
          <span class="badge-dot"></span>
          {data.siteStatus}
        </div>
        <span class="role-chip">
          <Sparkles size={13} /> Product Software Engineer
        </span>
      </div>

      <h1>
        Dari Ide Menjadi
        <span class="text-gradient">Produk Digital</span>
        yang Siap Tumbuh.
      </h1>

      <p class="hero-lead">
        Halo, saya <strong>Chelvyn</strong> — Product Software Engineer yang
        mengubah kebutuhan bisnis menjadi produk software end-to-end: ERP
        Odoo, aplikasi web, hingga mobile. Dirancang cepat, aman, dan siap
        diskalakan.
      </p>

      <div class="hero-btns">
        <a href="/projects" class="btn btn-primary btn-glow">
          Lihat Produk & Project <ArrowRight size={18} />
        </a>
        <a href="/contact" class="btn btn-ghost">Diskusikan Ide Anda</a>
      </div>

      <ul class="hero-pillars">
        <li>
          <span class="pillar-icon"><Rocket size={16} /></span>
          <div>
            <strong>End-to-end</strong>
            <span>Discovery → Deploy</span>
          </div>
        </li>
        <li>
          <span class="pillar-icon"><Layers size={16} /></span>
          <div>
            <strong>ERP-ready</strong>
            <span>Odoo & integrasi API</span>
          </div>
        </li>
        <li>
          <span class="pillar-icon"><MapPin size={16} /></span>
          <div>
            <strong>Indonesia</strong>
            <span>Remote-friendly</span>
          </div>
        </li>
      </ul>
    </div>

    <div class="hero-visual fade-in delay-1">
      <div class="photo-frame">
        <div class="photo-inner">
          <img
            src="/hero-dev-2.png"
            alt="Blasius Chelvyn Kera Kleden - Product Software Engineer"
            class="hero-img"
          />
        </div>

        <!-- Kartu mengambang -->
        <div class="float-card float-top">
          <span class="float-icon"><Layers size={16} /></span>
          <div>
            <small>Spesialisasi</small>
            <strong>Odoo ERP Specialist</strong>
          </div>
        </div>

        <div class="float-card float-bottom">
          <small class="mono">// product lifecycle</small>
          <div class="pipeline">
            <span class="step done">Ide</span>
            <span class="line"></span>
            <span class="step done">Build</span>
            <span class="line"></span>
            <span class="step active">Ship</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Tech marquee: pita tech berjalan -->
  <div class="tech-marquee" aria-hidden="true">
    <div class="marquee-track">
      {#each [...techMarquee, ...techMarquee] as tech}
        <span class="marquee-item">{tech}</span>
        <span class="marquee-sep">•</span>
      {/each}
    </div>
  </div>
</section>

<section id="about" class="about-section">
  <div class="container">
    <div class="about-head" use:reveal>
      <div>
        <span class="section-tag">Tentang Saya</span>
        <h2>
          Odoo Specialist dengan
          <span class="text-gradient">Pola Pikir Produk.</span>
        </h2>
      </div>
      <div class="about-head-side">
        <p>
          Saya menggabungkan keahlian ERP dengan kemampuan membangun produk web,
          mobile, hingga infrastruktur — satu engineer, end-to-end.
        </p>
        <a href="/about" class="about-more">
          Selengkapnya tentang saya <ArrowRight size={16} />
        </a>
      </div>
    </div>

    <div class="bento">
      <!-- Fokus utama: Odoo -->
      <article class="bento-card bento-focus" use:reveal>
        <div class="focus-glow" aria-hidden="true"></div>
        <span class="bento-label"><Layers size={14} /> Fokus Utama</span>
        <h3>Odoo Technical Consultant</h3>
        <p>
          Merancang, mengkustomisasi, dan mengintegrasikan modul
          <strong>ERP Odoo</strong> agar benar-benar pas dengan proses bisnis
          klien — dari <strong>custom module</strong>, workflow & automation,
          hingga integrasi <strong>Odoo API</strong> dengan sistem eksternal.
        </p>
        <div class="module-chips">
          {#each odooModules as mod}
            <span><CheckCircle2 size={14} /> {mod}</span>
          {/each}
        </div>
        <code class="focus-stack">// Python · Odoo ORM · QWeb · OWL · PostgreSQL</code>
      </article>

      <!-- Angka ringkas -->
      <article class="bento-card bento-stat" use:reveal={{ delay: 80 }}>
        <span class="bento-label">Pengalaman</span>
        <strong class="stat-num">1+<small>tahun</small></strong>
        <p>Hands-on Odoo di project production</p>
      </article>

      <article class="bento-card bento-stat" use:reveal={{ delay: 160 }}>
        <span class="bento-label">Versi Odoo</span>
        <strong class="stat-num">17·18·19</strong>
        <p>Custom module lintas versi</p>
      </article>

      <!-- Perjalanan (dari DB) -->
      <article class="bento-card bento-journey" use:reveal={{ delay: 120 }}>
        <span class="bento-label"><Briefcase size={14} /> Perjalanan</span>
        <ol class="journey">
          {#each data.experiences.slice(0, 3) as exp, i}
            <li class:current={i === 0}>
              <span class="journey-dot"></span>
              <div>
                <span class="journey-date">{exp.period}</span>
                <h4>{exp.role}</h4>
                <p>{exp.company}</p>
              </div>
            </li>
          {/each}
        </ol>
        {#if data.experiences.length === 0}
          <p class="journey-empty">Riwayat pengalaman akan segera ditambahkan.</p>
        {/if}
      </article>

      <!-- Kapabilitas -->
      {#each skillGroups as group, i}
        {@const Icon = group.icon}
        <article class="bento-card bento-skill" use:reveal={{ delay: i * 80 }}>
          <div class="skill-top">
            <span class="skill-icon"><Icon size={18} /></span>
            <span class="skill-index">0{i + 1}</span>
          </div>
          <h3>{group.title}</h3>
          <div class="skill-tags">
            {#each group.items as item}
              <span>{item}</span>
            {/each}
          </div>
        </article>
      {/each}
    </div>
  </div>
</section>

<section id="projects" class="project-section">
  <div class="container">
    <div class="section-header" use:reveal>
      <div>
        <span class="section-tag">Portofolio</span>
        <h2>Project <span class="text-orange">Terpilih</span></h2>
      </div>
      <p>
        Produk & sistem yang pernah saya bangun — klik salah satu untuk melihat
        detailnya.
      </p>
    </div>

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
          <span class="work-num" aria-hidden="true"
            >{String(i + 1).padStart(2, "0")}</span
          >

          <div class="work-main">
            <h3>{project.title}</h3>
            <!-- Deskripsi terbuka saat hover/focus (desktop), selalu tampil di mobile -->
            <div class="work-reveal">
              <div>
                <p class="work-desc">{project.description}</p>
                {#if project.tech.length > 0}
                  <div class="work-tech">
                    {#each project.tech.slice(0, 5) as t}
                      <span>{t}</span>
                    {/each}
                    {#if project.tech.length > 5}
                      <span class="tech-more">+{project.tech.length - 5}</span>
                    {/if}
                  </div>
                {/if}
              </div>
            </div>
          </div>

          <span class="work-cats">{project.categories.join(" · ")}</span>

          <div class="work-actions">
            {#if project.link}
              <a
                href={formatUrl(project.link)}
                class="mini-link-btn"
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
                class="mini-link-btn"
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
                class="mini-link-btn"
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
        <p class="work-empty">Project terpilih akan segera ditampilkan.</p>
      {/if}
    </div>

    <div class="work-foot" use:reveal>
      <a href="/projects" class="btn btn-ghost">
        Lihat Semua Project <ArrowRight size={18} />
      </a>
    </div>
  </div>
</section>

{#if selectedProject}
  <div class="modal-backdrop" transition:fade={{ duration: 200 }}>
    <button
      class="modal-overlay-btn"
      aria-label="Tutup detail"
      onclick={closeProject}
    ></button>
    <div
      class="modal-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabindex="-1"
      transition:scale={{ duration: 280, start: 0.94, opacity: 0, easing: quintOut }}
    >
      <button class="modal-close" onclick={closeProject} aria-label="Tutup detail">
        <X size={20} />
      </button>

      <div class="modal-tags">
        {#each selectedProject.categories as cat}
          <span class="project-cat">{cat}</span>
        {/each}
      </div>

      <h3 id="modal-title" class="modal-title">{selectedProject.title}</h3>

      <div class="modal-body">
        <p class="modal-desc">{selectedProject.description}</p>

        {#if selectedProject.tech.length > 0}
          <div class="modal-section">
            <h4>Teknologi</h4>
            <div class="project-tech">
              {#each selectedProject.tech as t}
                <span>{t}</span>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      {#if selectedProject.link || selectedProject.github || selectedProject.demo}
        <div class="modal-actions">
          {#if selectedProject.link}
            <a
              href={formatUrl(selectedProject.link)}
              class="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Globe size={18} /> Kunjungi Website
            </a>
          {/if}
          {#if selectedProject.github}
            <a
              href={formatUrl(selectedProject.github)}
              class="btn btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={18} /> Source Code
            </a>
          {/if}
          {#if selectedProject.demo}
            <a
              href={formatUrl(selectedProject.demo)}
              class="btn btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Play size={18} /> Demo
            </a>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}

{#if reviews.length > 0}
  <section id="testimoni" class="testimoni-section">
    <div class="container">
      <div class="section-header" use:reveal>
        <div>
          <span class="section-tag">Testimoni</span>
          <h2>Apa Kata <span class="text-orange">Klien</span></h2>
        </div>
        <div
          class="testi-stats"
          title="Persentase klien yang memberi rating 4–5 bintang"
        >
          <div>
            <strong>{reviewStats.happyPct}<small>%</small></strong>
            <span>klien puas</span>
          </div>
          <div>
            <strong
              >{reviewStats.avg.toFixed(1)}<Star
                size={18}
                fill="#f59e0b"
                color="#f59e0b"
              /></strong
            >
            <span>rating rata-rata</span>
          </div>
          <div>
            <strong>{reviewStats.total}</strong>
            <span>ulasan klien</span>
          </div>
        </div>
      </div>

      <div
        class="float-stage"
        role="region"
        aria-roledescription="carousel"
        aria-label="Testimoni klien"
        onmouseenter={() => (testiPaused = true)}
        onmouseleave={() => (testiPaused = false)}
        onfocusin={() => (testiPaused = true)}
        onfocusout={() => (testiPaused = false)}
      >
        {#each reviews as review, i (i)}
          {@const slot = testiSlot(i)}
          {@const isFocus = slot === 0}
          {@const isLong = review.testimonial.length > LONG_TESTIMONIAL}
          <article
            class="float-testi {slot < 0 ? 'slot-hidden' : `slot-${slot}`}"
            class:is-focus={isFocus}
          >
            <div
              class="float-bob"
              style="--bob-dur: {6 + (i % 4)}s; --bob-delay: -{i * 1.7}s"
            >
              <div class="testi-card" aria-hidden={!isFocus}>
                <div class="testi-top">
                  <div class="testimoni-stars">
                    {#each Array(5) as _, s}
                      <Star
                        size={15}
                        fill={s < Number(review.rating) ? "#f59e0b" : "none"}
                        color={s < Number(review.rating) ? "#f59e0b" : "#cbd5e1"}
                      />
                    {/each}
                  </div>
                  <span class="testimoni-quote"><Quote size={26} /></span>
                </div>

                <p
                  class="testimoni-text"
                  class:clamped={!isFocus || (isLong && !expanded[i])}
                >
                  "{review.testimonial}"
                </p>
                {#if isFocus && isLong}
                  <button
                    type="button"
                    class="read-more"
                    onclick={() => (expanded[i] = !expanded[i])}
                    aria-expanded={!!expanded[i]}
                  >
                    {expanded[i] ? "Tutup" : "Baca selengkapnya"}
                  </button>
                {/if}

                <div class="testi-foot">
                  {#if review.project_title}
                    <span class="testimoni-project">{review.project_title}</span>
                  {/if}
                  <div class="testimoni-author">
                    <div class="testimoni-avatar">
                      {review.reviewer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{review.reviewer_name}</strong>
                      {#if review.reviewer_role}
                        <span>{review.reviewer_role}</span>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>

              {#if !isFocus && slot > 0}
                <!-- Klik kartu latar untuk membawanya ke depan -->
                <button
                  type="button"
                  class="testi-hit"
                  onclick={() => goTesti(i)}
                  aria-label={`Tampilkan testimoni dari ${review.reviewer_name}`}
                ></button>
              {/if}
            </div>
          </article>
        {/each}
      </div>

      {#if reviews.length > 1}
        <div class="testi-controls">
          <button
            type="button"
            class="nav-btn"
            onclick={() => goTesti(activeTesti - 1)}
            aria-label="Testimoni sebelumnya"
          >
            <ChevronLeft size={20} />
          </button>
          <div class="testi-dots">
            {#each reviews as review, i (i)}
              <button
                type="button"
                class="dot"
                class:active={i === activeTesti}
                onclick={() => goTesti(i)}
                aria-label={`Testimoni ${i + 1}: ${review.reviewer_name}`}
                aria-current={i === activeTesti}
              ></button>
            {/each}
          </div>
          <button
            type="button"
            class="nav-btn"
            onclick={() => goTesti(activeTesti + 1)}
            aria-label="Testimoni berikutnya"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      {/if}
    </div>
  </section>
{/if}


<style>
  .text-orange {
    color: var(--primary);
  }

  .text-gradient {
    background: linear-gradient(120deg, var(--primary), #fbbf24 55%, var(--primary));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #fff7ed;
    color: var(--primary);
    border: 1px solid #ffedd5;
    border-radius: 2rem;
    font-size: 0.8125rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }

  :global(.dark) .badge {
    background: rgba(251, 146, 60, 0.12);
    border-color: rgba(251, 146, 60, 0.25);
  }

  /* Titik status berdenyut (hijau = tersedia/available) */
  .badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 6px rgba(34, 197, 94, 0.7);
    position: relative;
    flex-shrink: 0;
  }

  .badge-dot::after {
    content: "";
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: #22c55e;
    opacity: 0.4;
    animation: pulse-ring 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse-ring {
    0% {
      transform: scale(0.6);
      opacity: 0.5;
    }
    70% {
      transform: scale(1.6);
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }

  .hero-section {
    position: relative;
    padding: 7.5rem 0 0;
    overflow: hidden;
    min-height: 88vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: var(--bg-white);
  }

  :global(.dark) .hero-section {
    background: transparent;
  }

  /* ===== Latar: grid halus + aurora ===== */
  .hero-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  .hero-grid-lines {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(to right, rgba(15, 23, 42, 0.06) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(15, 23, 42, 0.06) 1px, transparent 1px);
    background-size: 56px 56px;
    -webkit-mask-image: radial-gradient(ellipse 75% 60% at 50% 35%, black 30%, transparent 100%);
    mask-image: radial-gradient(ellipse 75% 60% at 50% 35%, black 30%, transparent 100%);
  }

  :global(.dark) .hero-grid-lines {
    background-image:
      linear-gradient(to right, rgba(241, 245, 249, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(241, 245, 249, 0.05) 1px, transparent 1px);
  }

  .aurora {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    animation: aurora-drift 18s ease-in-out infinite alternate;
  }

  .aurora-1 {
    width: 520px;
    height: 520px;
    top: -160px;
    right: 8%;
    background: rgba(249, 115, 22, 0.18);
  }

  .aurora-2 {
    width: 440px;
    height: 440px;
    bottom: -120px;
    left: -80px;
    background: rgba(251, 191, 36, 0.14);
    animation-delay: -9s;
  }

  :global(.dark) .aurora-1 {
    background: rgba(251, 146, 60, 0.16);
  }

  :global(.dark) .aurora-2 {
    background: rgba(99, 102, 241, 0.12);
  }

  @keyframes aurora-drift {
    from {
      transform: translate(0, 0) scale(1);
    }
    to {
      transform: translate(40px, 30px) scale(1.12);
    }
  }

  /* ===== Layout ===== */
  .hero-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 3.5rem;
    align-items: center;
    width: 100%;
  }

  .hero-eyebrow {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.625rem;
    margin-bottom: 1.75rem;
  }

  .hero-eyebrow .badge {
    margin-bottom: 0;
  }

  .role-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.9rem;
    border-radius: 2rem;
    border: 1px solid var(--border);
    background: color-mix(in srgb, var(--bg-card) 70%, transparent);
    backdrop-filter: blur(8px);
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    color: var(--text-main);
  }

  .role-chip :global(svg) {
    color: var(--primary);
  }

  .hero-content h1 {
    font-size: clamp(2.5rem, 4.6vw, 3.85rem);
    line-height: 1.04;
    letter-spacing: -0.045em;
    margin-bottom: 1.5rem;
  }

  .hero-content h1 .text-gradient {
    display: block;
    background-size: 200% auto;
    animation: gradient-shift 6s ease-in-out infinite alternate;
  }

  @keyframes gradient-shift {
    to {
      background-position: 100% center;
    }
  }

  .hero-lead {
    font-size: 1.125rem;
    color: var(--text-muted);
    max-width: 540px;
    margin-bottom: 2.25rem;
    line-height: 1.7;
  }

  .hero-lead strong {
    color: var(--text-main);
    font-weight: 700;
  }

  .hero-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 0.875rem;
    position: relative;
    z-index: 10;
  }

  .hero-btns .btn {
    gap: 0.5rem;
    padding: 0.9rem 1.5rem;
  }

  .btn-glow {
    box-shadow:
      0 0 0 1px rgba(249, 115, 22, 0.35),
      0 12px 30px -10px rgba(249, 115, 22, 0.65);
  }

  .btn-glow:hover {
    box-shadow:
      0 0 0 1px rgba(249, 115, 22, 0.5),
      0 16px 36px -10px rgba(249, 115, 22, 0.75);
  }

  .btn-ghost {
    background: color-mix(in srgb, var(--bg-card) 70%, transparent);
    backdrop-filter: blur(8px);
    border: 1px solid var(--border);
    color: var(--text-main);
  }

  .btn-ghost:hover {
    border-color: var(--primary);
    color: var(--primary);
    transform: translateY(-1px);
  }

  /* Tiga pilar nilai di bawah CTA */
  .hero-pillars {
    display: flex;
    flex-wrap: wrap;
    gap: 1.75rem;
    margin-top: 2.25rem;
    padding-top: 1.5rem;
    border-top: 1px dashed #e2e8f0;
  }

  :global(.dark) .hero-pillars {
    border-top-color: var(--border);
  }

  .hero-pillars li {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .pillar-icon {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: rgba(249, 115, 22, 0.1);
    color: var(--primary);
    flex-shrink: 0;
  }

  .hero-pillars div {
    display: flex;
    flex-direction: column;
    line-height: 1.25;
    text-align: left;
  }

  .hero-pillars strong {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--text-main);
  }

  .hero-pillars span:not(.pillar-icon) {
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  /* ===== Visual: foto berbingkai + kartu mengambang ===== */
  .hero-visual {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .photo-frame {
    position: relative;
    width: 100%;
    max-width: 440px;
    padding: 10px;
    border-radius: 2rem;
    background: linear-gradient(
      145deg,
      rgba(249, 115, 22, 0.55),
      rgba(251, 191, 36, 0.25) 40%,
      color-mix(in srgb, var(--border) 80%, transparent) 70%
    );
    box-shadow: 0 40px 80px -30px rgba(15, 23, 42, 0.35);
  }

  .photo-inner {
    position: relative;
    aspect-ratio: 4 / 5;
    border-radius: 1.5rem;
    overflow: hidden;
    background: linear-gradient(180deg, #f8fafc, #eef2f7);
  }

  :global(.dark) .photo-inner {
    background: linear-gradient(180deg, #0f172a, #020617);
  }

  .hero-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 20%;
    display: block;
    mix-blend-mode: multiply;
  }

  :global(.dark) .hero-img {
    mix-blend-mode: normal;
  }

  .float-card {
    position: absolute;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    border: 1px solid color-mix(in srgb, var(--border) 60%, rgba(255, 255, 255, 0.6));
    background: color-mix(in srgb, var(--bg-card) 78%, transparent);
    backdrop-filter: blur(14px) saturate(1.4);
    -webkit-backdrop-filter: blur(14px) saturate(1.4);
    box-shadow: 0 18px 40px -18px rgba(15, 23, 42, 0.35);
    animation: float-y 6s ease-in-out infinite;
  }

  .float-card small {
    display: block;
    font-size: 0.7rem;
    color: var(--text-muted);
  }

  .float-card strong {
    font-size: 0.875rem;
    color: var(--text-main);
  }

  .float-icon {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: var(--primary);
    color: #fff;
  }

  .float-top {
    top: 12%;
    left: -3.5rem;
  }

  .float-bottom {
    bottom: 9%;
    right: -2.5rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    animation-delay: -3s;
  }

  .mono {
    font-family: "JetBrains Mono", ui-monospace, monospace;
  }

  .pipeline {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .pipeline .step {
    font-size: 0.72rem;
    font-weight: 700;
    padding: 0.25rem 0.55rem;
    border-radius: 0.5rem;
    background: rgba(100, 116, 139, 0.12);
    color: var(--text-muted);
  }

  .pipeline .step.done {
    background: rgba(34, 197, 94, 0.12);
    color: #16a34a;
  }

  .pipeline .step.active {
    background: var(--primary);
    color: #fff;
    box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.18);
  }

  .pipeline .line {
    width: 14px;
    height: 2px;
    border-radius: 2px;
    background: var(--border);
  }

  @keyframes float-y {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .aurora,
    .float-card,
    .hero-content h1 .text-gradient {
      animation: none;
    }
  }

  @media (max-width: 1024px) {
    .float-top {
      left: -1rem;
    }
    .float-bottom {
      right: -1rem;
    }
  }

  /* ===== Tech Marquee ===== */
  .tech-marquee {
    position: relative;
    z-index: 1;
    width: 100%;
    margin-top: 4rem;
    padding: 1.25rem 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    overflow: hidden;
    -webkit-mask-image: linear-gradient(
      90deg,
      transparent,
      black 12%,
      black 88%,
      transparent
    );
    mask-image: linear-gradient(
      90deg,
      transparent,
      black 12%,
      black 88%,
      transparent
    );
  }

  .marquee-track {
    display: inline-flex;
    align-items: center;
    gap: 1.5rem;
    white-space: nowrap;
    animation: marquee 32s linear infinite;
  }

  .tech-marquee:hover .marquee-track {
    animation-play-state: paused;
  }

  .marquee-item {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-main);
    opacity: 0.55;
    transition: opacity 0.3s ease;
  }

  .marquee-item:hover {
    opacity: 1;
    color: var(--primary);
  }

  .marquee-sep {
    color: var(--primary);
    opacity: 0.5;
  }

  @keyframes marquee {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .marquee-track {
      animation: none;
    }
  }
  @keyframes blob {
    from {
      border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    }
    to {
      border-radius: 50% 50% 20% 80% / 25% 80% 20% 75%;
    }
  }

  .section-tag {
    color: var(--primary);
    font-weight: 700;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    display: block;
    margin-bottom: 0.75rem;
  }

  /* ===== About: bento grid ===== */
  .about-head {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 3rem;
    align-items: end;
    margin-bottom: 3rem;
  }

  .about-head h2 {
    font-size: clamp(2rem, 3.8vw, 3rem);
    line-height: 1.08;
    letter-spacing: -0.035em;
  }

  .about-head h2 .text-gradient {
    display: block;
  }

  .about-head-side p {
    color: var(--text-muted);
    line-height: 1.7;
    margin-bottom: 1rem;
  }

  .about-more {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--primary);
    font-weight: 700;
    font-size: 0.95rem;
  }

  .about-more:hover {
    gap: 0.65rem;
  }

  .bento {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }

  .bento-card {
    position: relative;
    overflow: hidden;
    padding: 1.75rem;
    border-radius: 1.5rem;
    border: 1px solid var(--border);
    background: var(--bg-card);
    transition:
      transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
      border-color 0.3s ease,
      box-shadow 0.3s ease;
  }

  :global(:root:not(.dark)) .bento-card:not(.bento-focus) {
    border-color: #e9edf3;
  }

  .bento-card:hover {
    transform: translateY(-4px);
    border-color: color-mix(in srgb, var(--primary) 45%, var(--border));
    box-shadow: 0 24px 50px -24px rgba(15, 23, 42, 0.25);
  }

  .bento-label {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 1rem;
  }

  /* Kartu fokus (gelap) */
  .bento-focus {
    grid-column: span 2;
    grid-row: span 2;
    display: flex;
    flex-direction: column;
    padding: 2.25rem;
    background:
      linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px) 0 0 / 32px 32px,
      linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px) 0 0 / 32px 32px,
      linear-gradient(160deg, #111827, #0b1120);
    border-color: rgba(255, 255, 255, 0.08);
    color: #cbd5e1;
  }

  .focus-glow {
    position: absolute;
    top: -30%;
    right: -25%;
    width: 75%;
    height: 90%;
    background: radial-gradient(circle, rgba(249, 115, 22, 0.28), transparent 65%);
    pointer-events: none;
  }

  .bento-focus > :not(.focus-glow) {
    position: relative;
  }

  .bento-focus .bento-label {
    color: #fb923c;
  }

  .bento-focus h3 {
    color: #f8fafc;
    font-size: clamp(1.6rem, 2.6vw, 2.1rem);
    line-height: 1.15;
    margin-bottom: 1rem;
  }

  .bento-focus p {
    color: #94a3b8;
    line-height: 1.75;
    max-width: 460px;
  }

  .bento-focus strong {
    color: #f1f5f9;
    font-weight: 600;
  }

  .module-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1.75rem 0;
  }

  .module-chips span {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.8rem;
    border-radius: 0.65rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .module-chips :global(svg) {
    color: #4ade80;
  }

  .focus-stack {
    margin-top: auto;
    padding-top: 1.25rem;
    border-top: 1px dashed rgba(255, 255, 255, 0.12);
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 0.78rem;
    color: #64748b;
  }

  /* Kartu angka */
  .bento-stat {
    display: flex;
    flex-direction: column;
  }

  .stat-num {
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
    font-size: clamp(2.2rem, 3.4vw, 2.9rem);
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1;
    color: var(--text-main);
    margin-bottom: 0.6rem;
  }

  .stat-num small {
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0;
    color: var(--primary);
  }

  .bento-stat p {
    margin-top: auto;
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  /* Kartu perjalanan */
  .bento-journey {
    grid-column: span 2;
  }

  .journey {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    list-style: none;
  }

  .journey::before {
    content: "";
    position: absolute;
    left: 5px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: linear-gradient(to bottom, var(--primary), var(--border));
  }

  .journey li {
    position: relative;
    display: flex;
    gap: 1rem;
  }

  .journey-dot {
    position: relative;
    flex-shrink: 0;
    width: 12px;
    height: 12px;
    margin-top: 4px;
    border-radius: 50%;
    background: var(--bg-card);
    border: 2px solid var(--text-muted);
  }

  .journey li.current .journey-dot {
    background: var(--primary);
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.18);
  }

  .journey-date {
    display: block;
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 0.72rem;
    color: var(--primary);
    margin-bottom: 0.15rem;
  }

  .journey h4 {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-main);
    line-height: 1.3;
  }

  .journey p,
  .journey-empty {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  /* Kartu kapabilitas */
  .skill-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
  }

  .skill-icon {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba(249, 115, 22, 0.1);
    color: var(--primary);
    transition:
      background 0.3s ease,
      color 0.3s ease;
  }

  .bento-skill:hover .skill-icon {
    background: var(--primary);
    color: #fff;
  }

  .skill-index {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 0.75rem;
    color: var(--text-muted);
    opacity: 0.6;
  }

  .bento-skill h3 {
    font-size: 1.05rem;
    margin-bottom: 0.85rem;
  }

  .skill-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .skill-tags span {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-muted);
    background: var(--bg-soft);
    border: 1px solid var(--border);
    padding: 0.2rem 0.6rem;
    border-radius: 0.5rem;
  }

  :global(.dark) .skill-tags span {
    background: rgba(255, 255, 255, 0.03);
  }

  @media (max-width: 960px) {
    .about-head {
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }

    .bento {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 600px) {
    /* Kartu angka tetap berdampingan, sisanya full width */
    .bento-focus,
    .bento-journey,
    .bento-skill {
      grid-column: span 2;
      grid-row: auto;
    }

    .bento-focus {
      padding: 1.75rem;
    }

    .bento-stat {
      padding: 1.25rem;
    }

    .stat-num {
      font-size: 1.6rem;
    }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 4rem;
  }

  .section-header h2 {
    font-size: clamp(2rem, 3.8vw, 3rem);
    line-height: 1.08;
    letter-spacing: -0.035em;
  }

  .section-header p {
    max-width: 400px;
    color: var(--text-muted);
  }

  .project-cat {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 0.25rem 0.65rem;
    background: #fff7ed;
    border: 1px solid #ffedd5;
    border-radius: 2rem;
    display: inline-block;
  }

  :global(.dark) .project-cat {
    background: rgba(251, 146, 60, 0.12);
    border-color: rgba(251, 146, 60, 0.2);
  }

  .project-tech {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .project-tech span {
    font-size: 0.75rem;
    background: #f8fafc;
    padding: 0.25rem 0.75rem;
    border-radius: 0.5rem;
    color: var(--text-muted);
    border: 1px solid var(--border);
  }

  :global(.dark) .project-tech span {
    background: rgba(255, 255, 255, 0.03);
  }



  /* ===== Project terpilih: daftar editorial ===== */
  .work-list {
    border-top: 1px solid var(--border);
  }

  :global(:root:not(.dark)) .work-list,
  :global(:root:not(.dark)) .work-row {
    border-color: #e2e8f0;
  }

  .work-row {
    position: relative;
    display: grid;
    /* Kolom aksi lebar tetap (maks 3 ikon + panah) supaya kolom kategori sejajar antar baris */
    grid-template-columns: 4.5rem minmax(0, 1fr) 13rem 11.5rem;
    gap: 1.5rem;
    align-items: start;
    padding: 2rem 1.25rem;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    outline: none;
    isolation: isolate;
  }

  /* Sapuan warna dari kiri saat hover */
  .work-row::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(90deg, rgba(249, 115, 22, 0.08), rgba(249, 115, 22, 0.01) 70%);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .work-row:hover::before,
  .work-row:focus-visible::before {
    transform: scaleX(1);
  }

  .work-row:focus-visible {
    box-shadow: inset 0 0 0 2px rgba(249, 115, 22, 0.45);
    border-radius: 0.75rem;
  }

  .work-num {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 0.9rem;
    color: var(--text-muted);
    padding-top: 0.6rem;
    transition: color 0.3s ease;
  }

  .work-main h3 {
    font-size: clamp(1.5rem, 3vw, 2.25rem);
    line-height: 1.15;
    letter-spacing: -0.03em;
    transition:
      color 0.3s ease,
      transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
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
    padding-top: 0.75rem;
    color: var(--text-muted);
    font-size: 0.95rem;
    line-height: 1.65;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .work-tech {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 0.9rem;
    padding-top: 0.75rem;
  }

  .work-tech span {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .work-tech span::before {
    content: "#";
    color: var(--primary);
    margin-right: 0.15rem;
  }

  .work-tech span.tech-more {
    color: var(--primary);
    font-weight: 700;
  }

  .work-tech span.tech-more::before {
    content: none;
  }

  .work-cats {
    padding-top: 0.75rem;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .work-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .work-actions .mini-link-btn {
    width: 36px;
    height: 36px;
    opacity: 0;
    transform: translateX(8px);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease,
      background 0.3s ease,
      color 0.3s ease;
  }

  .work-row:hover .mini-link-btn,
  .work-row:focus-within .mini-link-btn {
    opacity: 1;
    transform: none;
  }

  .work-arrow {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 1px solid var(--border);
    color: var(--text-main);
    transition:
      background 0.3s ease,
      border-color 0.3s ease,
      color 0.3s ease,
      transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  }

  :global(:root:not(.dark)) .work-arrow {
    border-color: #e2e8f0;
  }

  .work-row:hover .work-num,
  .work-row:focus-visible .work-num,
  .work-row:hover .work-main h3,
  .work-row:focus-visible .work-main h3 {
    color: var(--primary);
  }

  .work-row:hover .work-main h3,
  .work-row:focus-visible .work-main h3 {
    transform: translateX(0.5rem);
  }

  .work-row:hover .work-arrow,
  .work-row:focus-visible .work-arrow {
    background: var(--primary);
    border-color: var(--primary);
    color: #fff;
    transform: rotate(45deg);
  }

  .work-empty {
    padding: 2rem 0;
    color: var(--text-muted);
  }

  .work-foot {
    display: flex;
    justify-content: center;
    margin-top: 2.5rem;
  }

  .work-foot .btn {
    gap: 0.5rem;
  }

  /* Perangkat tanpa hover (HP/tablet): detail selalu tampil */
  @media (hover: none) {
    .work-reveal {
      grid-template-rows: 1fr;
      opacity: 1;
    }

    .work-actions .mini-link-btn {
      opacity: 1;
      transform: none;
    }
  }

  @media (max-width: 860px) {
    .work-row {
      grid-template-columns: 2.5rem minmax(0, 1fr) auto;
      gap: 0.25rem 1rem;
      padding: 1.5rem 0.5rem;
    }

    .work-num {
      padding-top: 0.35rem;
    }

    .work-main {
      grid-column: 2;
      grid-row: 2;
    }

    .work-cats {
      grid-column: 2;
      grid-row: 1;
      padding-top: 0.35rem;
      font-size: 0.72rem;
    }

    .work-actions {
      grid-column: 3;
      grid-row: 1 / span 2;
      flex-direction: column-reverse;
      justify-content: flex-end;
    }

    .work-arrow {
      width: 42px;
      height: 42px;
    }

    .work-main h3 {
      font-size: 1.35rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .work-row::before,
    .work-reveal,
    .work-main h3,
    .work-arrow {
      transition: none;
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: 0 1rem;
    }

    .hero-section {
      padding: 6rem 0 3rem;
      text-align: center;
    }

    .hero-grid {
      grid-template-columns: 1fr;
    }

    .hero-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .hero-content h1 {
      font-size: 2.5rem;
    }

    .hero-btns {
      width: 100%;
      flex-direction: column;
    }

    .hero-btns .btn {
      width: 100%;
    }

    .hero-visual {
      display: none; /* Hide complex visual on small mobile to avoid overflow */
    }

    .hero-eyebrow {
      justify-content: center;
    }

    .hero-pillars {
      justify-content: center;
      gap: 1.25rem;
    }

    .section-header {
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 2.5rem;
    }
  }

  @media (max-width: 480px) {
    .badge {
      font-size: 0.75rem;
    }
  }
  .mini-link-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #fff7ed;
    color: var(--primary);
    border: 1px solid #ffedd5;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .mini-link-btn:hover {
    background: var(--primary);
    color: white;
    transform: translateY(-3px) scale(1.1);
    box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.25);
    border-color: var(--primary);
  }

  :global(.dark) .mini-link-btn {
    background: rgba(251, 146, 60, 0.1);
    border-color: rgba(251, 146, 60, 0.2);
  }

  /* ===== Project Detail Modal ===== */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .modal-overlay-btn {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
  }

  .modal-panel {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 620px;
    max-height: 88vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 1.75rem;
    padding: 2.5rem;
    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.4);
  }

  .modal-close {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border);
    background: var(--bg-soft);
    color: var(--text-muted);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.25s ease;
  }

  .modal-close:hover {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
    transform: rotate(90deg);
  }

  .modal-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding-right: 3rem;
  }

  .modal-title {
    font-size: clamp(1.5rem, 3vw, 2rem);
    margin-bottom: 1.5rem;
    padding-right: 2rem;
    line-height: 1.2;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    margin: 0 -0.5rem;
    padding: 0 0.5rem;
  }

  .modal-desc {
    color: var(--text-muted);
    font-size: 1rem;
    line-height: 1.75;
    white-space: pre-line;
    margin-bottom: 2rem;
  }

  .modal-section h4 {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-main);
    margin-bottom: 0.85rem;
  }

  .modal-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 2rem;
    padding-top: 1.75rem;
    border-top: 1px solid var(--border);
  }

  .modal-actions .btn {
    gap: 0.5rem;
    flex: 1;
    min-width: 150px;
  }

  /* Scrollbar halus untuk modal */
  .modal-body::-webkit-scrollbar {
    width: 6px;
  }
  .modal-body::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
  }

  @media (max-width: 480px) {
    .modal-panel {
      padding: 1.75rem 1.25rem;
      border-radius: 1.25rem;
      max-height: 90vh;
    }
    .modal-actions .btn {
      flex: 1 1 100%;
    }
  }

  /* ===== Testimoni ===== */
  .testimoni-section {
    padding: 6rem 0;
    background: var(--bg-soft);
    /* Kartu latar boleh keluar tepi tanpa bikin scroll horizontal */
    overflow-x: clip;
  }

  /* Statistik kepuasan (di header) */
  .testi-stats {
    display: flex;
    align-items: stretch;
  }

  .testi-stats > div {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0 1.5rem;
  }

  .testi-stats > div + div {
    border-left: 1px solid var(--border);
  }

  :global(:root:not(.dark)) .testi-stats > div + div {
    border-left-color: #e2e8f0;
  }

  .testi-stats > div:last-child {
    padding-right: 0;
  }

  .testi-stats strong {
    display: inline-flex;
    align-items: baseline;
    gap: 0.25rem;
    font-size: 2.1rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1;
    color: var(--text-main);
  }

  .testi-stats strong small {
    font-size: 1.1rem;
    color: var(--primary);
  }

  .testi-stats strong :global(svg) {
    align-self: center;
  }

  .testi-stats span {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  /* ===== Panggung kartu mengambang ===== */
  .float-stage {
    position: relative;
    height: 560px;
  }

  .float-testi {
    --x: 50%;
    --y: 50%;
    --w: 300px;
    --s: 1;
    --b: 0px;
    --o: 1;
    position: absolute;
    left: var(--x);
    top: var(--y);
    width: var(--w);
    z-index: var(--z, 1);
    opacity: var(--o);
    filter: blur(var(--b));
    transform: translate(-50%, -50%) scale(var(--s));
    transition:
      left 0.9s cubic-bezier(0.16, 1, 0.3, 1),
      top 0.9s cubic-bezier(0.16, 1, 0.3, 1),
      width 0.9s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.9s cubic-bezier(0.16, 1, 0.3, 1),
      filter 0.6s ease,
      opacity 0.6s ease;
  }

  /* Posisi tiap slot (desktop) */
  .slot-0 { --x: 52%; --y: 50%; --w: 440px; --z: 10; }
  .slot-1 { --x: 19%; --y: 70%; --s: 0.9; --o: 0.85; --z: 6; }
  .slot-2 { --x: 84%; --y: 56%; --s: 0.88; --b: 1.5px; --o: 0.7; --z: 5; }
  .slot-3 { --x: 16%; --y: 20%; --s: 0.8; --b: 5px; --o: 0.5; --z: 2; }
  .slot-4 { --x: 47%; --y: 12%; --s: 0.78; --b: 5px; --o: 0.45; --z: 1; }
  .slot-5 { --x: 86%; --y: 16%; --s: 0.75; --b: 6px; --o: 0.4; --z: 1; }
  .slot-hidden { --s: 0.6; --b: 8px; --o: 0; --z: 0; pointer-events: none; }

  /* Kartu latar jadi tajam saat di-hover */
  .float-testi:not(.is-focus):not(.slot-hidden):hover {
    --b: 0px;
    --o: 0.95;
  }

  /* Gerakan mengambang terus-menerus */
  .float-bob {
    position: relative;
    animation: float-bob var(--bob-dur, 7s) ease-in-out var(--bob-delay, 0s)
      infinite;
  }

  @keyframes float-bob {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-12px);
    }
  }

  .testi-card {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    border-radius: 1.25rem;
    border: 1px solid var(--border);
    background: var(--bg-card);
    box-shadow: 0 20px 40px -24px rgba(15, 23, 42, 0.25);
  }

  :global(:root:not(.dark)) .testi-card {
    border-color: #e9edf3;
  }

  .testi-hit {
    position: absolute;
    inset: 0;
    border: none;
    background: transparent;
    border-radius: 1.25rem;
    cursor: pointer;
  }

  .testi-hit:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 3px;
  }

  .testi-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.9rem;
  }

  .testimoni-stars {
    display: flex;
    gap: 3px;
  }

  .testimoni-quote {
    color: var(--primary);
    opacity: 0.25;
  }

  .testimoni-text {
    color: var(--text-main);
    font-size: 0.95rem;
    line-height: 1.7;
    margin: 0;
  }

  .testimoni-text.clamped {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .is-focus .testimoni-text.clamped {
    -webkit-line-clamp: 5;
    line-clamp: 5;
  }

  /* Saat dibuka, teks di-scroll di dalam kartu agar tinggi tetap terkendali */
  .is-focus .testimoni-text:not(.clamped) {
    max-height: 13.6em;
    overflow-y: auto;
    padding-right: 0.25rem;
    scrollbar-width: thin;
  }

  .read-more {
    align-self: flex-start;
    margin-top: 0.5rem;
    padding: 0;
    border: none;
    background: none;
    color: var(--primary);
    font: inherit;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
  }

  .read-more:hover {
    text-decoration: underline;
  }

  .testi-foot {
    margin-top: auto;
    padding-top: 1.1rem;
  }

  /* Judul project asal testimoni ini. */
  .testimoni-project {
    display: inline-block;
    max-width: 100%;
    background: color-mix(in srgb, var(--primary) 12%, transparent);
    color: var(--primary);
    border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent);
    border-radius: 999px;
    padding: 0.3rem 0.85rem;
    font-size: 0.78rem;
    font-weight: 600;
    margin-bottom: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .testimoni-author {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding-top: 1.1rem;
    border-top: 1px solid var(--border);
  }

  .testimoni-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), #fbbf24);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.05rem;
    flex-shrink: 0;
  }

  .testimoni-author strong {
    display: block;
    color: var(--text-main);
    font-size: 0.95rem;
  }

  .testimoni-author span {
    display: block;
    color: var(--text-muted);
    font-size: 0.82rem;
    margin-top: 0.1rem;
  }

  /* Kartu utama: gelap & menonjol */
  .is-focus .testi-card {
    padding: 2rem;
    background: linear-gradient(160deg, #111827, #0b1120);
    border-color: rgba(249, 115, 22, 0.35);
    box-shadow:
      0 40px 80px -30px rgba(15, 23, 42, 0.6),
      0 0 0 6px rgba(249, 115, 22, 0.06);
  }

  :global(.dark) .is-focus .testi-card {
    background: linear-gradient(160deg, #1e293b, #111827);
    border-color: rgba(251, 146, 60, 0.45);
  }

  .is-focus .testimoni-text {
    color: #e2e8f0;
    font-size: 1.02rem;
  }

  .is-focus .testimoni-quote {
    opacity: 0.6;
  }

  .is-focus .testimoni-author {
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  .is-focus .testimoni-author strong {
    color: #f8fafc;
  }

  .is-focus .testimoni-author span {
    color: #94a3b8;
  }

  /* Kontrol bawah */
  .testi-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
  }

  .testi-dots {
    display: flex;
    gap: 0.4rem;
  }

  .dot {
    width: 8px;
    height: 8px;
    padding: 0;
    border: none;
    border-radius: 99px;
    background: color-mix(in srgb, var(--text-muted) 35%, transparent);
    cursor: pointer;
    transition:
      width 0.3s ease,
      background 0.3s ease;
  }

  .dot.active {
    width: 24px;
    background: var(--primary);
  }

  .nav-btn {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-main);
    cursor: pointer;
    transition:
      background 0.25s ease,
      color 0.25s ease,
      border-color 0.25s ease;
  }

  :global(:root:not(.dark)) .nav-btn {
    border-color: #e2e8f0;
  }

  .nav-btn:hover {
    background: var(--primary);
    border-color: var(--primary);
    color: #fff;
  }

  @media (max-width: 760px) {
    .testimoni-section {
      padding: 4rem 0;
    }

    .testimoni-section .section-header {
      gap: 1.25rem;
    }

    .testi-stats {
      justify-content: center;
    }

    .testi-stats > div {
      align-items: center;
      padding: 0 1rem;
    }

    .testi-stats > div:last-child {
      padding-right: 1rem;
    }

    .testi-stats strong {
      font-size: 1.6rem;
    }

    .float-stage {
      height: 520px;
    }

    .testi-controls {
      margin-top: 1.75rem;
    }

    /* Mobile: kartu utama di tengah, dua kartu latar mengintip atas & bawah */
    .slot-0 { --x: 50%; --w: min(420px, calc(100vw - 2.5rem)); }
    .slot-1 { --x: 26%; --y: 12%; --s: 0.8; --b: 3px; --o: 0.5; }
    .slot-2 { --x: 74%; --y: 86%; --s: 0.8; --b: 3px; --o: 0.5; }
    .slot-3,
    .slot-4,
    .slot-5 { --o: 0; pointer-events: none; }

    .is-focus .testi-card {
      padding: 1.5rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .float-bob {
      animation: none;
    }

    .float-testi {
      transition: none;
    }
  }
</style>
