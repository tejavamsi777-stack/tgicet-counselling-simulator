import { useEffect } from "react";

function setMeta(selector, attribute, value) {
  if (!value) return;
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
  keywords = null,
  path = "/",
  noIndex = false,
  toolType = null,
  examName = null,
  faqs = null,
}) {
  useEffect(() => {
    // 1. Page Title
    const formattedTitle = title?.includes("Vuela") ? title : `${title} | Vuela Learn`;
    document.title = formattedTitle;

    // 2. Meta description & robots
    setMeta('meta[name="description"]', ["name", "description"], description);
    setMeta('meta[name="robots"]', ["name", "robots"], noIndex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large");

    // 3. Keywords (Combining custom keywords with authoritative admission keywords)
    const baseKeywords = "vuela learn, vuelalearn, college predictor, seat allotment explorer, mock web options simulator, ts eamcet predictor, tg eapcet predictor, ap eapcet predictor, cutoffs 2025 2026, engineering admissions telangana ap";
    const combinedKeywords = keywords ? `${keywords}, ${baseKeywords}` : baseKeywords;
    setMeta('meta[name="keywords"]', ["name", "keywords"], combinedKeywords);

    // 4. OpenGraph Tags
    setMeta('meta[property="og:title"]', ["property", "og:title"], formattedTitle);
    setMeta('meta[property="og:description"]', ["property", "og:description"], description);
    setMeta('meta[property="og:type"]', ["property", "og:type"], toolType ? "article" : "website");

    // 5. Twitter Card Tags
    setMeta('meta[name="twitter:title"]', ["name", "twitter:title"], formattedTitle);
    setMeta('meta[name="twitter:description"]', ["name", "twitter:description"], description);

    // 6. Canonical URL
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    const baseUrl = typeof window !== "undefined" && window.location.origin.includes("localhost")
      ? window.location.origin
      : "https://vuelalearn.in";
    const fullUrl = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    canonical.setAttribute("href", fullUrl);
    setMeta('meta[property="og:url"]', ["property", "og:url"], fullUrl);

    // 7. Dynamic Schema.org JSON-LD Structured Data
    let scriptTag = document.getElementById("dynamic-seo-schema");
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = "dynamic-seo-schema";
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }

    const schemaGraph = [
      {
        "@type": toolType ? "WebApplication" : "WebPage",
        "@id": `${fullUrl}#webpage`,
        "url": fullUrl,
        "name": formattedTitle,
        "description": description,
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR"
        },
        "provider": {
          "@type": "Organization",
          "name": "Vuela Learn",
          "alternateName": "VuelaLearn",
          "url": "https://vuelalearn.in",
          "sameAs": ["https://www.trustpilot.com/review/vuelalearn.vercel.app"]
        }
      }
    ];

    // If FAQs are present, inject FAQPage Schema for rich SERP FAQ snippets
    if (faqs && Array.isArray(faqs) && faqs.length > 0) {
      schemaGraph.push({
        "@type": "FAQPage",
        "@id": `${fullUrl}#faq`,
        "mainEntity": faqs.slice(0, 8).map((faq) => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
      });
    }

    scriptTag.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": schemaGraph
    });

  }, [description, noIndex, path, title, toolType, examName, keywords, faqs]);

  return null;
}
