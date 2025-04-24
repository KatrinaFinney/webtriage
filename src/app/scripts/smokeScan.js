import fetch from 'node-fetch';

(async () => {
  const res = await fetch(process.env.DEPLOY_URL + '/api/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      site: 'https://example.com',
      email: 'test@mycompany.com',
    }),
  });
  const json = await res.json();
  if (res.status !== 200 || json.error) {
    console.error('🚨 Scan failed:', json);
    process.exit(1);
  }
  console.log('✅ Smoke scan passed:', json.logs);
})();
