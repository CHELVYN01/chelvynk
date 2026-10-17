import type { Action } from "svelte/action";

// Kumpulan efek gerak untuk home (tanpa library). Semua efek mati otomatis
// kalau pengguna memilih "reduce motion", dan konten tetap tampil tanpa JS.

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

// Panggil `compute` (hasil 0..1) setiap scroll/resize, simpan ke --p di node.
function trackScroll(node: HTMLElement, compute: () => number) {
  let raf = 0;
  const update = () => {
    raf = 0;
    node.style.setProperty("--p", compute().toFixed(4));
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  update();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  return {
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    },
  };
}

// Jalankan `cb` sekali saat node masuk viewport.
function onceInView(node: HTMLElement, cb: () => void, threshold = 0.2) {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        cb();
        io.disconnect();
      }
    },
    { threshold, rootMargin: "0px 0px -8% 0px" },
  );
  io.observe(node);
  return io;
}

/** --p: 0 saat node di atas viewport → 1 saat node sudah ter-scroll habis. */
export const exitProgress: Action<HTMLElement> = (node) => {
  if (reducedMotion()) return;
  return trackScroll(node, () => {
    const r = node.getBoundingClientRect();
    return clamp01(-r.top / r.height);
  });
};

/** --p: 0 saat node baru muncul di bawah → 1 saat sampai ~35% tinggi layar. */
export const scrub: Action<HTMLElement> = (node) => {
  if (reducedMotion()) return;
  return trackScroll(node, () => {
    const vh = window.innerHeight;
    const r = node.getBoundingClientRect();
    return clamp01((vh * 0.9 - r.top) / (vh * 0.55));
  });
};

/** --p: progres scroll seluruh halaman (0..1). */
export const pageProgress: Action<HTMLElement> = (node) => {
  if (reducedMotion()) return;
  return trackScroll(node, () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? clamp01(window.scrollY / max) : 0;
  });
};

/** Tambah class .motion (keadaan awal) lalu .in saat masuk viewport. */
export const inview: Action<HTMLElement, number | undefined> = (
  node,
  threshold,
) => {
  if (reducedMotion()) return;
  node.classList.add("motion");
  const io = onceInView(node, () => node.classList.add("in"), threshold);
  return { destroy: () => io.disconnect() };
};

/** Teks monospace "di-decode" dari karakter acak saat masuk viewport. */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#_-";
export const scramble: Action<HTMLElement, number | undefined> = (
  node,
  delay = 0,
) => {
  if (reducedMotion()) return;
  const final = node.textContent ?? "";
  let raf = 0;
  const run = () => {
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const t = now - start;
      let out = "";
      for (let i = 0; i < final.length; i++) {
        const ch = final[i];
        out +=
          ch === " " || t >= 120 + i * 28
            ? ch
            : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      node.textContent = out;
      if (t < 120 + final.length * 28) raf = requestAnimationFrame(tick);
      else node.textContent = final;
    };
    raf = requestAnimationFrame(tick);
  };
  const io = onceInView(node, run, 0.5);
  return {
    destroy() {
      io.disconnect();
      cancelAnimationFrame(raf);
    },
  };
};

/** Angka naik dari 0 ke target saat masuk viewport. */
export const countUp: Action<
  HTMLElement,
  { to: number; from?: number; decimals?: number; suffix?: string }
> = (node, params) => {
  if (reducedMotion()) return;
  const { to, from = 0, decimals = 0, suffix = "" } = params;
  const fmt = (v: number) => v.toFixed(decimals) + suffix;
  let raf = 0;
  node.textContent = fmt(from);
  const run = () => {
    const start = performance.now();
    const dur = 1600;
    const tick = (now: number) => {
      const t = clamp01((now - start) / dur);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t); // easeOutExpo
      node.textContent = fmt(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  };
  const io = onceInView(node, run, 0.5);
  return {
    destroy() {
      io.disconnect();
      cancelAnimationFrame(raf);
    },
  };
};

/**
 * Elemen `.follower` (position: fixed) di dalam node mengikuti kursor mouse
 * dengan sedikit jeda + miring sesuai laju gerak. Pindah ke kiri kursor
 * kalau terlalu dekat tepi kanan. `width` = lebar kartu untuk hitungan itu.
 */
export const cursorFollow: Action<HTMLElement, number | undefined> = (
  node,
  width = 316,
) => {
  const el = node.querySelector<HTMLElement>(".follower");
  if (!el) return;
  const ease = reducedMotion() ? 1 : 0.14;
  let tx = 0,
    ty = 0,
    x = 0,
    y = 0,
    raf = 0,
    snapped = false;

  const loop = () => {
    const dx = tx - x;
    const dy = ty - y;
    x += dx * ease;
    y += dy * ease;
    const rot = reducedMotion() ? 0 : Math.max(-10, Math.min(10, dx * 0.06));
    const ox = tx > window.innerWidth - (width + 64) ? -(width + 28) : 28;
    el.style.transform = `translate3d(${x + ox}px, ${y + 20}px, 0) rotate(${rot}deg)`;
    raf = Math.abs(dx) + Math.abs(dy) > 0.2 ? requestAnimationFrame(loop) : 0;
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    tx = e.clientX;
    ty = e.clientY;
    if (!snapped) {
      x = tx;
      y = ty;
      snapped = true;
    }
    if (!raf) raf = requestAnimationFrame(loop);
  };
  const onLeave = () => (snapped = false);

  node.addEventListener("pointermove", onMove);
  node.addEventListener("pointerleave", onLeave);
  return {
    destroy() {
      cancelAnimationFrame(raf);
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
    },
  };
};

/**
 * Marquee yang bereaksi ke scroll: makin cepat scroll makin kencang,
 * arah ikut arah scroll, dan sedikit miring (skew) saat melaju.
 */
export const velocityMarquee: Action<HTMLElement, number | undefined> = (
  node,
  base = 0.6,
) => {
  if (reducedMotion()) return;
  node.style.animation = "none";
  let x = 0;
  let dir = -1;
  let boost = 0;
  let lastY = window.scrollY;
  let raf = 0;

  const tick = () => {
    const y = window.scrollY;
    const dy = y - lastY;
    lastY = y;
    if (dy !== 0) dir = dy > 0 ? -1 : 1;
    // Haluskan lonjakan kecepatan supaya tidak patah-patah
    boost += (Math.min(Math.abs(dy), 90) * 0.3 - boost) * 0.08;
    x += dir * (base + boost);
    const half = node.scrollWidth / 2;
    if (half > 0) {
      if (x <= -half) x += half;
      if (x > 0) x -= half;
    }
    const skew = Math.max(-10, Math.min(10, -dir * boost * 0.6));
    node.style.transform = `translate3d(${x}px,0,0) skewX(${skew}deg)`;
    raf = requestAnimationFrame(tick);
  };

  // Hanya berjalan saat terlihat (hemat baterai)
  const io = new IntersectionObserver(([e]) => {
    cancelAnimationFrame(raf);
    if (e.isIntersecting) {
      lastY = window.scrollY;
      raf = requestAnimationFrame(tick);
    }
  });
  io.observe(node);

  return {
    destroy() {
      io.disconnect();
      cancelAnimationFrame(raf);
    },
  };
};
