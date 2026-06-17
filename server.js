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

// Main page
app.get('/', (req, res) => {
  const rows = cities
    .map(
      (city) => `
        <div class="card" data-timezone="${city.timeZone}">
          <h2>${city.name}</h2>
          <p class="time">${formatTime(city.timeZone)}</p>
        </div>`
    )
    .join('');

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hello World - World Clock</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      margin: 0;
      min-height: 100vh;
      background: linear-gradient(135deg, #1e3c72, #2a5298);
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 16px;
    }
    h1 { font-size: 2.4rem; margin: 0 0 8px; }
    .subtitle { opacity: 0.85; margin-bottom: 32px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      width: 100%;
      max-width: 960px;
    }
    .card {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 14px;
      padding: 20px 24px;
      backdrop-filter: blur(6px);
    }
    .card h2 { margin: 0 0 10px; font-size: 1.3rem; }
    .time { margin: 0; font-size: 1.05rem; font-variant-numeric: tabular-nums; }
  </style>
</head>
<body>
  <h1>Hello World 👋</h1>
  <p class="subtitle">Local time around the world</p>
  <div class="grid">
    ${rows}
  </div>

  <script>
    async function refresh() {
      try {
        const res = await fetch('/api/times');
        const data = await res.json();
        document.querySelectorAll('.card').forEach((card) => {
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
