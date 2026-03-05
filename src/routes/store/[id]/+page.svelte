<script lang="ts">
  import {
    Download,
    Star,
    StarHalf,
    Info,
    Monitor,
    ArrowLeft,
    Calendar,
    FileBox,
  } from "lucide-svelte";

  let { data } = $props();
  const app = $derived(data.app);

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  };
</script>

<svelte:head>
  <title>{app.title} | Chelvyn Store</title>
  <meta name="description" content={app.description.substring(0, 150)} />
</svelte:head>

<div class="store-detail-page">
  <section class="page-header container">
    <a href="/store" class="back-link">
      <ArrowLeft size={16} /> Kembali ke Store
    </a>
  </section>

  <section class="container">
    <div class="app-detail-card card fade-in">
      <!-- Header Section -->
      <div class="detail-header">
        <div class="app-icon-large">
          {#if app.icon_url}
            <img src={app.icon_url} alt={app.title} />
          {:else}
            <div class="icon-placeholder"><Monitor size={64} /></div>
          {/if}
        </div>

        <div class="app-title-section">
          <h1>{app.title}</h1>
          <p class="developer-name">{app.developer || "Chelvyn"}</p>

          <div class="app-badges">
            <span class="badge">Gratis</span>
          </div>
        </div>

        <div class="action-section">
          <a
            href={formatUrl(app.download_url)}
            download
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-primary download-btn"
          >
            <Download size={20} />
            Dapatkan
          </a>
        </div>
      </div>

      <hr class="divider" />

      <!-- Content Section -->
      <div class="detail-content">
        <div class="main-info">
          <h2>Deskripsi</h2>
          <div class="description-text">
            {#each app.description.split("\n") as p}
              <p>{p}</p>
            {/each}
          </div>
        </div>

        <div class="sidebar-info">
          <div class="info-card">
            <h3>Informasi Tambahan</h3>
            <ul class="info-list">
              <li>
                <Info size={16} />
                <div>
                  <span class="label">Versi</span>
                  <span class="value">{app.version || "1.0"}</span>
                </div>
              </li>
              <li>
                <FileBox size={16} />
                <div>
                  <span class="label">Ukuran</span>
                  <span class="value">{app.size || "Unknown"}</span>
                </div>
              </li>
              <li>
                <Calendar size={16} />
                <div>
                  <span class="label">Ditambahkan pada</span>
                  <span class="value">{formatDate(app.created_at)}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .store-detail-page {
    padding-bottom: 5rem;
  }

  .page-header {
    padding: 8rem 0 2rem;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-muted);
    font-size: 0.875rem;
    font-weight: 500;
    transition: color 0.2s;
  }

  .back-link:hover {
    color: var(--primary);
  }

  .app-detail-card {
    padding: 3rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 1.5rem;
  }

  /* Header */
  .detail-header {
    display: flex;
    gap: 2rem;
    align-items: center;
    margin-bottom: 2.5rem;
  }

  .app-icon-large {
    width: 140px;
    height: 140px;
    border-radius: 25%;
    overflow: hidden;
    background: var(--bg-soft);
    flex-shrink: 0;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border);
  }

  .app-icon-large img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .icon-placeholder {
    color: var(--text-muted);
  }

  .app-title-section {
    flex-grow: 1;
  }

  .app-title-section h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    line-height: 1.1;
  }

  .developer-name {
    font-size: 1.125rem;
    color: var(--primary);
    font-weight: 500;
    margin-bottom: 1rem;
  }

  .app-badges {
    display: flex;
    gap: 0.75rem;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    background: var(--bg-soft);
    padding: 0.375rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-main);
    border: 1px solid var(--border);
  }

  .action-section {
    min-width: 200px;
    display: flex;
    flex-direction: column;
  }

  .download-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    font-size: 1.125rem;
    font-weight: 700;
    border-radius: 1rem;
    box-shadow: 0 4px 14px 0 rgba(var(--primary-rgb), 0.39);
    color: white;
  }

  .download-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.4);
  }

  .divider {
    border: 0;
    height: 1px;
    background: var(--border);
    margin: 2.5rem 0;
  }

  /* Content */
  .detail-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 3rem;
  }

  .main-info h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    font-weight: 700;
  }

  .description-text {
    font-size: 1.0625rem;
    line-height: 1.7;
    color: var(--text-muted);
  }

  .description-text p {
    margin-bottom: 1rem;
  }

  .info-card {
    background: var(--bg-soft);
    border: 1px solid var(--border);
    padding: 1.5rem;
    border-radius: 1rem;
  }

  .info-card h3 {
    font-size: 1.125rem;
    margin-bottom: 1.25rem;
    font-weight: 600;
  }

  .info-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .info-list li {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    color: var(--text-muted);
  }

  .info-list li > div {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .info-list .label {
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .info-list .value {
    font-size: 0.9375rem;
    color: var(--text-main);
    font-weight: 500;
  }

  @media (max-width: 900px) {
    .detail-content {
      grid-template-columns: 1fr;
    }

    .detail-header {
      flex-direction: column;
      text-align: center;
      gap: 1.5rem;
    }

    .app-badges {
      justify-content: center;
    }

    .action-section {
      width: 100%;
    }
  }

  @media (max-width: 600px) {
    .app-detail-card {
      padding: 1.5rem;
    }

    .app-title-section h1 {
      font-size: 2rem;
    }
  }
</style>
