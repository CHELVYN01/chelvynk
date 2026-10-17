<script lang="ts">
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { Sun, Moon } from "lucide-svelte";
  import { theme } from "$lib/theme.svelte";
  import { STORE_ENABLED } from "$lib/features";
  import "../app.css";
  import "$lib/styles/editorial.css";

  let { children, data } = $props();

  let isMobileMenuOpen = $state(false);

  // Halaman tanpa header/footer: admin & halaman review klien (standalone).
  const isAdmin = $derived(
    page.url.pathname.startsWith("/admin") ||
      page.url.pathname.startsWith("/review"),
  );
  const canonicalUrl = $derived(
    `https://chelvynkleden.com${page.url.pathname}`,
  );

  onMount(() => {
    theme.init();
  });

  function toggleMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }
</script>

<svelte:head>
  <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap"
    rel="stylesheet"
  />
  <!-- prettier-ignore -->
  <title>Blasius Chelvyn Kera Kleden — Odoo Technical Consultant & Freelance Developer</title>
  <meta
    name="description"
    content="Blasius Chelvyn Kera Kleden (Chelvyn Kleden) — Odoo Technical Consultant & Odoo Developer freelance di Indonesia. Spesialis kustomisasi modul Odoo ERP, integrasi Odoo API, Laravel, CodeIgniter 4, Svelte, dan Next.js."
  />
  <meta
    name="keywords"
    content="Blasius Chelvyn Kera Kleden, Chelvyn Kleden, Kleden Chelvyn, Teknikal Odoo, Odoo Technical Consultant, Odoo Developer, Odoo Development, Odoo Freelance, Freelance Odoo Developer, Konsultan Odoo, Odoo Indonesia, Laravel Developer, CodeIgniter 4, Fullstack Developer Indonesia"
  />
  <meta name="author" content="Blasius Chelvyn Kera Kleden" />
  <meta
    name="robots"
    content={isAdmin ? "noindex, nofollow" : "index, follow"}
  />
  <meta name="theme-color" content="#0a0a0a" />
  <link rel="canonical" href={canonicalUrl} />

  <!-- Open Graph / Social Media -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonicalUrl} />
  <meta
    property="og:title"
    content="Blasius Chelvyn Kera Kleden — Odoo Technical Consultant & Freelance Developer"
  />
  <meta
    property="og:description"
    content="Odoo Technical Consultant & Odoo Developer freelance di Indonesia. Spesialis kustomisasi modul Odoo ERP, integrasi Odoo API, Laravel, CodeIgniter 4, Svelte, dan Next.js."
  />
  <meta property="og:site_name" content="Chelvyn Kleden" />
  <meta property="og:locale" content="id_ID" />
  <meta
    property="og:image"
    content="https://chelvynkleden.com/profile-bg-atas.jpg"
  />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="twitter:title"
    content="Blasius Chelvyn Kera Kleden — Odoo Technical Consultant"
  />
  <meta
    name="twitter:description"
    content="Odoo Technical Consultant & Odoo Developer freelance di Indonesia. Spesialis Odoo ERP, Laravel, CodeIgniter 4, Svelte & Next.js."
  />
  <meta
    name="twitter:image"
    content="https://chelvynkleden.com/profile-bg-atas.jpg"
  />
</svelte:head>

{#if !isAdmin}
  <header class="header">
    <div class="container nav-container">
      <a href="/" class="logo"
        ><span class="logo-mark" aria-hidden="true"></span>Chelvyn Kleden</a
      >

      <button
        class="mobile-toggle"
        onclick={toggleMenu}
        aria-label="Toggle Menu"
      >
        <span class={isMobileMenuOpen ? "open" : ""}></span>
        <span class={isMobileMenuOpen ? "open" : ""}></span>
        <span class={isMobileMenuOpen ? "open" : ""}></span>
      </button>

      <nav class="nav-links {isMobileMenuOpen ? 'show' : ''}">
        <!-- Desktop: grup ini dikunci di tengah header -->
        <ul class="nav-center">
          {#if STORE_ENABLED}
            <li>
              <a href="/store" onclick={() => (isMobileMenuOpen = false)}
                >Store</a
              >
            </li>
          {/if}
          <li>
            <a href="/about" onclick={() => (isMobileMenuOpen = false)}
              >About</a
            >
          </li>
          <li>
            <a href="/projects" onclick={() => (isMobileMenuOpen = false)}
              >Projects</a
            >
          </li>
          <li>
            <a href="/certificates" onclick={() => (isMobileMenuOpen = false)}
              >Certificates</a
            >
          </li>
        </ul>
        <ul class="nav-right">
          <li>
            <a
              href="/contact"
              class="nav-cta"
              onclick={() => (isMobileMenuOpen = false)}>Kontak</a
            >
          </li>
          <li>
            <button
              class="theme-toggle"
              onclick={() => theme.toggle()}
              aria-label="Toggle Dark Mode"
            >
              {#if theme.isDark}
                <Sun size={20} />
              {:else}
                <Moon size={20} />
              {/if}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </header>
{/if}

<main>
  {@render children()}
</main>

{#if !isAdmin}
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-logo">
          <span class="logo-mark" aria-hidden="true"></span>Chelvyn Kleden
        </div>
        <div class="footer-links">
          <a
            href={data.settings?.github || "https://github.com"}
            target="_blank"
            rel="noopener noreferrer">GitHub</a
          >
          <a
            href={data.settings?.linkedin || "https://linkedin.com"}
            target="_blank"
            rel="noopener noreferrer">LinkedIn</a
          >
          <a
            href={data.settings?.twitter || "https://twitter.com"}
            target="_blank"
            rel="noopener noreferrer">Twitter</a
          >
        </div>
        <p class="copyright">
          &copy; 2026 Chelvyn Kleden. Membangun solusi digital yang bermakna.
        </p>
      </div>
    </div>

  </footer>
{/if}

<style>
  /* Header kaca: tembus pandang + blur & saturasi tinggi ala iOS */
  .header {
    position: sticky;
    top: 0;
    background: rgba(255, 255, 255, 0.86);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    z-index: 1000;
    border-bottom: 1px solid var(--text-main);
    transition:
      background-color 0.3s,
      border-color 0.3s,
      box-shadow 0.3s;
  }

  :global(.dark) .header {
    background: rgba(0, 0, 0, 0.82);
    border-bottom-color: rgba(255, 255, 255, 0.25);
  }

  .nav-container {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 4.5rem;
  }

  /* Logo: kotak solid + nama monospace */
  .logo,
  .footer-logo {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    font-family: var(--font-mono);
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-main);
  }

  .logo {
    z-index: 1100;
  }

  .logo-mark {
    width: 14px;
    height: 14px;
    background: var(--text-main);
    flex-shrink: 0;
  }

  .nav-links {
    display: flex;
    align-items: center;
  }

  .nav-links ul {
    display: flex;
    align-items: center;
    gap: 2.5rem;
    list-style: none;
  }

  .nav-links .nav-right {
    gap: 1rem;
  }

  /* Desktop: menu utama tepat di tengah header (logo kiri, Kontak kanan) */
  @media (min-width: 769px) {
    .nav-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .nav-links a {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.2s;
  }

  .nav-links a:hover {
    color: var(--text-main);
  }

  /* Tombol Kontak: outline kotak */
  .nav-links a.nav-cta {
    display: inline-block;
    padding: 0.6rem 1.1rem;
    border: 1px solid var(--text-main);
    font-family: var(--font-serif);
    letter-spacing: 0.16em;
    color: var(--text-main);
    transition:
      background 0.2s,
      color 0.2s;
  }

  .nav-links a.nav-cta:hover {
    background: var(--primary);
    color: var(--on-primary);
  }

  /* Mobile Toggle Button */
  .mobile-toggle {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 24px;
    height: 18px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: 1100;
  }

  .mobile-toggle span {
    width: 100%;
    height: 2px;
    background-color: var(--text-main);
    transition: all 0.3s;
    border-radius: 2px;
  }

  .mobile-toggle span.open:nth-child(1) {
    transform: translateY(8px) rotate(45deg);
  }
  .mobile-toggle span.open:nth-child(2) {
    opacity: 0;
  }
  .mobile-toggle span.open:nth-child(3) {
    transform: translateY(-8px) rotate(-45deg);
  }

  /* Tablet/Mobile styles */
  @media (max-width: 768px) {
    .mobile-toggle {
      display: flex;
    }

    .nav-links {
      position: fixed;
      top: 0;
      right: 0;
      width: 80%;
      max-width: 300px;
      height: 100vh;
      background: var(--bg-card);
      flex-direction: column;
      justify-content: center;
      padding: 2rem;
      box-shadow: -10px 0 30px rgba(0, 0, 0, 0.05);
      /* Tertutup: disembunyikan total (bukan digeser keluar layar lewat
         right negatif) supaya tidak melebarkan halaman & bisa di-swipe. */
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
      transform: translateX(24px);
      transition:
        opacity 0.3s ease,
        transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
        visibility 0s linear 0.4s;
    }

    .nav-links.show {
      visibility: visible;
      opacity: 1;
      pointer-events: auto;
      transform: translateX(0);
      transition-delay: 0s;
    }

    .nav-links ul {
      flex-direction: column;
      gap: 2rem;
      width: 100%;
    }

    .nav-links .nav-right {
      margin-top: 2rem;
      gap: 2rem;
    }

    .nav-links a {
      font-size: 1.25rem;
      width: 100%;
      display: block;
      text-align: center;
    }
  }

  /* Footer polos: tanpa gambar, garis tipis + teks monospace */
  .footer {
    background: var(--bg-white);
    border-top: 1px solid var(--text-main);
    padding: 2.5rem 0;
  }

  .footer-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
  }

  .footer-links {
    display: flex;
    gap: 2rem;
  }

  .footer-links a,
  .copyright {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .footer-links a:hover {
    color: var(--text-main);
  }

  .copyright {
    width: 100%;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
    text-transform: none;
    letter-spacing: 0.02em;
  }

  .theme-toggle {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-main);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    border-radius: 0;
    transition: all 0.2s;
  }

  .theme-toggle:hover {
    color: var(--on-primary);
    border-color: var(--primary);
    background: var(--primary);
  }
</style>
