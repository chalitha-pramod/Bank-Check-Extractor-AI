exports.config = {
  api: { bodyParser: false }
};

module.exports = async function handler(req, res) {
  const backendBase = process.env.BACKEND_URL;
  if (!backendBase) {
    res.status(500).json({ message: 'Missing BACKEND_URL environment variable' });
    return;
  }

  const matched = req.url.match(/\/api\/(.*)$/);
  const pathAfterApi = matched ? matched[1] : '';
  const targetUrl = `${backendBase.replace(/\/$/, '')}/api/${pathAfterApi}`;

  try {
    const headers = { ...req.headers };
    delete headers.host;

    const init = {
      method: req.method,
      headers,
      redirect: 'manual'
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = req;
    }

    const response = await fetch(targetUrl, init);

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


