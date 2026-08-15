import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getSharedLenis } from "../../hooks/useSmoothScroll";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Immediate scroll to top on route change
    window.scrollTo(0, 0);
    const lenis = getSharedLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return null;
}
