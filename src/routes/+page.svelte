<script lang="ts">
  import { Mail, Send, ExternalLink, Github, Play, Globe } from "lucide-svelte";
  let { data } = $props();
  const projects = $derived(data.projects);

  const formatUrl = (url: string) => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
  };

  // Structured Data for Google
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Blasius Chelvyn Kera Kleden",
    alternateName: "Chelvyn Kleden",
    url: "https://chelvynkleden.com",
    jobTitle: "Fullstack Developer & Odoo Consultant",
    description:
      "Fullstack Developer spesialis Odoo, Svelte, dan Next.js berbasis di Indonesia.",
    sameAs: [
      "https://github.com/CHELVYN01",
      "https://linkedin.com/in/chelvynkleden",
    ],
  };
</script>

<svelte:head>
  <script type="application/ld+json">
    {@html JSON.stringify(structuredData)}
  </script>
</svelte:head>

<section id="home" class="hero-section">
  <!-- Decorative Patterns -->
  <div class="hero-patterns">
    <div class="pattern-dots"></div>
    <div class="pattern-grid"></div>
    <div class="pattern-waves"></div>
    <div class="abstract-curves">
      <div class="curve curve-1"></div>
      <div class="curve curve-2"></div>
      <div class="curve curve-3"></div>
    </div>
    <div class="shape shape-1"></div>
    <div class="shape shape-2"></div>
    <div class="shape shape-3"></div>
  </div>

  <div class="container hero-grid">
    <div class="hero-content fade-in">
      <div class="badge">{data.siteStatus}</div>
      <h1>
        Membangun <span class="text-orange">Pengalaman Digital</span> yang Berdampak.
      </h1>
      <p>
        Halo, saya Chelvyn. Seorang Full-stack Developer yang mendedikasikan
        diri untuk merancang aplikasi web yang cepat, aman, dan mudah digunakan.
      </p>
      <div class="hero-btns">
        <a href="/projects" class="btn btn-primary">Lihat Pekerjaan</a>
        <!-- <a href="#about" class="btn btn-outline">Tentang Saya</a> -->
      </div>
    </div>
    <div class="hero-visual fade-in delay-1">
      <div class="illustration-container">
        <img
          src="/hero-dev-2.png"
          alt="Blasius Chelvyn Kera Kleden - Fullstack Developer Portfolio Illustration"
          class="hero-img"
        />
      </div>
    </div>
  </div>
</section>

<section id="about" class="about-section">
  <div class="container grid-2">
    <div class="fade-in delay-1">
      <span class="section-tag">Tentang Saya</span>
      <h2>
        Membangun Karir di <span class="text-orange">Dunia Teknologi.</span>
      </h2>

      <div class="experience-list">
        {#each data.experiences as exp}
          <div class="exp-item">
            <div class="exp-date">{exp.period}</div>
            <div class="exp-info">
              <h3>{exp.role}</h3>
              <p class="company">{exp.company}</p>
            </div>
          </div>
        {/each}

        {#if data.experiences.length === 0}
          <p class="text-muted">Riwayat pengalaman akan segera ditambahkan.</p>
        {/if}
      </div>
    </div>

    <div class="about-text fade-in delay-2">
      <p>
        Saya adalah pengembang perangkat lunak yang berpengalaman dalam
        membangun ekosistem digital yang kompleks. Dengan latar belakang yang
        kuat di berbagai platform, saya berfokus pada solusi yang efisien dan
        skalabel.
      </p>
      <p>
        Keahlian saya mencakup implementasi ERP menggunakan <strong>Odoo</strong
        >, pengembangan web modern dengan <strong>Svelte</strong> dan
        <strong>Next.js</strong>, hingga solusi aplikasi desktop berbasis
        <strong>Tauri</strong>
        dan mobile dengan <strong>React Native</strong>.
      </p>
      <p>
        Di sisi infrastruktur dan CI/CD, saya mengandalkan <strong>Rust</strong
        >, <strong>Python</strong>, <strong>Git</strong>, serta
        <strong>Docker</strong> untuk membangun backend yang performan, handal, dan
        mudah dideploy secara otomatis.
      </p>

      <div class="stack-tags">
        <span class="tag">Odoo ERP</span>
        <span class="tag">Svelte</span>
        <span class="tag">Next.js</span>
        <span class="tag">Tauri (Desktop)</span>
        <span class="tag">React Native</span>
        <span class="tag">Rust</span>
        <span class="tag">Python</span>
        <span class="tag">Git</span>
        <span class="tag">Docker</span>
      </div>
    </div>
  </div>
</section>

<section id="projects" class="project-section">
  <div class="container">
    <div class="section-header">
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
      {#each projects as project}
        <div class="card project-card fade-in">
          <div class="project-info">
            <div class="project-tags">
              {#each project.categories as cat}
                <span class="project-cat">{cat}</span>
              {/each}
            </div>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div class="project-tech">
              {#each project.tech as t}
                <span>{t}</span>
              {/each}
            </div>
            <div class="project-actions-links">
              <div class="project-mini-links">
                {#if project.link}
                  <a
                    href={formatUrl(project.link)}
                    class="mini-link-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Kunjungi Website"
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
                  >
                    <Play size={18} />
                  </a>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<section id="contact" class="contact-section">
  <div class="container">
    <div class="contact-card-main fade-in">
      <span class="section-tag">Kontak</span>
      <h2 class="contact-title">
        <span>Mari Mulai</span>
        <span class="text-orange">Sesuatu yang Besar.</span>
      </h2>
      <p>
        Punya ide project atau ingin diskusi tentang Odoo & Fullstack
        development? Saya selalu terbuka untuk kolaborasi baru.
      </p>

      <div class="contact-options">
        <a href="mailto:kledenchelvyn@gmail.com" class="contact-box">
          <div class="contact-icon">
            <Mail size={24} />
          </div>
          <div class="contact-info">
            <h3>Email</h3>
            <p>kledenchelvyn@gmail.com</p>
          </div>
        </a>

        <a href="https://t.me/kledenvin" target="_blank" class="contact-box">
          <div class="contact-icon">
            <Send size={24} />
          </div>
          <div class="contact-info">
            <h3>Telegram</h3>
            <p>@kledenvin</p>
          </div>
        </a>
      </div>
    </div>
  </div>
</section>

<style>
  .text-orange {
    color: var(--primary);
  }

  .badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: #fff7ed;
    color: var(--primary);
    border: 1px solid #ffedd5;
    border-radius: 2rem;
    font-size: 0.8125rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }

  .hero-section {
    position: relative;
    padding: 8rem 0 6rem;
    overflow: hidden;
    min-height: 80vh;
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  }

  /* Decorative Patterns */
  .hero-patterns {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  .pattern-dots {
    position: absolute;
    top: 5%;
    left: -2%;
    width: 300px;
    height: 300px;
    background-image: radial-gradient(#f97316 1.5px, transparent 1.5px);
    background-size: 24px 24px;
    opacity: 0.15;
    mask-image: linear-gradient(to bottom right, black, transparent);
  }

  .pattern-grid {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 400px;
    background-image: linear-gradient(#f1f5f9 1px, transparent 1px),
      linear-gradient(90deg, #f1f5f9 1px, transparent 1px);
    background-size: 60px 60px;
    opacity: 0.5;
    mask-image: radial-gradient(circle at top left, black, transparent 70%);
  }

  .pattern-waves {
    position: absolute;
    top: 15%;
    left: -2%;
    width: 500px;
    height: 400px;
    background-image: radial-gradient(
        circle at 100% 150%,
        #e2e8f0 24%,
        white 25%
      ),
      radial-gradient(circle at 0% 150%, #e2e8f0 24%, white 25%),
      radial-gradient(
        circle at 50% 100%,
        white 10%,
        #e2e8f0 11%,
        #e2e8f0 23%,
        white 24%
      );
    background-size: 80px 40px;
    opacity: 0.2; /* Dipertegas biar kelihatan pak */
    mask-image: linear-gradient(to bottom right, black 40%, transparent);
    z-index: 0;
  }

  /* Tambahan abstract curves dari referensi gambar kedua bapak */
  .abstract-curves {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .curve {
    position: absolute;
    border: 8px solid transparent;
    border-radius: 50%;
    opacity: 0.15;
  }

  .curve-1 {
    width: 200px;
    height: 200px;
    border-top-color: #f97316; /* Orange */
    top: 10%;
    left: 15%;
    transform: rotate(-15deg);
  }

  .curve-2 {
    width: 150px;
    height: 150px;
    border-right-color: #10b981; /* Green */
    top: 35%;
    left: 5%;
    transform: rotate(20deg);
  }

  .curve-3 {
    width: 250px;
    height: 250px;
    border-bottom-color: #3b82f6; /* Blue */
    top: -50px;
    left: 20%;
    transform: rotate(-45deg);
  }

  .shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    z-index: 0;
  }

  .shape-1 {
    width: 400px;
    height: 400px;
    background: rgba(249, 115, 22, 0.08); /* Primary color */
    left: -100px;
    top: -100px;
  }

  .shape-2 {
    width: 300px;
    height: 300px;
    background: rgba(16, 185, 129, 0.05); /* Greenish accent */
    left: 10%;
    bottom: -50px;
  }

  .shape-3 {
    width: 350px;
    height: 350px;
    background: rgba(59, 130, 246, 0.04); /* Bluish accent */
    top: 20%;
    left: 30%;
  }

  .hero-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 2rem;
    align-items: center;
    width: 100%;
  }

  .hero-content h1 {
    font-size: clamp(2.5rem, 5vw, 4.25rem);
    line-height: 1.1;
    margin-bottom: 1.5rem;
  }

  .hero-content p {
    font-size: 1.125rem;
    color: var(--text-muted);
    max-width: 520px;
    margin-bottom: 2.5rem;
    line-height: 1.6;
  }

  .hero-btns {
    display: flex;
    gap: 1rem;
    position: relative;
    z-index: 10;
  }

  .hero-visual {
    position: relative;
    z-index: -1;
    opacity: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    pointer-events: none;
  }

  .illustration-container {
    width: 100%;
    max-width: 650px;
    margin-right: -10%;
  }

  .hero-img {
    width: 100%;
    height: auto;
    display: block;
    mix-blend-mode: multiply;
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

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
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

  .about-text p {
    margin-bottom: 1.5rem;
    color: var(--text-muted);
  }

  .experience-list {
    margin-top: 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .exp-item {
    display: flex;
    gap: 1.5rem;
  }

  .exp-date {
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--primary);
    text-transform: uppercase;
    min-width: 140px;
    padding-top: 0.25rem;
  }

  .exp-info h3 {
    font-size: 1.125rem;
    margin-bottom: 0.25rem;
  }

  .exp-info .company {
    color: var(--text-muted);
    font-size: 0.9375rem;
  }

  .stack-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 2rem;
  }

  .tag {
    background: #fff7ed;
    color: var(--primary);
    padding: 0.4rem 1rem;
    border-radius: 2rem;
    font-size: 0.8125rem;
    font-weight: 600;
    border: 1px solid #ffedd5;
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
    padding: 2.5rem;
  }

  .project-cat {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--primary);
    text-transform: uppercase;
    margin-bottom: 1rem;
    display: block;
  }

  .project-card h3 {
    margin-bottom: 1rem;
  }

  .project-card p {
    color: var(--text-muted);
    font-size: 0.9375rem;
    margin-bottom: 1.5rem;
    height: 4.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
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

  .contact-card-main {
    background: #0f172a;
    padding: 5rem 3rem;
    border-radius: 2.5rem;
    text-align: center;
    color: white;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }

  .contact-title {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    margin: 1rem 0 1.5rem;
  }

  .contact-title span {
    display: block;
    line-height: 1.1;
  }

  .contact-card-main h2 {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 800;
  }

  .contact-card-main p {
    color: #94a3b8;
    max-width: 550px;
    margin: 0 auto 3.5rem;
    font-size: 1.05rem;
    line-height: 1.6;
  }

  .contact-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 900px;
    margin: 0 auto;
    align-items: stretch;
  }

  .contact-box {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 1.5rem 2rem;
    border-radius: 1.5rem;
    display: flex;
    align-items: center; /* This centers the icon and text block vertically */
    gap: 1.5rem;
    text-decoration: none;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    text-align: left;
  }

  .contact-box:hover {
    background: rgba(255, 255, 255, 0.07);
    transform: translateY(-8px);
    border-color: var(--primary);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  }

  .contact-icon {
    font-size: 1.75rem;
    background: rgba(255, 255, 255, 0.05);
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 1.15rem;
    flex-shrink: 0;
    transition: all 0.3s ease;
    line-height: 1;
  }

  .contact-box:hover .contact-icon {
    background: var(--primary);
    color: white;
    transform: rotate(-10deg);
  }

  .contact-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.15rem;
  }

  .contact-info h3 {
    font-size: 1.25rem;
    color: white;
    margin: 0;
    font-weight: 700;
    line-height: 1.2;
  }

  .contact-info p {
    font-size: 0.9375rem;
    color: #94a3b8;
    margin: 0;
    font-weight: 500;
    line-height: 1.2;
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

    .grid-2 {
      grid-template-columns: 1fr;
      gap: 2rem;
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

    .contact-card-main {
      padding: 3rem 1rem;
      border-radius: 1.5rem;
      margin: 0 0.5rem; /* Give some breathing room */
    }

    .contact-title {
      font-size: 1.75rem;
    }

    .contact-options {
      grid-template-columns: 1fr;
      width: 100%;
    }

    .contact-box {
      padding: 1rem;
      gap: 1rem;
    }

    .contact-icon {
      width: 50px;
      height: 50px;
    }

    .contact-info p {
      font-size: 0.8125rem;
      word-break: break-all; /* Prevent long email from pushing out box */
    }
  }

  @media (max-width: 480px) {
    .badge {
      font-size: 0.75rem;
    }
    .tag {
      padding: 0.3rem 0.75rem;
      font-size: 0.75rem;
    }
    .exp-item {
      flex-direction: column;
      gap: 0.5rem;
    }
    .exp-date {
      min-width: unset;
    }
  }
  .project-actions-links {
    margin-top: auto;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 1.5rem;
  }

  .project-mini-links {
    display: flex;
    gap: 0.75rem;
    align-items: center;
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

  @media (max-width: 480px) {
    .project-actions-links {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.25rem;
    }
  }
</style>
