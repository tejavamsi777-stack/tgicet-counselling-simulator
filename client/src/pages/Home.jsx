import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import ExamCard from "../components/exams/ExamCard";
import { exams } from "../config/exams";
import Seo from "../components/shared/Seo";
import AdSenseUnit from "../components/ads/AdSenseUnit";
import WhyChooseUs from "../components/home/WhyChooseUs";
import FaqSection from "../components/shared/FaqSection";
import { HOME_FAQS } from "../data/faqsData";

export default function Home() {
  const sortedExams = useMemo(() => {
    return [...exams].sort((a, b) => {
      const aAvail = a.status === "available" ? 0 : 1;
      const bAvail = b.status === "available" ? 0 : 1;
      return aAvail - bAvail;
    });
  }, []);

  return (
    <main className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-3 py-6 sm:px-6 sm:py-10">
      <Seo
        title="VuelaLearn — AP & TG Counselling Simulator, College Predictor & Cutoffs"
        description="Free AP & TG college predictor, mock web options simulator & authentic seat allotments for AP EAPCET, TG EAPCET, TG ICET, TG ECET & POLYCET."
      />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 w-full text-center sm:mb-8"
      >
        <div className="mx-auto mb-3 flex max-w-fit items-center justify-center space-x-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-sm border border-white/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-300 sm:text-sm">
            Andhra Pradesh &amp; Telangana Admissions
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
        <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-gray-200 sm:text-base sm:font-normal sm:text-gray-300">
          College predictor, mock web options simulator, and fee reimbursement tools — built specifically for APSCHE &amp; TSCHE entrance counselling.
        </p>
      </motion.div>

      {/* Exam cards (Extended width with tighter gap) */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="w-full mb-8"
        aria-labelledby="exam-selection-heading"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3">
          {sortedExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      </motion.section>

      {/* Section Divider */}
      <div className="my-6 w-full border-t border-white/[0.08]" />

      {/* Why Choose Our Website & About Section */}
      <div className="w-full mb-8">
        <WhyChooseUs />
      </div>

      {/* Section Divider */}
      <div className="my-6 w-full border-t border-white/[0.08]" />

      {/* Main Home Page FAQs */}
      <div className="w-full mb-8">
        <FaqSection
          title="Frequently Asked Questions (FAQs)"
          subtitle="Everything you need to know about state entrance counselling, cutoff predictions, fee calculators, and mock choice simulations"
          faqs={HOME_FAQS}
        />
      </div>

      {/* Passive, non-intrusive Home page advertisement banner */}
      <div className="mt-4 w-full">
        <AdSenseUnit slotName="homeBanner" minHeight={90} />
      </div>
    </main>
  );
}
