<script lang="ts">
  import { onMount } from "svelte";
  import { theme } from "$lib/theme.svelte";
  import type { Portrait } from "$lib/portrait-particles";

  // Potret partikel samar di kiri hero. Hanya desktop/tablet (>768px);
  // di HP canvas disembunyikan dan three.js tidak pernah diunduh.
  let canvas: HTMLCanvasElement;
  let portrait = $state<Portrait | null>(null);

  onMount(() => {
    const mq = window.matchMedia("(min-width: 769px)");
    let alive = true;
    let loading = false;

    async function start() {
      if (portrait || loading) return;
      loading = true;
      try {
        const { createPortrait } = await import("$lib/portrait-particles");
        const p = await createPortrait(canvas, { src: "/foto-partikel.png", dark: theme.isDark });
        if (alive && mq.matches) portrait = p;
        else p.destroy();
      } catch (e) {
        // WebGL/foto gagal dimuat: hero tetap tampil normal tanpa potret
        console.warn("[HeroPortrait]", e);
      } finally {
        loading = false;
      }
    }

    function stop() {
      portrait?.destroy();
      portrait = null;
    }

    const onChange = () => (mq.matches ? start() : stop());
    mq.addEventListener("change", onChange);
    onChange();

    return () => {
      alive = false;
      mq.removeEventListener("change", onChange);
      stop();
    };
  });

  $effect(() => {
    portrait?.setDark(theme.isDark);
  });
</script>

<canvas bind:this={canvas} class="hero-portrait" aria-hidden="true"></canvas>

<style>
  .hero-portrait {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: min(52vw, 860px);
    height: 100%;
    z-index: -1;
    pointer-events: none;
    /* Tepi kanan & bawah memudar supaya menyatu dengan latar */
    -webkit-mask-image:
      linear-gradient(to right, #000 55%, transparent),
      linear-gradient(to bottom, #000 80%, transparent);
    -webkit-mask-composite: source-in;
    mask-image:
      linear-gradient(to right, #000 55%, transparent),
      linear-gradient(to bottom, #000 80%, transparent);
    mask-composite: intersect;
  }

  @media (max-width: 768px) {
    .hero-portrait {
      display: none;
    }
  }
</style>
