import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDir = path.resolve(__dirname, '..');
const distDir = path.resolve(clientDir, 'dist');

const ROUTES = [
  { path: '/', title: 'Vuela Learn — 100% Free AP & TG College Predictor, Smart Web Options & Counselling Simulator', desc: '100% free counselling simulator for TG EAPCET, TG ICET, AP EAPCET, TG ECET, TG POLYCET & TG PGECET.' },
  { path: '/tg-icet', title: 'TG ICET 2027 Counselling Portal & Rank Predictor | Vuela Learn', desc: 'Comprehensive TG ICET MBA & MCA admissions portal. Predict ranks, explore seat allotments, and generate web options.' },
  { path: '/exams/tg-icet/marks-vs-rank', title: 'TG ICET Marks vs Rank 2027 | Accurate Rank Predictor & Marks Analysis | Vuela Learn', desc: 'Predict your TG ICET 2027 rank from raw marks instantly. Calibrated with verified ICET counseling data for MBA & MCA admissions across top Telangana universities.' },
  { path: '/exams/tg-icet/predictor', title: 'TG ICET 2027 College Predictor — Predict MBA & MCA Admissions | Vuela Learn', desc: 'Predict top Telangana MBA & MCA colleges based on your TG ICET rank, caste category, and gender quota.' },
  { path: '/exams/tg-icet/create-web-options', title: 'TG ICET Smart Web Options Generator 2027 — Safe Choice Ordering | Vuela Learn', desc: 'Build your customized, risk-ordered TG ICET web options list for MBA & MCA counselling.' },
  { path: '/exams/tg-icet/mock-counselling', title: 'TG ICET Mock Web Options Simulator 2027 | Vuela Learn', desc: 'Simulate official TG ICET choice filling before actual counselling.' },
  { path: '/tg-icet/allotments', title: 'TG ICET Seat Allotment Explorer & Closing Ranks | Vuela Learn', desc: 'Search official TG ICET closing ranks, category cutoffs, and seat allocations.' },
  { path: '/tg-icet/compare', title: 'Compare TG ICET MBA & MCA Colleges | Vuela Learn', desc: 'Compare fees, placements, and cutoffs across Telangana business schools.' },
  { path: '/tg-icet/documents', title: 'TG ICET Counselling Certificate Verification & Document Checklist | Vuela Learn', desc: 'Complete checklist of mandatory certificates for TG ICET counselling.' },
  { path: '/tg-eapcet', title: 'TG EAPCET 2027 Counselling Navigator & Engineering Predictor | Vuela Learn', desc: 'Complete guidance for Telangana engineering admissions. Predict eligible colleges and cutoffs.' },
  { path: '/exams/tg-eapcet/marks-vs-rank', title: 'TG EAPCET Marks vs Rank 2027 | Normalized Score to Rank Calculator | Vuela Learn', desc: 'Calculate your TG EAPCET 2027 rank from expected marks with combined normalization.' },
  { path: '/exams/tg-eapcet/predictor', title: 'TG EAPCET 2027 College Predictor — Predict B.Tech Seats | Vuela Learn', desc: 'Predict eligible Telangana engineering & pharmacy colleges by TS/TG EAPCET rank.' },
  { path: '/exams/tg-eapcet/create-web-options', title: 'TG EAPCET Smart Web Options Generator 2027 | Vuela Learn', desc: 'Generate a strategic choice list with Reach, Target, and Safe colleges for TG EAPCET.' },
  { path: '/exams/tg-eapcet/mock-counselling', title: 'TG EAPCET Mock Counselling & Choice Ordering Simulator | Vuela Learn', desc: 'Practice web options sequencing to prevent seat loss in TS counselling.' },
  { path: '/tg-eapcet/allotments', title: 'TG EAPCET Seat Allotments & Candidate Closing Ranks | Vuela Learn', desc: 'Explore historical closing ranks and round-wise allotments for Telangana B.Tech.' },
  { path: '/tg-eapcet/compare', title: 'Compare TG EAPCET Engineering Colleges | Vuela Learn', desc: 'Side-by-side comparison of placements, NAAC grades, and tuition fees.' },
  { path: '/tg-eapcet/documents', title: 'TG EAPCET Documents, Reservation & Fee Reimbursement Guide | Vuela Learn', desc: 'Verification certificates and TS ePASS eligibility details.' },
  { path: '/ap-eapcet', title: 'AP EAPCET 2027 Admissions Portal & Engineering College Predictor | Vuela Learn', desc: 'Andhra Pradesh engineering counselling simulation, college predictors, and cutoffs.' },
  { path: '/exams/ap-eapcet/predictor', title: 'AP EAPCET 2027 College Predictor — B.Tech Admissions | Vuela Learn', desc: 'Predict eligible Andhra Pradesh engineering colleges by AP EAPCET rank.' },
  { path: '/exams/ap-eapcet/create-web-options', title: 'AP EAPCET Smart Web Options Generator 2027 | Vuela Learn', desc: 'AI-assisted preference sequencing for APSCHE engineering web counselling.' },
  { path: '/exams/ap-eapcet/mock-counselling', title: 'AP EAPCET Web Options Choice Simulator | Vuela Learn', desc: 'Interactive choice ordering simulator for AP EAPCET engineering admissions.' },
  { path: '/ap-eapcet/allotments', title: 'AP EAPCET Allotments & College Closing Cutoffs | Vuela Learn', desc: 'Search official candidate allotments and closing ranks across Andhra Pradesh.' },
  { path: '/ap-eapcet/compare', title: 'Compare AP EAPCET Colleges | Vuela Learn', desc: 'Compare engineering colleges in Andhra Pradesh across NIRF, cutoffs, and fees.' },
  { path: '/ap-eapcet/documents', title: 'AP EAPCET Verification Checklist & JVD Fee Reimbursement Guide | Vuela Learn', desc: 'Documentation checklist and Jagananna Vidya Deevena eligibility criteria.' },
  { path: '/tg-ecet', title: 'TG ECET 2027 Lateral Entry Predictor & Counselling Guide | Vuela Learn', desc: '2nd-year B.Tech admissions guidance for diploma holders in Telangana.' },
  { path: '/exams/tg-ecet/predictor', title: 'TG ECET Lateral Entry College Predictor 2027 | Vuela Learn', desc: 'Predict B.Tech seats for diploma holders across top Telangana engineering colleges.' },
  { path: '/exams/tg-ecet/create-web-options', title: 'TG ECET Smart Web Options Generator 2027 | Vuela Learn', desc: 'Build lateral entry branch preference lists for TG ECET counselling.' },
  { path: '/exams/tg-ecet/mock-counselling', title: 'TG ECET Mock Web Options Simulator | Vuela Learn', desc: 'Simulate priority ordering for diploma lateral entry admissions.' },
  { path: '/tg-ecet/allotments', title: 'TG ECET Seat Allotment Archive & Closing Ranks | Vuela Learn', desc: 'Official TG ECET cutoffs and allotment trends for diploma engineers.' },
  { path: '/tg-ecet/compare', title: 'Compare TG ECET Lateral Entry Colleges | Vuela Learn', desc: 'Compare lateral entry intake and branch opportunities across colleges.' },
  { path: '/tg-ecet/documents', title: 'TG ECET Counselling Document Checklist & Verification Guidelines | Vuela Learn', desc: 'Mandatory certificates and certificates for TG ECET diploma counselling.' },
  { path: '/tg-polycet', title: 'TG POLYCET 2027 Polytechnic Predictor & Admissions Portal | Vuela Learn', desc: 'Diploma admissions after 10th/SSC in Telangana government & private polytechnics.' },
  { path: '/exams/tg-polycet/predictor', title: 'TG POLYCET 2027 Polytechnic College Predictor | Vuela Learn', desc: 'Predict government and private polytechnic diploma colleges after 10th class.' },
  { path: '/exams/tg-polycet/create-web-options', title: 'TG POLYCET Smart Web Options Generator | Vuela Learn', desc: 'Create your 3-year engineering polytechnic choice list.' },
  { path: '/exams/tg-polycet/mock-counselling', title: 'TG POLYCET Mock Choice Simulator | Vuela Learn', desc: 'Simulate polytechnic web options sequencing before official rounds.' },
  { path: '/tg-polycet/allotments', title: 'TG POLYCET Allotments & Polytechnic Closing Cutoffs | Vuela Learn', desc: 'Search official TG POLYCET allotment records and closing ranks.' },
  { path: '/tg-polycet/compare', title: 'Compare TG POLYCET Polytechnic Colleges | Vuela Learn', desc: 'Compare government polytechnics and top private diploma institutes.' },
  { path: '/tg-polycet/documents', title: 'TG POLYCET Document Checklist & Certificate Verification Guide | Vuela Learn', desc: 'Document checklist for 10th passed candidates attending polytechnic counselling.' },
  { path: '/tg-pgecet', title: 'TG PGECET 2027 M.Tech & M.Pharm Admissions Explorer | Vuela Learn', desc: 'Postgraduate admissions guidance and candidate allotment records in Telangana.' },
  { path: '/tg-pgecet/predictor', title: 'TG PGECET M.Tech & M.Pharm Predictor | Vuela Learn', desc: 'Find eligible PG engineering specializations based on TG PGECET/GATE scores.' },
  { path: '/tg-pgecet/allotments', title: 'TG PGECET Seat Allotments & Closing Ranks | Vuela Learn', desc: 'Search postgraduate M.Tech, M.E. & M.Pharm seat allotments and cutoffs.' },
  { path: '/tg-pgecet/compare', title: 'Compare TG PGECET Postgraduate Colleges | Vuela Learn', desc: 'Compare postgraduate engineering colleges and university faculties.' },
  { path: '/tg-pgecet/documents', title: 'TG PGECET Document Checklist & Verification Guidelines | Vuela Learn', desc: 'Complete certificate verification list for PGECET / GATE / GPAT admissions.' },
  { path: '/kcet/allotments', title: 'KCET Engineering Seat Allotments & Closing Ranks | Vuela Learn', desc: 'Search verified KCET candidate allotments and engineering closing ranks.' },
  { path: '/colleges', title: 'Engineering & Management Colleges Directory (AP & TG) | Vuela Learn', desc: 'Comprehensive directory of engineering and MBA/MCA colleges across AP and Telangana.' },
  { path: '/compare', title: 'College Comparison Tool — Side-by-Side Analytics | Vuela Learn', desc: 'Compare any two colleges across cutoffs, placements, accreditation, and fees.' },
  { path: '/about', title: 'About Us — Vuela Learn Admissions Navigator', desc: 'Learn about Vuela Learn, India 100% free educational counselling simulation platform.' },
  { path: '/privacy-policy', title: 'Privacy Policy — Vuela Learn', desc: 'Official Privacy Policy and data protection standards for Vuela Learn.' },
  { path: '/terms', title: 'Terms of Service & Disclaimer — Vuela Learn', desc: 'Official Terms of Service, User Agreement, and Disclaimer for Vuela Learn.' },
  { path: '/contact', title: 'Contact Us & Student Support — Vuela Learn', desc: 'Get in touch with the Vuela Learn support team for feedback, data inquiries, or assistance.' },
];

function generateStaticRoutes() {
  const baseHtmlPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(baseHtmlPath)) {
    console.error('dist/index.html not found! Run vite build first.');
    return;
  }

  const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8');
  let count = 0;

  for (const route of ROUTES) {
    if (route.path === '/') continue;

    let modifiedHtml = baseHtml
      .replace(/<title>.*?<\/title>/i, `<title>${route.title}</title>`)
      .replace(/<meta name="description" content=".*?"/i, `<meta name="description" content="${route.desc}"`)
      .replace(/<meta property="og:title" content=".*?"/i, `<meta property="og:title" content="${route.title}"`)
      .replace(/<meta property="og:description" content=".*?"/i, `<meta property="og:description" content="${route.desc}"`)
      .replace(/<meta name="twitter:title" content=".*?"/i, `<meta name="twitter:title" content="${route.title}"`)
      .replace(/<meta name="twitter:description" content=".*?"/i, `<meta name="twitter:description" content="${route.desc}"`);

    const canonicalUrl = `https://vuelalearn.in${route.path}`;
    if (modifiedHtml.includes('<link rel="canonical"')) {
      modifiedHtml = modifiedHtml.replace(/<link rel="canonical" href=".*?"/i, `<link rel="canonical" href="${canonicalUrl}"`);
    }

    const routeDir = path.join(distDir, route.path.replace(/^\//, ''));
    fs.mkdirSync(routeDir, { recursive: true });
    const targetFile = path.join(routeDir, 'index.html');
    fs.writeFileSync(targetFile, modifiedHtml, 'utf-8');
    count++;
  }

  console.log(`🎉 Static route generator created ${count} dedicated HTML files with full SEO metadata!`);
}

generateStaticRoutes();
