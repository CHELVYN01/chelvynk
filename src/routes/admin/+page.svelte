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
    } from "lucide-svelte";
    import { fade, slide, fly } from "svelte/transition";

    let {
        data,
        form,
    }: { data: { projects: any[]; authenticated: boolean }; form: any } =
        $props();

    let editingId = $state(null);
    let isAddModalOpen = $state(false);

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
        } else if (form?.error) {
            showToast(form.error, "error");
        }
    });

    const handleUpdateResult = (result: any) => {
        if (result.type === "success") {
            editingId = null;
            showToast("Perubahan berhasil disimpan!");
        }
    };

    const handleDeleteResult = (result: any) => {
        if (result.type === "success") {
            showToast("Project berhasil dihapus");
        }
    };
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
                    <label for="pin" class="pin-label">PIN Keamanan</label>
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
                <button type="submit" class="btn btn-primary w-full btn-login"
                    >Buka Dashboard</button
                >
            </form>
        </div>
    {:else}
        <header class="admin-header fade-in">
            <div class="admin-title-row">
                <div class="title-group">
                    <h1>Dashboard <span class="text-orange">Project</span></h1>
                    <span class="project-count"
                        >{data.projects.length} Project Tersimpan</span
                    >
                </div>
                <div class="header-actions">
                    <button
                        class="btn btn-primary"
                        onclick={() => (isAddModalOpen = true)}
                        style="gap: 0.5rem;"
                    >
                        <PlusCircle size={18} />
                        Tambah Project
                    </button>
                    <form method="POST" action="?/logout" use:enhance>
                        <button
                            type="submit"
                            class="btn btn-outline"
                            title="Keluar"
                        >
                            <LogOut size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </header>

        <section class="admin-content">
            <!-- Modal Tambah Project -->
            {#if isAddModalOpen}
                <div
                    class="modal-overlay"
                    role="button"
                    tabindex="-1"
                    transition:fade={{ duration: 200 }}
                    onclick={(e) => {
                        if (e.target === e.currentTarget)
                            isAddModalOpen = false;
                    }}
                    onkeydown={(e) => {
                        if (e.key === "Escape") isAddModalOpen = false;
                    }}
                >
                    <div
                        class="modal-content card"
                        transition:fly={{ y: 20, duration: 300 }}
                    >
                        <div class="modal-header">
                            <h2>Tambah Project Baru</h2>
                            <button
                                class="close-btn"
                                onclick={() => (isAddModalOpen = false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form
                            method="POST"
                            action="?/addProject"
                            use:enhance={() => {
                                return async ({ result, update }) => {
                                    if (result.type === "success") {
                                        isAddModalOpen = false;
                                        showToast(
                                            "Project baru berhasil ditambahkan!",
                                        );
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
                                    <label for="link">Link Website</label>
                                    <input
                                        type="text"
                                        id="link"
                                        name="link"
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
                                    onclick={() => (isAddModalOpen = false)}
                                    >Batal</button
                                >
                                <button type="submit" class="btn btn-primary"
                                    >Simpan Project</button
                                >
                            </div>
                        </form>
                    </div>
                </div>
            {/if}

            <!-- Daftar Project -->
            <div class="card projects-container fade-in delay-1">
                <div class="container-header">
                    <h2>Daftar Project</h2>
                    <p>Kelola semua karya bapak di sini.</p>
                </div>
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
                                    use:enhance={() => {
                                        return async ({ result, update }) => {
                                            if (result.type === "success") {
                                                editingId = null;
                                                showToast(
                                                    "Perubahan berhasil disimpan!",
                                                );
                                            }
                                            await update();
                                        };
                                    }}
                                    class="edit-inline-form"
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
                                    <div class="project-tags">
                                        <span class="tag"
                                            >{project.category}</span
                                        >
                                        {#if project.tech}
                                            {#each project.tech.split(",") as t}
                                                <span class="tag-tech"
                                                    >{t.trim()}</span
                                                >
                                            {/each}
                                        {/if}
                                    </div>
                                    <h3>{project.title}</h3>
                                    <p class="project-desc">
                                        {project.description}
                                    </p>
                                </div>

                                <div class="project-item-actions">
                                    <form
                                        method="POST"
                                        action="?/toggleFeatured"
                                        use:enhance={() => {
                                            return async ({
                                                result,
                                                update,
                                            }) => {
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
                                        <input
                                            type="hidden"
                                            name="id"
                                            value={project.id}
                                        />
                                        <input
                                            type="hidden"
                                            name="featured"
                                            value={project.featured}
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

                                    <form
                                        method="POST"
                                        action="?/deleteProject"
                                        use:enhance={() => {
                                            return async ({
                                                result,
                                                update,
                                            }) => {
                                                if (result.type === "success") {
                                                    showToast(
                                                        "Project berhasil dihapus",
                                                    );
                                                }
                                                await update();
                                            };
                                        }}
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
                                            <Trash2 size={18} />
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
</div>

<style>
    .admin-page {
        padding: 8rem 0;
    }
    .login-container {
        max-width: 450px;
        margin: 6rem auto;
        padding: 3.5rem 2.5rem;
        text-align: center;
        border-radius: 2rem;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    }
    .login-container h1 {
        font-size: 2.25rem;
        font-weight: 800;
        margin-bottom: 0.75rem;
        color: #0f172a;
    }
    .login-container p {
        color: #64748b;
        margin-bottom: 2.5rem;
        font-size: 1rem;
    }

    .pin-label {
        display: block;
        margin-bottom: 1rem;
        font-weight: 700;
        font-size: 0.875rem;
        color: #334155;
    }

    .pin-input {
        text-align: center;
        font-size: 2.5rem;
        letter-spacing: 1rem;
        padding: 1.25rem !important;
        width: 100% !important;
        max-width: 320px;
        margin: 0 auto 2rem;
        border: none !important;
        background: #f8fafc !important;
        border-radius: 1.25rem !important;
        transition: all 0.3s ease;
        color: #0f172a;
    }

    .pin-input:focus {
        background: white !important;
        box-shadow:
            0 0 0 3px rgba(249, 115, 22, 0.1),
            0 10px 20px rgba(0, 0, 0, 0.05) !important;
    }

    .btn-login {
        height: 56px;
        font-size: 1.125rem;
        font-weight: 700;
        border-radius: 1rem;
        box-shadow: 0 8px 20px rgba(249, 115, 22, 0.3);
    }

    .admin-header {
        margin-bottom: 2.5rem;
    }
    .admin-title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1.5rem;
    }
    .title-group h1 {
        font-size: 2.25rem;
        margin-bottom: 0.25rem;
    }
    .project-count {
        font-size: 0.875rem;
        color: var(--text-muted);
        font-weight: 500;
        background: #f1f5f9;
        padding: 0.35rem 0.85rem;
        border-radius: 2rem;
    }
    .header-actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
    }

    .projects-container {
        padding: 0;
        overflow: hidden;
    }
    .container-header {
        padding: 1.5rem 2rem;
        border-bottom: 1px solid var(--border);
        background: #fafafa;
    }
    .container-header h2 {
        font-size: 1.125rem;
        margin: 0;
        font-weight: 700;
        border-bottom: none;
    }
    .container-header p {
        font-size: 0.875rem;
        color: var(--text-muted);
    }

    /* Modal Overlay */
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.7);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 1rem;
    }
    .modal-content {
        width: 100%;
        max-width: 750px;
        position: relative;
        padding: 2.5rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }
    .modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
        border-bottom: none;
    }
    .close-btn {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 0.5rem;
    }
    .close-btn:hover {
        background: #f1f5f9;
        color: #000;
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
        font-size: 0.875rem;
        font-weight: 600;
    }
    .form-group input,
    .form-group textarea {
        padding: 0.75rem 1rem;
        border: 1px solid var(--border);
        border-radius: 0.75rem;
        font-family: inherit;
        background: #f8fafc;
    }
    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border);
    }

    /* Project Items */
    .project-item {
        padding: 1.75rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border);
    }
    .project-item:last-child {
        border-bottom: none;
    }
    .project-item.editing {
        display: block;
        background: #fcfcfd;
    }
    .project-main-info h3 {
        margin-bottom: 0.25rem;
        font-size: 1.125rem;
        font-weight: 700;
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
        background: #f9f2ed;
        color: var(--primary);
        padding: 0.2rem 0.6rem;
        border-radius: 0.5rem;
        text-transform: uppercase;
    }
    .tag-tech {
        font-size: 0.75rem;
        background: #f1f5f9;
        color: #64748b;
        padding: 0.15rem 0.5rem;
        border-radius: 0.4rem;
        border: 1px solid var(--border);
    }
    .project-desc {
        color: var(--text-muted);
        font-size: 0.9375rem;
        max-width: 750px;
        line-height: 1.5;
    }

    .project-item-actions {
        display: flex;
        gap: 0.75rem;
    }
    .action-btn {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border);
        border-radius: 0.75rem;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
    }
    .action-btn:hover {
        background: #f8fafc;
        transform: translateY(-2px);
    }
    .action-btn.active {
        color: var(--primary);
        border-color: var(--primary);
        background: #fff7ed;
    }
    .btn-delete-icon:hover {
        border-color: #fca5a5;
        color: #ef4444;
        background: #fef2f2;
    }

    /* Edit Form */
    .edit-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }
    .edit-grid textarea {
        grid-column: span 2;
        min-height: 100px;
    }
    .edit-grid input,
    .edit-grid textarea {
        padding: 0.75rem 1rem;
        border: 1px solid var(--border);
        border-radius: 0.75rem;
        font-family: inherit;
    }
    .edit-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }

    /* Toast */
    .toast-container {
        position: fixed;
        top: 2rem;
        right: 2rem;
        z-index: 10000;
    }
    .toast-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        background: white;
        border-radius: 1rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--border);
        font-weight: 600;
    }
    .toast-item.success {
        border-left: 4px solid #10b981;
    }
    .toast-item.error {
        border-left: 4px solid #ef4444;
    }

    .empty-state {
        text-align: center;
        padding: 4rem;
        color: var(--text-muted);
    }

    @media (max-width: 768px) {
        .admin-title-row {
            flex-direction: column;
            align-items: stretch;
        }
        .project-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
        }
        .edit-grid,
        .form-grid {
            grid-template-columns: 1fr;
        }
        .edit-grid textarea,
        .full-width {
            grid-column: span 1;
        }
        .modal-content {
            padding: 1.5rem;
        }
    }
</style>
