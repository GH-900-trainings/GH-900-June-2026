const { test, before, after } = require('node:test');
const assert = require('node:assert');

const { app, cities } = require('../server');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    // Port 0 lets the OS pick a free port so tests never clash with a running app.
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });
});

after(() => {
  if (server) server.close();
});

// Web app route tests — no Azure Maps key required.

test('GET / serves the web app home page with all cities', async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.strictEqual(res.status, 200);
  const html = await res.text();
  assert.match(html, /Hello World/);
  for (const city of cities) {
    assert.ok(html.includes(city.name), `home page should list ${city.name}`);
  }
});

test('GET /api/times returns a time entry for every city', async () => {
  const res = await fetch(`${baseUrl}/api/times`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.times.length, cities.length);
  for (const city of cities) {
    const match = data.times.find((t) => t.name === city.name);
    assert.ok(match, `missing time for ${city.name}`);
    assert.ok(match.time, `empty time for ${city.name}`);
  }
});

test('GET /city/:slug serves a detail page for a known city', async () => {
  const res = await fetch(`${baseUrl}/city/bangkok`);
  assert.strictEqual(res.status, 200);
  const html = await res.text();
  assert.match(html, /7-Day Forecast/);
  assert.ok(html.includes('Bangkok'));
});

test('GET /city/:slug returns 404 for an unknown city', async () => {
  const res = await fetch(`${baseUrl}/city/atlantis`);
  assert.strictEqual(res.status, 404);
});
