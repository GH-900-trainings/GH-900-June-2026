# GH-900-June-2026

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
- 🎨 Modern, responsive design built with **Tailwind CSS**
- 🌙 **Light / Dark theme toggle** — your choice is remembered between visits
- 🌐 Accurate time zones with automatic daylight-saving handling

## 🧩 How it works

- **Node.js** runs the application on your machine.
- **Express** serves the web page and a small `/api/times` endpoint.
- The browser calls `/api/times` once per second to keep all the clocks ticking.
- Times are calculated using the built-in `Intl.DateTimeFormat` API with IANA time zones, so daylight-saving changes are handled automatically.

## 🚀 Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or newer recommended)

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

- **View the cards** to read the current time in each city.
- Click the **☀️ / 🌙 button** (top-right corner) to switch between light and dark mode.
- Leave the page open — the clocks update automatically.

## 🛑 Stopping the app

In the terminal where the app is running, press **`Ctrl + C`**, or simply close that terminal. The server on port 3000 will shut down.

## 📁 Project structure

```
GH-900-June-2026/
├── package.json    # Project config and dependencies
├── server.js       # Express server + web page
└── README.md       # This file
```

## 🛠️ Built with

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)