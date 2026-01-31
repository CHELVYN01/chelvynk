<script lang="ts">
    let { data } = $props();
    const projects = $derived(data.projects);
</script>

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
                        <a href={project.link} class="project-link"
                            >Lihat Demo →</a
                        >
                    </div>
                </div>
            {/each}
        </div>
    </section>
</div>

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
        padding: 2.5rem;
    }

    .project-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
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

    .project-link {
        font-weight: 600;
        color: var(--primary);
        font-size: 0.9375rem;
    }
</style>
