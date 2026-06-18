const { test } = require('node:test');
const assert = require('node:assert');

const { cities, citySlug, findCityBySlug } = require('../server');

// Pure helper unit tests — no network or server required.

test('citySlug turns a city name into a URL-friendly slug', () => {
  assert.strictEqual(citySlug('Bangkok'), 'bangkok');
  assert.strictEqual(citySlug('KL - Malaysia'), 'kl-malaysia');
  assert.strictEqual(citySlug('  Spaces  '), 'spaces');
});

test('findCityBySlug resolves every configured city', () => {
  for (const city of cities) {
    const found = findCityBySlug(citySlug(city.name));
    assert.ok(found, `expected to resolve slug for ${city.name}`);
    assert.strictEqual(found.name, city.name);
  }
  assert.strictEqual(findCityBySlug('not-a-real-city'), undefined);
});

test('every city has valid coordinates and a time zone', () => {
  assert.ok(cities.length > 0, 'expected at least one city');
  for (const city of cities) {
    assert.strictEqual(typeof city.lat, 'number');
    assert.strictEqual(typeof city.lon, 'number');
    assert.ok(city.lat >= -90 && city.lat <= 90, `bad lat for ${city.name}`);
    assert.ok(city.lon >= -180 && city.lon <= 180, `bad lon for ${city.name}`);
    assert.ok(city.timeZone, `missing timeZone for ${city.name}`);
  }
});
