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

export default function Seo({
  title,
  description,
  path = "/",
  noIndex = false,
  toolType = null,
  examName = null
}) {
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
    const fullUrl = `${window.location.origin}${path}`;
    canonical.setAttribute("href", fullUrl);

    // Dynamic Schema.org JSON-LD injection for rich sitelinks & web applications
    let scriptTag = document.getElementById("dynamic-seo-schema");
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = "dynamic-seo-schema";
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }

    const schemaData = {
      "@context": "https://schema.org",
      "@type": toolType ? "WebApplication" : "WebPage",
      "name": title,
      "description": description,
      "url": fullUrl,
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
      },
      "provider": {
        "@type": "Organization",
        "name": "TG Counselling",
        "url": "https://tgcounselling.vercel.app"
      }
    };

    scriptTag.textContent = JSON.stringify(schemaData);

    return () => {
      // Clean up on unmount if needed
    };
  }, [description, noIndex, path, title, toolType, examName]);

  return null;
}
