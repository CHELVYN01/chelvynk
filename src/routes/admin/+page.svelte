<script lang="ts">
    import { enhance } from "$app/forms";
    let {
        data,
        form,
    }: { data: { projects: any[]; authenticated: boolean }; form: any } =
        $props();
    let editingId = $state(null);
</script>

<div class="admin-page container">
    {#if !data.authenticated}
        <div class="login-container card fade-in">
            <h1>Admin Login</h1>
            <p>Masukkan PIN untuk mengelola project.</p>

            {#if form?.error}
                <div class="alert alert-error">{form.error}</div>
            {/if}

            <form method="POST" action="?/login" use:enhance class="admin-form">
                <div class="form-group">
                    <label for="pin">PIN Keamanan</label>
                    <input
                        type="password"
                        id="pin"
                        name="pin"
                        placeholder="****"
                        required
                        maxlength="4"
                        class="pin-input"
                    />
                </div>
                <button type="submit" class="btn btn-primary w-full"
                    >Buka Dashboard</button
                >
            </form>
        </div>
    {:else}
        <header class="admin-header fade-in">
            <div class="admin-title-row">
                <h1>Dashboard <span class="text-orange">Project</span></h1>
                <form method="POST" action="?/logout" use:enhance>
                    <button type="submit" class="btn btn-outline btn-sm"
                        >Keluar</button
                    >
                </form>
            </div>
            <p>Kelola daftar project portofolio Anda di sini.</p>
        </header>

        {#if form?.error}
            <div class="alert alert-error">{form.error}</div>
        {/if}
        {#if form?.success}
            <div class="alert alert-success">Project berhasil disimpan!</div>
        {/if}

        <section class="admin-grid-full">
            <div class="card admin-card fade-in delay-1">
                <h2>Tambah Project Baru</h2>
                <form
                    method="POST"
                    action="?/addProject"
                    use:enhance
                    class="admin-form"
                >
                    <div class="form-group-horizontal">
                        <label for="title">Judul Project</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="Contoh: E-Commerce App"
                            required
                        />
                    </div>
                    <div class="form-group-horizontal">
                        <label for="category">Kategori</label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            placeholder="Contoh: Web App / Odoo Module"
                            required
                        />
                    </div>
                    <div class="form-group-horizontal">
                        <label for="tech">Teknologi</label>
                        <input
                            type="text"
                            id="tech"
                            name="tech"
                            placeholder="Svelte, Bun, SQLite"
                        />
                    </div>
                    <div class="form-group-horizontal">
                        <label for="link">Link Demo</label>
                        <input
                            type="text"
                            id="link"
                            name="link"
                            placeholder="https://github.com/..."
                        />
                    </div>
                    <div class="form-group-horizontal">
                        <label for="description">Deskripsi</label>
                        <textarea
                            id="description"
                            name="description"
                            rows="3"
                            placeholder="Jelaskan tentang project ini..."
                            required
                        ></textarea>
                    </div>
                    <div class="form-group-horizontal">
                        <div></div>
                        <button type="submit" class="btn btn-primary"
                            >Simpan Project</button
                        >
                    </div>
                </form>
            </div>

            <!-- Daftar Project -->
            <div
                class="card admin-card fade-in delay-2"
                style="margin-top: 2rem;"
            >
                <h2>Daftar Project ({data.projects.length})</h2>
                <div class="project-list">
                    {#each data.projects as project}
                        <div
                            class="project-item {editingId === project.id
                                ? 'editing'
                                : ''}"
                        >
                            {#if editingId === project.id}
                                <form
                                    method="POST"
                                    action="?/updateProject"
                                    use:enhance
                                    class="edit-inline-form"
                                    onsubmit={() => (editingId = null)}
                                >
                                    <input
                                        type="hidden"
                                        name="id"
                                        value={project.id}
                                    />
                                    <div class="edit-grid">
                                        <input
                                            type="text"
                                            name="title"
                                            value={project.title}
                                            placeholder="Judul"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="category"
                                            value={project.category}
                                            placeholder="Kategori"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="tech"
                                            value={project.tech}
                                            placeholder="Teknologi"
                                        />
                                        <input
                                            type="text"
                                            name="link"
                                            value={project.link}
                                            placeholder="Link"
                                        />
                                        <textarea
                                            name="description"
                                            placeholder="Deskripsi"
                                            required
                                            >{project.description}</textarea
                                        >
                                    </div>
                                    <div class="edit-actions">
                                        <button
                                            type="submit"
                                            class="btn btn-primary sm"
                                            >Simpan</button
                                        >
                                        <button
                                            type="button"
                                            class="btn btn-outline sm"
                                            onclick={() => (editingId = null)}
                                            >Batal</button
                                        >
                                    </div>
                                </form>
                            {:else}
                                <div class="project-main-info">
                                    <h3>{project.title}</h3>
                                    <span class="tag">{project.category}</span>
                                </div>

                                <div class="project-item-actions">
                                    <form
                                        method="POST"
                                        action="?/toggleFeatured"
                                        use:enhance
                                    >
                                        <input
                                            type="hidden"
                                            name="id"
                                            value={project.id}
                                        />
                                        <input
                                            type="hidden"
                                            name="featured"
                                            value={project.featured === 1
                                                ? "false"
                                                : "true"}
                                        />
                                        <button
                                            type="submit"
                                            class="action-btn {project.featured ===
                                            1
                                                ? 'active'
                                                : ''}"
                                            title={project.featured === 1
                                                ? "Hapus dari Home"
                                                : "Tampilkan di Home"}
                                        >
                                            {project.featured === 1
                                                ? "⭐"
                                                : "☆"}
                                        </button>
                                    </form>

                                    <button
                                        type="button"
                                        class="action-btn"
                                        onclick={() => (editingId = project.id)}
                                        title="Edit Project"
                                    >
                                        ✍️
                                    </button>

                                    <form
                                        method="POST"
                                        action="?/deleteProject"
                                        use:enhance
                                    >
                                        <input
                                            type="hidden"
                                            name="id"
                                            value={project.id}
                                        />
                                        <button
                                            type="submit"
                                            class="action-btn btn-delete-icon"
                                            title="Hapus Project"
                                            onclick={(e) =>
                                                !confirm(
                                                    "Hapus project ini?",
                                                ) && e.preventDefault()}
                                        >
                                            🗑️
                                        </button>
                                    </form>
                                </div>
                            {/if}
                        </div>
                    {/each}

                    {#if data.projects.length === 0}
                        <p class="empty-state">
                            Belum ada project yang ditambahkan.
                        </p>
                    {/if}
                </div>
            </div>
        </section>
    {/if}
</div>

<style>
    .admin-page {
        padding: 8rem 0;
    }
    .login-container {
        max-width: 400px;
        margin: 4rem auto;
        padding: 3rem 2rem;
        text-align: center;
    }
    .login-container h1 {
        font-size: 1.75rem;
        margin-bottom: 0.5rem;
    }
    .login-container p {
        color: var(--text-muted);
        margin-bottom: 2rem;
    }

    .pin-input {
        text-align: center;
        font-size: 2rem;
        letter-spacing: 0.8rem;
        padding: 1rem !important;
        width: 200px !important;
        margin: 0 auto;
        border: 2px solid var(--border) !important;
    }

    .admin-header {
        margin-bottom: 3rem;
    }
    .admin-title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    .admin-header h1 {
        font-size: 2.5rem;
    }
    .text-orange {
        color: var(--primary);
    }

    .admin-card {
        padding: 2rem;
    }

    .admin-card h2 {
        font-size: 1.25rem;
        margin-bottom: 2rem;
        border-bottom: 2px solid var(--border);
        padding-bottom: 1rem;
    }

    .admin-grid-full {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .admin-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .form-group-horizontal {
        display: grid;
        grid-template-columns: 180px 1fr;
        align-items: center;
        gap: 2rem;
    }

    .form-group-horizontal label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-main);
    }

    .form-group-horizontal input,
    .form-group-horizontal textarea {
        padding: 0.75rem 1rem;
        border: 1px solid var(--border);
        border-radius: 0.75rem;
        font-family: inherit;
        font-size: 0.9375rem;
        background: #fcfcfd;
        width: 100%;
    }

    .form-group-horizontal input:focus,
    .form-group-horizontal textarea:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }

    @media (max-width: 640px) {
        .form-group-horizontal {
            grid-template-columns: 1fr;
            gap: 0.5rem;
        }
    }

    .w-full {
        width: 100%;
    }
    .alert {
        padding: 1rem;
        border-radius: 0.75rem;
        margin-bottom: 2rem;
        font-size: 0.875rem;
        font-weight: 600;
    }
    .alert-error {
        background: #fee2e2;
        color: #b91c1c;
    }
    .alert-success {
        background: #dcfce7;
        color: #15803d;
    }

    .project-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .project-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        background: #f8fafc;
        border-radius: 1rem;
        border: 1px solid var(--border);
        transition: all 0.2s ease;
    }
    .project-item.editing {
        flex-direction: column;
        align-items: stretch;
        background: white;
        border-color: var(--primary);
        box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.1);
    }
    .project-main-info h3 {
        font-size: 1.125rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }
    .project-item-actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
    }
    .action-btn {
        background: white;
        border: 1px solid var(--border);
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.75rem;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 1.1rem;
    }
    .action-btn:hover {
        background: #f1f5f9;
        transform: translateY(-2px);
        border-color: #cbd5e1;
    }
    .action-btn.active {
        background: rgba(249, 115, 22, 0.05);
        border-color: var(--primary);
    }
    .btn-delete-icon:hover {
        background: #fef2f2;
        border-color: #fecaca;
    }

    /* Edit Inline Form */
    .edit-inline-form {
        width: 100%;
    }
    .edit-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1.25rem;
    }
    .edit-grid input,
    .edit-grid textarea {
        padding: 0.75rem 1rem;
        border: 1px solid var(--border);
        border-radius: 0.75rem;
        font-family: inherit;
        font-size: 0.9375rem;
    }
    .edit-grid textarea {
        grid-column: span 2;
        min-height: 100px;
    }
    .edit-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
    }
    .btn.sm {
        padding: 0.5rem 1.25rem;
        font-size: 0.875rem;
    }

    .tag {
        font-size: 0.75rem;
        background: white;
        padding: 0.3rem 0.75rem;
        border-radius: 2rem;
        color: var(--primary);
        font-weight: 700;
        border: 1px solid var(--border);
    }

    .empty-state {
        text-align: center;
        color: var(--text-muted);
        padding: 2rem 0;
    }

    @media (max-width: 768px) {
        .admin-grid-full {
            grid-template-columns: 1fr;
        }
        .edit-grid {
            grid-template-columns: 1fr;
        }
        .edit-grid textarea {
            grid-column: span 1;
        }
    }
</style>
