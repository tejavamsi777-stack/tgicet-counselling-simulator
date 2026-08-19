// Security middleware: Obfuscates sensitive data payloads for automated bots
// while seamlessly serving valid client sessions.

const SECRET_KEY = "TGC_SECURE_PAYLOAD_2026";

function obfuscateString(str) {
  const jsonStr = String(str);
  let result = "";
  for (let i = 0; i < jsonStr.length; i++) {
    result += String.fromCharCode(jsonStr.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
  }
  return Buffer.from(result).toString("base64");
}

export function payloadObfuscator(req, res, next) {
  const clientAppHeader = req.headers["x-client-app"];

  // If request does not have official web client header signature and is targeting data APIs
  const shouldObfuscate = !clientAppHeader && !req.path.includes("/health") && !req.path.includes("/admin");

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (shouldObfuscate && body && typeof body === "object" && !body._obf) {
      try {
        const encoded = obfuscateString(JSON.stringify(body));
        return originalJson({
          _obf: true,
          _sig: "TGC_SEC_V1",
          _data: encoded,
        });
      } catch (e) {
        return originalJson(body);
      }
    }
    return originalJson(body);
  };

  next();
}
