import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Hero2() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Gradient background with grain effect */}
      <div className="pointer-events-none absolute -right-60 -top-10 z-0 flex flex-col items-end blur-xl">
        <div className="z-1 h-[10rem] w-[60rem] rounded-full bg-gradient-to-b from-purple-600 to-sky-600 blur-[6rem]"></div>
        <div className="z-1 h-[10rem] w-[90rem] rounded-full bg-gradient-to-b from-pink-900 to-yellow-400 blur-[6rem]"></div>
        <div className="z-1 h-[10rem] w-[60rem] rounded-full bg-gradient-to-b from-yellow-600 to-sky-500 blur-[6rem]"></div>
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      ></div>

      {/* Content container */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto mt-6 flex items-center justify-between px-4 py-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
              <span className="font-bold">⚡</span>
            </div>
            <span className="ml-2 text-xl font-bold text-white">LeadGenie</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-6 md:flex">
            <div className="flex items-center space-x-6">
              <NavItem label="Use Cases" hasDropdown />
              <NavItem label="Products" hasDropdown />
              <NavItem label="Resources" hasDropdown />
              <NavItem label="Pricing" />
            </div>
            <div className="flex items-center space-x-3">
              <button className="h-12 rounded-full bg-white px-8 text-base font-medium text-black hover:bg-white/90">
                Login
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Toggle menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </nav>

        {/* Mobile Navigation Menu with animation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex flex-col bg-black/95 p-4 md:hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
                    <span className="font-bold">⚡</span>
                  </div>
                  <span className="ml-2 text-xl font-bold text-white">
                    LeadGenie
                  </span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="mt-8 flex flex-col space-y-6">
                <MobileNavItem label="Use Cases" />
                <MobileNavItem label="Products" />
                <MobileNavItem label="Resources" />
                <MobileNavItem label="Pricing" />
                <div className="pt-4">
                  <button className="w-full justify-start border border-gray-700 text-white">
                    Log in
                  </button>
                </div>
                <button className="h-12 rounded-full bg-white px-8 text-base font-medium text-black hover:bg-white/90">
                  Get Started For Free
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge */}
        <div className="mx-auto mt-6 flex max-w-fit items-center justify-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
          <span className="text-sm font-medium text-white">
            Join the revolution today!
          </span>
          <ArrowRight className="h-4 w-4 text-white" />
        </div>

        {/* Hero section */}
        <div className="container mx-auto mt-12 px-4 text-center">
          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
            Unbeatable Pricing for Dynamic Email Tools
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
            Delivering unmatched email campaigns every day at unbeatable rates.
            Our tool redefines cost-effectiveness. Now!!!
          </p>
          <div className="mt-10 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <button className="h-12 rounded-full bg-white px-8 text-base font-medium text-black hover:bg-white/90">
              Start Your 7 Day Free Trial
            </button>
            <button className="h-12 rounded-full border border-gray-600 px-8 text-base font-medium text-white hover:bg-white/10">
              Watch Demo
            </button>
          </div>

          <div className="relative mx-auto my-20 w-full max-w-6xl">
            <div className="bg-grainy absolute inset-0 rounded bg-white blur-[10rem] opacity-20 shadow-lg" />
            <img
              src="https://kikxai.netlify.app/_next/image?url=%2Fassets%2Fhero-image.png&w=1920&q=75"
              alt="Hero Image"
              className="relative h-auto w-full rounded shadow-md grayscale-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ label, hasDropdown }) {
  return (
    <div className="flex items-center text-sm text-gray-300 hover:text-white">
      <span>{label}</span>
      {hasDropdown && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-1"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      )}
    </div>
  );
}

function MobileNavItem({ label }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-800 pb-2 text-lg text-white">
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 text-gray-400" />
    </div>
  );
}
