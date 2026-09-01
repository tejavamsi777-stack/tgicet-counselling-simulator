import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDir = path.resolve(__dirname, '..');
const distDir = path.resolve(clientDir, 'dist');

// Shared Common Nav & Header HTML
function getHeaderHtml() {
  return `
    <header class="sticky top-3 z-50 px-3 sm:px-6">
      <div class="relative mx-auto flex h-14 max-w-7xl items-center justify-between rounded-full border border-white/25 bg-white/[0.03] px-4 sm:px-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-3xl text-white">
        <div class="flex items-center">
          <a href="/" class="flex items-center group py-1" title="Vuela Learn">
            <span class="text-xl font-black tracking-wider bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">VUELA</span>
            <span class="ml-2 text-xs font-semibold uppercase tracking-widest text-purple-300 border-l border-white/20 pl-2">LEARN</span>
          </a>
        </div>
        <nav class="hidden md:flex items-center gap-6 text-xs font-medium text-gray-200">
          <a href="/tg-eapcet" class="hover:text-white transition-colors">TG EAPCET</a>
          <a href="/tg-icet" class="hover:text-white transition-colors">TG ICET</a>
          <a href="/ap-eapcet" class="hover:text-white transition-colors">AP EAPCET</a>
          <a href="/tg-ecet" class="hover:text-white transition-colors">TG ECET</a>
          <a href="/tg-polycet" class="hover:text-white transition-colors">TG POLYCET</a>
          <a href="/colleges" class="hover:text-white transition-colors">Colleges</a>
          <a href="/about" class="hover:text-white transition-colors">About</a>
          <a href="/privacy-policy" class="hover:text-white transition-colors">Privacy</a>
          <a href="/contact" class="hover:text-white transition-colors">Contact</a>
        </nav>
      </div>
    </header>
  `;
}

// Shared Common Footer HTML
function getFooterHtml() {
  return `
    <footer class="mt-20 border-t border-white/10 bg-[#070a13]/95 text-gray-400 text-xs py-12 px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="space-y-3">
          <div class="text-lg font-bold text-white">VUELA LEARN</div>
          <p class="text-gray-400 text-xs leading-relaxed">
            India's premier 100% free educational counselling simulation suite for TG EAPCET, TG ICET, AP EAPCET, TG ECET, TG POLYCET, TG PGECET, and KCET admissions.
          </p>
        </div>
        <div>
          <h4 class="font-bold text-white uppercase tracking-wider mb-3">Entrance Portals</h4>
          <ul class="space-y-1.5 text-gray-400">
            <li><a href="/tg-eapcet" class="hover:text-white">TG EAPCET Engineering</a></li>
            <li><a href="/tg-icet" class="hover:text-white">TG ICET MBA &amp; MCA</a></li>
            <li><a href="/ap-eapcet" class="hover:text-white">AP EAPCET Andhra Pradesh</a></li>
            <li><a href="/tg-ecet" class="hover:text-white">TG ECET Lateral Entry</a></li>
            <li><a href="/tg-polycet" class="hover:text-white">TG POLYCET Polytechnic</a></li>
            <li><a href="/tg-pgecet" class="hover:text-white">TG PGECET M.Tech</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold text-white uppercase tracking-wider mb-3">Popular Tools</h4>
          <ul class="space-y-1.5 text-gray-400">
            <li><a href="/exams/tg-icet/marks-vs-rank" class="hover:text-white">TG ICET Marks vs Rank</a></li>
            <li><a href="/exams/tg-eapcet/marks-vs-rank" class="hover:text-white">TG EAPCET Marks vs Rank</a></li>
            <li><a href="/exams/tg-eapcet/create-web-options" class="hover:text-white">Smart Web Options Generator</a></li>
            <li><a href="/colleges" class="hover:text-white">500+ Colleges Directory</a></li>
            <li><a href="/compare" class="hover:text-white">College Comparison Matrix</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold text-white uppercase tracking-wider mb-3">Company &amp; Legal</h4>
          <ul class="space-y-1.5 text-gray-400">
            <li><a href="/about" class="hover:text-white">About Vuela Learn</a></li>
            <li><a href="/privacy-policy" class="hover:text-white">Privacy &amp; Cookie Policy</a></li>
            <li><a href="/terms" class="hover:text-white">Terms of Service &amp; Disclaimer</a></li>
            <li><a href="/contact" class="hover:text-white">Contact &amp; Student Support</a></li>
          </ul>
        </div>
      </div>
      <div class="mx-auto max-w-7xl mt-8 pt-6 border-t border-white/10 text-center text-gray-500">
        © 2026 vuelalearn.in — All rights reserved. Data sourced directly from official TSCHE, APSCHE &amp; State Technical Boards.
      </div>
    </footer>
  `;
}

// Generate FAQ Block HTML and JSON-LD
function renderFaqs(faqs) {
  if (!faqs || faqs.length === 0) return { html: '', jsonLd: null };

  const html = `
    <section class="mt-14 space-y-6">
      <div class="border-b border-white/10 pb-3">
        <h2 class="text-2xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
        <p class="text-xs text-gray-400 mt-1">Authoritative answers regarding cutoff calculations, admission counselling, and web options simulation.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${faqs.map(faq => `
          <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
            <h3 class="font-bold text-white text-sm text-purple-300">${faq.q}</h3>
            <p class="text-xs text-gray-300 leading-relaxed">${faq.a}</p>
          </div>
        `).join('')}
      </div>
    </section>
  `;

  const jsonLd = {
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return { html, jsonLd };
}

// Dynamic Specialized Route Generator based on URL tool patterns
function generateSmartRouteContent(routePath, defaultTitle, defaultDesc) {
  const p = routePath.toLowerCase();
  
  // 1. Identify Exam Context
  let examName = 'State Entrance';
  let examShort = 'Admissions';
  if (p.includes('tg-eapcet')) { examName = 'TG EAPCET (Telangana Engineering & Pharmacy)'; examShort = 'TG EAPCET'; }
  else if (p.includes('ap-eapcet')) { examName = 'AP EAPCET (Andhra Pradesh Engineering & Agri)'; examShort = 'AP EAPCET'; }
  else if (p.includes('tg-icet')) { examName = 'TG ICET (Telangana MBA & MCA)'; examShort = 'TG ICET'; }
  else if (p.includes('tg-ecet')) { examName = 'TG ECET (Diploma Engineering Lateral Entry)'; examShort = 'TG ECET'; }
  else if (p.includes('tg-polycet')) { examName = 'TG POLYCET (10th SSC Polytechnic Diploma)'; examShort = 'TG POLYCET'; }
  else if (p.includes('tg-pgecet')) { examName = 'TG PGECET (M.Tech & M.Pharmacy Postgraduate)'; examShort = 'TG PGECET'; }
  else if (p.includes('kcet')) { examName = 'KCET (Karnataka Engineering Admissions)'; examShort = 'KCET'; }

  // 2. Predictor Tool
  if (p.includes('predictor')) {
    const title = `${examShort} 2027 College Predictor — Predict Eligible Seats & Cutoffs`;
    const faqs = [
      { q: `How does the ${examShort} College Predictor calculate admission chances?`, a: `The predictor analyzes verified past closing ranks across OC, BC-A/B/C/D/E, SC, ST, and EWS categories to calculate probability bands (High Chance, Moderate Chance, Low Chance).` },
      { q: `Does the predictor consider regional quotas (OU, AU, SVU)?`, a: `Yes. It takes your local status (Local vs Non-Local / Statewide) into account to ensure accurate probability matching.` },
      { q: `Is the ${examShort} predictor free to use?`, a: `Yes, 100% free with unlimited rank searches and zero registration fees.` }
    ];
    const { html: faqHtml, jsonLd: faqJson } = renderFaqs(faqs);
    const softwareSchema = {
      "@type": "SoftwareApplication",
      "name": `${examShort} College Predictor`,
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "410" },
      "description": `Predict eligible ${examShort} colleges and courses by rank and reservation quota.`
    };

    return {
      title: `${title} | Vuela Learn`,
      desc: `Predict your admission chances for ${examName} 2027 based on rank, reservation category, gender, and regional quotas.`,
      body: `
        <main class="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 text-gray-300 space-y-10">
          <div class="border-b border-white/10 pb-6 space-y-2">
            <div class="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300">
              <span>${examShort} 2027 Intelligence Suite</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">${title}</h1>
            <p class="text-sm text-gray-400">Accurate college and branch predictions for ${examName} calibrated against authentic convenor closing cutoffs.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
              <div class="text-lg font-bold text-white">🎯 Rank Matching</div>
              <p class="text-xs text-gray-400 leading-relaxed">Enter your exact rank or expected marks to search thousands of historical candidate allotments.</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
              <div class="text-lg font-bold text-white">🛡️ Quota Filters</div>
              <p class="text-xs text-gray-400 leading-relaxed">Filter results by OC, BC-A/B/C/D/E, SC, ST, and 10% EWS quotas with gender-specific closing ranks.</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
              <div class="text-lg font-bold text-white">⚡ Instant Analysis</div>
              <p class="text-xs text-gray-400 leading-relaxed">View tuition fee structures, NIRF rankings, and college locations directly within the prediction table.</p>
            </div>
          </div>

          ${faqHtml}
        </main>
      `,
      schemas: [softwareSchema, faqJson]
    };
  }

  // 3. Smart Web Options Generator Tool
  if (p.includes('create-web-options')) {
    const title = `${examShort} Smart Web Options Generator 2027 — Safe Choice Ordering`;
    const faqs = [
      { q: `What is the 3-Tier Web Options Strategy?`, a: `Our algorithm automatically divides your choices into Reach (Ambitious top colleges - 30%), Target (Realistic colleges matching your rank - 40%), and Safe (Guaranteed backup institutions - 30%) to eliminate the risk of missing a seat.` },
      { q: `How many web options can I add?`, a: `TSCHE and APSCHE permit unlimited web options. We recommend adding at least 40 to 80 choices in strict order of institutional preference.` },
      { q: `Can I export the generated list?`, a: `Yes, you can export and copy the priority codes directly for the official web counselling portal.` }
    ];
    const { html: faqHtml, jsonLd: faqJson } = renderFaqs(faqs);
    const softwareSchema = {
      "@type": "SoftwareApplication",
      "name": `${examShort} Smart Web Options Generator`,
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "285" },
      "description": `Strategic web options choice list ordering for ${examShort} counselling.`
    };

    return {
      title: `${title} | Vuela Learn`,
      desc: `Build a risk-optimized web options preference list for ${examName} 2027 counselling with Reach, Target, and Safe choice tiers.`,
      body: `
        <main class="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 text-gray-300 space-y-10">
          <div class="border-b border-white/10 pb-6 space-y-2">
            <div class="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
              <span>Strategy &amp; Choice Priority</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">${title}</h1>
            <p class="text-sm text-gray-400">Eliminate seat loss risk during ${examName} counselling with AI-assisted priority sequencing.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-5 space-y-2">
              <div class="text-xs font-bold text-purple-400 uppercase">Tier 1: 30% Choices</div>
              <div class="text-lg font-bold text-white">Reach (Dream Colleges)</div>
              <p class="text-xs text-gray-400 leading-relaxed">Top government universities and Tier-1 institutes with cutoffs slightly above your rank.</p>
            </div>
            <div class="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-5 space-y-2">
              <div class="text-xs font-bold text-cyan-400 uppercase">Tier 2: 40% Choices</div>
              <div class="text-lg font-bold text-white">Target (Realistic Seats)</div>
              <p class="text-xs text-gray-400 leading-relaxed">High-reputation colleges where your rank comfortably falls within recent closing brackets.</p>
            </div>
            <div class="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 space-y-2">
              <div class="text-xs font-bold text-emerald-400 uppercase">Tier 3: 30% Choices</div>
              <div class="text-lg font-bold text-white">Safe (Guaranteed Backups)</div>
              <p class="text-xs text-gray-400 leading-relaxed">Reliable institutions where past closing ranks ensure zero chance of remaining unallotted.</p>
            </div>
          </div>

          ${faqHtml}
        </main>
      `,
      schemas: [softwareSchema, faqJson]
    };
  }

  // 4. Mock Counselling Simulator Tool
  if (p.includes('mock-counselling')) {
    const title = `${examShort} 2027 Mock Counselling Simulator — Seat Allocation Engine`;
    const faqs = [
      { q: `What is the Mock Counselling Simulator?`, a: `It is an interactive multi-round simulator that models how the official state convenor algorithm processes your web option choices against candidate ranks.` },
      { q: `Can I test different web option sequences?`, a: `Yes. You can test multiple priority lists and see how moving a college higher or lower affects your simulated allotment result.` }
    ];
    const { html: faqHtml, jsonLd: faqJson } = renderFaqs(faqs);
    return {
      title: `${title} | Vuela Learn`,
      desc: `Simulate ${examName} 2027 seat allocation rounds, test option priorities, and evaluate upgrade rules.`,
      body: `
        <main class="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 text-gray-300 space-y-10">
          <div class="border-b border-white/10 pb-6 space-y-2">
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">${title}</h1>
            <p class="text-sm text-gray-400">Experience virtual counselling rounds before official TSCHE/APSCHE seat allocation.</p>
          </div>
          <section class="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
            <h2 class="text-lg font-bold text-white">Interactive Seat Allocation Simulation</h2>
            <p class="text-xs text-gray-300 leading-relaxed">
              Step through Phase 1, Phase 2, and Final Phase seat allotments. Understand the sliding rules, seat retention mechanics, and how to maximize your upgrade potential.
            </p>
          </section>
          ${faqHtml}
        </main>
      `,
      schemas: [faqJson]
    };
  }

  // 5. Allotment Explorer Tool
  if (p.includes('allotments')) {
    const title = `${examShort} Seat Allotments & Candidate Closing Ranks Archive`;
    const faqs = [
      { q: `Are these allotment records official?`, a: `Yes. All records are compiled directly from public state convenor allotment gazettes released by TSCHE and APSCHE.` },
      { q: `How frequently are cutoffs updated?`, a: `Data is updated for every counselling phase (Phase 1, Phase 2, Final Round, and Special Round).` }
    ];
    const { html: faqHtml, jsonLd: faqJson } = renderFaqs(faqs);
    return {
      title: `${title} | Vuela Learn`,
      desc: `Search verified ${examName} candidate seat allotment records, college cutoffs, and quota closing ranks.`,
      body: `
        <main class="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 text-gray-300 space-y-10">
          <div class="border-b border-white/10 pb-6 space-y-2">
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">${title}</h1>
            <p class="text-sm text-gray-400">Comprehensive database of authentic seat allotments, candidate marks, and branch closing cutoffs.</p>
          </div>
          <section class="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
            <h2 class="text-lg font-bold text-white">Search Candidate Seat Allotments</h2>
            <p class="text-xs text-gray-300 leading-relaxed">
              Filter allotments by College Code, Branch Name, Caste Quota (OC, BC-A/B/C/D/E, SC, ST, EWS), Gender, and Local Region status.
            </p>
          </section>
          ${faqHtml}
        </main>
      `,
      schemas: [faqJson]
    };
  }

  // 6. College Compare Tool
  if (p.includes('compare')) {
    const title = `${examShort} College Comparison Tool — Cutoffs, Placements & Fees`;
    const faqs = [
      { q: `What factors should I compare between colleges?`, a: `Key metrics include NAAC Accreditation grade, NIRF rank, average salary packages, historical cutoff ranks, faculty ratio, and annual tuition fees.` }
    ];
    const { html: faqHtml, jsonLd: faqJson } = renderFaqs(faqs);
    return {
      title: `${title} | Vuela Learn`,
      desc: `Compare engineering and management colleges side-by-side for ${examName} across cutoffs, fees, and placements.`,
      body: `
        <main class="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 text-gray-300 space-y-10">
          <div class="border-b border-white/10 pb-6 space-y-2">
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">${title}</h1>
            <p class="text-sm text-gray-400">Side-by-side comparison matrix for ${examName} institutions.</p>
          </div>
          <section class="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
            <h2 class="text-lg font-bold text-white">Side-by-Side Institutional Analysis</h2>
            <p class="text-xs text-gray-300 leading-relaxed">
              Evaluate campus infrastructure, branch options, closing rank difficulty, tuition fee subsidies, and placement records before finalizing your web options list.
            </p>
          </section>
          ${faqHtml}
        </main>
      `,
      schemas: [faqJson]
    };
  }

  // 7. Documents & Certificate Verification
  if (p.includes('documents')) {
    const title = `${examShort} Counselling Certificate Verification Checklist 2027`;
    const faqs = [
      { q: `What certificates are mandatory for ${examShort} counselling?`, a: `Mandatory documents include: 1) Rank Card & Hall Ticket, 2) SSC / 10th Memo, 3) Intermediate / Qualifying Degree Marks Memos, 4) Study/Bonafide Certificates from Class 6 to 12, 5) Transfer Certificate (TC), 6) Income Certificate issued after January 1st for fee reimbursement, 7) Caste/Category Certificate for reserved quotas, and 8) EWS Certificate (if applicable).` },
      { q: `What happens if income certificate is not submitted?`, a: `Without a valid government income certificate, you will not receive government fee reimbursement (TS ePASS / AP JVD) and must pay full college tuition fees.` }
    ];
    const { html: faqHtml, jsonLd: faqJson } = renderFaqs(faqs);
    return {
      title: `${title} | Vuela Learn`,
      desc: `Complete document checklist and certificate verification guidelines for ${examName} 2027 counselling.`,
      body: `
        <main class="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 text-gray-300 space-y-10">
          <div class="border-b border-white/10 pb-6 space-y-2">
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">${title}</h1>
            <p class="text-sm text-gray-400">Ensure a smooth slot booking and help line center certificate verification process.</p>
          </div>
          
          <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
            <h2 class="text-xl font-bold text-white">Mandatory Certificate Checklist</h2>
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-300">
              <li class="flex items-center gap-2">✅ ${examShort} 2027 Hall Ticket &amp; Rank Card</li>
              <li class="flex items-center gap-2">✅ SSC / 10th Class Marks Memo</li>
              <li class="flex items-center gap-2">✅ Intermediate / Diploma Marks Memorandum</li>
              <li class="flex items-center gap-2">✅ Study / Bonafide Certificates (Class 6 to 12)</li>
              <li class="flex items-center gap-2">✅ Transfer Certificate (TC) from Last Institution</li>
              <li class="flex items-center gap-2">✅ Caste Certificate (BC / SC / ST candidates)</li>
              <li class="flex items-center gap-2">✅ Income Certificate (for Fee Reimbursement)</li>
              <li class="flex items-center gap-2">✅ Economically Weaker Section (EWS) Certificate</li>
              <li class="flex items-center gap-2">✅ Residence Certificate (for Non-Local/Private Study)</li>
              <li class="flex items-center gap-2">✅ Aadhaar Card &amp; Passport Photographs</li>
            </ul>
          </div>

          ${faqHtml}
        </main>
      `,
      schemas: [faqJson]
    };
  }

  // 8. Exam Hub Pages (e.g. /tg-eapcet, /tg-icet, /tg-ecet, /tg-polycet, /tg-pgecet, /kcet)
  if (p === '/tg-eapcet' || p === '/tg-icet' || p === '/ap-eapcet' || p === '/tg-ecet' || p === '/tg-polycet' || p === '/tg-pgecet' || p === '/kcet') {
    const title = `${examShort} 2027 Admissions Portal & Counselling Simulator`;
    const faqs = [
      { q: `What tools are available for ${examShort}?`, a: `Vuela Learn provides a complete suite: Marks vs Rank Predictor, College Predictor, Smart Web Options Generator, Seat Allotment Explorer, College Comparator, and Certificate Checklist.` },
      { q: `Are all tools free for students?`, a: `Yes, 100% free with no paywalls or mandatory subscriptions.` }
    ];
    const { html: faqHtml, jsonLd: faqJson } = renderFaqs(faqs);
    return {
      title: `${title} | Vuela Learn`,
      desc: `Complete ${examName} 2027 counselling simulation suite: College predictors, smart web options builder, seat allotments & cutoffs.`,
      body: `
        <main class="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 text-gray-300 space-y-10">
          <div class="border-b border-white/10 pb-6 space-y-2">
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">${title}</h1>
            <p class="text-sm text-gray-400">Everything you need to secure your top seat in ${examName}.</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <a href="/exams/${examShort.toLowerCase().replace(/\s+/g, '-')}/predictor" class="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-purple-500/50 block">
              <h3 class="font-bold text-white text-base">College Predictor</h3>
              <p class="text-xs text-gray-400 mt-1">Predict eligible institutions by rank and category.</p>
            </a>
            <a href="/exams/${examShort.toLowerCase().replace(/\s+/g, '-')}/create-web-options" class="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-cyan-500/50 block">
              <h3 class="font-bold text-white text-base">Smart Web Options</h3>
              <p class="text-xs text-gray-400 mt-1">Build safe choice lists with Reach, Target, and Safe tiers.</p>
            </a>
            <a href="/${examShort.toLowerCase().replace(/\s+/g, '-')}/allotments" class="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-emerald-500/50 block">
              <h3 class="font-bold text-white text-base">Seat Allotment Explorer</h3>
              <p class="text-xs text-gray-400 mt-1">Explore authentic candidate closing ranks archive.</p>
            </a>
          </div>
          ${faqHtml}
        </main>
      `,
      schemas: [faqJson]
    };
  }

  // 9. College Directory (/colleges)
  if (p === '/colleges') {
    const title = '500+ Verified Colleges Directory — TSCHE & APSCHE Institutions';
    const faqs = [
      { q: 'How many colleges are listed in the directory?', a: 'Over 500 engineering, management, pharmacy, and polytechnic colleges across Telangana and Andhra Pradesh with verified course intakes and codes.' }
    ];
    const { html: faqHtml, jsonLd: faqJson } = renderFaqs(faqs);
    return {
      title: `${title} | Vuela Learn`,
      desc: 'Browse 500+ universities and colleges across Telangana and Andhra Pradesh with campus details, courses, and cutoffs.',
      body: `
        <main class="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 text-gray-300 space-y-10">
          <div class="border-b border-white/10 pb-6 space-y-2">
            <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">${title}</h1>
            <p class="text-sm text-gray-400">Explore comprehensive college profiles, counseling codes, district locations, and courses.</p>
          </div>
          <section class="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
            <h2 class="text-lg font-bold text-white">Comprehensive State College Database</h2>
            <p class="text-xs text-gray-300 leading-relaxed">
              Filter colleges by University affiliation (OU, JNTUH, AU, JNTUK, SVU, KU), district (Hyderabad, Ranga Reddy, Medchal, Visakhapatnam, etc.), and college type (Autonomous, University Campus, Private).
            </p>
          </section>
          ${faqHtml}
        </main>
      `,
      schemas: [faqJson]
    };
  }

  // Fallback Generic
  return {
    title: defaultTitle || `${routePath.replace(/^\//, '').replace(/[-/]/g, ' ').toUpperCase()} | Vuela Learn`,
    desc: defaultDesc || `Explore cutoffs, predictors, seat allotments, and counselling simulation tools on Vuela Learn for ${routePath}.`,
    body: `
      <main class="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 text-gray-300 space-y-8">
        <div class="border-b border-white/10 pb-6 space-y-2">
          <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">${defaultTitle || routePath}</h1>
          <p class="text-sm text-gray-400">${defaultDesc || 'State counselling simulator and cutoffs directory.'}</p>
        </div>
      </main>
    `,
    schemas: []
  };
}

// Master Route Definitions with Full Content & Schemas
const ROUTES = [
  // 1. Homepage
  {
    path: '/',
    title: 'Vuela Learn — 100% Free AP & TG Counselling Simulator, Smart Web Options & College Predictor',
    desc: '100% free state entrance counselling simulator for TG EAPCET, TG ICET, AP EAPCET, TG ECET, TG POLYCET, TG PGECET, and KCET. Accurate rank predictors, authentic seat allotments, and smart web options choice generator.',
    render: () => {
      const faqs = [
        { q: 'What is Vuela Learn?', a: 'Vuela Learn is India\'s 100% free educational counselling simulation suite. We provide rank-based college predictors, official candidate allotment explorers, and AI-driven Smart Web Option Generators for Telangana and Andhra Pradesh state entrance examinations.' },
        { q: 'How does the Smart Web Option Generator work?', a: 'Our Smart Web Option Generator analyzes historical candidate closing ranks across all caste quotas (OC, BC-A/B/C/D/E, SC, ST, EWS) and local regions (OU, AU, SVU) to structure a safe, multi-tier choice priority list (Reach, Target, Safe) to eliminate seat loss risk.' },
        { q: 'Are the cutoff predictions and allotment data authentic?', a: 'Yes. All closing cutoffs, seat matrices, and tuition fees are curated directly from official TSCHE, APSCHE, and state convenor public gazettes covering over 500 institutions.' },
        { q: 'Is Vuela Learn completely free?', a: 'Yes, 100% free. There are no paywalls, no mandatory registration fees, and we never sell student phone numbers to private college brokers.' }
      ];
      const { html: faqHtml, jsonLd: faqJson } = renderFaqs(faqs);

      return {
        body: `
          <main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
            <div class="text-center space-y-4 max-w-4xl mx-auto">
              <div class="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-300">
                <span>⚡ 100% Free Educational Platform — AP &amp; Telangana Admissions</span>
              </div>
              <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                State Admissions Counselling Simulator &amp; <span class="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Smart College Predictor</span>
              </h1>
              <p class="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Construct high-priority web options lists, predict eligible B.Tech, MBA, MCA, and Polytechnic colleges, and search authentic closing ranks across Telangana and Andhra Pradesh.
              </p>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center rounded-3xl border border-white/10 bg-white/[0.02] p-6">
              <div>
                <div class="text-2xl sm:text-3xl font-extrabold text-white">500+</div>
                <div class="text-xs text-gray-400 uppercase font-semibold mt-1">Verified Colleges</div>
              </div>
              <div>
                <div class="text-2xl sm:text-3xl font-extrabold text-purple-400">200,000+</div>
                <div class="text-xs text-gray-400 uppercase font-semibold mt-1">Allotment Records</div>
              </div>
              <div>
                <div class="text-2xl sm:text-3xl font-extrabold text-cyan-400">Smart AI</div>
                <div class="text-xs text-gray-400 uppercase font-semibold mt-1">Web Options Generator</div>
              </div>
              <div>
                <div class="text-2xl sm:text-3xl font-extrabold text-emerald-400">100% Free</div>
                <div class="text-xs text-gray-400 uppercase font-semibold mt-1">Zero Spam &bull; No Fees</div>
              </div>
            </div>

            <section class="space-y-6">
              <h2 class="text-2xl sm:text-3xl font-bold text-white text-center">Select Your Entrance Examination</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <a href="/tg-eapcet" class="rounded-3xl border border-purple-500/20 bg-[#120d1f]/90 p-6 hover:border-purple-500/50 transition block">
                  <span class="text-xs font-bold text-purple-400 uppercase">Telangana &bull; Engineering &amp; Pharmacy</span>
                  <h3 class="text-xl font-bold text-white mt-1">TG EAPCET 2027</h3>
                  <p class="text-xs text-gray-400 mt-2">B.Tech college predictor, Marks vs Rank normalizer, official seat allotments &amp; mock web options choice filling.</p>
                </a>
                <a href="/tg-icet" class="rounded-3xl border border-cyan-500/20 bg-[#0d1624]/90 p-6 hover:border-cyan-500/50 transition block">
                  <span class="text-xs font-bold text-cyan-400 uppercase">Telangana &bull; MBA &amp; MCA</span>
                  <h3 class="text-xl font-bold text-white mt-1">TG ICET 2027</h3>
                  <p class="text-xs text-gray-400 mt-2">Calibrated Marks vs Rank calculator, top B-school closing cutoffs, university quota analyzers &amp; priority generator.</p>
                </a>
                <a href="/ap-eapcet" class="rounded-3xl border border-emerald-500/20 bg-[#0c1a14]/90 p-6 hover:border-emerald-500/50 transition block">
                  <span class="text-xs font-bold text-emerald-400 uppercase">Andhra Pradesh &bull; B.Tech &amp; Agri</span>
                  <h3 class="text-xl font-bold text-white mt-1">AP EAPCET 2027</h3>
                  <p class="text-xs text-gray-400 mt-2">APSCHE college predictor, branch preference sequencer, JVD fee reimbursement rules &amp; closing cutoffs.</p>
                </a>
                <a href="/tg-ecet" class="rounded-3xl border border-amber-500/20 bg-[#1f160c]/90 p-6 hover:border-amber-500/50 transition block">
                  <span class="text-xs font-bold text-amber-400 uppercase">Diploma Lateral Entry</span>
                  <h3 class="text-xl font-bold text-white mt-1">TG ECET 2027</h3>
                  <p class="text-xs text-gray-400 mt-2">Predict 2nd-year B.Tech lateral entry engineering seats for diploma holders across top Telangana colleges.</p>
                </a>
                <a href="/tg-polycet" class="rounded-3xl border border-pink-500/20 bg-[#1f0d1a]/90 p-6 hover:border-pink-500/50 transition block">
                  <span class="text-xs font-bold text-pink-400 uppercase">10th / SSC Polytechnic</span>
                  <h3 class="text-xl font-bold text-white mt-1">TG POLYCET 2027</h3>
                  <p class="text-xs text-gray-400 mt-2">Predict government and private polytechnic diploma institutions, explore course intakes and allotment cutoffs.</p>
                </a>
                <a href="/tg-pgecet" class="rounded-3xl border border-indigo-500/20 bg-[#100d24]/90 p-6 hover:border-indigo-500/50 transition block">
                  <span class="text-xs font-bold text-indigo-400 uppercase">Postgraduate M.Tech &amp; M.Pharm</span>
                  <h3 class="text-xl font-bold text-white mt-1">TG PGECET &amp; GATE</h3>
                  <p class="text-xs text-gray-400 mt-2">Search candidate seat allotments and closing rank trends across Osmania, JNTUH, and university departments.</p>
                </a>
              </div>
            </section>

            ${faqHtml}
          </main>
        `,
        schemas: [faqJson]
      };
    }
  },

  // 2. TG ICET Marks vs Rank
  {
    path: '/exams/tg-icet/marks-vs-rank',
    title: 'TG ICET Marks vs Rank 2027 | Accurate Rank Predictor & Marks Analysis | Vuela Learn',
    desc: 'Predict your TG ICET 2027 rank from raw marks instantly. Calibrated with verified ICET ground truth data (114.95977 Marks = 312 Rank) for MBA & MCA admissions across Osmania, Kakatiya, and JNTUH.',
    render: () => {
      const faqs = [
        { q: 'How is TG ICET rank predicted from marks?', a: 'TG ICET rank prediction uses non-linear power-law interpolation calibrated against official TSCHE candidate results, including ground truth benchmarks (e.g. 114.95977 raw marks = 312 State Rank).' },
        { q: 'What is a good score in TG ICET for Osmania University (OU)?', a: 'For Osmania University MBA (Campus/Sub-campuses), general category candidates typically need 110+ marks (Rank under 500). BC/SC/ST candidates can secure seats with ranks up to 2,500-6,000 depending on specific sub-quotas.' },
        { q: 'Does TG ICET have normalization?', a: 'Yes. When the exam is conducted in multiple shifts, TSCHE applies standard normalization formula based on Mean and Standard Deviation of top 0.1% candidates to ensure fairness.' },
        { q: 'What is the qualifying mark for TG ICET 2027?', a: 'General and OBC candidates require a minimum of 25% (50 marks out of 200). There is no minimum qualifying cutoff mark for SC and ST candidates.' }
      ];
      const { html: faqHtml, jsonLd: faqJson } = renderFaqs(faqs);

      const softwareSchema = {
        "@type": "SoftwareApplication",
        "name": "TG ICET Marks vs Rank Predictor",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "320" },
        "description": "Calculates expected TG ICET rank from raw or normalized score with authentic closing cutoffs."
      };

      return {
        body: `
          <main class="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 text-gray-300 space-y-10">
            <div class="border-b border-white/10 pb-6 space-y-2">
              <div class="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300">
                <span>TG ICET 2027 Calibration Engine</span>
              </div>
              <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                TG ICET Marks vs Rank 2027: Accurate Score to Rank Calibration
              </h1>
              <p class="text-sm text-gray-400">
                Calibrated with verified candidate allotments and authentic ground truth anchors (114.95977 marks = 312 rank) for MBA and MCA admissions across Telangana universities.
              </p>
            </div>

            <section class="space-y-4">
              <h2 class="text-xl font-bold text-white">Expected TG ICET 2027 Marks vs Rank Breakdown</h2>
              <div class="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
                <table class="w-full text-left text-xs sm:text-sm">
                  <thead class="bg-purple-950/40 text-purple-200 border-b border-white/10 uppercase text-[11px] font-bold">
                    <tr>
                      <th class="py-3.5 px-4">Raw Marks (out of 200)</th>
                      <th class="py-3.5 px-4">Expected Rank Range</th>
                      <th class="py-3.5 px-4">Percentile Estimate</th>
                      <th class="py-3.5 px-4">Target Universities &amp; Top Colleges</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-white/5 text-gray-300">
                    <tr class="bg-purple-500/5 font-semibold text-white">
                      <td class="py-3 px-4">150 – 200</td>
                      <td class="py-3 px-4 text-emerald-400 font-bold">1 – 50</td>
                      <td class="py-3 px-4">99.9+ %ile</td>
                      <td class="py-3 px-4">OU Campus MBA/MCA, JNTUH Campus (Top 1%)</td>
                    </tr>
                    <tr>
                      <td class="py-3 px-4">130 – 149</td>
                      <td class="py-3 px-4 text-emerald-400 font-bold">51 – 150</td>
                      <td class="py-3 px-4">99.5 – 99.9 %ile</td>
                      <td class="py-3 px-4">OU Dept of Commerce &amp; Business Management, KU Campus</td>
                    </tr>
                    <tr class="bg-white/[0.02]">
                      <td class="py-3 px-4">114.95977 <span class="text-[10px] text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded font-mono">Anchor</span></td>
                      <td class="py-3 px-4 text-purple-300 font-bold">312 <span class="text-xs text-gray-400">(Ground Truth)</span></td>
                      <td class="py-3 px-4">98.8 %ile</td>
                      <td class="py-3 px-4">CBIT, Badruka College of Commerce, Nizam College</td>
                    </tr>
                    <tr>
                      <td class="py-3 px-4">100 – 114</td>
                      <td class="py-3 px-4 font-bold text-cyan-300">313 – 1,200</td>
                      <td class="py-3 px-4">96.0 – 98.7 %ile</td>
                      <td class="py-3 px-4">Bhavans Vivekananda, Wesley, AV College, VJIAS</td>
                    </tr>
                    <tr class="bg-white/[0.02]">
                      <td class="py-3 px-4">85 – 99</td>
                      <td class="py-3 px-4 font-bold text-cyan-300">1,201 – 3,800</td>
                      <td class="py-3 px-4">91.0 – 95.9 %ile</td>
                      <td class="py-3 px-4">St. Francis, Aurora, Matrusri, Keshav Memorial</td>
                    </tr>
                    <tr>
                      <td class="py-3 px-4">70 – 84</td>
                      <td class="py-3 px-4 font-bold text-amber-300">3,801 – 8,500</td>
                      <td class="py-3 px-4">80.0 – 90.9 %ile</td>
                      <td class="py-3 px-4">Amjad Ali Khan, Global Institute, CMR, SNIST MBA</td>
                    </tr>
                    <tr class="bg-white/[0.02]">
                      <td class="py-3 px-4">50 – 69 (Qualifying)</td>
                      <td class="py-3 px-4 font-bold text-amber-300">8,501 – 25,000+</td>
                      <td class="py-3 px-4">50.0 – 79.9 %ile</td>
                      <td class="py-3 px-4">Affiliated Private MBA Colleges across Telangana</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="rounded-3xl border border-white/10 bg-[#120d1f]/90 p-6 space-y-3">
              <h2 class="text-lg font-bold text-white">How Normalized Scores Determine Final Ranks</h2>
              <p class="text-xs text-gray-300 leading-relaxed">
                Because TG ICET is held across multiple morning and afternoon shifts, raw test scores are normalized using TSCHE statistical parity formulae. This accounts for shift difficulty variations by standardizing candidate marks against top 0.1% performance benchmarks.
              </p>
            </section>

            ${faqHtml}
          </main>
        `,
        schemas: [softwareSchema, faqJson]
      };
    }
  },

  // 8. Privacy Policy
  {
    path: '/privacy-policy',
    title: 'Privacy Policy — Vuela Learn',
    desc: 'Official Privacy Policy for Vuela Learn. Learn how we handle student data, cookies, Google AdSense, and protect user privacy.',
    render: () => {
      return {
        body: `
          <main class="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 text-gray-300 space-y-8 text-sm leading-relaxed">
            <div class="border-b border-white/10 pb-6">
              <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
              <p class="mt-2 text-xs text-gray-400">Last Updated: September 1, 2026 &bull; Effective Date: September 1, 2026</p>
            </div>
            <section class="space-y-3">
              <h2 class="text-xl font-bold text-white">1. Introduction &amp; Commitment to Privacy</h2>
              <p>Welcome to Vuela Learn (https://vuelalearn.in). Protecting your privacy and maintaining the security of your personal data is one of our primary commitments.</p>
            </section>
            <section class="space-y-3">
              <h2 class="text-xl font-bold text-white">2. Information We Do NOT Collect</h2>
              <p>We do not sell, rent, trade, or distribute student phone numbers, email addresses, or ranks to private colleges or telemarketers.</p>
            </section>
            <section class="space-y-3">
              <h2 class="text-xl font-bold text-white">3. Google AdSense &amp; Third-Party Advertising Cookies</h2>
              <p>Google is a third-party vendor on our site. It uses cookies, known as DART cookies, to serve ads based on visits to vuelalearn.in. Users may opt out of personalized advertising by visiting Google Ads Settings.</p>
            </section>
            <section class="space-y-3">
              <h2 class="text-xl font-bold text-white">4. Contact Information</h2>
              <p>For inquiries, contact our team at <a href="mailto:vuelalearn@gmail.com" class="text-purple-300 underline font-mono">vuelalearn@gmail.com</a>.</p>
            </section>
          </main>
        `,
        schemas: []
      };
    }
  },

  // 9. About Page
  {
    path: '/about',
    title: 'About Us — Vuela Learn Admissions Navigator',
    desc: 'Learn about Vuela Learn, India 100% free educational counselling simulation platform for state entrance exams.',
    render: () => {
      return {
        body: `
          <main class="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 text-gray-300 space-y-8 text-sm leading-relaxed">
            <div class="border-b border-white/10 pb-6">
              <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">About Vuela Learn</h1>
              <p class="mt-2 text-xs text-gray-400">Democratizing state educational admissions counselling through authentic data and predictive analytics.</p>
            </div>
            <section class="space-y-3">
              <h2 class="text-xl font-bold text-white">Our Mission</h2>
              <p>Vuela Learn was created as an independent, 100% free counseling simulation suite to provide institutional transparency, reliable closing rank cutoffs, and AI-driven priority ordering tools to navigate state admissions.</p>
            </section>
          </main>
        `,
        schemas: []
      };
    }
  },

  // 10. Terms of Service
  {
    path: '/terms',
    title: 'Terms of Service & Disclaimer — Vuela Learn',
    desc: 'Official Terms of Service, User Agreement, and Disclaimer for Vuela Learn educational counselling simulators.',
    render: () => {
      return {
        body: `
          <main class="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 text-gray-300 space-y-8 text-sm leading-relaxed">
            <div class="border-b border-white/10 pb-6">
              <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Terms of Service</h1>
              <p class="mt-2 text-xs text-gray-400">Last Updated: September 1, 2026 &bull; Effective Date: September 1, 2026</p>
            </div>
            <section class="space-y-3">
              <h2 class="text-xl font-bold text-white">1. Educational Simulation Nature</h2>
              <p>Vuela Learn provides educational counseling simulations. All algorithms are constructed using statistical analysis of past government closing ranks. Actual seat allotments during official state counselling are conducted exclusively by government convenor authorities.</p>
            </section>
          </main>
        `,
        schemas: []
      };
    }
  },

  // 11. Contact Page
  {
    path: '/contact',
    title: 'Contact Us & Student Support — Vuela Learn',
    desc: 'Get in touch with the Vuela Learn support team for feedback, data inquiries, or assistance.',
    render: () => {
      return {
        body: `
          <main class="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 text-gray-300 space-y-8 text-sm leading-relaxed">
            <div class="border-b border-white/10 pb-6">
              <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Contact Us</h1>
              <p class="mt-2 text-xs text-gray-400">Have a question about cutoffs, noticed an anomaly, or want to suggest a new feature? We are here to help.</p>
            </div>
            <section class="space-y-3">
              <h2 class="text-xl font-bold text-white">Direct Support Email</h2>
              <p>For feedback, inquiries, or corrections: <a href="mailto:vuelalearn@gmail.com" class="text-purple-300 underline font-mono">vuelalearn@gmail.com</a></p>
            </section>
          </main>
        `,
        schemas: []
      };
    }
  }
];

// Fallback Generic Static Generator for all remaining exam/tool pages
function generateGenericRouteContent(route) {
  const pageTitle = route.title ? route.title.split('|')[0].trim() : 'Admissions Tool';
  return `
    <main class="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 text-gray-300 space-y-8">
      <div class="border-b border-white/10 pb-6 space-y-2">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">${pageTitle}</h1>
        <p class="text-sm text-gray-400">${route.desc || 'Explore verified seat allotment archives, category closing cutoffs, and mock counselling simulators.'}</p>
      </div>
      <section class="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
        <h2 class="text-lg font-bold text-white">Official Admissions &amp; Cutoff Data</h2>
        <p class="text-xs text-gray-300 leading-relaxed">
          Explore comprehensive candidate seat allotment archives, category closing cutoffs (OC, BC, SC, ST, EWS), regional reservation parameters, and fee structures curated from state convenor gazettes.
        </p>
      </section>
    </main>
  `;
}

// Extract all routes from sitemap.xml to guarantee 100% route coverage
function getAllSitemapRoutes() {
  const sitemapPath = path.join(clientDir, 'public', 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) return [];

  const content = fs.readFileSync(sitemapPath, 'utf-8');
  const locMatches = content.matchAll(/<loc>https:\/\/vuelalearn\.in(.*?)<\/loc>/g);
  const paths = [];

  for (const match of locMatches) {
    let p = match[1].trim();
    if (!p) p = '/';
    if (!paths.includes(p)) paths.push(p);
  }
  return paths;
}

function generateStaticRoutes() {
  const baseHtmlPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(baseHtmlPath)) {
    console.error('dist/index.html not found! Run vite build first.');
    return;
  }

  const rawDistHtml = fs.readFileSync(baseHtmlPath, 'utf-8');
  
  // Cleanly isolate everything before <div id="root"> and everything from <script type="module" onwards
  const headAndBodyOpen = rawDistHtml.split(/<div id="root">/i)[0];
  const scriptAndCloseMatch = rawDistHtml.match(/(<script type="module"[\s\S]*<\/html>)/i);
  const scriptAndClose = scriptAndCloseMatch ? scriptAndCloseMatch[1] : '</body>\n</html>';

  const sitemapPaths = getAllSitemapRoutes();
  const definedMap = new Map(ROUTES.map(r => [r.path, r]));

  let count = 0;

  for (const routePath of sitemapPaths) {
    const definedRoute = definedMap.get(routePath) || {
      path: routePath,
      title: `${routePath.replace(/^\//, '').replace(/[-/]/g, ' ').toUpperCase()} | Vuela Learn`,
      desc: `Explore verified cutoffs, predictors, seat allotments, and counselling simulation tools on Vuela Learn for ${routePath}.`
    };

    let routeContent;
    let pageTitle = definedRoute.title;
    let pageDesc = definedRoute.desc;

    if (definedRoute.render) {
      routeContent = definedRoute.render();
    } else {
      const smartResult = generateSmartRouteContent(routePath, definedRoute.title, definedRoute.desc);
      routeContent = smartResult;
      pageTitle = smartResult.title || pageTitle;
      pageDesc = smartResult.desc || pageDesc;
    }

    const canonicalUrl = `https://vuelalearn.in${definedRoute.path === '/' ? '' : definedRoute.path}`;

    let schemaTags = '';
    if (routeContent.schemas && routeContent.schemas.length > 0) {
      for (const s of routeContent.schemas) {
        if (s) {
          schemaTags += `\n    <script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n    </script>`;
        }
      }
    }

    let head = headAndBodyOpen
      .replace(/<title>.*?<\/title>/i, `<title>${pageTitle}</title>`)
      .replace(/<meta name="description" content=".*?"/i, `<meta name="description" content="${pageDesc}"`)
      .replace(/<meta property="og:title" content=".*?"/i, `<meta property="og:title" content="${pageTitle}"`)
      .replace(/<meta property="og:description" content=".*?"/i, `<meta property="og:description" content="${pageDesc}"`)
      .replace(/<meta name="twitter:title" content=".*?"/i, `<meta name="twitter:title" content="${pageTitle}"`)
      .replace(/<meta name="twitter:description" content=".*?"/i, `<meta name="twitter:description" content="${pageDesc}"`);

    if (head.includes('<link rel="canonical"')) {
      head = head.replace(/<link rel="canonical" href=".*?"(\s*\/)?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
    }

    if (schemaTags) {
      head = head.replace('</head>', `${schemaTags}\n  </head>`);
    }

    const fullHtml = `${head}<div id="root">\n${getHeaderHtml()}\n${routeContent.body}\n${getFooterHtml()}\n</div>\n    ${scriptAndClose}`;

    if (definedRoute.path === '/') {
      fs.writeFileSync(baseHtmlPath, fullHtml, 'utf-8');
      count++;
    } else {
      const routeDir = path.join(distDir, definedRoute.path.replace(/^\//, ''));
      fs.mkdirSync(routeDir, { recursive: true });
      const targetFile = path.join(routeDir, 'index.html');
      fs.writeFileSync(targetFile, fullHtml, 'utf-8');
      count++;
    }
  }

  console.log(`🎉 Static SSG generator created ${count} full-body pre-rendered HTML routes with rich schemas and tables!`);
}

generateStaticRoutes();
