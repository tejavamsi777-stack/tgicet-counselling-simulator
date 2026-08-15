import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ExamCard from "../components/exams/ExamCard";
import { exams } from "../config/exams";
import Seo from "../components/shared/Seo";
import AdSenseUnit from "../components/ads/AdSenseUnit";

export default function Home() {
  const sortedExams = useMemo(() => {
    return [...exams].sort((a, b) => {
      const aAvail = a.status === "available" ? 0 : 1;
      const bAvail = b.status === "available" ? 0 : 1;
      return aAvail - bAvail;
    });
  }, []);

  return (
    <main className="relative mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center px-3.5 py-12 sm:px-6 sm:py-16">
      <Seo
        title="TG Counselling — Telangana Entrance Exam Tools"
        description="College predictor and mock counselling simulator for TG ICET, TG EAPCET, TG ECET, TG POLYCET and more Telangana entrance exams."
      />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 w-full text-center sm:mb-12"
      >
        <div className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-sm border border-white/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-300 sm:text-sm">
            Telangana Entrance Exams
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-purple-300" />
        </div>

        <h1
          className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
          id="exam-selection-heading"
        >
          Select your exam to get started
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm font-medium text-gray-200 sm:mt-5 sm:text-base sm:font-normal sm:text-gray-300">
          College predictor and mock counselling tools — built specifically for Telangana entrance counselling.
        </p>
      </motion.div>

      {/* Exam cards */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
        aria-labelledby="exam-selection-heading"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {sortedExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      </motion.section>

      {/* Passive, non-intrusive Home page advertisement banner */}
      <div className="mt-12 w-full">
        <AdSenseUnit slotName="homeBanner" minHeight={90} />
      </div>
    </main>
  );
}
