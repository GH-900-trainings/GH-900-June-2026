require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const AZURE_MAPS_KEY = process.env.AZURE_MAPS_KEY;

if (!AZURE_MAPS_KEY) {
  console.warn(
    '⚠️  AZURE_MAPS_KEY is not set. Add it to your .env file to enable weather forecasts.'
  );
}

// Cities with their IANA time zones and geographic coordinates (lat/lon)
const cities = [
  { name: 'Sydney', timeZone: 'Australia/Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'Singapore', timeZone: 'Asia/Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Melbourne', timeZone: 'Australia/Melbourne', lat: -37.8136, lon: 144.9631 },
  { name: 'KL - Malaysia', timeZone: 'Asia/Kuala_Lumpur', lat: 3.139, lon: 101.6869 },
  { name: 'Bangkok', timeZone: 'Asia/Bangkok', lat: 13.7563, lon: 100.5018 },
  { name: 'India', timeZone: 'Asia/Kolkata', lat: 28.6139, lon: 77.209 },
];

function formatTime(timeZone, date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(date);
}

// Turn a city name into a URL-friendly slug, e.g. "KL - Malaysia" -> "kl-malaysia"
function citySlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function findCityBySlug(slug) {
  return cities.find((c) => citySlug(c.name) === slug);
}

// JSON API for the live-updating clocks
app.get('/api/times', (req, res) => {
  const now = new Date();
  const times = cities.map((city) => ({
    name: city.name,
    timeZone: city.timeZone,
    time: formatTime(city.timeZone, now),
  }));
  res.json({ serverTime: now.toISOString(), times });
});

// Fetch the current weather conditions for a city from the Azure Maps Weather service
async function fetchWeather(city) {
  const url =
    'https://atlas.microsoft.com/weather/currentConditions/json' +
    `?api-version=1.1&query=${city.lat},${city.lon}&unit=metric` +
    `&subscription-key=${encodeURIComponent(AZURE_MAPS_KEY)}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Azure Maps responded with ${res.status}`);
  }
  const data = await res.json();
  const current = data.results && data.results[0];
  if (!current) {
    throw new Error('No weather data returned');
  }
  return {
    name: city.name,
    phrase: current.phrase,
    temperature: current.temperature ? current.temperature.value : null,
    unit: current.temperature ? current.temperature.unit : 'C',
    iconCode: current.iconCode,
  };
}

// JSON API for the weather forecast tiles
app.get('/api/weather', async (req, res) => {
  if (!AZURE_MAPS_KEY) {
    return res
      .status(503)
      .json({ error: 'AZURE_MAPS_KEY is not configured on the server.' });
  }

  try {
    const weather = await Promise.all(
      cities.map(async (city) => {
        try {
          return await fetchWeather(city);
        } catch (err) {
          return { name: city.name, error: err.message };
        }
      })
    );
    res.json({ weather });
  } catch (err) {
    console.error('Failed to fetch weather', err);
    res.status(500).json({ error: 'Failed to fetch weather data.' });
  }
});

// Fetch detailed current conditions + multi-day forecast for the city detail page
async function fetchCityDetails(city) {
  const base = 'https://atlas.microsoft.com/weather';
  const key = encodeURIComponent(AZURE_MAPS_KEY);
  const currentUrl =
    `${base}/currentConditions/json?api-version=1.1&query=${city.lat},${city.lon}` +
    `&unit=metric&details=true&subscription-key=${key}`;
  const forecastUrl =
    `${base}/forecast/daily/json?api-version=1.1&query=${city.lat},${city.lon}` +
    `&duration=10&unit=metric&subscription-key=${key}`;

  const [curRes, fcRes] = await Promise.all([fetch(currentUrl), fetch(forecastUrl)]);
  if (!curRes.ok) throw new Error(`Current conditions request failed (${curRes.status})`);
  if (!fcRes.ok) throw new Error(`Forecast request failed (${fcRes.status})`);

  const curData = await curRes.json();
  const fcData = await fcRes.json();
  const cur = curData.results && curData.results[0];
  if (!cur) throw new Error('No current weather data returned');

  const current = {
    phrase: cur.phrase,
    iconCode: cur.iconCode,
    temperature: cur.temperature ? cur.temperature.value : null,
    realFeel: cur.realFeelTemperature ? cur.realFeelTemperature.value : null,
    humidity: cur.relativeHumidity ?? null,
    dewPoint: cur.dewPoint ? cur.dewPoint.value : null,
    uvIndex: cur.uvIndex ?? null,
    uvPhrase: cur.uvIndexPhrase ?? null,
    windSpeed: cur.wind && cur.wind.speed ? cur.wind.speed.value : null,
    windDir: cur.wind && cur.wind.direction ? cur.wind.direction.localizedDescription : null,
    pressure: cur.pressure ? cur.pressure.value : null,
    visibility: cur.visibility ? cur.visibility.value : null,
    cloudCover: cur.cloudCover ?? null,
  };

  const forecast = (fcData.forecasts || []).slice(0, 7).map((f) => ({
    date: f.date,
    iconCode: f.day ? f.day.iconCode : null,
    phrase: f.day ? f.day.shortPhrase || f.day.iconPhrase : '',
    min: f.temperature && f.temperature.minimum ? f.temperature.minimum.value : null,
    max: f.temperature && f.temperature.maximum ? f.temperature.maximum.value : null,
    precipProbability: f.day ? f.day.precipitationProbability : null,
  }));

  return { name: city.name, timeZone: city.timeZone, current, forecast };
}

// JSON API for a single city's detailed weather
app.get('/api/city/:slug', async (req, res) => {
  if (!AZURE_MAPS_KEY) {
    return res
      .status(503)
      .json({ error: 'AZURE_MAPS_KEY is not configured on the server.' });
  }
  const city = findCityBySlug(req.params.slug);
  if (!city) {
    return res.status(404).json({ error: 'Unknown city.' });
  }
  try {
    const details = await fetchCityDetails(city);
    res.json(details);
  } catch (err) {
    console.error(`Failed to fetch details for ${city.name}`, err);
    res.status(500).json({ error: 'Failed to fetch weather details.' });
  }
});

// Emoji flag/icon per city for a nicer visual touch
const cityIcons = {
  Sydney: '🇦🇺',
  Singapore: '🇸🇬',
  Melbourne: '🇦🇺',
  'KL - Malaysia': '🇲🇾',
  Bangkok: '🇹🇭',
  India: '🇮🇳',
};

// Main page
app.get('/', (req, res) => {
  const cards = cities
    .map(
      (city) => `
        <a
          href="/city/${citySlug(city.name)}"
          data-timezone="${city.timeZone}"
          data-city="${city.name}"
          aria-label="View detailed weather for ${city.name}"
          class="group relative block cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl transition duration-300 hover:-translate-y-1 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-xl dark:hover:border-white/30 dark:hover:bg-white/10"
        >
          <div class="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-cyan-400/20 blur-2xl transition group-hover:scale-150 dark:from-fuchsia-500/30 dark:to-cyan-400/30"></div>
          <div class="relative flex items-center gap-3">
            <span class="text-3xl">${cityIcons[city.name] || '🌍'}</span>
            <h2 class="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">${city.name}</h2>
          </div>
          <p class="time relative mt-4 font-mono text-lg tabular-nums text-indigo-600 dark:text-cyan-200">${formatTime(city.timeZone)}</p>
          <p class="relative mt-1 text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">${city.timeZone}</p>
          <div class="weather relative mt-4 flex items-center gap-3 border-t border-slate-200 pt-4 dark:border-white/10">
            <span class="weather-icon text-3xl">⏳</span>
            <div>
              <p class="weather-temp text-lg font-semibold text-slate-900 dark:text-white">Loading weather…</p>
              <p class="weather-phrase text-xs text-slate-500 dark:text-white/50">&nbsp;</p>
            </div>
          </div>
          <p class="relative mt-4 text-xs font-medium text-indigo-500 opacity-0 transition group-hover:opacity-100 dark:text-cyan-300">View 7-day forecast →</p>
        </a>`
    )
    .join('');

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hello World - World Clock</title>
  <script>
    // Apply saved theme before paint to avoid flash
    (function () {
      const saved = localStorage.getItem('theme');
      if (saved === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    })();
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { darkMode: 'class' };
  </script>
  <!-- Twemoji renders emoji (incl. flags) as images so they display consistently on every platform -->
  <script src="https://cdn.jsdelivr.net/npm/twemoji@14.0.2/dist/twemoji.min.js" crossorigin="anonymous"></script>
  <style>
    img.emoji {
      height: 1em;
      width: 1em;
      margin: 0 0.05em 0 0.1em;
      vertical-align: -0.1em;
    }
  </style>
</head>
<body class="min-h-screen bg-slate-100 text-slate-900 antialiased transition-colors duration-300 dark:bg-slate-950 dark:text-white">
  <div class="relative min-h-screen overflow-hidden">
    <!-- decorative background glows -->
    <div class="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/30"></div>
    <div class="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/20"></div>

    <main class="relative mx-auto max-w-5xl px-6 py-16">
      <!-- theme toggle -->
      <button
        id="theme-toggle"
        type="button"
        aria-label="Toggle theme"
        class="absolute right-6 top-6 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-xl shadow-md transition hover:scale-110 dark:border-white/10 dark:bg-white/10"
      >
        <span class="hidden dark:inline">🌙</span>
        <span class="inline dark:hidden">☀️</span>
      </button>

      <header class="text-center">
        <h1 class="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent dark:from-fuchsia-400 dark:via-violet-300 dark:to-cyan-300 sm:text-6xl">
          Hello World 👋
        </h1>
        <p class="mt-4 text-lg text-slate-500 dark:text-white/60">Local time and live weather around the world</p>
      </header>

      <section class="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        ${cards}
      </section>

      <footer class="mt-16 text-center text-sm text-slate-400 dark:text-white/30">
        Built with Node.js, Express, Tailwind CSS &amp; Azure Maps
      </footer>
    </main>
  </div>

  <script>
    // Render emoji (including country flags) as images for consistent cross-platform display
    if (window.twemoji) {
      twemoji.parse(document.body);
    }

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    async function refresh() {
      try {
        const res = await fetch('/api/times');
        const data = await res.json();
        document.querySelectorAll('[data-timezone]').forEach((card) => {
          const tz = card.dataset.timezone;
          const match = data.times.find((t) => t.timeZone === tz);
          if (match) card.querySelector('.time').textContent = match.time;
        });
      } catch (err) {
        console.error('Failed to refresh times', err);
      }
    }
    setInterval(refresh, 1000);

    // Map Azure Maps weather icon codes (1-44) to emoji for a friendly visual
    const weatherEmoji = {
      1: '☀️', 2: '☀️', 3: '🌤️', 4: '⛅', 5: '🌤️', 6: '🌥️', 7: '☁️', 8: '☁️',
      11: '🌫️', 12: '🌧️', 13: '🌦️', 14: '🌦️', 15: '⛈️', 16: '⛈️', 17: '⛈️',
      18: '🌧️', 19: '🌨️', 20: '🌨️', 21: '🌨️', 22: '❄️', 23: '❄️', 24: '🧊',
      25: '🌨️', 26: '🌧️', 29: '🌧️', 30: '🥵', 31: '🥶', 32: '💨', 33: '🌙',
      34: '🌙', 35: '🌤️', 36: '⛅', 37: '🌥️', 38: '☁️', 39: '🌦️', 40: '🌧️',
      41: '⛈️', 42: '⛈️', 43: '🌨️', 44: '🌨️',
    };

    async function refreshWeather() {
      try {
        const res = await fetch('/api/weather');
        if (!res.ok) throw new Error('Weather request failed (' + res.status + ')');
        const data = await res.json();
        document.querySelectorAll('[data-city]').forEach((card) => {
          const name = card.dataset.city;
          const w = data.weather.find((item) => item.name === name);
          if (!w) return;
          const iconEl = card.querySelector('.weather-icon');
          const tempEl = card.querySelector('.weather-temp');
          const phraseEl = card.querySelector('.weather-phrase');
          if (w.error || w.temperature == null) {
            iconEl.textContent = '❓';
            tempEl.textContent = 'Unavailable';
            phraseEl.textContent = w.error || 'No data';
            return;
          }
          iconEl.textContent = weatherEmoji[w.iconCode] || '🌡️';
          tempEl.textContent = Math.round(w.temperature) + '°' + (w.unit || 'C');
          phraseEl.textContent = w.phrase || '';
        });
        if (window.twemoji) twemoji.parse(document.body);
      } catch (err) {
        console.error('Failed to refresh weather', err);
        document.querySelectorAll('[data-city] .weather-temp').forEach((el) => {
          el.textContent = 'Weather unavailable';
        });
        document.querySelectorAll('[data-city] .weather-icon').forEach((el) => {
          el.textContent = '❓';
        });
      }
    }
    refreshWeather();
    // Weather changes slowly, refresh every 10 minutes
    setInterval(refreshWeather, 10 * 60 * 1000);
  </script>
</body>
</html>`);
});

// City detail page
app.get('/city/:slug', (req, res) => {
  const city = findCityBySlug(req.params.slug);
  if (!city) {
    return res.status(404).send('City not found. <a href="/">Go back</a>');
  }

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${city.name} Weather - World Clock</title>
  <script>
    (function () {
      const saved = localStorage.getItem('theme');
      if (saved === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    })();
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { darkMode: 'class' };
  </script>
  <script src="https://cdn.jsdelivr.net/npm/twemoji@14.0.2/dist/twemoji.min.js" crossorigin="anonymous"></script>
  <style>
    img.emoji { height: 1em; width: 1em; margin: 0 0.05em 0 0.1em; vertical-align: -0.1em; }
  </style>
</head>
<body class="min-h-screen bg-slate-100 text-slate-900 antialiased transition-colors duration-300 dark:bg-slate-950 dark:text-white">
  <div class="relative min-h-screen overflow-hidden">
    <div class="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/30"></div>
    <div class="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/20"></div>

    <main class="relative mx-auto max-w-5xl px-6 py-12">
      <div class="flex items-center justify-between">
        <a href="/" class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:scale-105 dark:border-white/10 dark:bg-white/10">
          ← Back
        </a>
        <button
          id="theme-toggle"
          type="button"
          aria-label="Toggle theme"
          class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-xl shadow-md transition hover:scale-110 dark:border-white/10 dark:bg-white/10"
        >
          <span class="hidden dark:inline">🌙</span>
          <span class="inline dark:hidden">☀️</span>
        </button>
      </div>

      <header class="mt-8 flex items-center gap-4">
        <span class="text-5xl">${cityIcons[city.name] || '🌍'}</span>
        <div>
          <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">${city.name}</h1>
          <p class="mt-1 text-sm uppercase tracking-widest text-slate-400 dark:text-white/40">${city.timeZone}</p>
        </div>
      </header>

      <div id="content" class="mt-10">
        <p class="text-lg text-slate-500 dark:text-white/60">Loading weather details…</p>
      </div>

      <footer class="mt-16 text-center text-sm text-slate-400 dark:text-white/30">
        Built with Node.js, Express, Tailwind CSS &amp; Azure Maps
      </footer>
    </main>
  </div>

  <script>
    document.getElementById('theme-toggle').addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    const weatherEmoji = {
      1: '☀️', 2: '☀️', 3: '🌤️', 4: '⛅', 5: '🌤️', 6: '🌥️', 7: '☁️', 8: '☁️',
      11: '🌫️', 12: '🌧️', 13: '🌦️', 14: '🌦️', 15: '⛈️', 16: '⛈️', 17: '⛈️',
      18: '🌧️', 19: '🌨️', 20: '🌨️', 21: '🌨️', 22: '❄️', 23: '❄️', 24: '🧊',
      25: '🌨️', 26: '🌧️', 29: '🌧️', 30: '🥵', 31: '🥶', 32: '💨', 33: '🌙',
      34: '🌙', 35: '🌤️', 36: '⛅', 37: '🌥️', 38: '☁️', 39: '🌦️', 40: '🌧️',
      41: '⛈️', 42: '⛈️', 43: '🌨️', 44: '🌨️',
    };

    const round = (v) => (v == null ? '–' : Math.round(v));
    const dayName = (iso) =>
      new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    function statCard(label, value, sub) {
      return \`
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-white/10 dark:bg-white/5">
          <p class="text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">\${label}</p>
          <p class="mt-2 text-2xl font-bold text-slate-900 dark:text-white">\${value}</p>
          \${sub ? \`<p class="mt-1 text-xs text-slate-500 dark:text-white/50">\${sub}</p>\` : ''}
        </div>\`;
    }

    async function load() {
      const content = document.getElementById('content');
      try {
        const res = await fetch('/api/city/${citySlug(city.name)}');
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error || 'Request failed (' + res.status + ')');
        }
        const d = await res.json();
        const c = d.current;

        const hero = \`
          <div class="flex flex-col items-center gap-3 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-white/10 dark:bg-white/5 sm:flex-row sm:text-left">
            <span class="text-7xl">\${weatherEmoji[c.iconCode] || '🌡️'}</span>
            <div class="sm:ml-4">
              <p class="text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">\${round(c.temperature)}°C</p>
              <p class="mt-1 text-lg text-slate-500 dark:text-white/60">\${c.phrase || ''}</p>
              <p class="text-sm text-slate-400 dark:text-white/40">Feels like \${round(c.realFeel)}°C</p>
            </div>
          </div>\`;

        const stats = \`
          <div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            \${statCard('Humidity', c.humidity == null ? '–' : c.humidity + '%')}
            \${statCard('UV Index', c.uvIndex == null ? '–' : c.uvIndex, c.uvPhrase)}
            \${statCard('Wind', c.windSpeed == null ? '–' : round(c.windSpeed) + ' km/h', c.windDir)}
            \${statCard('Pressure', c.pressure == null ? '–' : round(c.pressure) + ' mb')}
            \${statCard('Dew Point', c.dewPoint == null ? '–' : round(c.dewPoint) + '°C')}
            \${statCard('Visibility', c.visibility == null ? '–' : c.visibility + ' km')}
            \${statCard('Cloud Cover', c.cloudCover == null ? '–' : c.cloudCover + '%')}
            \${statCard('Feels Like', c.realFeel == null ? '–' : round(c.realFeel) + '°C')}
          </div>\`;

        const days = (d.forecast || []).map((f) => \`
          <div class="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-lg dark:border-white/10 dark:bg-white/5">
            <p class="text-xs font-semibold text-slate-500 dark:text-white/50">\${dayName(f.date)}</p>
            <span class="text-4xl">\${weatherEmoji[f.iconCode] || '🌡️'}</span>
            <p class="text-sm text-slate-500 dark:text-white/60">\${f.phrase || ''}</p>
            <p class="text-base font-bold text-slate-900 dark:text-white">\${round(f.max)}° / \${round(f.min)}°</p>
            \${f.precipProbability == null ? '' : \`<p class="text-xs text-cyan-600 dark:text-cyan-300">💧 \${f.precipProbability}%</p>\`}
          </div>\`).join('');

        const forecast = \`
          <h2 class="mt-12 text-2xl font-bold tracking-tight">7-Day Forecast</h2>
          <div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">\${days}</div>\`;

        content.innerHTML = hero + stats + forecast;
        if (window.twemoji) twemoji.parse(document.body);
      } catch (err) {
        content.innerHTML = '<p class="text-lg text-rose-500">Could not load weather details: ' + err.message + '</p>';
      }
    }
    load();
    if (window.twemoji) twemoji.parse(document.body);
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
