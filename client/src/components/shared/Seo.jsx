import { useEffect } from "react";

function setMeta(selector, attribute, value) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    const [name, key] = attribute;
    element.setAttribute(name, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", value);
}

export default function Seo({ title, description, path = "/", noIndex = false }) {
  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', ["name", "description"], description);
    setMeta('meta[property="og:title"]', ["property", "og:title"], title);
    setMeta('meta[property="og:description"]', ["property", "og:description"], description);
    setMeta('meta[name="robots"]', ["name", "robots"], noIndex ? "noindex, nofollow" : "index, follow");

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}${path}`);
  }, [description, noIndex, path, title]);

  return null;
}
