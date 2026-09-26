<script lang="ts">
  import {
    ArrowRight,
    Download,
    MapPin,
    Briefcase,
    GraduationCap,
    Layers,
    Server,
    Smartphone,
    Database,
    Terminal,
    Bot,
    Check,
    Sparkles,
  } from "lucide-svelte";
  import { reveal } from "$lib/reveal";

  // Seluruh konten halaman ini diambil dari resume (static/resume/my resume.pdf).
  // Kalau resume diperbarui, perbarui juga data di bawah.
  const resumeUrl = "/resume/my%20resume.pdf";

  const quickFacts = [
    { icon: MapPin, label: "Lokasi", value: "Indonesia · Remote" },
    { icon: Briefcase, label: "Fokus", value: "Odoo ERP & Produk Web" },
    { icon: GraduationCap, label: "Pendidikan", value: "Universitas Sanata Dharma" },
  ];

  const stats = [
    { value: "1+", label: "Tahun hands-on Odoo" },
    { value: "17·18·19", label: "Versi Odoo yang ditangani" },
    { value: "5", label: "Modul inti dikustomisasi" },
    { value: "2024", label: "Mulai freelance" },
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
      icon: Layers,
      title: "Odoo Development",
      desc: "Kustomisasi & implementasi ERP",
      items: ["Odoo 17/18/19", "Odoo ORM", "XML Views", "QWeb", "OWL"],
    },
    {
      icon: Server,
      title: "Backend",
      desc: "API & business logic",
      items: ["Python", "PHP", "Laravel", "Rust"],
    },
    {
      icon: Smartphone,
      title: "Frontend & Mobile",
      desc: "Web modern & aplikasi mobile",
      items: ["Next.js", "SvelteKit", "React Native", "Flutter"],
    },
    {
      icon: Database,
      title: "Data & Machine Learning",
      desc: "Database & model ML",
      items: ["PostgreSQL", "MySQL", "PyTorch", "Python"],
    },
    {
      icon: Terminal,
      title: "DevOps",
      desc: "Deploy & operasional production",
      items: ["Docker", "Git", "Vercel", "Troubleshooting"],
    },
    {
      icon: Bot,
      title: "AI & Problem Solving",
      desc: "Workflow modern & analitis",
      items: ["Agent AI (Claude Code)", "Analytics", "Problem Solving"],
    },
  ];
</script>

<svelte:head>
  <title>Tentang — Chelvyn Kleden | Product Software Engineer & Odoo Developer</title>
</svelte:head>

<!-- ===== Intro ===== -->
<section class="about-hero">
  <div class="hero-bg" aria-hidden="true">
    <div class="grid-lines"></div>
    <div class="aurora aurora-1"></div>
    <div class="aurora aurora-2"></div>
  </div>

  <div class="container intro-grid">
    <div class="intro-text fade-in">
      <span class="section-tag">Tentang Saya</span>
      <h1>
        Engineer yang Berpikir
        <span class="text-gradient">Seperti Pemilik Produk.</span>
      </h1>
      <p class="lead">
        Saya <strong>Blasius Chelvyn Kera Kleden</strong> — Software Developer
        & Odoo Consultant yang berspesialisasi dalam implementasi dan optimasi
        <strong>ERP enterprise</strong>.
      </p>
      <p>
        Lebih dari satu tahun hands-on dengan <strong>Odoo 17, 18, 19</strong>,
        Python backend, PostgreSQL, Docker, dan DevOps. Terbiasa juga membangun
        aplikasi mobile (<strong>React Native, Flutter</strong>) dan
        mengimplementasikan <strong>machine learning</strong>. Terbukti
        menangani deployment yang kompleks, troubleshooting sistem production,
        dan menghadirkan solusi yang scalable.
      </p>

      <div class="intro-btns">
        <a
          href={resumeUrl}
          class="btn btn-primary btn-glow"
          download="CV-Chelvyn-Kleden.pdf"
        >
          <Download size={18} /> Unduh CV
        </a>
        <a href="/contact" class="btn btn-ghost">
          Hubungi Saya <ArrowRight size={18} />
        </a>
      </div>
    </div>

    <aside class="profile-card fade-in delay-1">
      <div class="profile-photo">
        <img
          src="/hero-dev-2.png"
          alt="Blasius Chelvyn Kera Kleden"
          class="hero-img"
        />
        <span class="role-chip"><Sparkles size={13} /> Software Developer</span>
      </div>
      <ul class="facts">
        {#each quickFacts as fact}
          {@const Icon = fact.icon}
          <li>
            <span class="fact-icon"><Icon size={16} /></span>
            <div>
              <small>{fact.label}</small>
              <strong>{fact.value}</strong>
            </div>
          </li>
        {/each}
      </ul>
    </aside>
  </div>

  <div class="container">
    <div class="stats" use:reveal>
      {#each stats as stat}
        <div class="stat">
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ===== Pengalaman ===== -->
<section class="exp-section">
  <div class="container">
    <div class="section-head" use:reveal>
      <span class="section-tag">Perjalanan</span>
      <h2>Pengalaman <span class="text-orange">Kerja</span></h2>
    </div>

    <div class="exp-list">
      {#each experiences as exp, i}
        <article class="exp-item" use:reveal={{ delay: i * 90 }}>
          <div class="exp-meta">
            <span class="exp-period">{exp.period}</span>
            <h3>{exp.role}</h3>
          </div>
          <div class="exp-body">
            <ul class="exp-points">
              {#each exp.points as point}
                <li><Check size={16} /> <span>{point}</span></li>
              {/each}
            </ul>
            <div class="tags">
              {#each exp.tech as t}
                <span>{t}</span>
              {/each}
            </div>
          </div>
        </article>
      {/each}
    </div>
  </div>
</section>

<!-- ===== Keahlian ===== -->
<section class="skills-section">
  <div class="container">
    <div class="section-head" use:reveal>
      <span class="section-tag">Keahlian</span>
      <h2>Core <span class="text-orange">Skills</span></h2>
    </div>

    <div class="skill-grid">
      {#each skillGroups as group, i}
        {@const Icon = group.icon}
        <div class="skill-card" use:reveal={{ delay: (i % 3) * 80 }}>
          <div class="skill-icon"><Icon size={20} /></div>
          <h3>{group.title}</h3>
          <p>{group.desc}</p>
          <div class="tags">
            {#each group.items as item}
              <span>{item}</span>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ===== Pendidikan + CTA ===== -->
<section class="closing-section">
  <div class="container closing-grid">
    <div class="edu-card" use:reveal>
      <span class="section-tag">Pendidikan</span>
      <div class="edu-row">
        <span class="edu-icon"><GraduationCap size={22} /></span>
        <div>
          <h3>Universitas Sanata Dharma</h3>
          <span class="exp-period">2020 — 2024</span>
        </div>
      </div>
    </div>

    <div class="cta-card" use:reveal={{ delay: 100 }}>
      <div class="cta-glow" aria-hidden="true"></div>
      <h2>Punya ide produk atau butuh implementasi Odoo?</h2>
      <p>Ceritakan kebutuhan Anda — saya bantu dari perencanaan sampai rilis.</p>
      <div class="intro-btns">
        <a href="/contact" class="btn btn-primary btn-glow">
          Diskusikan Project <ArrowRight size={18} />
        </a>
        <a href="/projects" class="btn btn-dark-ghost">Lihat Project</a>
      </div>
    </div>
  </div>
</section>

<style>
  .text-orange {
    color: var(--primary);
  }

  .text-gradient {
    display: block;
    background: linear-gradient(120deg, var(--primary), #fbbf24 55%, var(--primary));
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .section-tag {
    display: inline-block;
    color: var(--primary);
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-size: 0.8rem;
    margin-bottom: 1rem;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .tags span {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.3rem 0.65rem;
    border-radius: 0.5rem;
    background: var(--bg-soft);
    border: 1px solid var(--border);
    color: var(--text-muted);
  }

  :global(.dark) .tags span {
    background: rgba(255, 255, 255, 0.03);
  }

  /* ===== Intro ===== */
  .about-hero {
    position: relative;
    overflow: hidden;
    padding: 8rem 0 3rem;
    background: var(--bg-white);
  }

  :global(.dark) .about-hero {
    background: transparent;
  }

  .hero-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .grid-lines {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(to right, rgba(15, 23, 42, 0.06) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(15, 23, 42, 0.06) 1px, transparent 1px);
    background-size: 56px 56px;
    -webkit-mask-image: radial-gradient(ellipse 75% 55% at 50% 30%, black 30%, transparent 100%);
    mask-image: radial-gradient(ellipse 75% 55% at 50% 30%, black 30%, transparent 100%);
  }

  :global(.dark) .grid-lines {
    background-image:
      linear-gradient(to right, rgba(241, 245, 249, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(241, 245, 249, 0.05) 1px, transparent 1px);
  }

  .aurora {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
  }

  .aurora-1 {
    width: 480px;
    height: 480px;
    top: -160px;
    right: 5%;
    background: rgba(249, 115, 22, 0.16);
  }

  .aurora-2 {
    width: 400px;
    height: 400px;
    top: 40%;
    left: -120px;
    background: rgba(251, 191, 36, 0.12);
  }

  :global(.dark) .aurora-2 {
    background: rgba(99, 102, 241, 0.12);
  }

  .intro-grid {
    position: relative;
    display: grid;
    grid-template-columns: 1.3fr 0.7fr;
    gap: 4rem;
    align-items: center;
  }

  .intro-text h1 {
    font-size: clamp(2.3rem, 4.4vw, 3.6rem);
    line-height: 1.06;
    letter-spacing: -0.04em;
    margin-bottom: 1.5rem;
  }

  .intro-text p {
    color: var(--text-muted);
    font-size: 1.05rem;
    line-height: 1.75;
    max-width: 600px;
    margin-bottom: 1rem;
  }

  .intro-text .lead {
    font-size: 1.15rem;
  }

  .intro-text strong {
    color: var(--text-main);
    font-weight: 600;
  }

  .intro-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 0.875rem;
    margin-top: 2rem;
  }

  .intro-btns .btn {
    gap: 0.5rem;
    padding: 0.9rem 1.5rem;
  }

  .btn-glow {
    box-shadow:
      0 0 0 1px rgba(249, 115, 22, 0.35),
      0 12px 30px -10px rgba(249, 115, 22, 0.65);
  }

  .btn-ghost {
    background: color-mix(in srgb, var(--bg-card) 70%, transparent);
    border: 1px solid var(--border);
    color: var(--text-main);
  }

  :global(:root:not(.dark)) .btn-ghost {
    border-color: #e2e8f0;
  }

  .btn-ghost:hover {
    border-color: var(--primary);
    color: var(--primary);
    transform: translateY(-1px);
  }

  /* Kartu profil */
  .profile-card {
    padding: 10px;
    border-radius: 2rem;
    background: linear-gradient(
      145deg,
      rgba(249, 115, 22, 0.5),
      rgba(251, 191, 36, 0.2) 40%,
      color-mix(in srgb, var(--border) 80%, transparent) 70%
    );
    box-shadow: 0 40px 80px -30px rgba(15, 23, 42, 0.35);
  }

  .profile-photo {
    position: relative;
    aspect-ratio: 1 / 1;
    border-radius: 1.5rem 1.5rem 0 0;
    overflow: hidden;
    background: linear-gradient(180deg, #f8fafc, #eef2f7);
  }

  :global(.dark) .profile-photo {
    background: linear-gradient(180deg, #0f172a, #020617);
  }

  .profile-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 50% 18%;
    display: block;
    mix-blend-mode: multiply;
  }

  :global(.dark) .profile-photo img {
    mix-blend-mode: normal;
  }

  .role-chip {
    position: absolute;
    left: 0.875rem;
    bottom: 0.875rem;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.85rem;
    border-radius: 2rem;
    background: color-mix(in srgb, var(--bg-card) 80%, transparent);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid var(--border);
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 0.72rem;
    font-weight: 500;
    color: var(--text-main);
  }

  .role-chip :global(svg) {
    color: var(--primary);
  }

  .facts {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    padding: 1.25rem;
    background: var(--bg-card);
    border-radius: 0 0 1.5rem 1.5rem;
  }

  .facts li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .fact-icon,
  .skill-icon,
  .edu-icon {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(249, 115, 22, 0.1);
    color: var(--primary);
  }

  .facts div {
    display: flex;
    flex-direction: column;
    line-height: 1.3;
  }

  .facts small {
    font-size: 0.72rem;
    color: var(--text-muted);
  }

  .facts strong {
    font-size: 0.9rem;
    color: var(--text-main);
  }

  /* Statistik */
  .stats {
    position: relative;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    margin-top: 4.5rem;
    border: 1px solid var(--border);
    border-radius: 1.25rem;
    background: color-mix(in srgb, var(--bg-card) 75%, transparent);
    backdrop-filter: blur(8px);
    overflow: hidden;
  }

  :global(:root:not(.dark)) .stats {
    border-color: #e2e8f0;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1.5rem 1.75rem;
  }

  .stat + .stat {
    border-left: 1px solid var(--border);
  }

  :global(:root:not(.dark)) .stat + .stat {
    border-left-color: #e2e8f0;
  }

  .stat strong {
    font-size: 1.9rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--text-main);
    line-height: 1.1;
  }

  .stat span {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  /* ===== Section umum ===== */
  .section-head {
    margin-bottom: 2.5rem;
  }

  .section-head h2 {
    font-size: clamp(1.9rem, 3.4vw, 2.6rem);
  }

  /* ===== Pengalaman ===== */
  .exp-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .exp-item {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 2rem;
    padding: 2rem;
    border: 1px solid var(--border);
    border-radius: 1.25rem;
    background: var(--bg-card);
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease;
  }

  .exp-item:hover {
    border-color: color-mix(in srgb, var(--primary) 45%, var(--border));
    box-shadow: var(--shadow-lg);
  }

  .exp-period {
    display: inline-block;
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--primary);
    margin-bottom: 0.4rem;
  }

  .exp-meta h3 {
    font-size: 1.25rem;
  }

  .exp-points {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .exp-points li {
    display: flex;
    gap: 0.6rem;
    color: var(--text-muted);
    line-height: 1.6;
  }

  .exp-points :global(svg) {
    flex-shrink: 0;
    margin-top: 0.3rem;
    color: #22c55e;
  }

  /* ===== Keahlian ===== */
  .skills-section {
    background: var(--bg-soft);
  }

  :global(.dark) .skills-section {
    background: transparent;
  }

  .skill-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }

  .skill-card {
    padding: 1.75rem;
    border: 1px solid var(--border);
    border-radius: 1.25rem;
    background: var(--bg-card);
    transition:
      transform 0.3s ease,
      border-color 0.3s ease,
      box-shadow 0.3s ease;
  }

  .skill-card:hover {
    transform: translateY(-4px);
    border-color: color-mix(in srgb, var(--primary) 45%, var(--border));
    box-shadow: var(--shadow-lg);
  }

  .skill-card h3 {
    font-size: 1.05rem;
    margin: 1rem 0 0.25rem;
  }

  .skill-card p {
    font-size: 0.875rem;
    color: var(--text-muted);
    margin-bottom: 1rem;
  }

  /* ===== Pendidikan + CTA ===== */
  .closing-grid {
    display: grid;
    grid-template-columns: 0.8fr 1.2fr;
    gap: 1.25rem;
    align-items: stretch;
  }

  .edu-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2rem;
    border: 1px solid var(--border);
    border-radius: 1.25rem;
    background: var(--bg-card);
  }

  .edu-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .edu-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
  }

  .edu-row h3 {
    font-size: 1.15rem;
    margin-bottom: 0.15rem;
  }

  .cta-card {
    position: relative;
    overflow: hidden;
    padding: 2.5rem;
    border-radius: 1.25rem;
    background: linear-gradient(160deg, #111827, #0b1120);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #e2e8f0;
  }

  .cta-glow {
    position: absolute;
    top: -60%;
    right: -20%;
    width: 70%;
    height: 160%;
    background: radial-gradient(circle, rgba(249, 115, 22, 0.25), transparent 65%);
    pointer-events: none;
  }

  .cta-card > :not(.cta-glow) {
    position: relative;
  }

  .cta-card h2 {
    color: #f8fafc;
    font-size: clamp(1.4rem, 2.4vw, 1.9rem);
    max-width: 480px;
    margin-bottom: 0.75rem;
  }

  .cta-card p {
    color: #94a3b8;
  }

  .cta-card .intro-btns {
    margin-top: 1.5rem;
  }

  .btn-dark-ghost {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #f1f5f9;
  }

  .btn-dark-ghost:hover {
    border-color: var(--primary);
    color: var(--primary);
  }

  /* ===== Responsif ===== */
  @media (max-width: 960px) {
    .intro-grid {
      grid-template-columns: 1fr;
      gap: 3rem;
    }

    .profile-card {
      max-width: 380px;
    }

    .stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .stat:nth-child(3) {
      border-left: none;
    }

    .stat:nth-child(n + 3) {
      border-top: 1px solid var(--border);
    }

    :global(:root:not(.dark)) .stat:nth-child(n + 3) {
      border-top-color: #e2e8f0;
    }

    .skill-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .exp-item {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .closing-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 600px) {
    .about-hero {
      padding-top: 6rem;
    }

    .intro-btns .btn {
      width: 100%;
    }

    .stat {
      padding: 1.25rem;
    }

    .stat strong {
      font-size: 1.5rem;
    }

    .skill-grid {
      grid-template-columns: 1fr;
    }

    .exp-item,
    .cta-card {
      padding: 1.5rem;
    }
  }
</style>
