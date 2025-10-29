# USA Globe Explorer

An interactive USA globe web application built with React, Vite, and three.js. The experience features draggable 3D controls, neon pins for every state and territory, a detail-rich sidebar, theme customization, and an exporter that generates a standalone HTML widget.

## Getting started

```bash
npm install
npm run dev
```

Visit the printed local URL to explore the experience.

## Production build

```bash
npm run build
npm run start
```

`npm run start` serves the prebuilt assets from `dist/` using an Express server and also exposes a lightweight `/api/state/:abbr` endpoint that returns information about a single state.

## Exporter

Use the **Export Widget** button in the sidebar to generate a drop-in HTML file that recreates the 3D globe with your current theme settings. Copy the code from the modal into your project to embed the widget.
