<script lang="ts">
  import { enhance } from "$app/forms";
  import {
    Star,
    Pencil,
    Trash2,
    LogOut,
    PlusCircle,
    X,
    CheckCircle2,
    AlertCircle,
    LayoutGrid,
    Settings as SettingsIcon,
    User,
    Briefcase,
    BarChart3,
    Globe,
    Eye,
    Bot,
    Clock,
    Github,
    Play,
    Sun,
    Moon,
    MessageSquare,
    Copy,
    Check,
    XCircle,
    Mail,
  } from "lucide-svelte";
  import { theme } from "$lib/theme.svelte";
  import { fade, slide, fly } from "svelte/transition";

  let {
    data,
    form,
  }: {
    data: {
      projects: any[];
      settings: any;
      experiences: any[];
      apps: any[];
      reviewTokens: any[];
      reviews: any[];
      messages: any[];
      stats: {
        total: number;
        human: number;
        bot: number;
        recent: any[];
        topPages: any[];
      };
      authenticated: boolean;
    };
    form: any;
  } = $props();

  let editingId = $state<number | null>(null);
  let editingProject = $derived(
    editingId ? data.projects.find((p) => p.id === editingId) : null,
  );
  let editingAppId = $state<number | null>(null);
  let editingApp = $derived(
    editingAppId ? data.apps.find((a) => a.id === editingAppId) : null,
  );
  let isAddModalOpen = $state(false);
  let isAddExpModalOpen = $state(false);
  let isAddAppModalOpen = $state(false);
  let iconDragging = $state(false);
  let appDragging = $state(false);
  let iconFileName = $state("");
  let appFileName = $state("");
  let editIconDragging = $state(false);
  let editAppDragging = $state(false);
  let editIconFileName = $state("");
  let editAppFileName = $state("");
  let projectToDelete = $state<any | null>(null);
  let isPresent = $state(false);
  let activeTab = $state("projects");
  let currentStatus = $state("");

  // Base URL untuk membangun link review (dipakai di tab Reviews).
  let origin = $state("");
  $effect(() => {
    origin = window.location.origin;
  });
  let copiedLink = $state("");
  // Project yang dipilih saat generate link review ("manual" = ketik sendiri).
  let selectedProjectId = $state("");
  const pendingReviews = $derived(
    (data.reviews ?? []).filter((r) => r.status === "pending"),
  );
  const messages = $derived(data.messages ?? []);
  const unreadMessages = $derived(messages.filter((m) => m.is_read !== 1));
  async function copyLink(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedLink = text;
      setTimeout(() => {
        if (copiedLink === text) copiedLink = "";
      }, 2000);
    } catch {
      // Clipboard API bisa gagal (non-HTTPS/permission) — abaikan diam-diam.
    }
  }

  // Bangun template pesan WA santai & personal, siap copy-paste ke klien.
  // Edit teks di sini kalau mau ganti gaya bahasanya.
  function buildWaMessage(clientName: string, link: string): string {
    const nama = clientName?.trim() || "Kak";
    return `Halo ${nama} 🙏

Terima kasih banyak sudah mempercayakan project-nya ke saya. Senang bisa kerja sama 🙌

Kalau ada waktu sebentar, boleh minta tolong isi review singkat soal pengalaman kerja samanya? Cukup 1–2 menit dan sangat membantu saya ke depannya.

Link-nya di sini ya (khusus buat ${nama}):
${link}

Sekali lagi makasih banyak! 🚀`;
  }

  // Keep currentStatus in sync with server data
  $effect(() => {
    if (data?.settings?.status) {
      currentStatus = data.settings.status;
    }
  });

  // Loading State
  let isSubmitting = $state(false);

  // Toast State
  let toast = $state({ show: false, message: "", type: "success" });

  function showToast(message: string, type: "success" | "error" = "success") {
    toast.message = message;
    toast.type = type;
    toast.show = true;
    setTimeout(() => {
      toast.show = false;
    }, 3000);
  }

  // Handle form responses with Toast
  $effect(() => {
    if (form?.success) {
      showToast(form.message || "Berhasil!");
      isAddModalOpen = false;
      isAddExpModalOpen = false;
    } else if (form?.error) {
      showToast(form.error, "error");
    }
  });
</script>

{#if !data.authenticated}
  <div class="login-wrapper container">
    <div class="login-container card fade-in">
      <h1>Admin Login</h1>
      <p>Masukkan PIN untuk mengelola project.</p>

      {#if form?.error}
        <div class="alert alert-error">{form.error}</div>
      {/if}

      <form method="POST" action="?/login" use:enhance class="admin-form">
        <!-- Honeypot field - invisible to humans, bots will fill this -->
        <div
          style="position: absolute; left: -9999px; opacity: 0;"
          aria-hidden="true"
        >
          <label for="website">Website</label>
          <input
            type="text"
            id="website"
            name="website"
            tabindex="-1"
            autocomplete="off"
          />
        </div>

        <div class="form-group">
          <label for="pin" class="pin-label">PIN Keamanan</label>
          <input
            type="password"
            id="pin"
            name="pin"
            placeholder="****"
            required
            maxlength="8"
            pattern="[0-9]*"
            inputmode="numeric"
            class="pin-input"
          />
        </div>
        <button type="submit" class="btn btn-primary w-full btn-login"
          >Buka Dashboard</button
        >
      </form>
    </div>
  </div>
{:else}
  <div class="admin-layout">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="logo">CK<span>.</span></div>
        <span class="brand-text">Dashboard</span>
      </div>

      <nav class="sidebar-nav">
        <button
          class="nav-item"
          class:active={activeTab === "projects"}
          onclick={() => (activeTab = "projects")}
        >
          <Briefcase size={20} />
          <span>Projects</span>
        </button>
        <button
          class="nav-item"
          class:active={activeTab === "experiences"}
          onclick={() => (activeTab = "experiences")}
        >
          <User size={20} />
          <span>Experience</span>
        </button>
        <button
          class="nav-item"
          class:active={activeTab === "store"}
          onclick={() => (activeTab = "store")}
        >
          <Star size={20} />
          <span>Store Apps</span>
        </button>
        <button
          class="nav-item"
          class:active={activeTab === "analytics"}
          onclick={() => (activeTab = "analytics")}
        >
          <BarChart3 size={20} />
          <span>Analytics</span>
        </button>
        <button
          class="nav-item"
          class:active={activeTab === "reviews"}
          onclick={() => (activeTab = "reviews")}
        >
          <MessageSquare size={20} />
          <span>Reviews</span>
        </button>
        <button
          class="nav-item"
          class:active={activeTab === "messages"}
          onclick={() => (activeTab = "messages")}
        >
          <Mail size={20} />
          <span>Pesan</span>
          {#if unreadMessages.length > 0}
            <span class="nav-badge">{unreadMessages.length}</span>
          {/if}
        </button>
        <button
          class="nav-item"
          class:active={activeTab === "settings"}
          onclick={() => (activeTab = "settings")}
        >
          <SettingsIcon size={20} />
          <span>Settings</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <button
          class="logout-btn"
          onclick={() => theme.toggle()}
          title="Toggle Theme"
          style="margin-bottom: 0.5rem; justify-content: center;"
        >
          {#if theme.isDark}
            <Sun size={20} />
          {:else}
            <Moon size={20} />
          {/if}
          <span style="margin-left: 0.5rem;"
            >{theme.isDark ? "Light Mode" : "Dark Mode"}</span
          >
        </button>

        <form method="POST" action="?/logout" use:enhance>
          <button type="submit" class="logout-btn">
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </form>
      </div>
    </aside>

    <!-- CONTENT -->
    <main class="admin-main">
      <div class="content-header">
        <div>
          <h1>
            {#if activeTab === "projects"}
              Kelola Project
            {:else if activeTab === "experiences"}
              Kelola Pengalaman
            {:else if activeTab === "store"}
              Kelola Store Apps
            {:else if activeTab === "analytics"}
              Analitik Trafik
            {:else if activeTab === "reviews"}
              Review Klien
            {:else if activeTab === "messages"}
              Pesan Masuk
            {:else}
              Pengaturan Situs
            {/if}
          </h1>
          <p>
            {#if activeTab === "projects"}
              Daftar semua hasil karya bapak.
            {:else if activeTab === "experiences"}
              Daftar riwayat karir bapak.
            {:else if activeTab === "store"}
              Kelola aplikasi Store yang dibagikan.
            {:else if activeTab === "analytics"}
              Pantau pengunjung website bapak secara real-time.
            {:else if activeTab === "reviews"}
              Buat link review unik untuk klien & moderasi testimoni.
            {:else if activeTab === "messages"}
              Pesan yang dikirim lewat form kontak di halaman depan.
            {:else}
              Sesuaikan informasi publik di website.
            {/if}
          </p>
        </div>

        {#if activeTab === "projects"}
          <button
            class="btn btn-primary"
            onclick={() => (isAddModalOpen = true)}
            style="gap: 0.5rem;"
          >
            <PlusCircle size={18} />
            Tambah Project
          </button>
        {:else if activeTab === "experiences"}
          <button
            class="btn btn-primary"
            onclick={() => (isAddExpModalOpen = true)}
            style="gap: 0.5rem;"
          >
            <PlusCircle size={18} />
            Tambah Pengalaman
          </button>
        {:else if activeTab === "store"}
          <button
            class="btn btn-primary"
            onclick={() => (isAddAppModalOpen = true)}
            style="gap: 0.5rem;"
          >
            <PlusCircle size={18} />
            Tambah App
          </button>
        {/if}
      </div>

      <div class="content-body">
        {#if activeTab === "projects"}
          <!-- PROJECTS LIST -->
          <div class="card projects-container fade-in">
            <div class="project-list">
              {#each data.projects as project}
                <div class="project-item">
                  <div class="project-main-info">
                    <div class="project-tags">
                      <span class="tag">{project.category}</span>
                      {#if project.tech}
                        {#each project.tech.split(",") as t}
                          <span class="tag-tech">{t.trim()}</span>
                        {/each}
                      {/if}
                    </div>
                    <h3>{project.title}</h3>
                    <p class="project-desc">
                      {project.description}
                    </p>
                    <div class="project-links-preview">
                      {#if project.link}
                        <a href={project.link} target="_blank" title="Website"
                          ><Globe size={14} /></a
                        >
                      {/if}
                      {#if project.github}
                        <a href={project.github} target="_blank" title="GitHub"
                          ><Github size={14} /></a
                        >
                      {/if}
                      {#if project.demo}
                        <a href={project.demo} target="_blank" title="Demo"
                          ><Play size={14} /></a
                        >
                      {/if}
                    </div>
                  </div>

                  <div class="project-item-actions">
                    <form
                      method="POST"
                      action="?/toggleFeatured"
                      use:enhance={() => {
                        isSubmitting = true;
                        return async ({ result, update }) => {
                          isSubmitting = false;
                          if (result.type === "success") {
                            showToast(
                              project.featured === 1
                                ? "Dihapus dari Home"
                                : "Ditampilkan di Home",
                            );
                          }
                          await update();
                        };
                      }}
                    >
                      <input type="hidden" name="id" value={project.id} />
                      <input
                        type="hidden"
                        name="featured"
                        value={project.featured === 1 ? "0" : "1"}
                      />
                      <button
                        type="submit"
                        class="action-btn {project.featured === 1
                          ? 'active'
                          : ''}"
                        disabled={isSubmitting}
                        title={project.featured === 1
                          ? "Hapus dari Home"
                          : "Tampilkan di Home"}
                      >
                        <Star
                          size={18}
                          fill={project.featured === 1
                            ? "var(--primary)"
                            : "none"}
                          color={project.featured === 1
                            ? "var(--primary)"
                            : "currentColor"}
                        />
                      </button>
                    </form>

                    <button
                      type="button"
                      class="action-btn"
                      onclick={() => (editingId = project.id)}
                      title="Edit Project"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      class="action-btn btn-delete-icon"
                      title="Hapus Project"
                      onclick={() => (projectToDelete = project)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              {/each}

              {#if data.projects.length === 0}
                <p class="empty-state">Belum ada project yang ditambahkan.</p>
              {/if}
            </div>
          </div>
        {:else if activeTab === "experiences"}
          <!-- EXPERIENCES LIST -->
          <div class="card projects-container fade-in">
            <div class="project-list">
              {#each data.experiences as exp}
                <div class="project-item">
                  <div class="project-main-info">
                    <div class="project-tags">
                      <span class="tag">{exp.period}</span>
                    </div>
                    <h3>{exp.role}</h3>
                    <p class="project-desc">
                      {exp.company}
                    </p>
                  </div>

                  <div class="project-item-actions">
                    <form
                      method="POST"
                      action="?/deleteExperience"
                      use:enhance={() => {
                        return async ({ result, update }) => {
                          if (result.type === "success") {
                            showToast("Pengalaman berhasil dihapus");
                          }
                          await update();
                        };
                      }}
                    >
                      <input type="hidden" name="id" value={exp.id} />
                      <button
                        type="submit"
                        class="action-btn btn-delete-icon"
                        title="Hapus Pengalaman"
                        onclick={(e) =>
                          !confirm("Hapus pengalaman ini?") &&
                          e.preventDefault()}
                      >
                        <Trash2 size={18} />
                      </button>
                    </form>
                  </div>
                </div>
              {/each}

              {#if data.experiences.length === 0}
                <p class="empty-state">
                  Belum ada pengalaman yang ditambahkan.
                </p>
              {/if}
            </div>
          </div>
        {:else if activeTab === "store"}
          <!-- STORE LIST -->
          <div class="card projects-container fade-in">
            <div class="project-list">
              {#each data.apps as app}
                <div class="project-item">
                  <div
                    class="project-main-info"
                    style="display: flex; gap: 1rem; align-items: flex-start;"
                  >
                    <div
                      style="flex-shrink: 0; width: 64px; height: 64px; border-radius: 12px; background-color: var(--bg-soft); display: flex; align-items: center; justify-content: center; overflow: hidden;"
                    >
                      {#if app.icon_url}
                        <img
                          src={app.icon_url}
                          alt={app.title}
                          style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;"
                        />
                      {/if}
                    </div>
                    <div>
                      <h3 style="margin-bottom: 0.25rem;">{app.title}</h3>
                      <p
                        class="project-desc"
                        style="margin-bottom: 0.5rem; height: auto;"
                      >
                        {app.developer} &bull; v{app.version || "1.0"} &bull; {app.size ||
                          "Unknown size"}
                      </p>
                      <p class="project-desc" style="font-size: 0.875rem;">
                        {app.description.substring(0, 100)}{app.description
                          .length > 100
                          ? "..."
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div class="project-item-actions">
                    <button
                      type="button"
                      class="action-btn"
                      onclick={() => (editingAppId = app.id)}
                      title="Edit App"
                    >
                      <Pencil size={18} />
                    </button>

                    <form
                      method="POST"
                      action="?/deleteApp"
                      use:enhance={() => {
                        return async ({ result, update }) => {
                          if (result.type === "success")
                            showToast("App berhasil dihapus");
                          await update();
                        };
                      }}
                    >
                      <input type="hidden" name="id" value={app.id} />
                      <button
                        type="submit"
                        class="action-btn btn-delete-icon"
                        title="Hapus App"
                        onclick={(e) =>
                          !confirm("Hapus aplikasi ini?") && e.preventDefault()}
                      >
                        <Trash2 size={18} />
                      </button>
                    </form>
                  </div>
                </div>
              {/each}

              {#if data.apps.length === 0}
                <p class="empty-state">Belum ada aplikasi di Store.</p>
              {/if}
            </div>
          </div>
        {:else if activeTab === "analytics"}
          <!-- ANALYTICS DASHBOARD -->
          <div class="analytics-wrapper fade-in">
            <!-- STAT CARDS -->
            <div class="stats-grid">
              <div class="stat-card">
                <div
                  class="stat-icon"
                  style="background: #eff6ff; color: #3b82f6;"
                >
                  <Eye size={24} />
                </div>
                <div class="stat-info">
                  <span class="stat-label">Total Kunjungan</span>
                  <span class="stat-value">{data.stats.total}</span>
                </div>
              </div>
              <div class="stat-card">
                <div
                  class="stat-icon"
                  style="background: #f0fdf4; color: #22c55e;"
                >
                  <User size={24} />
                </div>
                <div class="stat-info">
                  <span class="stat-label">Pengunjung Manusia</span>
                  <span class="stat-value">{data.stats.human}</span>
                </div>
              </div>
              <div class="stat-card">
                <div
                  class="stat-icon"
                  style="background: #fef2f2; color: #ef4444;"
                >
                  <Bot size={24} />
                </div>
                <div class="stat-info">
                  <span class="stat-label">Bot / Crawler</span>
                  <span class="stat-value">{data.stats.bot}</span>
                </div>
              </div>
            </div>

            <div class="analytics-grid">
              <!-- TOP PAGES -->
              <div class="card analytics-card">
                <div class="card-header">
                  <h3>Halaman Terpopuler</h3>
                </div>
                <div class="top-pages-list">
                  {#each data.stats.topPages as page}
                    <div class="page-item">
                      <span class="page-path">{page.path}</span>
                      <span class="page-count">{page.count} hits</span>
                    </div>
                  {/each}
                </div>
              </div>

              <!-- REAL TIME LOG -->
              <div class="card analytics-card full-width-card">
                <div class="card-header">
                  <h3>Kunjungan Terbaru</h3>
                </div>
                <div class="traffic-log">
                  <table class="traffic-table">
                    <thead>
                      <tr>
                        <th>Waktu</th>
                        <th>Path</th>
                        <th>Browser / Bot</th>
                        <th>Tipe</th>
                        <th>Asal (Referrer)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {#each data.stats.recent as visit}
                        <tr>
                          <td class="text-xs text-muted">
                            {new Date(visit.timestamp).toLocaleString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "short",
                            })}
                          </td>
                          <td class="font-bold">{visit.path}</td>
                          <td class="ua-cell text-xs" title={visit.ua}>
                            {visit.ua.length > 40
                              ? visit.ua.substring(0, 40) + "..."
                              : visit.ua}
                          </td>
                          <td>
                            <span
                              class="badge-type {visit.is_bot
                                ? 'bot'
                                : 'human'}"
                            >
                              {visit.is_bot ? "BOT" : "USER"}
                            </span>
                          </td>
                          <td class="text-xs"
                            >{visit.referrer === "direct"
                              ? "Langsung"
                              : visit.referrer.length > 20
                                ? visit.referrer.substring(0, 20) + "..."
                                : visit.referrer}</td
                          >
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        {:else if activeTab === "settings"}
          <!-- SETTINGS UI -->
          <div class="card settings-container fade-in">
            <div class="settings-section">
              <h3>Status Ketersediaan</h3>
              <p>Ubah status bapak yang muncul di halaman depan (Home).</p>

              <form
                method="POST"
                action="?/updateStatus"
                use:enhance
                class="admin-form"
              >
                <div class="form-group">
                  <label for="status">Status Saat Ini</label>
                  <div
                    style="display: flex; gap: 1rem; align-items: flex-start;"
                  >
                    <div style="flex: 1;">
                      <input
                        type="text"
                        id="status"
                        name="status"
                        bind:value={currentStatus}
                        placeholder="Contoh: Tersedia untuk Project Baru"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      class="btn btn-primary"
                      style="height: 52px; padding: 0 2rem;">Simpan</button
                    >
                  </div>
                  <div class="status-presets">
                    <button
                      type="button"
                      class="preset-tag"
                      onclick={() =>
                        (currentStatus = "Tersedia untuk Project Baru")}
                      >Tersedia</button
                    >
                    <button
                      type="button"
                      class="preset-tag"
                      onclick={() => (currentStatus = "Sedang Sibuk (Busy)")}
                      >Sibuk</button
                    >
                    <button
                      type="button"
                      class="preset-tag"
                      onclick={() => (currentStatus = "Sedang Liburan 🏖️")}
                      >Libur</button
                    >
                  </div>
                </div>
              </form>
            </div>

            <div
              class="settings-section"
              style="border-top: 1px solid var(--border);"
            >
              <h3>Social Media Links</h3>
              <p>Tautkan akun media sosial bapak yang akan muncul di footer.</p>

              <form
                method="POST"
                action="?/updateSocialLinks"
                use:enhance
                class="admin-form"
                style="max-width: 900px;"
              >
                <div class="form-grid">
                  <div class="form-group">
                    <label for="github">GitHub URL</label>
                    <input
                      type="text"
                      id="github"
                      name="github"
                      value={data.settings.github || "#"}
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div class="form-group">
                    <label for="linkedin">LinkedIn URL</label>
                    <input
                      type="text"
                      id="linkedin"
                      name="linkedin"
                      value={data.settings.linkedin || "#"}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div class="form-group">
                    <label for="twitter">Twitter / X URL</label>
                    <input
                      type="text"
                      id="twitter"
                      name="twitter"
                      value={data.settings.twitter || "#"}
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                </div>
                <div
                  style="margin-top: 2.5rem; padding-top: 2rem; border-top: 1px solid #f1f5f9;"
                >
                  <button
                    type="submit"
                    class="btn btn-primary"
                    style="padding: 0.875rem 2.5rem;"
                  >
                    Simpan Perubahan Social Links
                  </button>
                </div>
              </form>
            </div>
          </div>
        {:else if activeTab === "reviews"}
          <!-- REVIEWS UI -->
          <div class="reviews-container fade-in">
            <!-- Generate link -->
            <div class="review-block">
              <div>
                <h3 class="review-block-title" style="margin-bottom: 0.4rem;">
                  Buat Link Review Baru
                </h3>
                <p class="review-block-desc">
                  Isi nama klien & proyek, lalu kirim link yang dihasilkan ke WA
                  klien. Link berlaku 30 hari & hanya bisa dipakai sekali.
                </p>

                <form
                  method="POST"
                  action="?/generateReviewLink"
                  use:enhance={() => {
                    return async ({ result, update }) => {
                      await update();
                      // Reset pilihan supaya form siap untuk klien berikutnya.
                      if (result.type === "success") selectedProjectId = "";
                    };
                  }}
                  class="admin-form"
                >
                  <div class="review-gen-grid">
                    <div class="form-group">
                      <label for="client_name">Nama Klien</label>
                      <input
                        type="text"
                        id="client_name"
                        name="client_name"
                        placeholder="mis. Budi Santoso"
                        maxlength="100"
                        required
                      />
                    </div>
                    <div class="form-group">
                      <label for="project_id">Project</label>
                      <select
                        id="project_id"
                        name="project_id"
                        bind:value={selectedProjectId}
                        required
                      >
                        <option value="" disabled>— Pilih project —</option>
                        {#each data.projects as p (p.id)}
                          <option value={String(p.id)}>{p.title}</option>
                        {/each}
                        <option value="manual">Lainnya (ketik manual)</option>
                      </select>
                    </div>
                  </div>

                  <!-- Fallback untuk pekerjaan yang belum terdaftar di /admin projects. -->
                  {#if selectedProjectId === "manual"}
                    <div class="form-group" style="margin-bottom: 1.25rem;">
                      <label for="project_name">Nama Project (manual)</label>
                      <input
                        type="text"
                        id="project_name"
                        name="project_name"
                        placeholder="mis. Implementasi Odoo ERP"
                        maxlength="120"
                        required
                      />
                    </div>
                  {/if}
                  <button
                    type="submit"
                    class="btn btn-primary"
                    style="gap: 0.5rem;"
                  >
                    <PlusCircle size={18} /> Generate Link
                  </button>
                </form>

                {#if form?.reviewToken}
                  {@const link = `${origin}/review/${form.reviewToken}`}
                  {@const waMsg = buildWaMessage(form.clientName ?? "", link)}
                  <div class="link-result">
                    <div class="link-result-label">
                      <Check size={16} /> Link berhasil dibuat! Salin pesan di bawah, lalu paste ke WA klien 👇
                    </div>
                    <textarea class="wa-template" readonly rows="9">{waMsg}</textarea>
                    <button
                      type="button"
                      class="copy-btn wa-copy-btn"
                      onclick={() => copyLink(waMsg)}
                    >
                      {#if copiedLink === waMsg}
                        <Check size={16} /> Pesan Tersalin — tinggal paste ke WA
                      {:else}
                        <Copy size={16} /> Salin Pesan WA
                      {/if}
                    </button>
                  </div>
                {/if}
              </div>
            </div>

            <!-- Pending reviews -->
            <div class="review-block">
              <h3 class="review-block-title">
                Menunggu Persetujuan
                {#if pendingReviews.length > 0}
                  <span class="pending-badge">{pendingReviews.length}</span>
                {/if}
              </h3>
              {#if pendingReviews.length === 0}
                <p class="empty-hint">Belum ada review yang menunggu persetujuan.</p>
              {:else}
                <div class="review-list">
                  {#each pendingReviews as r (r.id)}
                    <div class="review-item">
                      <div class="review-item-head">
                        <div>
                          <strong>{r.reviewer_name}</strong>
                          {#if r.reviewer_role}<span class="review-role">— {r.reviewer_role}</span>{/if}
                          <div class="review-stars">
                            {#each Array(5) as _, i}
                              <Star
                                size={15}
                                fill={i < Number(r.rating) ? "#f59e0b" : "none"}
                                color={i < Number(r.rating) ? "#f59e0b" : "#cbd5e1"}
                              />
                            {/each}
                          </div>
                        </div>
                        <span class="review-project">{r.project_name}</span>
                      </div>
                      <p class="review-text">"{r.testimonial}"</p>
                      <div class="review-actions">
                        <form method="POST" action="?/approveReview" use:enhance>
                          <input type="hidden" name="id" value={r.id} />
                          <button type="submit" class="btn-mini approve">
                            <Check size={15} /> Setujui
                          </button>
                        </form>
                        <form method="POST" action="?/rejectReview" use:enhance>
                          <input type="hidden" name="id" value={r.id} />
                          <button type="submit" class="btn-mini reject">
                            <XCircle size={15} /> Tolak
                          </button>
                        </form>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>

            <!-- Daftar link -->
            <div class="review-block">
              <h3 class="review-block-title">Semua Link Review</h3>
              {#if data.reviewTokens.length === 0}
                <p class="empty-hint">Belum ada link review yang dibuat.</p>
              {:else}
                <div class="token-list">
                  {#each data.reviewTokens as t (t.id)}
                    {@const expired =
                      t.expires_at && new Date(t.expires_at).getTime() < Date.now()}
                    <div class="token-item">
                      <div class="token-info">
                        <strong>{t.client_name}</strong>
                        <span class="token-project">{t.project_name}</span>
                        <div class="token-meta">
                          {#if t.used}
                            <span class="chip used">Sudah direview</span>
                          {:else if expired}
                            <span class="chip expired">Kadaluarsa</span>
                          {:else}
                            <span class="chip active">Aktif</span>
                          {/if}
                          {#if t.project_id}
                            <span class="chip linked">Terhubung ke project</span>
                          {/if}
                        </div>
                      </div>
                      <div class="token-controls">
                        {#if !t.used && !expired}
                          {@const waMsg = buildWaMessage(
                            t.client_name,
                            `${origin}/review/${t.token}`,
                          )}
                          <button
                            type="button"
                            class="copy-btn"
                            title="Salin pesan WA untuk klien ini"
                            onclick={() => copyLink(waMsg)}
                          >
                            {#if copiedLink === waMsg}
                              <Check size={15} /> Tersalin
                            {:else}
                              <Copy size={15} /> Salin Pesan
                            {/if}
                          </button>
                        {/if}
                        <!-- Tautkan ke project. Berguna kalau klien review
                             duluan sebelum project-nya didaftarkan. -->
                        <form
                          method="POST"
                          action="?/linkTokenProject"
                          use:enhance
                          class="token-link-form"
                        >
                          <input type="hidden" name="id" value={t.id} />
                          <select
                            name="project_id"
                            class="token-project-select"
                            title="Hubungkan link ini ke project"
                            value={t.project_id ? String(t.project_id) : ""}
                            onchange={(e) =>
                              e.currentTarget.form?.requestSubmit()}
                          >
                            <option value="">— Belum ditautkan —</option>
                            {#each data.projects as p (p.id)}
                              <option value={String(p.id)}>{p.title}</option>
                            {/each}
                          </select>
                        </form>

                        <form method="POST" action="?/deleteReviewToken" use:enhance>
                          <input type="hidden" name="id" value={t.id} />
                          <button type="submit" class="btn-mini reject" title="Hapus">
                            <Trash2 size={15} />
                          </button>
                        </form>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        {:else if activeTab === "messages"}
          <div class="messages-container fade-in">
            {#if messages.length === 0}
              <p class="empty-hint">Belum ada pesan masuk.</p>
            {:else}
              <div class="message-list">
                {#each messages as m (m.id)}
                  <div class="message-card" class:unread={m.is_read !== 1}>
                    <div class="message-head">
                      <div>
                        <h4>
                          {m.name}
                          {#if m.is_read !== 1}
                            <span class="pending-badge">Baru</span>
                          {/if}
                        </h4>
                        <a class="message-email" href="mailto:{m.email}"
                          >{m.email}</a
                        >
                      </div>
                      <span class="message-date"
                        >{new Date(m.created_at).toLocaleString("id-ID")}</span
                      >
                    </div>

                    {#if m.subject}
                      <p class="message-subject">{m.subject}</p>
                    {/if}
                    <p class="message-body">{m.message}</p>

                    <div class="message-actions">
                      <a
                        class="btn-mini"
                        href="mailto:{m.email}?subject=Re: {encodeURIComponent(
                          m.subject || 'Pesan dari portfolio',
                        )}"
                      >
                        <Mail size={15} /> Balas
                      </a>
                      {#if m.is_read !== 1}
                        <form
                          method="POST"
                          action="?/markMessageRead"
                          use:enhance
                        >
                          <input type="hidden" name="id" value={m.id} />
                          <button
                            type="submit"
                            class="btn-mini"
                            title="Tandai sudah dibaca"
                          >
                            <Check size={15} /> Tandai Dibaca
                          </button>
                        </form>
                      {/if}
                      <form method="POST" action="?/deleteMessage" use:enhance>
                        <input type="hidden" name="id" value={m.id} />
                        <button
                          type="submit"
                          class="btn-mini reject"
                          title="Hapus pesan"
                        >
                          <Trash2 size={15} />
                        </button>
                      </form>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </main>
  </div>

  <!-- Modal Tambah Project -->
  {#if isAddModalOpen}
    <div
      class="modal-overlay"
      role="button"
      tabindex="-1"
      transition:fade={{ duration: 200 }}
      onclick={(e) => {
        if (e.target === e.currentTarget) isAddModalOpen = false;
      }}
      onkeydown={(e) => {
        if (e.key === "Escape") isAddModalOpen = false;
      }}
    >
      <div class="modal-content card" transition:fly={{ y: 20, duration: 300 }}>
        <div class="modal-header">
          <h2>Tambah Project Baru</h2>
          <button class="close-btn" onclick={() => (isAddModalOpen = false)}>
            <X size={20} />
          </button>
        </div>
        <form
          method="POST"
          action="?/addProject"
          use:enhance={() => {
            isSubmitting = true;
            return async ({ result, update }) => {
              isSubmitting = false;
              if (result.type === "success") {
                isAddModalOpen = false;
                showToast("Project baru berhasil ditambahkan!");
              }
              await update();
            };
          }}
          class="admin-form"
        >
          <div class="form-grid">
            <div class="form-group">
              <label for="title">Judul Project</label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Contoh: E-Commerce App"
                required
              />
            </div>
            <div class="form-group">
              <label for="category">Kategori</label>
              <input
                type="text"
                id="category"
                name="category"
                placeholder="Contoh: Web App"
                required
              />
            </div>
            <div class="form-group">
              <label for="tech">Teknologi</label>
              <input
                type="text"
                id="tech"
                name="tech"
                placeholder="Svelte, Rust, etc."
              />
            </div>
            <div class="form-group">
              <label for="link">Link Website (Live)</label>
              <input
                type="text"
                id="link"
                name="link"
                placeholder="https://..."
              />
            </div>
            <div class="form-group">
              <label for="github">Link GitHub / Source</label>
              <input
                type="text"
                id="github"
                name="github"
                placeholder="https://github.com/..."
              />
            </div>
            <div class="form-group">
              <label for="demo">Link Video / Live Demo</label>
              <input
                type="text"
                id="demo"
                name="demo"
                placeholder="https://..."
              />
            </div>
            <div class="form-group full-width">
              <label for="description">Deskripsi</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                placeholder="Jelaskan detail project..."
                required
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-outline"
              onclick={() => (isAddModalOpen = false)}>Batal</button
            >
            <button
              type="submit"
              class="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Project"}</button
            >
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- Modal Tambah App Store -->
  {#if isAddAppModalOpen}
    <div
      class="modal-overlay"
      role="button"
      tabindex="-1"
      transition:fade={{ duration: 200 }}
      onclick={(e) => {
        if (e.target === e.currentTarget) isAddAppModalOpen = false;
      }}
      onkeydown={(e) => {
        if (e.key === "Escape") isAddAppModalOpen = false;
      }}
    >
      <div class="modal-content card" transition:fly={{ y: 20, duration: 300 }}>
        <div class="modal-header">
          <h2>Tambah App ke Store</h2>
          <button
            class="close-btn"
            onclick={() => {
              isAddAppModalOpen = false;
              iconFileName = "";
              appFileName = "";
              iconDragging = false;
              appDragging = false;
            }}><X size={20} /></button
          >
        </div>
        <form
          method="POST"
          action="?/addApp"
          enctype="multipart/form-data"
          use:enhance={() => {
            isSubmitting = true;
            return async ({ result, update }) => {
              isSubmitting = false;
              if (result.type === "success") {
                isAddAppModalOpen = false;
                iconFileName = "";
                appFileName = "";
                showToast("App berhasil ditambahkan!");
              }
              await update();
            };
          }}
          class="admin-form"
        >
          <div
            style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;"
          >
            <!-- Kolom Kiri: Input Teks -->
            <div style="display: flex; flex-direction: column; gap: 1.25rem;">
              <div class="form-group" style="margin-bottom: 0;">
                <label for="app_title">Judul App</label>
                <input
                  type="text"
                  id="app_title"
                  name="title"
                  placeholder="Contoh: My Application"
                  required
                />
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label for="developer">Developer</label>
                <input
                  type="text"
                  id="developer"
                  name="developer"
                  placeholder="Contoh: Chelvyn"
                  required
                />
              </div>

              <div
                style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;"
              >
                <div class="form-group" style="margin-bottom: 0;">
                  <label for="version">Versi</label>
                  <input
                    type="text"
                    id="version"
                    name="version"
                    placeholder="1.0"
                  />
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label for="size">Ukuran (Size)</label>
                  <input
                    type="text"
                    id="size"
                    name="size"
                    placeholder="25 MB"
                  />
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label for="app_description">Deskripsi</label>
                <textarea
                  id="app_description"
                  name="description"
                  rows="3"
                  placeholder="Deskripsi aplikasi..."
                  required
                ></textarea>
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label for="icon_url">Atau URL Icon (Bila tidak upload)</label>
                <input
                  type="text"
                  id="icon_url"
                  name="icon_url"
                  placeholder="https://..."
                />
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label for="download_url"
                  >Atau URL Download (Bila tidak upload)</label
                >
                <input
                  type="text"
                  id="download_url"
                  name="download_url"
                  placeholder="https://..."
                />
              </div>
            </div>

            <!-- Kolom Kanan: Dropzones -->
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
              <div
                class="form-group"
                style="margin-bottom: 0; flex: 1; display: flex; flex-direction: column;"
              >
                <label for="icon_file">Upload Icon Aplikasi</label>
                <div
                  class="dropzone {iconDragging ? 'dragging' : ''}"
                  style="flex: 1; display: flex; flex-direction: column; justify-content: center; min-height: 150px;"
                  role="button"
                  tabindex="0"
                  ondragover={(e) => {
                    e.preventDefault();
                    iconDragging = true;
                  }}
                  ondragleave={(e) => {
                    e.preventDefault();
                    iconDragging = false;
                  }}
                  ondrop={(e) => {
                    e.preventDefault();
                    iconDragging = false;
                    if (e.dataTransfer?.files?.length) {
                      const fileInput = document.getElementById(
                        "icon_file",
                      ) as HTMLInputElement;
                      fileInput.files = e.dataTransfer.files;
                      iconFileName = e.dataTransfer.files[0].name;
                    }
                  }}
                >
                  <input
                    type="file"
                    id="icon_file"
                    name="icon_file"
                    accept="image/*"
                    class="file-input-hidden"
                    onchange={(e) => {
                      const target = e.currentTarget as HTMLInputElement;
                      if (target.files?.length)
                        iconFileName = target.files[0].name;
                    }}
                  />
                  <div class="dropzone-content">
                    <div class="drop-icon">🖼️</div>
                    {#if iconFileName}
                      <p class="file-name">{iconFileName}</p>
                    {:else}
                      <p style="font-size: 0.875rem;">
                        Tarik & lepas file icon<br />atau
                        <span style="color: var(--primary); font-weight: 500;"
                          >Pilih File</span
                        >
                      </p>
                    {/if}
                  </div>
                </div>
              </div>

              <div
                class="form-group"
                style="margin-bottom: 0; flex: 1; display: flex; flex-direction: column;"
              >
                <label for="app_file">Upload File App (APK/EXE/ZIP)</label>
                <div
                  class="dropzone {appDragging ? 'dragging' : ''}"
                  style="flex: 1; display: flex; flex-direction: column; justify-content: center; min-height: 150px;"
                  role="button"
                  tabindex="0"
                  ondragover={(e) => {
                    e.preventDefault();
                    appDragging = true;
                  }}
                  ondragleave={(e) => {
                    e.preventDefault();
                    appDragging = false;
                  }}
                  ondrop={(e) => {
                    e.preventDefault();
                    appDragging = false;
                    if (e.dataTransfer?.files?.length) {
                      const fileInput = document.getElementById(
                        "app_file",
                      ) as HTMLInputElement;
                      fileInput.files = e.dataTransfer.files;
                      appFileName = e.dataTransfer.files[0].name;
                    }
                  }}
                >
                  <input
                    type="file"
                    id="app_file"
                    name="app_file"
                    accept=".apk,.exe,.zip,.tar,.gz,.rar"
                    class="file-input-hidden"
                    onchange={(e) => {
                      const target = e.currentTarget as HTMLInputElement;
                      if (target.files?.length)
                        appFileName = target.files[0].name;
                    }}
                  />
                  <div class="dropzone-content">
                    <div class="drop-icon">📦</div>
                    {#if appFileName}
                      <p class="file-name">{appFileName}</p>
                    {:else}
                      <p style="font-size: 0.875rem;">
                        Tarik & lepas file app<br />atau
                        <span style="color: var(--primary); font-weight: 500;"
                          >Pilih File</span
                        >
                      </p>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-outline"
              onclick={() => (isAddAppModalOpen = false)}>Batal</button
            >
            <button
              type="submit"
              class="btn btn-primary"
              disabled={isSubmitting}
              >{isSubmitting ? "Menyimpan..." : "Simpan App"}</button
            >
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- Modal Tambah Pengalaman -->
  {#if isAddExpModalOpen}
    <div
      class="modal-overlay"
      role="button"
      tabindex="-1"
      transition:fade={{ duration: 200 }}
      onclick={(e) => {
        if (e.target === e.currentTarget) isAddExpModalOpen = false;
      }}
      onkeydown={(e) => {
        if (e.key === "Escape") isAddExpModalOpen = false;
      }}
    >
      <div
        class="modal-content card"
        transition:fly={{ y: 20, duration: 300 }}
        style="max-width: 600px;"
      >
        <div class="modal-header">
          <h2>Tambah Riwayat Pengalaman</h2>
          <button class="close-btn" onclick={() => (isAddExpModalOpen = false)}>
            <X size={20} />
          </button>
        </div>
        <form
          method="POST"
          action="?/addExperience"
          use:enhance={() => {
            return async ({ result, update }) => {
              if (result.type === "success") {
                isAddExpModalOpen = false;
                isPresent = false;
                showToast("Pengalaman berhasil ditambahkan!");
              }
              await update();
            };
          }}
          class="admin-form"
        >
          <div
            class="date-grid"
            style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;"
          >
            <div class="form-group">
              <label for="start_date">Bulan Mulai</label>
              <input type="month" id="start_date" name="start_date" required />
            </div>

            {#if !isPresent}
              <div class="form-group" transition:slide>
                <label for="end_date">Bulan Selesai</label>
                <input type="month" id="end_date" name="end_date" required />
              </div>
            {/if}
          </div>

          <div class="form-group" style="margin-bottom: 2rem;">
            <label
              class="checkbox-label"
              style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; font-weight: 600; color: #475569;"
            >
              <input
                type="checkbox"
                name="isPresent"
                bind:checked={isPresent}
                style="width: 20px; height: 20px; cursor: pointer;"
              />
              Masih Bekerja di Sini (Sekarang)
            </label>
          </div>

          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label for="role">Posisi / Jabatan</label>
            <input
              type="text"
              id="role"
              name="role"
              placeholder="Contoh: Odoo Technical Consultant"
              required
            />
          </div>
          <div class="form-group" style="margin-bottom: 2rem;">
            <label for="company">Nama Perusahaan / Detail</label>
            <input
              type="text"
              id="company"
              name="company"
              placeholder="Contoh: PT. Sinergi Karya Solusindo"
              required
            />
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-outline"
              onclick={() => (isAddExpModalOpen = false)}>Batal</button
            >
            <button type="submit" class="btn btn-primary"
              >Simpan Pengalaman</button
            >
          </div>
        </form>
      </div>
    </div>
  {/if}
{/if}

<!-- Modal Edit Project -->
{#if editingProject}
  <div
    class="modal-overlay"
    role="button"
    tabindex="-1"
    transition:fade={{ duration: 200 }}
    onclick={(e) => {
      if (e.target === e.currentTarget) editingId = null;
    }}
    onkeydown={(e) => {
      if (e.key === "Escape") editingId = null;
    }}
  >
    <div class="modal-content card" transition:fly={{ y: 20, duration: 300 }}>
      <div class="modal-header">
        <h2>Edit Project</h2>
        <button class="close-btn" onclick={() => (editingId = null)}>
          <X size={20} />
        </button>
      </div>
      <form
        method="POST"
        action="?/updateProject"
        use:enhance={() => {
          return async ({ result, update }) => {
            if (result.type === "success") {
              editingId = null;
              showToast("Perubahan berhasil disimpan!");
            }
            await update();
          };
        }}
        class="admin-form"
      >
        <input type="hidden" name="id" value={editingProject.id} />
        <div class="form-grid">
          <div class="form-group">
            <label for="edit-title">Judul Project</label>
            <input
              type="text"
              id="edit-title"
              name="title"
              value={editingProject.title}
              required
            />
          </div>
          <div class="form-group">
            <label for="edit-category">Kategori</label>
            <input
              type="text"
              id="edit-category"
              name="category"
              value={editingProject.category}
              required
            />
          </div>
          <div class="form-group">
            <label for="edit-tech">Teknologi</label>
            <input
              type="text"
              id="edit-tech"
              name="tech"
              value={editingProject.tech}
              placeholder="Svelte, Rust, etc."
            />
          </div>
          <div class="form-group">
            <label for="edit-link">Link Website (Live)</label>
            <input
              type="text"
              id="edit-link"
              name="link"
              value={editingProject.link}
              placeholder="https://..."
            />
          </div>
          <div class="form-group">
            <label for="edit-github">Link GitHub / Source</label>
            <input
              type="text"
              id="edit-github"
              name="github"
              value={editingProject.github}
              placeholder="https://github.com/..."
            />
          </div>
          <div class="form-group">
            <label for="edit-demo">Link Video / Live Demo</label>
            <input
              type="text"
              id="edit-demo"
              name="demo"
              value={editingProject.demo}
              placeholder="https://..."
            />
          </div>
          <div class="form-group full-width">
            <label for="edit-description">Deskripsi</label>
            <textarea id="edit-description" name="description" rows="4" required
              >{editingProject.description}</textarea
            >
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline"
            onclick={() => (editingId = null)}>Batal</button
          >
          <button type="submit" class="btn btn-primary">Simpan Perubahan</button
          >
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Modal Edit App -->
{#if editingApp}
  <div
    class="modal-overlay"
    role="button"
    tabindex="-1"
    transition:fade={{ duration: 200 }}
    onclick={(e) => {
      if (e.target === e.currentTarget) {
        editingAppId = null;
        editIconFileName = "";
        editAppFileName = "";
      }
    }}
    onkeydown={(e) => {
      if (e.key === "Escape") {
        editingAppId = null;
        editIconFileName = "";
        editAppFileName = "";
      }
    }}
  >
    <div class="modal-content card" transition:fly={{ y: 20, duration: 300 }}>
      <div class="modal-header">
        <h2>Edit App</h2>
        <button
          class="close-btn"
          onclick={() => {
            editingAppId = null;
            editIconFileName = "";
            editAppFileName = "";
          }}
        >
          <X size={20} />
        </button>
      </div>
      <form
        method="POST"
        action="?/updateApp"
        enctype="multipart/form-data"
        use:enhance={() => {
          return async ({ result, update }) => {
            if (result.type === "success") {
              editingAppId = null;
              editIconFileName = "";
              editAppFileName = "";
              showToast("Perubahan berhasil disimpan!");
            }
            await update();
          };
        }}
        class="admin-form"
      >
        <input type="hidden" name="id" value={editingApp.id} />
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          <!-- Kolom Kiri: Input Teks -->
          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div class="form-group" style="margin-bottom: 0;">
              <label for="edit_app_title">Judul App</label>
              <input
                type="text"
                id="edit_app_title"
                name="title"
                value={editingApp.title}
                required
              />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label for="edit_app_developer">Developer</label>
              <input
                type="text"
                id="edit_app_developer"
                name="developer"
                value={editingApp.developer}
                required
              />
            </div>

            <div
              style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;"
            >
              <div class="form-group" style="margin-bottom: 0;">
                <label for="edit_app_version">Versi</label>
                <input
                  type="text"
                  id="edit_app_version"
                  name="version"
                  value={editingApp.version}
                />
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label for="edit_app_size">Ukuran (Size)</label>
                <input
                  type="text"
                  id="edit_app_size"
                  name="size"
                  value={editingApp.size}
                />
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label for="edit_app_description">Deskripsi</label>
              <textarea
                id="edit_app_description"
                name="description"
                rows="3"
                required>{editingApp.description}</textarea
              >
            </div>
          </div>

          <!-- Kolom Kanan: Dropzones -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="form-group" style="margin-bottom: 0;">
              <label for="edit_icon_url">URL Icon Saat Ini</label>
              <input
                type="text"
                id="edit_icon_url"
                name="icon_url"
                value={editingApp.icon_url}
              />
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label for="edit_download_url">URL Download Saat Ini</label>
              <input
                type="text"
                id="edit_download_url"
                name="download_url"
                value={editingApp.download_url}
              />
            </div>

            <div
              class="form-group"
              style="margin-bottom: 0; flex: 1; display: flex; flex-direction: column;"
            >
              <label for="edit_icon_file"
                >Ganti Icon Aplikasi Baru (Opsional)</label
              >
              <div
                class="dropzone {editIconDragging ? 'dragging' : ''}"
                style="flex: 1; display: flex; flex-direction: column; justify-content: center; min-height: 120px;"
                role="button"
                tabindex="0"
                ondragover={(e) => {
                  e.preventDefault();
                  editIconDragging = true;
                }}
                ondragleave={(e) => {
                  e.preventDefault();
                  editIconDragging = false;
                }}
                ondrop={(e) => {
                  e.preventDefault();
                  editIconDragging = false;
                  if (e.dataTransfer?.files?.length) {
                    const fileInput = document.getElementById(
                      "edit_icon_file",
                    ) as HTMLInputElement;
                    fileInput.files = e.dataTransfer.files;
                    editIconFileName = e.dataTransfer.files[0].name;
                  }
                }}
              >
                <input
                  type="file"
                  id="edit_icon_file"
                  name="icon_file"
                  accept="image/*"
                  class="file-input-hidden"
                  onchange={(e) => {
                    const target = e.currentTarget as HTMLInputElement;
                    if (target.files?.length)
                      editIconFileName = target.files[0].name;
                  }}
                />
                <div class="dropzone-content">
                  <div class="drop-icon">🖼️</div>
                  {#if editIconFileName}
                    <p class="file-name">{editIconFileName}</p>
                  {:else}
                    <p style="font-size: 0.875rem;">
                      Tarik & lepas file icon<br />atau
                      <span style="color: var(--primary); font-weight: 500;"
                        >Pilih File</span
                      >
                    </p>
                  {/if}
                </div>
              </div>
            </div>

            <div
              class="form-group"
              style="margin-bottom: 0; flex: 1; display: flex; flex-direction: column;"
            >
              <label for="edit_app_file">Ganti File App Baru (Opsional)</label>
              <div
                class="dropzone {editAppDragging ? 'dragging' : ''}"
                style="flex: 1; display: flex; flex-direction: column; justify-content: center; min-height: 120px;"
                role="button"
                tabindex="0"
                ondragover={(e) => {
                  e.preventDefault();
                  editAppDragging = true;
                }}
                ondragleave={(e) => {
                  e.preventDefault();
                  editAppDragging = false;
                }}
                ondrop={(e) => {
                  e.preventDefault();
                  editAppDragging = false;
                  if (e.dataTransfer?.files?.length) {
                    const fileInput = document.getElementById(
                      "edit_app_file",
                    ) as HTMLInputElement;
                    fileInput.files = e.dataTransfer.files;
                    editAppFileName = e.dataTransfer.files[0].name;
                  }
                }}
              >
                <input
                  type="file"
                  id="edit_app_file"
                  name="app_file"
                  accept=".apk,.exe,.zip,.tar,.gz,.rar"
                  class="file-input-hidden"
                  onchange={(e) => {
                    const target = e.currentTarget as HTMLInputElement;
                    if (target.files?.length)
                      editAppFileName = target.files[0].name;
                  }}
                />
                <div class="dropzone-content">
                  <div class="drop-icon">📦</div>
                  {#if editAppFileName}
                    <p class="file-name">{editAppFileName}</p>
                  {:else}
                    <p style="font-size: 0.875rem;">
                      Tarik & lepas file app<br />atau
                      <span style="color: var(--primary); font-weight: 500;"
                        >Pilih File</span
                      >
                    </p>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline"
            onclick={() => (editingAppId = null)}>Batal</button
          >
          <button type="submit" class="btn btn-primary">Simpan Perubahan</button
          >
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Modal Konfirmasi Hapus -->
{#if projectToDelete}
  <div
    class="modal-overlay"
    role="button"
    tabindex="-1"
    transition:fade={{ duration: 200 }}
    onclick={(e) => {
      if (e.target === e.currentTarget) projectToDelete = null;
    }}
    onkeydown={(e) => {
      if (e.key === "Escape") projectToDelete = null;
    }}
  >
    <div
      class="modal-content card delete-confirm-modal"
      transition:fly={{ y: 20, duration: 300 }}
      style="max-width: 450px;"
    >
      <div class="modal-header">
        <h2 style="color: #ef4444;">Hapus Project?</h2>
        <button class="close-btn" onclick={() => (projectToDelete = null)}>
          <X size={20} />
        </button>
      </div>
      <div class="modal-body" style="padding: 1rem 0 2rem;">
        <p>
          Bapak yakin ingin menghapus project <strong
            >{projectToDelete.title}</strong
          >?
        </p>
        <p style="font-size: 0.875rem; color: #64748b; margin-top: 0.5rem;">
          Tindakan ini tidak bisa dibatalkan ya pak.
        </p>
      </div>
      <div class="modal-footer" style="padding-top: 0;">
        <button
          type="button"
          class="btn btn-outline"
          onclick={() => (projectToDelete = null)}>Batal</button
        >
        <form
          method="POST"
          action="?/deleteProject"
          use:enhance={() => {
            return async ({ result, update }) => {
              if (result.type === "success") {
                projectToDelete = null;
                showToast("Project berhasil dihapus");
              }
              await update();
            };
          }}
        >
          <input type="hidden" name="id" value={projectToDelete.id} />
          <button
            type="submit"
            class="btn btn-primary"
            style="background: #ef4444; border-color: #ef4444;"
            >Ya, Hapus Sekarang</button
          >
        </form>
      </div>
    </div>
  </div>
{/if}

<!-- Toast Notification -->

{#if toast.show}
  <div class="toast-container" transition:fly={{ x: 100, duration: 300 }}>
    <div class="toast-item {toast.type}">
      {#if toast.type === "success"}
        <CheckCircle2 size={18} />
      {:else}
        <AlertCircle size={18} />
      {/if}
      <span>{toast.message}</span>
    </div>
  </div>
{/if}

<style>
  :global(body) {
    background-color: var(--bg-soft);
    color: var(--text-main);
  }

  .admin-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    min-height: 100vh;
  }

  /* SIDEBAR */
  .sidebar {
    background: var(--bg-card);
    color: var(--text-main);
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    border-right: 1px solid var(--border);
  }

  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 3rem;
    padding: 0 0.5rem;
  }

  .sidebar-brand .logo {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-main);
  }
  .sidebar-brand span.brand-text {
    font-weight: 600;
    color: var(--text-muted);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.875rem 1.25rem;
    border-radius: 0.75rem;
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
    font-weight: 600;
    font-size: 0.9375rem;
  }

  .nav-item:hover {
    background: var(--bg-soft);
    color: var(--primary);
  }

  .nav-item.active {
    background: var(--primary);
    color: white;
    box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.2);
  }

  .sidebar-footer {
    padding-top: 2rem;
    border-top: 1px solid var(--border);
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--text-muted);
    background: transparent;
    border: none;
    padding: 0.875rem 1.25rem;
    width: 100%;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    border-radius: 0.75rem;
  }

  .logout-btn:hover {
    background: var(--bg-soft);
    color: #ef4444;
  }

  /* MAIN CONTENT */
  .admin-main {
    padding: 2.5rem 4rem;
    overflow-y: auto;
  }

  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3rem;
  }

  .content-header h1 {
    font-size: 2.25rem;
    font-weight: 800;
    margin-bottom: 0.25rem;
    color: var(--text-main);
  }

  .content-header p {
    color: var(--text-muted);
    font-weight: 500;
  }

  /* Projects & Settings Containers */
  .projects-container,
  .settings-container {
    padding: 0;
    overflow: hidden;
  }

  .project-item {
    padding: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border);
    transition: background 0.2s;
  }
  .project-item:hover {
    background: var(--bg-soft);
  }
  .project-item.editing {
    display: block;
    background: var(--bg-soft);
  }

  .project-main-info h3 {
    margin-bottom: 0.5rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-main);
  }
  .project-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  .tag {
    font-size: 0.7rem;
    font-weight: 800;
    background: var(--bg-soft);
    color: var(--primary);
    padding: 0.25rem 0.75rem;
    border-radius: 0.5rem;
    text-transform: uppercase;
  }
  .tag-tech {
    font-size: 0.75rem;
    background: var(--bg-soft);
    color: var(--text-muted);
    padding: 0.15rem 0.5rem;
    border-radius: 0.4rem;
    border: 1px solid var(--border);
  }
  .project-desc {
    color: var(--text-muted);
    max-width: 800px;
    line-height: 1.6;
  }

  .project-item-actions {
    display: flex;
    gap: 0.75rem;
  }
  .action-btn {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border);
    border-radius: 0.875rem;
    background: var(--bg-card);
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-muted);
  }
  .action-btn:hover {
    background: var(--bg-soft);
    transform: translateY(-3px);
    color: var(--text-main);
    box-shadow: var(--shadow-sm);
  }
  .action-btn.active {
    color: var(--primary);
    border-color: var(--primary);
    background: var(--bg-soft);
  }

  /* Settings Styles */
  .settings-section {
    padding: 3rem;
  }
  .settings-section h3 {
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
  }
  .settings-section p {
    color: #64748b;
    margin-bottom: 2.5rem;
  }

  .status-presets {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-top: 1.5rem;
  }
  .preset-tag {
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .preset-tag:hover {
    background: white;
    border-color: var(--primary);
    color: var(--primary);
  }

  /* Modal & Forms Global */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 1rem;
  }
  .modal-content {
    width: 100%;
    max-width: 800px;
    padding: 3rem;
    border-radius: 2rem;
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #f1f5f9;
  }
  .modal-header h2 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #0f172a;
  }
  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #94a3b8;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  .full-width {
    grid-column: span 2;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group label {
    font-size: 0.75rem;
    font-weight: 800;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .admin-form input,
  .admin-form select,
  .admin-form textarea {
    width: 100%;
    padding: 0.875rem 1.25rem;
    border: 2px solid #f1f5f9;
    border-radius: 1rem;
    background: #f8fafc;
    font-size: 0.9375rem;
    font-weight: 600;
    color: #0f172a;
    transition: all 0.2s;
  }

  .admin-form select {
    font-family: inherit;
    cursor: pointer;
    appearance: none;
    /* Panah dropdown custom (SVG inline) supaya konsisten lintas browser. */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    padding-right: 2.75rem;
  }

  .admin-form input:focus,
  .admin-form select:focus,
  .admin-form textarea:focus {
    background: white;
    border-color: var(--primary);
    outline: none;
    box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.08);
  }

  .admin-form textarea {
    resize: vertical;
    min-height: 120px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2.5rem;
    padding-top: 2rem;
    border-top: 1px solid #f1f5f9;
  }
  .project-links-preview {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
  }
  .project-links-preview a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #f1f5f9;
    color: #64748b;
    transition: all 0.2s;
  }
  .project-links-preview a:hover {
    background: var(--primary);
    color: white;
    transform: translateY(-2px);
  }

  /* Login Specific */
  .login-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  .login-container {
    max-width: 450px;
    padding: 4rem 3rem;
    text-align: center;
  }
  .pin-input {
    font-size: 2.5rem;
    letter-spacing: 1rem;
    text-align: center;
    padding: 1.5rem !important;
  }
  .btn-login {
    height: 60px;
    font-size: 1.125rem;
    font-weight: 800;
    border-radius: 1.25rem;
    margin-top: 1rem;
  }

  /* Toast */
  .toast-container {
    position: fixed;
    top: 2rem;
    right: 2rem;
    z-index: 10001;
  }
  .toast-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem 2rem;
    background: white;
    border-radius: 1.25rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-left: 6px solid #10b981;
    font-weight: 700;
  }
  .toast-item.error {
    border-left-color: #ef4444;
  }

  /* Analytics Styles */
  .analytics-wrapper {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  .stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 1.25rem;
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }
  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .stat-label {
    display: block;
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 600;
  }
  .stat-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: #0f172a;
  }

  .analytics-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  .analytics-card {
    padding: 1.5rem;
  }
  .card-header h3 {
    font-size: 1.125rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: #0f172a;
  }

  .top-pages-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .page-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: #f8fafc;
    border-radius: 0.75rem;
  }
  .page-path {
    font-weight: 700;
    color: #334155;
  }
  .page-count {
    font-weight: 600;
    color: var(--primary);
  }

  .traffic-log {
    overflow-x: auto;
  }
  .traffic-table {
    width: 100%;
    border-collapse: collapse;
  }
  .traffic-table th {
    text-align: left;
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #64748b;
    border-bottom: 1px solid var(--border);
  }
  .traffic-table td {
    padding: 1rem;
    border-bottom: 1px solid #f1f5f9;
    font-size: 0.8125rem;
  }

  .badge-type {
    font-size: 0.625rem;
    font-weight: 800;
    padding: 0.2rem 0.5rem;
    border-radius: 0.375rem;
  }
  .badge-type.human {
    background: #dcfce7;
    color: #166534;
  }
  .badge-type.bot {
    background: #fee2e2;
    color: #991b1b;
  }

  .text-xs {
    font-size: 0.75rem;
  }
  .text-muted {
    color: #64748b;
  }
  .font-bold {
    font-weight: 700;
  }

  @media (max-width: 1024px) {
    .admin-layout {
      grid-template-columns: 1fr;
    }
    .sidebar {
      display: none;
    }
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }

  /* File Dropzone Styles */
  .dropzone {
    border: 2px dashed var(--border);
    border-radius: 0.75rem;
    padding: 2rem 1rem;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: var(--bg-soft);
    position: relative;
    cursor: pointer;
    overflow: hidden;
  }
  .dropzone:hover {
    border-color: rgba(var(--primary-rgb), 0.5);
    background: rgba(var(--primary-rgb), 0.02);
  }
  .dropzone.dragging {
    border-color: var(--primary);
    background: rgba(var(--primary-rgb), 0.05);
    transform: scale(1.02);
  }
  .file-input-hidden {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 2;
  }
  .dropzone-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    color: var(--text-muted);
    pointer-events: none;
  }
  .drop-icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
  .file-name {
    color: var(--text-main);
    font-weight: 600;
    font-size: 0.875rem;
    word-break: break-all;
    background: var(--bg-card);
    padding: 0.25rem 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid var(--primary);
  }

  /* ===== Reviews Tab ===== */
  .reviews-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* ===== Tab Pesan Masuk ===== */
  .nav-badge {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.35rem;
    height: 1.35rem;
    padding: 0 0.4rem;
    border-radius: 999px;
    background: var(--primary);
    color: #fff;
    font-size: 0.72rem;
    font-weight: 700;
  }
  .message-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .message-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 1rem;
    padding: 1.5rem;
  }
  .message-card.unread {
    border-color: color-mix(in srgb, var(--primary) 45%, transparent);
    background: color-mix(in srgb, var(--primary) 5%, var(--bg-card));
  }
  .message-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 0.85rem;
  }
  .message-head h4 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.2rem;
    font-size: 1rem;
    color: var(--text-main);
  }
  .message-email {
    font-size: 0.87rem;
    color: var(--primary);
    text-decoration: none;
  }
  .message-email:hover {
    text-decoration: underline;
  }
  .message-date {
    font-size: 0.8rem;
    color: var(--text-muted);
    white-space: nowrap;
  }
  .message-subject {
    font-weight: 600;
    color: var(--text-main);
    margin: 0 0 0.4rem;
    font-size: 0.93rem;
  }
  .message-body {
    color: var(--text-muted);
    font-size: 0.92rem;
    line-height: 1.7;
    margin: 0 0 1.15rem;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .message-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .review-block {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 1rem;
    padding: 2rem;
  }
  .review-block-desc {
    color: var(--text-muted);
    font-size: 0.92rem;
    line-height: 1.6;
    margin: 0 0 1.5rem;
  }
  .review-gen-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
  @media (max-width: 640px) {
    .review-gen-grid {
      grid-template-columns: 1fr;
    }
  }
  .link-result {
    margin-top: 1.5rem;
    padding: 1rem;
    border-radius: 0.75rem;
    background: color-mix(in srgb, #22c55e 8%, transparent);
    border: 1px solid color-mix(in srgb, #22c55e 30%, transparent);
  }
  .link-result-label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: #16a34a;
    margin-bottom: 0.6rem;
  }
  .wa-template {
    width: 100%;
    box-sizing: border-box;
    padding: 0.85rem 1rem;
    border: 1px solid var(--border);
    border-radius: 0.6rem;
    background: var(--bg-card);
    color: var(--text-main);
    font-size: 0.9rem;
    font-family: inherit;
    line-height: 1.55;
    resize: vertical;
    white-space: pre-wrap;
  }
  .wa-copy-btn {
    margin-top: 0.75rem;
    width: 100%;
    justify-content: center;
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
  }
  .copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.5rem 0.9rem;
    border: 1px solid var(--primary);
    border-radius: 0.5rem;
    background: var(--primary);
    color: #fff;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s;
  }
  .copy-btn:hover {
    background: var(--primary-hover);
  }
  .review-block-title {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1.1rem;
    margin: 0 0 1.25rem;
    color: var(--text-main);
  }
  .pending-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.4rem;
    height: 1.4rem;
    padding: 0 0.45rem;
    border-radius: 999px;
    background: var(--primary);
    color: #fff;
    font-size: 0.75rem;
    font-weight: 700;
  }
  .empty-hint {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin: 0;
  }
  .review-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .review-item {
    padding: 1.1rem;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    background: var(--bg-soft);
  }
  .review-item-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 0.6rem;
  }
  .review-role {
    color: var(--text-muted);
    font-size: 0.85rem;
  }
  .review-stars {
    display: flex;
    gap: 2px;
    margin-top: 0.35rem;
  }
  .review-project {
    font-size: 0.78rem;
    color: var(--text-muted);
    background: var(--bg-card);
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    border: 1px solid var(--border);
    white-space: nowrap;
  }
  .review-text {
    color: var(--text-main);
    font-size: 0.92rem;
    line-height: 1.55;
    font-style: italic;
    margin: 0 0 0.9rem;
  }
  .review-actions {
    display: flex;
    gap: 0.6rem;
  }
  .btn-mini {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.45rem 0.85rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-main);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.15s;
  }
  .btn-mini.approve {
    border-color: #22c55e;
    color: #16a34a;
  }
  .btn-mini.approve:hover {
    background: #22c55e;
    color: #fff;
  }
  .btn-mini.reject {
    border-color: #ef4444;
    color: #dc2626;
  }
  .btn-mini.reject:hover {
    background: #ef4444;
    color: #fff;
  }
  .token-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .token-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.9rem 1rem;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    background: var(--bg-soft);
  }
  .token-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;
  }
  .token-project {
    font-size: 0.85rem;
    color: var(--text-muted);
  }
  .token-meta {
    margin-top: 0.3rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .chip {
    display: inline-block;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
  }
  .chip.active {
    background: color-mix(in srgb, #22c55e 15%, transparent);
    color: #16a34a;
  }
  .chip.used {
    background: color-mix(in srgb, #64748b 15%, transparent);
    color: var(--text-muted);
  }
  .chip.expired {
    background: color-mix(in srgb, #ef4444 15%, transparent);
    color: #dc2626;
  }
  .chip.linked {
    background: color-mix(in srgb, var(--primary) 15%, transparent);
    color: var(--primary);
  }
  /* Dropdown penaut project di tiap baris link review. */
  .token-link-form {
    display: flex;
  }
  .token-project-select {
    max-width: 190px;
    padding: 0.4rem 2rem 0.4rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    background: var(--bg-card);
    color: var(--text-main);
    font-family: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.6rem center;
    transition: border-color 0.15s;
  }
  .token-project-select:hover,
  .token-project-select:focus {
    border-color: var(--primary);
    outline: none;
  }
  .token-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
    flex-shrink: 0;
  }
</style>
