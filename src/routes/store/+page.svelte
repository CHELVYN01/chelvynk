<script lang="ts">
  import {
    Download,
    Star,
    StarHalf,
    Info,
    Monitor,
    Smartphone,
    CheckCircle,
  } from "lucide-svelte";

  let { data } = $props();
  const apps = $derived(data.apps || []);

  const formatUrl = (url: string) => {
    if (!url) return "#";
    if (
      url.startsWith("/") ||
      url.startsWith("http://") ||
      url.startsWith("https://")
    )
      return url;
    return `https://${url}`;
  };
</script>

<svelte:head>
  <title>Store | Chelvyn Kleden — Aplikasi oleh Chelvyn Kleden</title>
</svelte:head>

<div class="store-page">
  <section class="page-header container">
    <a href="/" class="back-link">← Kembali ke Home</a>
    <h1>App <span class="text-primary">Store</span></h1>
    <p>
      Temukan dan unduh aplikasi buatan saya secara gratis untuk Windows dan
      Android.
    </p>
  </section>

  <section class="container">
    <div class="store-grid">
      {#each apps as app}
        <div class="app-card fade-in">
          <div class="app-header">
            <div class="app-icon">
              {#if app.icon_url}
                <img src={app.icon_url} alt={app.title} />
              {:else}
                <div class="icon-placeholder"><Monitor size={32} /></div>
              {/if}
            </div>
            <div class="app-title-group">
              <h3>{app.title}</h3>
              <p class="app-developer">{app.developer || "Chelvyn"}</p>
              <div class="app-rating">
                <span style="margin-left: 0;">Gratis</span>
              </div>
            </div>
          </div>

          <div class="app-body">
            <p class="app-description">{app.description}</p>

            <div class="app-meta">
              <span class="meta-item"
                ><Info size={14} /> v{app.version || "1.0"}</span
              >
              <span class="meta-item"
                ><Download size={14} /> {app.size || "Unknown size"}</span
              >
            </div>
          </div>

          <div class="app-footer">
            <a href={`/store/${app.id}`} class="btn btn-primary install-btn">
              Lihat Detail
            </a>
          </div>
        </div>
      {/each}

      {#if apps.length === 0}
        <div class="empty-state card">
          <p>
            Belum ada aplikasi yang tersedia di store saat ini. Kembali lagi
            nanti!
          </p>
        </div>
      {/if}
    </div>
  </section>
</div>

<style>
  .store-page {
    padding-bottom: 5rem;
  }

  .page-header {
    padding: 8rem 0 4rem;
  }

  .back-link {
    display: inline-block;
    color: var(--text-muted);
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 1.5rem;
  }

  .back-link:hover {
    color: var(--primary);
  }

  .page-header h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .text-primary {
    color: var(--primary);
  }

  .store-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 2rem;
  }

  .app-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 1.5rem;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .app-card:hover {
    transform: translateY(-5px);
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: rgba(var(--primary-rgb), 0.2);
  }

  .app-header {
    display: flex;
    gap: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .app-icon {
    width: 80px;
    height: 80px;
    border-radius: 20%;
    overflow: hidden;
    background: var(--bg-soft);
    flex-shrink: 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border);
  }

  .app-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .icon-placeholder {
    color: var(--text-muted);
  }

  .app-title-group {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .app-title-group h3 {
    font-size: 1.25rem;
    margin: 0 0 0.25rem 0;
    line-height: 1.2;
  }

  .app-developer {
    font-size: 0.875rem;
    color: var(--primary);
    font-weight: 500;
    margin: 0 0 0.5rem 0;
  }

  .app-rating {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: #f59e0b;
    font-size: 0.75rem;
  }

  .app-rating span {
    margin-left: 0.5rem;
    color: var(--text-muted);
    background: var(--bg-soft);
    padding: 0.125rem 0.5rem;
    border-radius: 1rem;
    font-weight: 600;
  }

  .app-body {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  .app-description {
    color: var(--text-muted);
    font-size: 0.9375rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .app-meta {
    display: flex;
    gap: 1rem;
    margin-top: auto;
    margin-bottom: 1.5rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    color: var(--text-muted);
    background: var(--bg-soft);
    padding: 0.25rem 0.625rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border);
  }

  .app-footer {
    display: flex;
    justify-content: stretch;
  }

  .install-btn {
    width: 100%;
    font-weight: 600;
    border-radius: 1rem;
    padding: 0.75rem;
    background: var(--primary);
    color: white;
    text-align: center;
  }

  .install-btn:hover {
    background: var(--primary-hover);
    transform: scale(1.02);
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 4rem 2rem;
    color: var(--text-muted);
  }

  @media (max-width: 768px) {
    .page-header {
      padding: 6rem 0 2rem;
      text-align: center;
    }
    .page-header h1 {
      font-size: 2.25rem;
    }
    .store-grid {
      grid-template-columns: 1fr;
      padding: 0 0.5rem;
    }
  }
</style>
