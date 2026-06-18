# GH-900-June-2026

> ## 🎓 Training Recaps
>
> Students — review the daily session recaps here:
>
> - 📅 **[Day 1 Recap](docs/day-1-recap.md)**
> - 📅 **[Day 2 Recap](docs/day-2-recap.md)**

# 🌍 Hello World — World Clock

A simple **Node.js + Express** web app that greets you with **"Hello World"** and displays the **live local time** for several cities around the world. Styled with **Tailwind CSS** and includes a **light/dark theme toggle**.

## ✨ Features

- 👋 Friendly **"Hello World"** greeting
- 🕒 **Live local time** for 6 cities, updated every second:
  - Sydney 🇦🇺
  - Singapore 🇸🇬
  - Melbourne 🇦🇺
  - KL - Malaysia 🇲🇾
  - Bangkok 🇹🇭
  - India 🇮🇳
- 🌦️ **Live weather** (emoji + temperature in °C) for each city, powered by **Azure Maps**
- 🔎 **Clickable city cards** open a detail page with humidity, UV index, wind, pressure & a **7-day forecast**
- 🎨 Modern, responsive design built with **Tailwind CSS**
- 🌙 **Light / Dark theme toggle** — your choice is remembered between visits
- 🌐 Accurate time zones with automatic daylight-saving handling

## 🧩 How it works

- **Node.js** runs the application on your machine.
- **Express** serves the web pages and the `/api/times`, `/api/weather`, and `/api/city/:slug` endpoints.
- The browser calls `/api/times` once per second to keep all the clocks ticking.
- The browser calls `/api/weather` to fetch the current conditions for each city from the **Azure Maps Weather** service (refreshed every 10 minutes).
- Clicking a city card opens `/city/:slug`, which calls `/api/city/:slug` for detailed current conditions plus a 7-day daily forecast.
- Times are calculated using the built-in `Intl.DateTimeFormat` API with IANA time zones, so daylight-saving changes are handled automatically.

## 🚀 Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or newer recommended)
- An **Azure Maps** account and subscription key (for the weather forecast)

### Configure your Azure Maps key

The weather forecast uses **Azure Maps**, so you need a subscription key:

1. In the [Azure Portal](https://portal.azure.com/), create (or open) an **Azure Maps** account.
2. Go to **Settings → Authentication** and copy the **Primary Key** (Shared Key authentication).
3. Copy the example environment file to a real `.env` file:

   ```bash
   cp .env.example .env
   ```

4. Open `.env` and paste your key:

   ```
   AZURE_MAPS_KEY=your-azure-maps-subscription-key-here
   ```

> The `.env` file is git-ignored so your key never gets committed. If `AZURE_MAPS_KEY` is missing, the clocks still work but each tile shows "Weather unavailable".

### Installation

Install the dependencies (only needed the first time):

```bash
npm install
```

### Run the app

```bash
npm start
```

You should see:

```
Server running at http://localhost:3000
```

Then open your browser and go to:

```
http://localhost:3000
```

## 🖱️ Using the app

- **View the cards** to read the current time and live weather in each city.
- **Click any city card** to open its detail page (humidity, UV index, wind, pressure & 7-day forecast).
- Click the **☀️ / 🌙 button** (top-right corner) to switch between light and dark mode.
- Leave the page open — the clocks update automatically.

## 🧪 Running tests

The project uses Node's built-in test runner (no extra dependencies). Tests are split into three tiers:

```bash
npm test            # run everything
npm run test:helpers  # pure helper unit tests (no network)
npm run test:webapp   # web app route tests (no Azure key)
npm run test:azure    # live Azure Maps connectivity (needs AZURE_MAPS_KEY)
```

> The Azure tests skip automatically when `AZURE_MAPS_KEY` is not set, so the suite never fails just because the key is absent.

## ⚙️ CI/CD pipeline

GitHub Actions runs a single entry-point workflow, [`main.yml`](.github/workflows/main.yml), that calls three reusable workflows:

| Workflow | Purpose |
| --- | --- |
| `reusable-tests.yml` | Lint → unit/web app tests → Azure Maps connectivity |
| `reusable-codeql.yml` | CodeQL security scanning |
| `reusable-docker.yml` | Build & publish the image to GitHub Packages |

Tests and CodeQL run on every push and pull request; the Docker image is published only on `main` and `v*` tags, after tests and CodeQL pass.

**Required repository secret:** add `AZURE_MAPS_KEY` under **Settings → Secrets and variables → Actions** to enable the live Azure Maps tests in CI.

## 🛑 Stopping the app

In the terminal where the app is running, press **`Ctrl + C`**, or simply close that terminal. The server on port 3000 will shut down.

## 🐳 Running with Docker

The app is published as a container image to **GitHub Packages** (GitHub Container Registry) on every push to `main` and every `v*` tag.

> Replace `OWNER/REPO` below with this repository's owner and name in **lowercase** (the registry requires lowercase), e.g. `ghcr.io/your-org/gh-900-june-2026`.

### Pull the image

```bash
docker pull ghcr.io/OWNER/REPO:latest
```

Available tags:

| Tag | Meaning |
| --- | --- |
| `latest` | Most recent build of the `main` branch |
| `main` | Same as above, by branch name |
| `1.2.3` / `1.2` | A specific released version (from a `v1.2.3` git tag) |
| `sha-<commit>` | An exact commit build |

### Environment variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `AZURE_MAPS_KEY` | Yes (for weather) | _none_ | Azure Maps subscription (shared) key. Without it the clocks still work but tiles show "Weather unavailable". |
| `PORT` | No | `3000` | Port the server listens on **inside** the container. |

### Run the container

Pass environment variables with `-e` and map the port with `-p`:

```bash
docker run --rm -p 3000:3000 \
  -e AZURE_MAPS_KEY=your-azure-maps-key \
  ghcr.io/OWNER/REPO:latest
```

Then open <http://localhost:3000>.

**Pass parameters via a `.env` file** instead of multiple `-e` flags:

```bash
docker run --rm -p 3000:3000 --env-file .env ghcr.io/OWNER/REPO:latest
```

**Change the published port** (host `8080` → container `3000`):

```bash
docker run --rm -p 8080:3000 -e AZURE_MAPS_KEY=your-azure-maps-key ghcr.io/OWNER/REPO:latest
```

**Change the in-container port** with `PORT` (remember to map the same port):

```bash
docker run --rm -p 4000:4000 \
  -e PORT=4000 \
  -e AZURE_MAPS_KEY=your-azure-maps-key \
  ghcr.io/OWNER/REPO:latest
```

**Run detached** (in the background) and view logs:

```bash
docker run -d --name world-clock -p 3000:3000 \
  -e AZURE_MAPS_KEY=your-azure-maps-key \
  ghcr.io/OWNER/REPO:latest

docker logs -f world-clock     # follow logs
docker stop world-clock        # stop it
```

> **PowerShell note:** use a backtick `` ` `` for line continuation instead of `\`, or put everything on one line.

### Build the image locally

```bash
docker build -t world-clock .
docker run --rm -p 3000:3000 -e AZURE_MAPS_KEY=your-azure-maps-key world-clock
```

### Authenticating to pull a private image

If the package is private, log in to GHCR first with a Personal Access Token that has the `read:packages` scope:

```bash
echo $CR_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

## 📁 Project structure

```
GH-900-June-2026/
├── .github/workflows/   # CI, CodeQL & Docker publish pipelines
├── test/                # Unit, web app & Azure connectivity tests
├── .dockerignore        # Files excluded from the Docker build context
├── .env                 # Your Azure Maps key (git-ignored, create from .env.example)
├── .env.example         # Template for environment variables
├── Dockerfile           # Container image definition
├── package.json         # Project config and dependencies
├── server.js            # Express server + web page
└── README.md            # This file
```

## 🛠️ Built with

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Azure Maps](https://azure.microsoft.com/products/azure-maps/)
- [Docker](https://www.docker.com/) + [GitHub Packages](https://github.com/features/packages)