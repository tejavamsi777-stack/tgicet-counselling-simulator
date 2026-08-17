import fs from 'fs';
import zlib from 'zlib';

function decompressPdf(filePath) {
  const buf = fs.readFileSync(filePath);
  let textOut = '';
  let pos = 0;

  while (pos < buf.length) {
    const streamIdx = buf.indexOf('stream\r\n', pos);
    if (streamIdx === -1) {
      const altIdx = buf.indexOf('stream\n', pos);
      if (altIdx === -1) break;
    }
    const startTag = buf.indexOf('stream', pos);
    if (startTag === -1) break;

    // skip \r\n or \n
    let dataStart = startTag + 6;
    if (buf[dataStart] === 0x0d && buf[dataStart + 1] === 0x0a) dataStart += 2;
    else if (buf[dataStart] === 0x0a) dataStart += 1;

    const endIdx = buf.indexOf('endstream', dataStart);
    if (endIdx === -1) break;

    const streamData = buf.slice(dataStart, endIdx);
    try {
      const uncompressed = zlib.inflateSync(streamData);
      textOut += uncompressed.toString('latin1') + '\n';
    } catch (e) {
      try {
        const uncompressedRaw = zlib.inflateRawSync(streamData);
        textOut += uncompressedRaw.toString('latin1') + '\n';
      } catch (e2) {}
    }
    pos = endIdx + 9;
  }
  return textOut;
}

async function run() {
  console.log('Extracting text from TGPOLYCET_2025_FINALPHASE.pdf...');
  const text = decompressPdf('client/public/files/TGPOLYCET_2025_FINALPHASE.pdf');
  fs.writeFileSync('server/src/data/polycet_2025_final_extracted.txt', text);
  console.log('Extracted text length:', text.length);

  // Look for text fragments like (MASB), (CME), (OC_GEN_OU), closing ranks
  const matches = text.match(/\(([^\)]{2,})\)/g) || [];
  const cleanTokens = matches.map(m => m.replace(/^\(/, '').replace(/\)$/, ''));
  console.log(`Found ${cleanTokens.length} text tokens in PDF.`);
  fs.writeFileSync('server/src/data/polycet_tokens.txt', cleanTokens.join('\n'));
  console.log('Sample tokens:', cleanTokens.slice(0, 50));
}

run();
