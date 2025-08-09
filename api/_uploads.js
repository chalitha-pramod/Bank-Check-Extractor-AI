module.exports = async function handler(req, res) {
  const backendBase = process.env.BACKEND_URL;
  if (!backendBase) {
    res.status(500).json({ message: 'Missing BACKEND_URL environment variable' });
    return;
  }

  const originalPath = req.url.replace(/^\/api\/_uploads/, '/uploads');
  const targetUrl = `${backendBase.replace(/\/$/, '')}${originalPath}`;

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      res.status(response.status).end();
      return;
    }
    for (const [key, value] of response.headers.entries()) {
      if (key.toLowerCase() === 'transfer-encoding') continue;
      res.setHeader(key, value);
    }
    res.status(response.status);
    response.body.pipe(res);
  } catch (err) {
    res.status(502).json({ message: 'Proxy error', error: err.message });
  }
}


