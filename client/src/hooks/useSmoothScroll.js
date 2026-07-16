import { useEffect, useRef } from "react";
import Lenis from "lenis";

let sharedLenis = null;
let sharedFrameId = null;
let sharedUsers = 0;

function startSharedLenis() {
  if (!sharedLenis) {
    sharedLenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    function raf(time) {
      sharedLenis?.raf(time);
      sharedFrameId = requestAnimationFrame(raf);
    }

    sharedFrameId = requestAnimationFrame(raf);
  }

  sharedUsers += 1;
  return sharedLenis;
}

function stopSharedLenis() {
  sharedUsers = Math.max(0, sharedUsers - 1);

  if (sharedUsers > 0) return;

  if (sharedFrameId) {
    cancelAnimationFrame(sharedFrameId);
    sharedFrameId = null;
  }

  sharedLenis?.destroy();
  sharedLenis = null;
}

export function useSmoothScroll() {
  const lenisRef = useRef(null);

  useEffect(() => {
    lenisRef.current = startSharedLenis();

    return () => {
      lenisRef.current = null;
      stopSharedLenis();
    };
  }, []);

  return lenisRef;
}
