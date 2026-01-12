# Home Storage Organizer

A small React + Vite app to manage named "bins" of household items. Create bins, add/remove items, and persist data to a remote JSON store.

## Features
- Create and list bins (each has a user-defined ID and name)
- Add and remove items from a bin
- Persistent storage via a remote JSON bin (see `src/api/binStorage.js`)
- Minimal, Vite-powered React app with `react-router` for navigation

## Quick Start

Prerequisites: Node.js (16+ recommended) and npm

Install and run locally:

```bash
npm install
npm run dev
```

Open http://localhost:5173 (or URL shown by Vite).

Available scripts (from `package.json`):

- `npm run dev` — start development server
- `npm run build` — build production bundle
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

## App Overview

- Routing: defined in `src/App.jsx`
  - `/` → Home page (list bins and create new)
  - `/bin/:binId` → Bin page (view/add/remove items)

- Key pages/components:
  - `src/pages/HomePage.jsx` — list bins, create a new bin (requires Name + unique ID)
  - `src/pages/BinPage.jsx` — view bin details, add/remove items
  - `src/components/Loading.jsx` — loading fallback used by pages

## Data Persistence

Persistent data is handled in `src/api/binStorage.js`. The file calls a JSON storage endpoint (jsonbin.io) with an embedded `BIN_ID` and `API_KEY`.

Functions:
- `getAllBins()` — fetches the stored bins object
- `saveAllBins(bins)` — overwrites the stored bins record

Stored data shape:

```json
{
  "bins": {
    "binId1": { "name": "Shoes", "items": ["left shoe", "right shoe"] },
    "binId2": { "name": "Tools", "items": ["hammer"] }
  }
}
```

## Project Structure (high level)

- `index.html` — app entry
- `src/main.jsx` — bootstraps React and `BrowserRouter`
- `src/App.jsx` — routes and top-level UI
- `src/pages/` — page-level components (`HomePage.jsx`, `BinPage.jsx`)
- `src/components/` — shared components (e.g., `Loading.jsx`)
- `src/api/binStorage.js` — persistence helpers

## Development Notes

- Uses Vite and React 19 with `react-router-dom` for navigation.
- ESLint is configured; run `npm run lint` before commits.

## Deployment (GitHub Pages)

This project is already configured to deploy to GitHub Pages using the `gh-pages` package.

- The `homepage` field in `package.json` is set to: `https://mjandersondeveloper.github.io/home-storage-organizer`
- The following deploy scripts are configured in `package.json`:
  - `predeploy`: `npm run build`
  - `deploy`: `gh-pages -d dist`

To publish the site to GitHub Pages, run:

```bash
npm run deploy
```

This command will build the app and push the production `dist` output to the `gh-pages` branch.

Notes:
- Ensure the `homepage` value matches your GitHub username and repository name.
- If you change the repository name or owner, update the `homepage` field accordingly.
- GitHub Pages may take a minute to publish the updated site after deployment.

## CI / Automated Deploys

This repository includes a GitHub Actions workflow that builds and deploys the app to GitHub Pages on pushes to `main`.

- Workflow file: `.github/workflows/deploy.yml`
- Trigger: `push` to the `main` branch
- What it does:
  - Checks out code
  - Installs Node (Node.js 20)
  - Cleans `node_modules` and `package-lock.json`, then runs `npm install`
  - Builds the app (`npm run build`)
  - Deploys `./dist` to the `gh-pages` branch using `peaceiris/actions-gh-pages`

To trigger a deploy, push commits to `main` (the workflow runs automatically). You can also run the local deploy with:

```bash
npm run deploy
```
