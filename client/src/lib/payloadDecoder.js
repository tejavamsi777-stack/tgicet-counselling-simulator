// Transparent client-side payload decoder for obfuscated API responses

const SECRET_KEY = "TGC_SECURE_PAYLOAD_2026";

function deobfuscateString(base64Str) {
  try {
    const rawStr = atob(base64Str);
    let result = "";
    for (let i = 0; i < rawStr.length; i++) {
      result += String.fromCharCode(rawStr.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return JSON.parse(result);
  } catch (e) {
    console.warn("[PayloadDecoder Error]: Failed to deobfuscate response payload", e);
    return null;
  }
}

export function parseApiResponse(jsonBody) {
  if (jsonBody && jsonBody._obf && jsonBody._data) {
    const decoded = deobfuscateString(jsonBody._data);
    if (decoded) return decoded;
  }
  return jsonBody;
}
