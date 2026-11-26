import "@fontsource/instrument-serif/latin-400-italic.css";
import "@phosphor-icons/web/regular";
import "@phosphor-icons/web/bold";
import "@phosphor-icons/web/fill";
import "../styles/main.css";

const motion = matchMedia("(prefers-reduced-motion: reduce)");
const pointer = matchMedia("(hover: hover) and (pointer: fine)");
const glow = document.getElementById("mouseGlow");

if (glow) {
  let frame = 0;
  let x = 0;
  let y = 0;

  document.addEventListener("pointermove", (event) => {
    if (motion.matches || !pointer.matches || event.pointerType === "touch")
      return;
    x = event.clientX;
    y = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      glow.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      glow.style.opacity = "1";
    });
  });

  document.documentElement.addEventListener("pointerleave", () => {
    cancelAnimationFrame(frame);
    frame = 0;
    glow.style.opacity = "0";
  });
}

const quickNav = document.getElementById("bottom-nav");
if (quickNav) {
  let lastScrollTop = 0;
  window.addEventListener(
    "scroll",
    () => {
      const scrollTop = Math.max(window.scrollY, 0);
      quickNav.classList.toggle(
        "nav-hidden",
        scrollTop > lastScrollTop && scrollTop > 100,
      );
      lastScrollTop = scrollTop;
    },
    { passive: true },
  );
}

const menu = document.getElementById("site-menu");
menu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => menu.hidePopover());
});

document.querySelectorAll(".tilt-card").forEach((card) => {
  if (!(card instanceof HTMLElement)) return;
  card.addEventListener("pointermove", (event) => {
    if (motion.matches || !pointer.matches || event.pointerType === "touch")
      return;
    const { left, top, width, height } = card.getBoundingClientRect();
    const rotateX = ((event.clientY - top) / height - 0.5) * -16;
    const rotateY = ((event.clientX - left) / width - 0.5) * 16;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });
  card.addEventListener("pointerleave", () =>
    card.style.removeProperty("transform"),
  );
  motion.addEventListener("change", () =>
    card.style.removeProperty("transform"),
  );
});

if (!motion.matches && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.1 },
  );
  document.documentElement.classList.add("reveal-enabled");
  document
    .querySelectorAll(".reveal")
    .forEach((item) => observer.observe(item));
}

const faq = Array.from(document.querySelectorAll(".faq-btn")).flatMap(
  (button) => {
    const panelId = button.getAttribute("aria-controls");
    const panel = panelId && document.getElementById(panelId);
    if (!panel) return [];
    return [{ button, panel }];
  },
);

for (const { button } of faq) {
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") === "false";
    for (const item of faq) {
      const expanded = item.button === button && open;
      item.button.setAttribute("aria-expanded", String(expanded));
      item.panel.hidden = !expanded;
    }
  });
}
