import { ArrowLeft, ClipboardList, DatabaseZap, Target } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getExamBySlug } from "../../config/exams";
import Seo from "../../components/shared/Seo";
import EapcetWebOptionsPage from "../eapcet/EapcetWebOptionsPage";

const FEATURE_COPY = {
  predictor: {
    icon: Target,
    title: "College Predictor",
    detail: "Predictor results will appear here after verified cutoff and programme data is uploaded for this exam.",
  },
  counselling: {
    icon: ClipboardList,
    title: "Mock Counselling",
    detail: "Candidate details, web options, saved preferences, and allotment practice will appear here after official counselling rules and college data are configured.",
  },
};

export default function ExamFeaturePage({ feature }) {
  const { examSlug } = useParams();
  const exam = getExamBySlug(examSlug);
  const copy = FEATURE_COPY[feature];

  if (!exam || !copy) return <Navigate to="/" replace />;
  if (exam.slug === "tg-eapcet" && feature === "counselling") return <EapcetWebOptionsPage />;
  if (exam.slug === "tg-icet") {
    return <Navigate to={feature === "predictor" ? "/tg-icet/predictor" : "/tg-icet/mock-counselling"} replace />;
  }

  const Icon = copy.icon;
  return (
    <main className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
      <Seo
        title={`${exam.shortName} ${copy.title} | Data Coming Soon`}
        description={`${exam.shortName} ${copy.title}: ${copy.detail}`}
        path={`/exams/${exam.slug}/${feature === "predictor" ? "predictor" : "mock-counselling"}`}
      />
      <Link to={`/exams/${exam.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-indigo-700">
        <ArrowLeft size={16} /> {exam.shortName} overview
      </Link>
      <section className="mt-7 rounded-[36px] border border-white/70 bg-white/75 p-8 text-center shadow-[0_24px_70px_rgba(37,99,235,0.13)] backdrop-blur-xl sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 text-white shadow-lg">
          <Icon size={25} />
        </div>
        <span className="mt-6 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">Data not available yet</span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl" style={{ fontFamily: "var(--font-display)" }}>{exam.shortName} {copy.title}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-600">{copy.detail}</p>
        <div className="mx-auto mt-8 flex max-w-xl items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-left text-sm leading-relaxed text-indigo-900">
          <DatabaseZap size={19} className="mt-0.5 shrink-0" />
          <span>The shared database and API are ready to store this exam separately. No estimate, cutoff, college, counselling rule, or allotment result will be shown until verified source data is added.</span>
        </div>
      </section>
    </main>
  );
}
