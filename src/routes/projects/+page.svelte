<script lang="ts">
    import { Globe, Github, Play, X, ArrowUpRight } from "lucide-svelte";
    import { fade, scale } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    let { data } = $props();
    const projects = $derived(data.projects);

    const formatUrl = (url: string) => {
        if (!url) return "#";
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        return `https://${url}`;
    };

    // --- Project Detail Modal ---
    let selectedProject = $state<any>(null);

    function openProject(project: any) {
        selectedProject = project;
    }

    function closeProject() {
        selectedProject = null;
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") closeProject();
    }

    // Kunci scroll body saat modal terbuka
    $effect(() => {
        if (typeof document === "undefined") return;
        document.body.style.overflow = selectedProject ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    });
</script>

<svelte:head>
    <!-- prettier-ignore -->
    <title>Portofolio Project — Chelvyn Kleden | Odoo, Laravel & Web Developer</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="projects-page">
    <section class="page-header container">
        <a href="/" class="back-link">← Kembali ke Home</a>
        <h1>Semua <span class="text-orange">Project</span></h1>
        <p>
            Kumpulan lengkap dari berbagai solusi digital yang telah saya
            bangun.
        </p>
    </section>

    <section class="container">
        <div class="project-grid">
            {#each projects as project, i (project.id)}
                <div
                    class="card project-card fade-in"
                    role="button"
                    tabindex="0"
                    aria-label={`Lihat detail project ${project.title}`}
                    onclick={() => openProject(project)}
                    onkeydown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openProject(project);
                        }
                    }}
                >
                    <span class="project-index" aria-hidden="true"
                        >{String(i + 1).padStart(2, "0")}</span
                    >
                    <div class="project-info">
                        <div class="project-tags">
                            {#each project.categories as cat}
                                <span class="project-cat">{cat}</span>
                            {/each}
                        </div>
                        <h3>{project.title}</h3>
                        <p class="project-desc">{project.description}</p>
                        <div class="project-tech">
                            {#each project.tech.slice(0, 4) as t}
                                <span>{t}</span>
                            {/each}
                            {#if project.tech.length > 4}
                                <span class="tech-more"
                                    >+{project.tech.length - 4}</span
                                >
                            {/if}
                        </div>
                        <div class="project-footer">
                            <div class="project-mini-links">
                                {#if project.link}
                                    <a
                                        href={formatUrl(project.link)}
                                        class="mini-link-btn"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Kunjungi Website"
                                        onclick={(e) => e.stopPropagation()}
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
                                        onclick={(e) => e.stopPropagation()}
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
                                        onclick={(e) => e.stopPropagation()}
                                    >
                                        <Play size={18} />
                                    </a>
                                {/if}
                            </div>
                            <span class="detail-cta">
                                Detail <ArrowUpRight size={16} />
                            </span>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </section>
</div>

{#if selectedProject}
    <div class="modal-backdrop" transition:fade={{ duration: 200 }}>
        <button
            class="modal-overlay-btn"
            aria-label="Tutup detail"
            onclick={closeProject}
        ></button>
        <div
            class="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            tabindex="-1"
            transition:scale={{
                duration: 280,
                start: 0.94,
                opacity: 0,
                easing: quintOut,
            }}
        >
            <button
                class="modal-close"
                onclick={closeProject}
                aria-label="Tutup detail"
            >
                <X size={20} />
            </button>

            <div class="modal-tags">
                {#each selectedProject.categories as cat}
                    <span class="project-cat">{cat}</span>
                {/each}
            </div>

            <h3 id="modal-title" class="modal-title">
                {selectedProject.title}
            </h3>

            <div class="modal-body">
                <p class="modal-desc">{selectedProject.description}</p>

                {#if selectedProject.tech.length > 0}
                    <div class="modal-section">
                        <h4>Teknologi</h4>
                        <div class="project-tech">
                            {#each selectedProject.tech as t}
                                <span>{t}</span>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>

            {#if selectedProject.link || selectedProject.github || selectedProject.demo}
                <div class="modal-actions">
                    {#if selectedProject.link}
                        <a
                            href={formatUrl(selectedProject.link)}
                            class="btn btn-primary"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Globe size={18} /> Kunjungi Website
                        </a>
                    {/if}
                    {#if selectedProject.github}
                        <a
                            href={formatUrl(selectedProject.github)}
                            class="btn btn-outline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Github size={18} /> Source Code
                        </a>
                    {/if}
                    {#if selectedProject.demo}
                        <a
                            href={formatUrl(selectedProject.demo)}
                            class="btn btn-outline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Play size={18} /> Demo
                        </a>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .projects-page {
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
    .text-orange {
        color: var(--primary);
    }

    .project-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 2rem;
    }

    .project-card {
        position: relative;
        padding: 2rem;
        display: flex;
        cursor: pointer;
        overflow: hidden;
        outline: none;
    }

    /* Garis aksen gradient di atas kartu, muncul saat hover */
    .project-card::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--primary), var(--accent));
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .project-card:hover::before,
    .project-card:focus-visible::before {
        transform: scaleX(1);
    }

    .project-card:focus-visible {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.25);
    }

    .project-info {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
        z-index: 1;
    }

    /* Nomor index dekoratif di pojok kanan atas */
    .project-index {
        position: absolute;
        top: 1.25rem;
        right: 1.5rem;
        font-size: 2.75rem;
        font-weight: 800;
        line-height: 1;
        color: var(--text-main);
        opacity: 0.06;
        letter-spacing: -0.03em;
        transition:
            opacity 0.3s ease,
            color 0.3s ease;
        pointer-events: none;
    }

    .project-card:hover .project-index,
    .project-card:focus-visible .project-index {
        opacity: 0.14;
        color: var(--primary);
    }

    .project-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
    }

    .project-cat {
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--primary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 0.25rem 0.65rem;
        background: #fff7ed;
        border: 1px solid #ffedd5;
        border-radius: 2rem;
        display: inline-block;
    }

    :global(.dark) .project-cat {
        background: rgba(251, 146, 60, 0.12);
        border-color: rgba(251, 146, 60, 0.2);
    }

    .project-card h3 {
        margin-bottom: 0.75rem;
        padding-right: 2.5rem;
        font-size: 1.35rem;
        transition: color 0.25s ease;
    }

    .project-card:hover h3,
    .project-card:focus-visible h3 {
        color: var(--primary);
    }

    .project-desc {
        color: var(--text-muted);
        font-size: 0.9375rem;
        line-height: 1.65;
        margin-bottom: 1.5rem;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        line-clamp: 3;
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

    :global(.dark) .project-tech span {
        background: rgba(255, 255, 255, 0.03);
    }

    .project-tech span.tech-more {
        background: transparent;
        border-color: transparent;
        color: var(--primary);
        font-weight: 700;
    }

    .project-footer {
        margin-top: auto;
        padding-top: 1.25rem;
        border-top: 1px solid var(--border);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
    }

    .project-mini-links {
        display: flex;
        gap: 0.75rem;
        align-items: center;
    }

    .detail-cta {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-muted);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        white-space: nowrap;
    }

    .detail-cta :global(svg) {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .project-card:hover .detail-cta,
    .project-card:focus-visible .detail-cta {
        color: var(--primary);
    }

    .project-card:hover .detail-cta :global(svg),
    .project-card:focus-visible .detail-cta :global(svg) {
        transform: translate(2px, -2px);
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

    :global(.dark) .mini-link-btn {
        background: rgba(251, 146, 60, 0.1);
        border-color: rgba(251, 146, 60, 0.2);
    }

    /* ===== Project Detail Modal ===== */
    .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        background: rgba(15, 23, 42, 0.55);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
    }

    .modal-overlay-btn {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        border: none;
        padding: 0;
        margin: 0;
        cursor: pointer;
    }

    .modal-panel {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 620px;
        max-height: 88vh;
        display: flex;
        flex-direction: column;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 1.75rem;
        padding: 2.5rem;
        box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.4);
    }

    .modal-close {
        position: absolute;
        top: 1.25rem;
        right: 1.25rem;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border);
        background: var(--bg-soft);
        color: var(--text-muted);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.25s ease;
    }

    .modal-close:hover {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
        transform: rotate(90deg);
    }

    .modal-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
        padding-right: 3rem;
    }

    .modal-title {
        font-size: clamp(1.5rem, 3vw, 2rem);
        margin-bottom: 1.5rem;
        padding-right: 2rem;
        line-height: 1.2;
    }

    .modal-body {
        flex: 1;
        overflow-y: auto;
        margin: 0 -0.5rem;
        padding: 0 0.5rem;
    }

    .modal-desc {
        color: var(--text-muted);
        font-size: 1rem;
        line-height: 1.75;
        white-space: pre-line;
        margin-bottom: 2rem;
    }

    .modal-section h4 {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-main);
        margin-bottom: 0.85rem;
    }

    .modal-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 2rem;
        padding-top: 1.75rem;
        border-top: 1px solid var(--border);
    }

    .modal-actions .btn {
        gap: 0.5rem;
        flex: 1;
        min-width: 150px;
    }

    /* Scrollbar halus untuk modal */
    .modal-body::-webkit-scrollbar {
        width: 6px;
    }
    .modal-body::-webkit-scrollbar-thumb {
        background: var(--border);
        border-radius: 3px;
    }

    @media (max-width: 768px) {
        .page-header {
            padding: 6rem 0 2rem;
            text-align: center;
        }
        .page-header h1 {
            font-size: 2.25rem;
        }
        .project-grid {
            grid-template-columns: 1fr;
            padding: 0 0.5rem;
        }
    }

    @media (max-width: 480px) {
        .page-header h1 {
            font-size: 1.875rem;
        }
        .modal-panel {
            padding: 1.75rem 1.25rem;
            border-radius: 1.25rem;
            max-height: 90vh;
        }
        .modal-actions .btn {
            flex: 1 1 100%;
        }
    }
</style>
