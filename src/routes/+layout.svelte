<script lang="ts">
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { Sun, Moon } from "lucide-svelte";
  import { theme } from "$lib/theme.svelte";
  import { STORE_ENABLED } from "$lib/features";
  import "../app.css";

  let { children, data } = $props();

  let isMobileMenuOpen = $state(false);
  let scrolled = $state(false);

  // Halaman tanpa header/footer: admin & halaman review klien (standalone).
  const isAdmin = $derived(
    page.url.pathname.startsWith("/admin") ||
      page.url.pathname.startsWith("/review"),
  );
  const canonicalUrl = $derived(
    `https://chelvynkleden.com${page.url.pathname}`,
  );

  // Halaman dengan hero foto full-bleed: header jadi kaca transparan di atas
  // foto, lalu berubah jadi kaca biasa setelah halaman di-scroll.
  const overHero = $derived(
    page.url.pathname === "/" || page.url.pathname === "/about",
  );

  onMount(() => {
    theme.init();

    const onScroll = () => (scrolled = window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap"
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
  <meta name="theme-color" content="#f97316" />
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
  <header
    class="header"
    class:hero-top={overHero && !scrolled && !isMobileMenuOpen}
  >
    <div class="container nav-container">
      <a href="/" class="logo" style="text-decoration: none;"
        >CK<span>.</span></a
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
        <ul>
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
            <a
              href="/contact"
              class="btn btn-primary btn-sm"
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

<main class:under-header={overHero && !isAdmin}>
  {@render children()}
</main>

{#if !isAdmin}
  <footer class="footer">
    <div class="footer-glass">
    <div class="container">
      <div class="footer-content">
        <div class="footer-logo">CK<span>.</span></div>
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
    </div>

  </footer>
{/if}

<style>
  /* Header kaca: tembus pandang + blur & saturasi tinggi ala iOS */
  .header {
    position: sticky;
    top: 0;
    background: rgba(255, 255, 255, 0.62);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    z-index: 1000;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.4);
    transition:
      background-color 0.3s,
      border-color 0.3s,
      box-shadow 0.3s;
  }

  :global(.dark) .header {
    background: rgba(2, 6, 23, 0.55);
    border-bottom-color: rgba(255, 255, 255, 0.1);
    box-shadow: none;
  }

  /* Hero full-bleed naik ke bawah header supaya foto tembus di balik kaca. */
  main.under-header {
    margin-top: calc(-4.5rem - 1px);
  }

  /* Di atas hero (belum di-scroll): kaca bening dengan teks terang. */
  .header.hero-top {
    background: rgba(255, 255, 255, 0.07);
    border-bottom-color: rgba(255, 255, 255, 0.18);
    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.06);
  }

  .header.hero-top .logo {
    color: #fff;
  }

  .header.hero-top .mobile-toggle span {
    background-color: #fff;
  }

  .header.hero-top .theme-toggle {
    color: #fff;
    border-color: rgba(255, 255, 255, 0.3);
  }

  @media (min-width: 769px) {
    .header.hero-top .nav-links a:not(.btn) {
      color: rgba(255, 255, 255, 0.85);
    }

    .header.hero-top .nav-links a:not(.btn):hover {
      color: var(--primary);
    }
  }

  .nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 4.5rem;
  }

  .logo {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-main);
    z-index: 1100;
  }

  .logo span {
    color: var(--primary);
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

  .nav-links a {
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--text-muted);
    text-decoration: none;
    transition: color 0.2s;
  }

  .nav-links a:hover {
    color: var(--primary);
  }

  .nav-links a.btn {
    color: white;
  }

  .btn-sm {
    padding: 0.5rem 1.25rem;
    font-size: 0.875rem;
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
      right: -100%;
      width: 80%;
      max-width: 300px;
      height: 100vh;
      background: var(--bg-card);
      flex-direction: column;
      justify-content: center;
      padding: 2rem;
      box-shadow: -10px 0 30px rgba(0, 0, 0, 0.05);
      transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .nav-links.show {
      right: 0;
    }

    .nav-links ul {
      flex-direction: column;
      gap: 2rem;
      width: 100%;
    }

    .nav-links a {
      font-size: 1.25rem;
      width: 100%;
      display: block;
      text-align: center;
    }
  }

  /* Foto jadi latar footer (hanya bagian bawahnya yang terlihat); tinggi
     footer mengikuti konten, yang duduk di panel kaca ber-blur. */
  .footer {
    background: #0b0b0d url("/profile-bg-bawah.jpg") center bottom / cover
      no-repeat;
    border-top: 1px solid var(--border);
  }

  .footer-glass {
    padding: 3.5rem 0;
    background: rgba(2, 6, 23, 0.4);
    backdrop-filter: blur(12px) saturate(140%);
    -webkit-backdrop-filter: blur(12px) saturate(140%);
  }

  .footer-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .footer-logo {
    font-size: 1.25rem;
    font-weight: 800;
    color: #fff;
  }

  .footer-logo span {
    color: var(--primary);
  }

  .footer-links {
    display: flex;
    gap: 2rem;
  }

  .footer-links a {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
  }

  .footer-links a:hover {
    color: var(--primary);
  }

  .copyright {
    color: rgba(255, 255, 255, 0.65);
    font-size: 0.8125rem;
    text-align: center;
  }

  .theme-toggle {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: all 0.2s;
  }

  .theme-toggle:hover {
    color: var(--primary);
    border-color: var(--primary);
    background: var(--bg-soft);
  }
</style>
