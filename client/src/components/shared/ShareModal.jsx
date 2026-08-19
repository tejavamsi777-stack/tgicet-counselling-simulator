import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
  Share2,
  Copy,
  Check,
  X,
  MessageCircle,
  Send,
  Mail,
  Link2
} from "lucide-react";

/**
 * Custom modern glowing node share logo matching the website theme
 */
export function ModernShareIcon({ className = "", size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="themeShareGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <path
        d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"
        stroke="url(#themeShareGrad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="6"
        cy="12"
        r="3.5"
        fill="#120b22"
        stroke="#a855f7"
        strokeWidth="2"
      />
      <circle cx="6" cy="12" r="1.5" fill="#f3e8ff" />
      <circle
        cx="18"
        cy="5"
        r="3.5"
        fill="#120b22"
        stroke="#c084fc"
        strokeWidth="2"
      />
      <circle cx="18" cy="5" r="1.5" fill="#ffffff" />
      <circle
        cx="18"
        cy="19"
        r="3.5"
        fill="#120b22"
        stroke="#818cf8"
        strokeWidth="2"
      />
      <circle cx="18" cy="19" r="1.5" fill="#ffffff" />
    </svg>
  );
}

export function SharePopoverContent({ onClose, shareData, placement = "bottom" }) {
  const [copied, setCopied] = useState(false);
  const [activeUrl, setActiveUrl] = useState("");
  const [activeTitle, setActiveTitle] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActiveUrl(shareData?.url || window.location.href);
      setActiveTitle(shareData?.title || document.title || "TG Counselling Portal");
    }
  }, [shareData]);

  const url = activeUrl || (typeof window !== "undefined" ? window.location.href : "https://tgcounselling.vercel.app");
  const title = activeTitle || "TG Counselling Portal";
  const text = shareData?.text || `Check out ${title} — Official Seat Allotments, College Predictors & Cutoffs for TG EAPCET, TG ICET, TG ECET & TG POLYCET!`;

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${text}\n\n${url}`);
  const encodedSubject = encodeURIComponent(`Explore: ${title}`);

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-[#25D366]/15 text-[#25D366] border-[#25D366]/30 hover:bg-[#25D366]/25",
      href: `https://api.whatsapp.com/send?text=${encodedText}`,
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-[#229ED9]/15 text-[#229ED9] border-[#229ED9]/30 hover:bg-[#229ED9]/25",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(text)}`,
    },
    {
      name: "X (Twitter)",
      icon: ({ size, className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: "bg-white/10 text-white border-white/20 hover:bg-white/20",
      href: `https://twitter.com/intent/tweet?text=${encodedText}`,
    },
    {
      name: "Facebook",
      icon: ({ size, className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: "bg-[#1877F2]/15 text-[#1877F2] border-[#1877F2]/30 hover:bg-[#1877F2]/25",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "LinkedIn",
      icon: ({ size, className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37h2.79V10.9H6.46M7.86 6.54a1.63 1.63 0 0 0-1.63 1.63c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.63-1.63-1.63z" />
        </svg>
      ),
      color: "bg-[#0A66C2]/15 text-[#0A66C2] border-[#0A66C2]/30 hover:bg-[#0A66C2]/25",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Reddit",
      icon: ({ size, className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.094z" />
        </svg>
      ),
      color: "bg-[#FF4500]/15 text-[#FF4500] border-[#FF4500]/30 hover:bg-[#FF4500]/25",
      href: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedSubject}`,
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25",
      href: `mailto:?subject=${encodedSubject}&body=${encodedText}`,
    },
  ];

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const positionClasses = placement === "top"
    ? "bottom-full mb-2 right-0 sm:right-auto sm:left-0"
    : placement === "bottom-left"
    ? "bottom-full mb-3 left-0"
    : "top-full mt-2 right-0";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: placement === "top" || placement === "bottom-left" ? 6 : -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: placement === "top" || placement === "bottom-left" ? 6 : -6 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute z-[120] w-[min(90vw,340px)] rounded-3xl border border-white/20 bg-[#120b22]/98 p-4 text-left shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.2)] text-white ${positionClasses}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
            <ModernShareIcon size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-tight">Share Page Link</h4>
            <p className="text-[10px] text-white/50">Direct share to apps or copy link</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      {/* Social Apps Grid */}
      <div className="py-3">
        <div className="grid grid-cols-4 gap-2">
          {shareLinks.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2 transition-all duration-150 active:scale-95 ${item.color}`}
              >
                <Icon size={16} />
                <span className="text-[9px] font-semibold text-center truncate w-full">{item.name.split(" ")[0]}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Copy Link Input */}
      <div className="pt-2 border-t border-white/10 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-white/50 flex items-center gap-1">
            <Link2 size={11} className="text-purple-400" />
            <span>Active URL</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-black/60 p-1">
          <input
            type="text"
            readOnly
            value={url}
            className="w-full bg-transparent px-2 text-[11px] font-mono text-cyan-300 focus:outline-none select-all overflow-ellipsis"
          />
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all duration-200 cursor-pointer shrink-0 ${
              copied
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-950/50"
                : "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-950/50 active:scale-95"
            }`}
          >
            {copied ? (
              <>
                <Check size={12} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Fallback compatibility wrapper
export function ShareModal({ isOpen, onClose, shareData }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" onClick={onClose}>
      <SharePopoverContent onClose={onClose} shareData={shareData} placement="center" />
    </div>
  );
}

/**
 * Floating Share Button docked at the bottom-left corner of every page!
 */
export function FloatingShareButton() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setOpen(!open);
  };

  return (
    <div ref={containerRef} className="fixed bottom-5 left-5 z-[100] sm:bottom-6 sm:left-6">
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="group flex h-11 w-11 items-center justify-center rounded-full border border-purple-500/35 bg-[#120b22]/90 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.25)] transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
        title="Share this page"
        aria-label="Share this page"
      >
        <ModernShareIcon size={19} />
      </button>

      <AnimatePresence>
        {open && (
          <SharePopoverContent
            onClose={() => setOpen(false)}
            shareData={{
              url: typeof window !== "undefined" ? window.location.href : "https://tgcounselling.vercel.app",
              title: typeof document !== "undefined" ? document.title : "TG Counselling Portal",
              text: "Check out TG Counselling Portal for real-time seat allotments, college cutoffs, and mock counselling simulators!",
            }}
            placement="bottom-left"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export function ShareButton({ className = "", variant = "icon", label = "Share", shareData = null }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setOpen(!open);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {variant === "icon" ? (
        <button
          onClick={handleToggle}
          className={`group flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/90 shadow-sm transition-all duration-200 hover:border-purple-500/40 hover:bg-purple-500/20 hover:text-white active:scale-95 cursor-pointer ${className}`}
          title="Share this page"
          aria-label="Share this page"
        >
          <ModernShareIcon size={16} />
        </button>
      ) : variant === "pill" ? (
        <button
          onClick={handleToggle}
          className={`inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/90 shadow-sm transition-all duration-200 hover:border-purple-500/40 hover:bg-purple-500/20 hover:text-white active:scale-95 cursor-pointer ${className}`}
        >
          <ModernShareIcon size={14} />
          <span>{label}</span>
        </button>
      ) : (
        <button
          onClick={handleToggle}
          className={`inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-all cursor-pointer ${className}`}
        >
          <ModernShareIcon size={15} />
          <span>{label}</span>
        </button>
      )}

      <AnimatePresence>
        {open && (
          <SharePopoverContent
            onClose={() => setOpen(false)}
            shareData={shareData || {
              url: typeof window !== "undefined" ? window.location.href : "https://tgcounselling.vercel.app",
              title: typeof document !== "undefined" ? document.title : "TG Counselling Portal",
              text: "Check out TG Counselling Portal for real-time seat allotments, college cutoffs, and mock counselling simulators!",
            }}
            placement="bottom"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
