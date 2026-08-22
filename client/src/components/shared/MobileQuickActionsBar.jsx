import { ArrowUp, Share2, Filter, Download } from 'lucide-react';
import { useState } from 'react';
import { ShareModal } from './ShareModal';

export default function MobileQuickActionsBar({
  onFilterClick,
  onExportClick,
  shareTitle = 'Vuela Learn Simulator',
  shareUrl,
}) {
  const [shareOpen, setShareOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden flex items-center justify-around gap-2 rounded-2xl border border-white/15 bg-black/80 backdrop-blur-xl p-2 shadow-2xl shadow-purple-950/80">
        <button
          type="button"
          onClick={scrollToTop}
          className="flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
        >
          <ArrowUp size={16} className="text-purple-400" />
          <span className="text-[10px] font-medium">Top</span>
        </button>

        {onFilterClick && (
          <button
            type="button"
            onClick={onFilterClick}
            className="flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            <Filter size={16} className="text-sky-400" />
            <span className="text-[10px] font-medium">Filter</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
        >
          <Share2 size={16} className="text-emerald-400" />
          <span className="text-[10px] font-medium">Share</span>
        </button>

        {onExportClick && (
          <button
            type="button"
            onClick={onExportClick}
            className="flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            <Download size={16} className="text-amber-400" />
            <span className="text-[10px] font-medium">Export</span>
          </button>
        )}
      </div>

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        shareData={{
          title: shareTitle,
          url: shareUrl || (typeof window !== 'undefined' ? window.location.href : ''),
        }}
      />
    </>
  );
}
