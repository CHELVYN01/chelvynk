<script lang="ts">
  import { ArrowRight } from "lucide-svelte";
  import { inview, scramble } from "$lib/motion";

  // Section penutup: headline raksasa yang hurufnya naik saat terlihat.
  type Link = { href: string; label: string };
  let {
    kicker,
    lines,
    lead,
    primary,
    secondary,
  }: {
    kicker: string;
    lines: string[];
    lead: string;
    primary: Link;
    secondary?: Link;
  } = $props();
</script>

<section class="cta" use:inview={0.3}>
  <div class="container">
    <p class="mono cta-kicker" use:scramble>{kicker}</p>
    <h2 class="cta-title" aria-label={lines.join(" ")}>
      {#each lines as line, li}
        <span class="line" aria-hidden="true">
          <span class="line-mask">
            {#each line.split("") as ch, ci}
              <span
                class="ch"
                style="--d: {(0.15 + li * 0.2 + ci * 0.05).toFixed(3)}s"
                >{ch === " " ? " " : ch}</span
              >
            {/each}
          </span>
        </span>
      {/each}
    </h2>
    <div class="cta-foot">
      <p class="cta-lead">{lead}</p>
      <div class="cta-btns">
        <a href={primary.href} class="btn-solid">
          {primary.label} <ArrowRight size={16} />
        </a>
        {#if secondary}
          <a href={secondary.href} class="btn-line">{secondary.label}</a>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  .cta {
    padding: 7rem 0 6rem;
    border-top: 1px solid var(--text-main);
    background-image:
      linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
      linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
    background-size: 64px 64px;
  }

  .cta-kicker {
    color: var(--text-muted);
  }

  .cta-title {
    margin: 2rem 0 3.5rem;
    font-family: var(--font-serif);
    font-weight: 400;
    font-size: clamp(4rem, 17vw, 15rem);
    line-height: 0.88;
    letter-spacing: -0.045em;
    text-transform: uppercase;
    color: var(--text-main);
  }

  .cta-title .line {
    display: block;
    white-space: nowrap;
  }

  .cta-title .line + .line {
    padding-left: 1em;
  }

  /* Huruf baru naik saat section terlihat (tanpa JS: langsung main) */
  .cta:global(.motion) .ch {
    animation-play-state: paused;
  }

  .cta:global(.in) .ch {
    animation-play-state: running;
  }

  .cta-foot {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: end;
    padding-top: 1.75rem;
    border-top: 1px solid var(--border);
  }

  .cta-lead {
    font-family: var(--font-serif);
    font-size: clamp(1.1rem, 1.6vw, 1.3rem);
    line-height: 1.5;
    color: var(--text-main);
    max-width: 30rem;
  }

  .cta-btns {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  @media (max-width: 768px) {
    .cta {
      padding: 5rem 0 4rem;
    }

    .cta-title .line + .line {
      padding-left: 0.5em;
    }

    .cta-foot {
      grid-template-columns: 1fr;
    }

    .cta-btns {
      justify-content: flex-start;
    }
  }
</style>
