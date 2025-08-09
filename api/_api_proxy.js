module.exports = async function handler(req, res) {
  const backendBase = process.env.BACKEND_URL;
  if (!backendBase) {
    res.status(500).json({ message: 'Missing BACKEND_URL environment variable' });
    return;
  }

  const targetUrl = `${backendBase.replace(/\/$/, '')}${req.url}`;

  try {
    const headers = { ...req.headers };
    // Remove host header to avoid issues
    delete headers.host;

    const init = {
      method: req.method,
      headers,
      redirect: 'manual'
    };

    // Pipe body if present
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = req;
    }

    const response = await fetch(targetUrl, init);

    // Pass through status and headers
    for (const [key, value] of response.headers.entries()) {
      if (key.toLowerCase() === 'transfer-encoding') continue;
      res.setHeader(key, value);
    }

    res.status(response.status);
    if (response.body) {
      response.body.pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    res.status(502).json({ message: 'Proxy error', error: err.message });
  }
}


