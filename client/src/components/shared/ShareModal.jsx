import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  X,
  MessageCircle,
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

export const DEFAULT_SHARE_TEXT =
  "🏛️ Vuela Learn — Authentic AP & TG Admission Guidance Platform\n\n" +
  "Find official seat allotments, verified college rank predictors, and mock web options simulators for AP EAPCET, TG EAPCET, TG ICET, TG ECET & TG POLYCET — 100% Free!\n\n" +
  "👥 Please share with your classmates & leave us a quick review to help fellow students! ⭐";

export function SharePopoverContent({ onClose, shareData }) {
  const [copied, setCopied] = useState(false);
  const [activeUrl, setActiveUrl] = useState("");
  const [activeTitle, setActiveTitle] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActiveUrl(shareData?.url || window.location.href);
      setActiveTitle(shareData?.title || document.title || "Vuela Learn Portal");
    }
  }, [shareData]);

  const url = activeUrl || (typeof window !== "undefined" ? window.location.href : "https://vuelalearn.in");
  const title = activeTitle || "Vuela Learn Portal";
  const text = shareData?.text || DEFAULT_SHARE_TEXT;

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
      icon: ({ size, className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.197 1.006.128.832.922z" />
        </svg>
      ),
      color: "bg-[#229ED9]/15 text-[#229ED9] border-[#229ED9]/30 hover:bg-[#229ED9]/25",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(text)}`,
    },
    {
      name: "X / Twitter",
      icon: ({ size, className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: "bg-white/10 text-white border-white/20 hover:bg-white/20",
      href: `https://twitter.com/intent/tweet?text=${encodedText}`,
    },
    {
      name: "LinkedIn",
      icon: ({ size, className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
      color: "bg-[#0A66C2]/15 text-[#0A66C2] border-[#0A66C2]/30 hover:bg-[#0A66C2]/25",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Facebook",
      icon: ({ size, className }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z" />
        </svg>
      ),
      color: "bg-[#1877F2]/15 text-[#1877F2] border-[#1877F2]/30 hover:bg-[#1877F2]/25",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ type: "spring", damping: 26, stiffness: 320 }}
      className="relative z-10 w-full max-w-sm rounded-3xl border border-white/20 bg-[#120b22]/95 p-5 text-left shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.25)] backdrop-blur-3xl text-white"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 shadow-inner">
            <ModernShareIcon size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">Share Vuela Learn</h4>
            <p className="text-[11px] text-white/50">Direct share to apps or copy link</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={15} />
        </button>
      </div>

      {/* Social Apps Grid */}
      <div className="py-4">
        <div className="grid grid-cols-4 gap-2.5">
          {shareLinks.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-2.5 transition-all duration-150 active:scale-95 ${item.color}`}
              >
                <Icon size={18} />
                <span className="text-[10px] font-semibold text-center truncate w-full">{item.name.split(" ")[0]}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Copy Link Input */}
      <div className="pt-3 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-white/60 flex items-center gap-1.5">
            <Link2 size={12} className="text-purple-400" />
            <span>Active Page URL</span>
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-black/60 p-1.5 shadow-inner">
          <input
            type="text"
            readOnly
            value={url}
            className="w-full bg-transparent px-2 text-xs font-mono text-cyan-300 focus:outline-none select-all overflow-ellipsis"
          />
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 ${
              copied
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-950/50"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white shadow-md shadow-purple-950/50 active:scale-95"
            }`}
          >
            {copied ? (
              <>
                <Check size={13} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Universal Share Modal using React Portal
 */
export function ShareModal({ isOpen, onClose, shareData }) {
  if (typeof document === "undefined" || !isOpen) return null;
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Hardware-Accelerated Smooth Frosted Backdrop (Zero GPU Glitch) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={onClose}
            style={{ transform: "translateZ(0)", willChange: "opacity" }}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
          />
          <SharePopoverContent onClose={onClose} shareData={shareData} />
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/**
 * Floating Share Button docked at the bottom-left corner of every page!
 */
export function FloatingShareButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 left-5 z-[80] sm:bottom-6 sm:left-6">
      <button
        onClick={() => setOpen(true)}
        className="group flex h-11 w-11 items-center justify-center rounded-full border border-purple-500/35 bg-[#120b22]/90 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.25)] transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
        title="Share this page"
        aria-label="Share this page"
      >
        <ModernShareIcon size={19} />
      </button>

      <ShareModal
        isOpen={open}
        onClose={() => setOpen(false)}
        shareData={{
          url: typeof window !== "undefined" ? window.location.href : "https://vuelalearn.in",
          title: typeof document !== "undefined" ? document.title : "Vuela Learn Portal",
          text: DEFAULT_SHARE_TEXT,
        }}
      />
    </div>
  );
}

export function ShareButton({ className = "", variant = "icon", label = "Share", shareData = null, onBeforeOpen = null }) {
  const [open, setOpen] = useState(false);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (onBeforeOpen) onBeforeOpen();
    setOpen(true);
  };

  return (
    <div className="inline-block text-left">
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

      <ShareModal
        isOpen={open}
        onClose={() => setOpen(false)}
        shareData={shareData || {
          url: typeof window !== "undefined" ? window.location.href : "https://vuelalearn.in",
          title: typeof document !== "undefined" ? document.title : "Vuela Learn Portal",
          text: DEFAULT_SHARE_TEXT,
        }}
      />
    </div>
  );
}
