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
        <div
          data-timezone="${city.timeZone}"
          data-city="${city.name}"
          class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl transition duration-300 hover:-translate-y-1 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-xl dark:hover:border-white/30 dark:hover:bg-white/10"
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
        </div>`
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
