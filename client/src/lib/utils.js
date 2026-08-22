import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function smoothScrollTo(target, offset = 80) {
  if (typeof window === "undefined") return;

  const getEl = () => {
    if (!target) return null;
    if (typeof target === "string") return document.getElementById(target) || document.querySelector(target);
    if (target.current) return target.current;
    if (target instanceof HTMLElement) return target;
    return null;
  };

  const doScroll = () => {
    const el = getEl();
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const targetY = window.pageYOffset + rect.top - offset;
    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: "smooth",
    });
    return true;
  };

  doScroll();
  setTimeout(doScroll, 150);
  setTimeout(doScroll, 350);
  setTimeout(doScroll, 650);
}
