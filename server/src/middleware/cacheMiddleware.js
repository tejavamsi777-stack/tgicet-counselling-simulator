// Simple, fast in-memory TTL cache for GET endpoints
const cacheMap = new Map();
const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function cacheMiddleware(ttlMs = DEFAULT_TTL_MS) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    // Skip health check or admin endpoints
    if (req.path.includes('/health') || req.path.includes('/admin')) return next();

    const clientHeader = req.headers['x-client-app'] || 'public';
    const cacheKey = `${clientHeader}:${req.originalUrl || req.url}`;
    const cached = cacheMap.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < ttlMs) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', 'public, max-age=900');
      return res.status(cached.status).json(cached.body);
    }

    // Intercept res.json to store response in cache
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheMap.set(cacheKey, {
          timestamp: Date.now(),
          status: res.statusCode,
          body,
        });
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
}

export function clearCache() {
  cacheMap.clear();
}
