import { GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200/60 bg-white/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 text-center md:flex-row">

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-600 p-2 text-white">
            <GraduationCap size={20} />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              TG ICET Predictor
            </h3>

            <p className="text-sm text-slate-500">
              Predict colleges using previous years' cutoff data.
            </p>
          </div>
        </div>

        <div className="flex gap-8 text-sm text-slate-500">
          <button className="transition hover:text-blue-600">
            About
          </button>

          <button className="transition hover:text-blue-600">
            Contact
          </button>

          <button className="transition hover:text-blue-600">
            Privacy
          </button>

          <button className="transition hover:text-blue-600">
            Data Source
          </button>
        </div>
      </div>

      <div className="border-t border-slate-200/60 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} TG ICET Predictor • Built with React & Tailwind CSS
      </div>
    </footer>
  );
}