<script lang="ts">
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { afterNavigate } from "$app/navigation";
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

  const navItems = [
    ...(STORE_ENABLED ? [{ href: "/store", label: "Store" }] : []),
    { href: "/about", label: "About" },
    { href: "/projects", label: "Projects" },
    { href: "/certificates", label: "Certificates" },
  ];
  const pad = (n: number) => String(n).padStart(2, "0");
  const isCurrent = (href: string) => page.url.pathname.startsWith(href);

  onMount(() => {
    theme.init();

    // iOS Safari baru menerapkan :active saat disentuh kalau ada touch listener
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });

    // Layar dilebarkan ke desktop saat menu terbuka -> tutup menunya
    const mq = window.matchMedia("(min-width: 769px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) isMobileMenuOpen = false;
    };
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
      document.removeEventListener("touchstart", noop);
    };
  });

  // Menu layar penuh: kunci scroll halaman di belakangnya
  $effect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
  });

  afterNavigate(() => (isMobileMenuOpen = false));

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
  <meta name="theme-color" content={theme.isDark ? "#000000" : "#ffffff"} />
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

<svelte:window
  onkeydown={(e) => e.key === "Escape" && (isMobileMenuOpen = false)}
/>

{#if !isAdmin}
  <header class="header" class:menu-open={isMobileMenuOpen}>
    <div class="container nav-container">
      <a href="/" class="logo"
        ><span class="logo-mark" aria-hidden="true"></span>Chelvyn Kleden</a
      >

      <!-- Mobile: tombol teks "Menu" / "Tutup" yang bergeser -->
      <button
        class="mobile-toggle"
        onclick={toggleMenu}
        aria-expanded={isMobileMenuOpen}
        aria-controls="site-nav"
        aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
      >
        <span class="toggle-text" aria-hidden="true">
          <span class:out={isMobileMenuOpen}>Menu</span>
          <span class:out={!isMobileMenuOpen}>Tutup</span>
        </span>
        <span class="toggle-mark" aria-hidden="true"></span>
      </button>

      <nav
        id="site-nav"
        class="nav-links"
        class:show={isMobileMenuOpen}
        aria-label="Navigasi utama"
      >
        <!-- Desktop: grup ini dikunci di tengah header -->
        <ul class="nav-center">
          {#each navItems as item, i}
            <li style="--i: {i}">
              <a
                href={item.href}
                aria-current={isCurrent(item.href) ? "page" : undefined}
                onclick={() => (isMobileMenuOpen = false)}
                ><span class="nav-num" aria-hidden="true">{pad(i + 1)}</span
                >{item.label}</a
              >
            </li>
          {/each}
        </ul>
        <ul class="nav-right">
          <li style="--i: {navItems.length}">
            <a
              href="/contact"
              class="nav-cta"
              onclick={() => (isMobileMenuOpen = false)}>Kontak</a
            >
          </li>
          <li style="--i: {navItems.length + 1}">
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
              <span class="toggle-label"
                >{theme.isDark ? "Mode Terang" : "Mode Gelap"}</span
              >
            </button>
          </li>
        </ul>

        <!-- Mobile: info kecil di dasar menu -->
        <div class="mono nav-meta">
          <div class="nav-social">
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
          <span>© 2026 — Chelvyn Kleden</span>
        </div>
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

  /* Penanda halaman aktif (desktop) */
  .nav-links .nav-center a[aria-current="page"] {
    color: var(--text-main);
  }

  /* Elemen khusus menu mobile: disembunyikan di desktop */
  .nav-num,
  .nav-meta,
  .toggle-label {
    display: none;
  }

  /* Tombol mobile: teks "Menu"/"Tutup" bergeser + kotak kecil berputar */
  .mobile-toggle {
    display: none;
    align-items: center;
    gap: 0.6rem;
    height: 2.5rem;
    padding: 0 0 0 0.75rem;
    background: none;
    border: none;
    color: var(--text-main);
    cursor: pointer;
    z-index: 1100;
    -webkit-tap-highlight-color: transparent;
  }

  .toggle-text {
    display: grid;
    overflow: hidden;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    line-height: 1.2;
  }

  .toggle-text span {
    grid-area: 1 / 1;
    transition: transform 0.5s cubic-bezier(0.65, 0, 0.35, 1);
  }

  .toggle-text span:first-child.out {
    transform: translateY(-120%);
  }

  .toggle-text span:last-child.out {
    transform: translateY(120%);
  }

  .toggle-mark {
    width: 9px;
    height: 9px;
    background: var(--text-main);
    transition: transform 0.5s cubic-bezier(0.65, 0, 0.35, 1);
  }

  .menu-open .toggle-mark {
    transform: rotate(45deg) scale(0.85);
  }

  /* Tablet/Mobile: menu layar penuh bergaya editorial */
  @media (max-width: 768px) {
    .mobile-toggle {
      display: inline-flex;
    }

    /* Saat menu terbuka header jadi solid, menyatu dengan panel menu */
    .header.menu-open,
    :global(.dark) .header.menu-open {
      background: var(--bg-white);
    }

    .nav-links {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1050;
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      flex-direction: column;
      align-items: stretch;
      justify-content: flex-start;
      padding: calc(4.5rem + 1.75rem) 1.25rem 1.5rem;
      overflow-y: auto;
      background-color: var(--bg-white);
      background-image:
        linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
        linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
      background-size: 64px 64px;
      /* Tertutup: disembunyikan total (bukan digeser keluar layar) supaya
         tidak melebarkan halaman. Buka = tirai turun dari atas. */
      visibility: hidden;
      pointer-events: none;
      clip-path: inset(0 0 100% 0);
      transition:
        clip-path 0.7s cubic-bezier(0.76, 0, 0.24, 1),
        visibility 0s linear 0.7s;
    }

    .nav-links.show {
      visibility: visible;
      pointer-events: auto;
      clip-path: inset(0 0 0 0);
      transition-delay: 0s;
    }

    .nav-links ul {
      flex-direction: column;
      align-items: stretch;
      gap: 0;
      width: 100%;
    }

    /* Item menu naik berurutan setelah tirai terbuka (--i = urutan) */
    .nav-links li {
      opacity: 0;
      transform: translateY(28px);
      transition:
        opacity 0.4s ease,
        transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .nav-links.show li {
      opacity: 1;
      transform: none;
      transition-delay: calc(0.3s + var(--i) * 0.07s);
    }

    .nav-center li {
      border-bottom: 1px solid var(--border);
    }

    .nav-center li:first-child {
      border-top: 1px solid var(--text-main);
    }

    .nav-links .nav-center a {
      display: flex;
      align-items: baseline;
      gap: 1rem;
      padding: 1.1rem 0;
      font-family: var(--font-serif);
      font-size: clamp(2.25rem, 11vw, 3.25rem);
      line-height: 1;
      letter-spacing: -0.03em;
      color: var(--text-main);
      -webkit-tap-highlight-color: transparent;
    }

    .nav-links .nav-center a:active {
      padding-left: 0.5rem;
    }

    .nav-links .nav-center a[aria-current="page"] {
      font-style: italic;
    }

    .nav-num {
      display: inline;
      min-width: 1.75rem;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }

    .nav-links .nav-right {
      flex-direction: row;
      gap: 0.75rem;
      margin-top: 2rem;
    }

    .nav-right li {
      flex: 1;
    }

    .nav-links a.nav-cta {
      display: block;
      padding: 1rem;
      text-align: center;
      background: var(--primary);
      color: var(--on-primary);
    }

    .theme-toggle {
      width: 100%;
      height: 100%;
      gap: 0.6rem;
      padding: 1rem;
      border-color: var(--text-main);
    }

    .toggle-label {
      display: inline;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .nav-meta {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: auto;
      padding-top: 2.5rem;
      color: var(--text-muted);
    }

    .nav-social {
      display: flex;
      gap: 1.5rem;
    }

    .nav-links .nav-social a {
      font-size: 0.72rem;
      color: var(--text-main);
    }
  }

  @media (max-width: 768px) and (prefers-reduced-motion: reduce) {
    .nav-links,
    .nav-links li {
      transition: none;
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
