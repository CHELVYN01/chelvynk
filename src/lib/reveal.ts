import type { Action } from "svelte/action";

// Scroll-reveal (progressive enhancement: tanpa JS elemen tetap tampil).
// Class .reveal / .reveal-in didefinisikan global di app.css.
export const reveal: Action<HTMLElement, { delay?: number } | undefined> = (
  node,
  params,
) => {
  node.classList.add("reveal");
  if (params?.delay) node.style.transitionDelay = `${params.delay}ms`;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          node.classList.add("reveal-in");
          io.unobserve(node);
        }
      }
    },
    { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
  );
  io.observe(node);
  return { destroy: () => io.disconnect() };
};
