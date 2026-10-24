<script lang="ts">
  import { ArrowLeft, ArrowRight, ArrowUpRight, Github, Globe, Play } from "lucide-svelte";
  import { reveal } from "$lib/reveal";
  import { exitProgress, pageProgress, scramble, inview } from "$lib/motion";
  import { formatUrl } from "$lib/url";
  import ClosingCta from "$lib/components/ClosingCta.svelte";

  // Halaman per project — sebelumnya project hanya tampil di modal, jadi tidak
  // punya URL sendiri untuk diindeks Google / dikutip mesin pencari AI.
  let { data } = $props();
  const project = $derived(data.project);

  const pad = (n: number) => String(n).padStart(2, "0");

  const paragraphs = $derived(
    String(project.description ?? "")
      .split(/\r?\n\s*\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean),
  );

  const sec = $derived.by(() => {
    let i = 0;
    return {
      // paragraf pertama sudah jadi lead di hero
      detail: paragraphs.length > 1 ? ++i : 0,
      tech: project.tech.length ? ++i : 0,
    };
  });
</script>

<div class="page-progress" use:pageProgress aria-hidden="true"></div>

<article>
  <!-- ===== Hero ===== -->
  <section class="pj-hero" use:exitProgress>
    <div class="container">
      <nav class="mono pj-top intro" style="--d: 0.1s" aria-label="Breadcrumb">
        <a href="/projects" class="back"><ArrowLeft size={14} /> Semua Project</a>
        <span use:scramble={300}>(Project {pad(data.number)} / {pad(data.total)})</span>
      </nav>

      <h1 class="pj-title intro" style="--d: 0.25s">{project.title}</h1>

      <div class="pj-foot">
        <div class="mono pj-meta intro" style="--d: 0.9s">
          {#each project.categories as cat}
            <span>{cat}</span>
          {/each}
          {#if project.tech.length}
            <span class="pj-meta-muted">{project.tech.slice(0, 4).join(" · ")}</span>
          {/if}
        </div>

        <div class="intro" style="--d: 1.05s">
          <p class="pj-lead">{paragraphs[0] ?? ""}</p>
          <div class="pj-btns">
            {#if project.link}
              <a
                href={formatUrl(project.link)}
                class="btn-solid"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe size={16} /> Kunjungi Website
              </a>
            {/if}
            {#if project.github}
              <a
                href={formatUrl(project.github)}
                class={project.link ? "btn-line" : "btn-solid"}
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
            {#if !project.link && !project.github && !project.demo}
              <a href="/contact" class="btn-text">
                Butuh solusi serupa? <ArrowRight size={16} />
              </a>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== Detail (paragraf setelah lead) ===== -->
  {#if sec.detail}
    <section class="block">
      <div class="container">
        <header class="sec-head" use:inview>
          <h2><span class="mask"><span>Detail</span></span></h2>
          <span class="mono" use:scramble={300}>({pad(sec.detail)})</span>
        </header>
        <div class="detail">
          {#each paragraphs.slice(1) as para, i}
            <p use:reveal={{ delay: i * 80 }}>{para}</p>
          {/each}
        </div>
      </div>
    </section>
  {/if}

  <!-- ===== Teknologi ===== -->
  {#if sec.tech}
    <section class="block">
      <div class="container">
        <header class="sec-head" use:inview>
          <h2><span class="mask"><span>Teknologi</span></span></h2>
          <span class="mono" use:scramble={300}>({pad(sec.tech)})</span>
        </header>
        <ul class="tech">
          {#each project.tech as t, i}
            <li use:reveal={{ delay: i * 60 }}>
              <span class="mono">{pad(i + 1)}</span>
              <span class="tech-name">{t}</span>
            </li>
          {/each}
        </ul>
      </div>
    </section>
  {/if}
</article>

<!-- ===== Project berikutnya ===== -->
{#if data.next}
  <a href="/projects/{data.next.slug}" class="next">
    <div class="container next-inner">
      <span class="mono">Project berikutnya</span>
      <span class="next-name">{data.next.title}</span>
      <span class="next-arrow" aria-hidden="true"><ArrowUpRight size={24} /></span>
    </div>
  </a>
{/if}

<ClosingCta
  kicker="Butuh sistem seperti {project.title}?"
  lines={["Ayo", "Ngobrol."]}
  lead="Ceritakan kebutuhan bisnis Anda — Odoo ERP, aplikasi web, atau mobile."
  primary={{ href: "/contact", label: "Hubungi Saya" }}
  secondary={{ href: "/projects", label: "Semua Project" }}
/>

<style>
  /* ===== Hero ===== */
  .pj-hero {
    position: relative;
    padding: 0;
    overflow: hidden;
    background-image:
      linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
      linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
    background-size: 64px 64px;
    background-position: -1px calc(-1px + var(--p, 0) * 160px);
  }

  .pj-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding-top: 4rem;
    color: var(--text-muted);
  }

  .back {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-main);
    border-bottom: 1px solid currentColor;
    padding-bottom: 0.15rem;
  }

  .back:hover {
    gap: 0.8rem;
  }

  /* Judul project bisa panjang — dibiarkan membungkus, bukan dikecilkan
     seperti nama produk */
  .pj-title {
    margin: 2.5rem 0 3.5rem;
    max-width: 18ch;
    font-family: var(--font-serif);
    font-weight: 400;
    font-size: clamp(2.75rem, 7.5vw, 7rem);
    line-height: 0.95;
    letter-spacing: -0.04em;
    color: var(--text-main);
    text-wrap: balance;
  }

  .pj-foot {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: 2rem;
    padding: 1.75rem 0 5rem;
    opacity: calc(1 - var(--p, 0) * 1.8);
    transform: translate3d(0, calc(var(--p, 0) * -60px), 0);
  }

  .pj-foot::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--text-muted);
    transform-origin: left;
    animation: draw-x 1.4s cubic-bezier(0.65, 0, 0.35, 1) 0.6s both;
  }

  .pj-meta {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    color: var(--text-main);
  }

  .pj-meta-muted {
    color: var(--text-muted);
  }

  .pj-lead {
    font-family: var(--font-serif);
    font-size: clamp(1.2rem, 2vw, 1.6rem);
    line-height: 1.45;
    color: var(--text-main);
    white-space: pre-line;
    margin-bottom: 2rem;
  }

  .pj-btns {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem 1.5rem;
  }

  /* ===== Section ===== */
  .block {
    padding: 6rem 0;
  }

  .detail {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 46rem;
    margin-left: auto;
  }

  .detail p {
    font-family: var(--font-serif);
    font-size: clamp(1.15rem, 1.8vw, 1.4rem);
    line-height: 1.6;
    color: var(--text-main);
    white-space: pre-line;
  }

  .tech {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    border-top: 1px solid var(--text-main);
  }

  .tech li {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    padding: 1.4rem 0;
    border-bottom: 1px solid var(--border);
  }

  .tech .mono {
    color: var(--text-muted);
  }

  .tech-name {
    font-family: var(--font-serif);
    font-size: clamp(1.25rem, 2.2vw, 1.75rem);
    line-height: 1.2;
  }

  /* ===== Project berikutnya ===== */
  .next {
    display: block;
    border-top: 1px solid var(--text-main);
    color: var(--text-main);
    transition:
      background 0.4s ease,
      color 0.4s ease;
  }

  .next-inner {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding-top: 2.5rem;
    padding-bottom: 2.5rem;
  }

  .next .mono {
    color: inherit;
    opacity: 0.6;
  }

  .next-name {
    flex: 1;
    font-family: var(--font-serif);
    font-size: clamp(2rem, 5vw, 4.5rem);
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .next-arrow {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    flex-shrink: 0;
    border: 1px solid currentColor;
  }

  .next:hover {
    background: var(--primary);
    color: var(--on-primary);
  }

  @media (max-width: 768px) {
    .pj-top {
      padding-top: 2.5rem;
    }

    .pj-title {
      margin: 1.5rem 0 2.5rem;
    }

    .pj-foot {
      grid-template-columns: 1fr;
      padding-bottom: 3.5rem;
    }

    .block {
      padding: 4rem 0;
    }

    .next-inner {
      flex-wrap: wrap;
      gap: 0.75rem 1rem;
    }

    .next .mono {
      width: 100%;
    }

    .next-arrow {
      width: 44px;
      height: 44px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pj-foot::before {
      animation: none;
    }
  }
</style>
