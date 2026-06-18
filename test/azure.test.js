const { test, before, after } = require('node:test');
const assert = require('node:assert');

const { app, cities, isAzureMapsConfigured } = require('../server');

// These tests verify the live Azure Maps Weather endpoint is connected.
// They skip automatically when AZURE_MAPS_KEY is not set (e.g. forks/CI without the secret).
const liveOpts = {
  skip: isAzureMapsConfigured()
    ? false
    : 'AZURE_MAPS_KEY not configured — skipping live Azure Maps tests',
};

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });
});

after(() => {
  if (server) server.close();
});

test('Azure Maps Weather endpoint is reachable and the key is valid', liveOpts, async () => {
  const city = cities[0];
  const url =
    'https://atlas.microsoft.com/weather/currentConditions/json' +
    `?api-version=1.1&query=${city.lat},${city.lon}&unit=metric` +
    `&subscription-key=${encodeURIComponent(process.env.AZURE_MAPS_KEY)}`;

  const res = await fetch(url);
  assert.strictEqual(res.status, 200, 'Azure Maps should respond 200 with a valid key');
  const data = await res.json();
  assert.ok(Array.isArray(data.results) && data.results.length > 0, 'expected weather results');
  assert.strictEqual(typeof data.results[0].temperature.value, 'number');
});

test('GET /api/weather returns live weather for all cities via Azure Maps', liveOpts, async () => {
  const res = await fetch(`${baseUrl}/api/weather`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.weather.length, cities.length);

  for (const city of cities) {
    const w = data.weather.find((item) => item.name === city.name);
    assert.ok(w, `missing weather for ${city.name}`);
    assert.ok(!w.error, `Azure Maps error for ${city.name}: ${w.error}`);
    assert.strictEqual(typeof w.temperature, 'number', `no temperature for ${city.name}`);
    assert.strictEqual(w.unit, 'C', `expected Celsius for ${city.name}`);
    assert.strictEqual(typeof w.iconCode, 'number', `no iconCode for ${city.name}`);
  }
});

test('GET /api/city/:slug returns current conditions and a 7-day forecast', liveOpts, async () => {
  const res = await fetch(`${baseUrl}/api/city/bangkok`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();

  // Current conditions (humidity, UV index, etc.)
  assert.strictEqual(data.name, 'Bangkok');
  assert.strictEqual(typeof data.current.temperature, 'number');
  assert.strictEqual(typeof data.current.humidity, 'number');
  assert.ok(data.current.uvIndex != null, 'expected a UV index');

  // Multi-day forecast
  assert.ok(Array.isArray(data.forecast), 'expected a forecast array');
  assert.ok(data.forecast.length >= 5, 'expected several forecast days');
  for (const day of data.forecast) {
    assert.ok(day.date, 'forecast day missing date');
    assert.strictEqual(typeof day.max, 'number', 'forecast day missing max temp');
    assert.strictEqual(typeof day.min, 'number', 'forecast day missing min temp');
  }
});
