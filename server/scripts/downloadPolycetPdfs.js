import fs from 'fs';
import path from 'path';

const PDFS_TO_DOWNLOAD = [
  {
    url: 'https://tgpolycetd.nic.in/files/TGPOLYCET_2025_FINALPHASE.pdf',
    filename: 'TGPOLYCET_2025_FINALPHASE.pdf'
  },
  {
    url: 'https://tgpolycetd.nic.in/files/TGPOLYCET_2025_FirstPhase.pdf',
    filename: 'TGPOLYCET_2025_FirstPhase.pdf'
  },
  {
    url: 'https://tgpolycetd.nic.in/files/TG_POLYCET_2026_DETAILEDNOTIFICATION.pdf',
    filename: 'TG_POLYCET_2026_DETAILEDNOTIFICATION.pdf'
  },
  {
    url: 'https://tgpolycetd.nic.in/files/01TGPOLYCET2026SPOTGUIDELINESTOCAND.PDF',
    filename: 'TGPOLYCET_2026_SPOT_GUIDELINES.pdf'
  },
  {
    url: 'https://tgpolycetd.nic.in/files/TGPOLYCET2026CandidateUserGuide.pdf',
    filename: 'TGPOLYCET_2026_Candidate_User_Guide.pdf'
  },
  {
    url: 'https://tgpolycetd.nic.in/files/MANUALOPTIONFORM.PDF',
    filename: 'TGPOLYCET_MANUALOPTIONFORM.pdf'
  }
];

async function downloadPdfs() {
  const destDir = path.resolve('client/public/files');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  for (const item of PDFS_TO_DOWNLOAD) {
    const destPath = path.join(destDir, item.filename);
    console.log(`Downloading ${item.url} -> ${item.filename}...`);
    try {
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://tgpolycet.nic.in/default.aspx'
        }
      });
      if (!res.ok) {
        console.warn(`Failed to download ${item.filename}: HTTP ${res.status}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(destPath, buffer);
      console.log(`✅ Saved ${item.filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
    } catch (e) {
      console.error(`Error downloading ${item.filename}:`, e.message);
    }
  }
}

downloadPdfs();
