<script lang="ts">
  import { Github, Play, Globe, X, ArrowRight } from "lucide-svelte";
  import { fade, scale } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { formatUrl } from "$lib/url";

  // Modal detail project (dipakai di home & /projects).
  // Render hanya saat ada project terpilih: {#if p}<ProjectModal ... />{/if}
  let { project, onclose }: { project: any; onclose: () => void } = $props();

  // Kunci scroll body selama modal terbuka
  $effect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  });
</script>

<svelte:window onkeydown={(e) => e.key === "Escape" && onclose()} />

<div class="modal-backdrop" transition:fade={{ duration: 200 }}>
  <button class="modal-overlay-btn" aria-label="Tutup detail" onclick={onclose}
  ></button>
  <div
    class="modal-panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
    transition:scale={{ duration: 280, start: 0.96, opacity: 0, easing: quintOut }}
  >
    <button class="modal-close" onclick={onclose} aria-label="Tutup detail">
      <X size={18} />
    </button>

    <p class="mono modal-tags">{project.categories.join(" / ")}</p>

    <h3 id="modal-title" class="modal-title">{project.title}</h3>

    <div class="modal-body">
      <p class="modal-desc">{project.description}</p>

      {#if project.tech.length > 0}
        <div class="modal-section">
          <h4 class="mono">Teknologi</h4>
          <ul class="mono modal-tech">
            {#each project.tech as t}
              <li>{t}</li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if project.slug}
        <a href="/projects/{project.slug}" class="btn-text modal-more" onclick={onclose}>
          Baca selengkapnya <ArrowRight size={14} />
        </a>
      {/if}
    </div>

    {#if project.link || project.github || project.demo}
      <div class="modal-actions">
        {#if project.link}
          <a
            href={formatUrl(project.link)}
            class="btn-solid"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Globe size={16} /> Website
          </a>
        {/if}
        {#if project.github}
          <a
            href={formatUrl(project.github)}
            class="btn-line"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={16} /> Source Code
          </a>
        {/if}
        {#if project.demo}
          <a
            href={formatUrl(project.demo)}
            class="btn-line"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Play size={16} /> Demo
          </a>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    background: color-mix(in srgb, var(--bg-white) 70%, transparent);
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
    max-width: 640px;
    max-height: 88vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-white);
    border: 1px solid var(--text-main);
    padding: 2.5rem;
  }

  .modal-close {
    position: absolute;
    top: 0;
    right: 0;
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    border: none;
    border-left: 1px solid var(--text-main);
    border-bottom: 1px solid var(--text-main);
    background: transparent;
    color: var(--text-main);
    cursor: pointer;
    transition:
      background 0.2s ease,
      color 0.2s ease;
  }

  .modal-close:hover {
    background: var(--primary);
    color: var(--on-primary);
  }

  .modal-tags {
    color: var(--text-muted);
    margin-bottom: 1rem;
    padding-right: 3rem;
  }

  .modal-title {
    font-family: var(--font-serif);
    font-weight: 400;
    font-size: clamp(1.75rem, 3.5vw, 2.5rem);
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin-bottom: 1.5rem;
    padding-right: 2rem;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
  }

  .modal-desc {
    font-family: var(--font-serif);
    font-size: 1.1rem;
    line-height: 1.6;
    color: var(--text-muted);
    white-space: pre-line;
    margin-bottom: 2rem;
  }

  .modal-section h4 {
    color: var(--text-main);
    padding-bottom: 0.75rem;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid var(--border);
  }

  .modal-tech {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1.25rem;
    color: var(--text-muted);
  }

  .modal-more {
    margin-top: 2rem;
  }

  .modal-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 2rem;
    padding-top: 1.75rem;
    border-top: 1px solid var(--border);
  }

  .modal-actions a {
    flex: 1;
    min-width: 150px;
  }

  @media (max-width: 768px) {
    .modal-panel {
      padding: 2rem 1.25rem 1.5rem;
      max-height: 90vh;
    }

    .modal-actions a {
      flex: 1 1 100%;
    }
  }
</style>
