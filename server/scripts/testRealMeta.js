import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testApi() {
  const res = await fetch('http://localhost:4000/api/kcet/allotments/meta');
  const json = await res.json();
  console.log("=== API Response ===");
  console.log("Obfuscated:", json._obf);

  if (json._data) {
    const key = 'TGC_SEC_KEY_2026';
    const b64 = Buffer.from(json._data, 'base64');
    let out = '';
    for(let i=0; i<b64.length; i++){
      out += String.fromCharCode(b64[i] ^ key.charCodeAt(i % key.length));
    }
    const parsed = JSON.parse(out);
    console.log("Parsed colleges count:", parsed.colleges ? parsed.colleges.length : "NO COLLEGES FIELD");
    if (parsed.colleges) {
      console.log("First 3:", parsed.colleges.slice(0, 3));
      console.log("Last 3:", parsed.colleges.slice(-3));
    }
  }
}

testApi();
