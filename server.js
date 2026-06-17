const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Cities with their IANA time zones
const cities = [
  { name: 'Sydney', timeZone: 'Australia/Sydney' },
  { name: 'Singapore', timeZone: 'Asia/Singapore' },
  { name: 'Melbourne', timeZone: 'Australia/Melbourne' },
  { name: 'KL - Malaysia', timeZone: 'Asia/Kuala_Lumpur' },
  { name: 'Bangkok', timeZone: 'Asia/Bangkok' },
  { name: 'India', timeZone: 'Asia/Kolkata' },
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
          class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl transition duration-300 hover:-translate-y-1 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-xl dark:hover:border-white/30 dark:hover:bg-white/10"
        >
          <div class="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-cyan-400/20 blur-2xl transition group-hover:scale-150 dark:from-fuchsia-500/30 dark:to-cyan-400/30"></div>
          <div class="relative flex items-center gap-3">
            <span class="text-3xl">${cityIcons[city.name] || '🌍'}</span>
            <h2 class="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">${city.name}</h2>
          </div>
          <p class="time relative mt-4 font-mono text-lg tabular-nums text-indigo-600 dark:text-cyan-200">${formatTime(city.timeZone)}</p>
          <p class="relative mt-1 text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">${city.timeZone}</p>
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
        <p class="mt-4 text-lg text-slate-500 dark:text-white/60">Local time around the world, updated live every second</p>
      </header>

      <section class="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        ${cards}
      </section>

      <footer class="mt-16 text-center text-sm text-slate-400 dark:text-white/30">
        Built with Node.js, Express &amp; Tailwind CSS
      </footer>
    </main>
  </div>

  <script>
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
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
