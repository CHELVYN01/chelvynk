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
    Sparkles,
    Rocket,
  } from "lucide-svelte";
  import { fade, scale } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import type { Action } from "svelte/action";
  import { enhance } from "$app/forms";
  let { data, form } = $props();
  const projects = $derived(data.projects);
  const reviews = $derived(data.reviews ?? []);

  // Status kirim form kontak (untuk disable tombol & ubah labelnya).
  let sending = $state(false);

  // Scroll-reveal (progressive enhancement: tanpa JS elemen tetap tampil)
  const reveal: Action<HTMLElement, { delay?: number } | undefined> = (
    node,
    params,
  ) => {
    node.classList.add("reveal");
    if (params?.delay) node.style.transitionDelay = `${params.delay}ms`;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add("reveal-in");
            io.unobserve(node);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(node);
    return { destroy: () => io.disconnect() };
  };

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
  <div class="container about-grid">
    <div class="about-main" use:reveal>
      <span class="section-tag">Tentang Saya</span>
      <h2>
        <span class="text-orange">Odoo Technical Consultant</span> & Fullstack
        Developer.
      </h2>

      <div class="about-text">
        <p>
          Fokus utama saya adalah <strong>Odoo Technical Consultant</strong> —
          merancang, mengkustomisasi, dan mengintegrasikan modul
          <strong>ERP Odoo</strong> agar benar-benar pas dengan proses bisnis
          klien. Mulai dari <strong>custom module</strong>, workflow &
          automation, hingga integrasi <strong>Odoo API</strong> dengan sistem
          eksternal.
        </p>
        <p>
          Di luar Odoo, saya membangun aplikasi web dengan
          <strong>Laravel</strong> dan <strong>CodeIgniter 4</strong>, frontend
          modern <strong>Svelte</strong> & <strong>Next.js</strong>, aplikasi
          desktop <strong>Tauri</strong>, hingga mobile
          <strong>React Native</strong> — ditopang <strong>Rust</strong> &
          <strong>Python</strong>. Sisi <strong>DevOps &amp; infrastruktur</strong>
          saya urus sendiri: <strong>Docker</strong>, <strong>CI/CD</strong>, dan
          deployment di <strong>VPS</strong> agar rilis cepat dan handal.
        </p>
      </div>

      <div class="skill-cards">
        {#each skillGroups as group, i}
          {@const Icon = group.icon}
          <div class="skill-card" use:reveal={{ delay: i * 90 }}>
            <div class="skill-icon"><Icon size={20} /></div>
            <h3>{group.title}</h3>
            <div class="skill-tags">
              {#each group.items as item}
                <span>{item}</span>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <aside class="about-side" use:reveal={{ delay: 120 }}>
      <span class="section-tag">Perjalanan</span>
      <h3 class="side-title">Pengalaman</h3>
      <div class="timeline">
        {#each data.experiences as exp}
          <div class="timeline-item">
            <span class="timeline-dot"></span>
            <div class="timeline-content">
              <span class="timeline-date">{exp.period}</span>
              <h4>{exp.role}</h4>
              <p class="company">{exp.company}</p>
            </div>
          </div>
        {/each}

        {#if data.experiences.length === 0}
          <p class="text-muted">Riwayat pengalaman akan segera ditambahkan.</p>
        {/if}
      </div>
    </aside>
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
        Kumpulan project yang mencerminkan dedikasi saya dalam pengembangan
        perangkat lunak.
      </p>
    </div>

    <div class="project-grid">
      {#each projects as project, i (project.id)}
        <div
          class="card project-card"
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
          <span class="project-index" aria-hidden="true"
            >{String(i + 1).padStart(2, "0")}</span
          >
          <div class="project-info">
            <div class="project-tags">
              {#each project.categories as cat}
                <span class="project-cat">{cat}</span>
              {/each}
            </div>
            <h3>{project.title}</h3>
            <p class="project-desc">{project.description}</p>
            <div class="project-tech">
              {#each project.tech.slice(0, 4) as t}
                <span>{t}</span>
              {/each}
              {#if project.tech.length > 4}
                <span class="tech-more">+{project.tech.length - 4}</span>
              {/if}
            </div>
            <div class="project-footer">
              <div class="project-mini-links">
                {#if project.link}
                  <a
                    href={formatUrl(project.link)}
                    class="mini-link-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Kunjungi Website"
                    onclick={(e) => e.stopPropagation()}
                  >
                    <Globe size={18} />
                  </a>
                {/if}

                {#if project.github}
                  <a
                    href={formatUrl(project.github)}
                    class="mini-link-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Lihat Source Code"
                    onclick={(e) => e.stopPropagation()}
                  >
                    <Github size={18} />
                  </a>
                {/if}

                {#if project.demo}
                  <a
                    href={formatUrl(project.demo)}
                    class="mini-link-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Lihat Demo"
                    onclick={(e) => e.stopPropagation()}
                  >
                    <Play size={18} />
                  </a>
                {/if}
              </div>
              <span class="detail-cta">
                Detail <ArrowUpRight size={16} />
              </span>
            </div>
          </div>
        </div>
      {/each}
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
        <p>
          Umpan balik langsung dari klien yang telah mempercayakan proyeknya
          kepada saya.
        </p>
      </div>

      <div class="testimoni-grid">
        {#each reviews as review, i (i)}
          <div class="card testimoni-card" use:reveal={{ delay: i * 70 }}>
            <div class="testimoni-quote"><Quote size={28} /></div>
            <div class="testimoni-stars">
              {#each Array(5) as _, s}
                <Star
                  size={16}
                  fill={s < Number(review.rating) ? "#f59e0b" : "none"}
                  color={s < Number(review.rating) ? "#f59e0b" : "#cbd5e1"}
                />
              {/each}
            </div>
            <p class="testimoni-text">"{review.testimonial}"</p>
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
        {/each}
      </div>
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

  /* Scroll reveal */
  :global(.reveal) {
    opacity: 0;
    transform: translateY(26px);
    transition:
      opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }

  :global(.reveal-in) {
    opacity: 1;
    transform: none;
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.reveal) {
      opacity: 1;
      transform: none;
      transition: none;
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
  .project-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  @keyframes blob {
    from {
      border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    }
    to {
      border-radius: 50% 50% 20% 80% / 25% 80% 20% 75%;
    }
  }

  .about-grid {
    display: grid;
    grid-template-columns: 1.35fr 1fr;
    gap: 4rem;
    align-items: start;
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

  .about-main h2 {
    margin-bottom: 1.5rem;
  }

  .about-text p {
    margin-bottom: 1.25rem;
    color: var(--text-muted);
    line-height: 1.7;
  }

  .about-text strong {
    color: var(--text-main);
    font-weight: 600;
  }

  /* Kartu kapabilitas */
  .skill-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    margin-top: 2.5rem;
  }

  .skill-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 1rem;
    padding: 1.5rem;
    transition:
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      border-color 0.3s ease,
      box-shadow 0.3s ease;
  }

  .skill-card:hover {
    transform: translateY(-4px);
    border-color: var(--primary);
    box-shadow: var(--shadow-md);
  }

  .skill-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.75rem;
    background: #fff7ed;
    color: var(--primary);
    border: 1px solid #ffedd5;
    margin-bottom: 1rem;
  }

  :global(.dark) .skill-icon {
    background: rgba(251, 146, 60, 0.12);
    border-color: rgba(251, 146, 60, 0.2);
  }

  .skill-card h3 {
    font-size: 1rem;
    margin-bottom: 0.85rem;
  }

  .skill-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .skill-tags span {
    font-size: 0.75rem;
    color: var(--text-muted);
    background: var(--bg-soft);
    border: 1px solid var(--border);
    padding: 0.2rem 0.6rem;
    border-radius: 0.5rem;
  }

  /* Sidebar pengalaman + timeline */
  .about-side {
    position: sticky;
    top: 6rem;
    background: var(--bg-soft);
    border: 1px solid var(--border);
    border-radius: 1.5rem;
    padding: 2rem;
  }

  :global(.dark) .about-side {
    background: rgba(255, 255, 255, 0.02);
  }

  .side-title {
    font-size: 1.5rem;
    margin-bottom: 1.75rem;
  }

  .timeline {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    padding-left: 1.5rem;
  }

  /* Garis vertikal timeline */
  .timeline::before {
    content: "";
    position: absolute;
    top: 4px;
    bottom: 4px;
    left: 4px;
    width: 2px;
    background: linear-gradient(
      to bottom,
      var(--primary),
      var(--border) 90%
    );
  }

  .timeline-item {
    position: relative;
  }

  .timeline-dot {
    position: absolute;
    left: calc(-1.5rem + 4px);
    top: 6px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--primary);
    border: 2px solid var(--bg-soft);
    transform: translateX(-50%);
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
  }

  .timeline-date {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 0.03em;
    display: block;
    margin-bottom: 0.35rem;
  }

  .timeline-content h4 {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 0.2rem;
    line-height: 1.3;
  }

  .timeline-content .company {
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 4rem;
  }

  .section-header p {
    max-width: 400px;
    color: var(--text-muted);
  }

  .project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .project-card {
    position: relative;
    padding: 2rem;
    display: flex;
    cursor: pointer;
    overflow: hidden;
    outline: none;
  }

  /* Garis aksen gradient di atas kartu, muncul saat hover */
  .project-card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary), var(--accent));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .project-card:hover::before,
  .project-card:focus-visible::before {
    transform: scaleX(1);
  }

  .project-card:focus-visible {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.25);
  }

  .project-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    z-index: 1;
  }

  /* Nomor index dekoratif di pojok kanan atas */
  .project-index {
    position: absolute;
    top: 1.25rem;
    right: 1.5rem;
    font-size: 2.75rem;
    font-weight: 800;
    line-height: 1;
    color: var(--text-main);
    opacity: 0.06;
    letter-spacing: -0.03em;
    transition: opacity 0.3s ease, color 0.3s ease;
    pointer-events: none;
  }

  .project-card:hover .project-index,
  .project-card:focus-visible .project-index {
    opacity: 0.14;
    color: var(--primary);
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

  .project-card h3 {
    margin-bottom: 0.75rem;
    padding-right: 2.5rem;
    font-size: 1.35rem;
    transition: color 0.25s ease;
  }

  .project-card:hover h3,
  .project-card:focus-visible h3 {
    color: var(--primary);
  }

  .project-desc {
    color: var(--text-muted);
    font-size: 0.9375rem;
    line-height: 1.65;
    margin-bottom: 1.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
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

  .project-tech span.tech-more {
    background: transparent;
    border-color: transparent;
    color: var(--primary);
    font-weight: 700;
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

    .about-grid {
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }

    .about-side {
      position: static;
    }

    .section-header {
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .project-grid {
      grid-template-columns: 1fr;
    }

    .project-card {
      padding: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    .badge {
      font-size: 0.75rem;
    }
    .about-side {
      padding: 1.5rem;
    }
    .skill-cards {
      grid-template-columns: 1fr;
    }
  }
  .project-footer {
    margin-top: auto;
    padding-top: 1.25rem;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .project-mini-links {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .detail-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-muted);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
  }

  .detail-cta :global(svg) {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .project-card:hover .detail-cta,
  .project-card:focus-visible .detail-cta {
    color: var(--primary);
  }

  .project-card:hover .detail-cta :global(svg),
  .project-card:focus-visible .detail-cta :global(svg) {
    transform: translate(2px, -2px);
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
  }
  .testimoni-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
    margin-top: 3rem;
  }
  .testimoni-card {
    position: relative;
    padding: 2rem;
    display: flex;
    flex-direction: column;
  }
  .testimoni-quote {
    color: var(--primary);
    opacity: 0.25;
    margin-bottom: 0.75rem;
  }
  .testimoni-stars {
    display: flex;
    gap: 3px;
    margin-bottom: 1rem;
  }
  .testimoni-text {
    color: var(--text-main);
    font-size: 1rem;
    line-height: 1.7;
    font-style: italic;
    margin: 0 0 1.5rem;
    flex: 1;
  }
  /* Judul project asal testimoni ini. */
  .testimoni-project {
    align-self: flex-start;
    max-width: 100%;
    background: color-mix(in srgb, var(--primary) 12%, transparent);
    color: var(--primary);
    border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent);
    border-radius: 999px;
    padding: 0.3rem 0.85rem;
    font-size: 0.78rem;
    font-weight: 600;
    margin-bottom: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .testimoni-author {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--border);
  }
  .testimoni-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.1rem;
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
  @media (max-width: 640px) {
    .testimoni-section {
      padding: 4rem 0;
    }
    .testimoni-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
