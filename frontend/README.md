# WorkZen Frontend

React + Vite SPA for the WorkZen HRMS landing experience and authenticated dashboard shell.

## Quick start

1. Install dependencies (run from `frontend/`):
	```powershell
	npm install
	```
2. Start the dev server:
	```powershell
	npm run dev
	```
	Vite prints the local URL (usually http://localhost:5173). Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to stop the server.
3. For a production build:
	```powershell
	npm run build
	npm run preview # optional: serve the build locally
	```

## Landing page smoke test

Use these quick checks after modifying the public site:

1. **Desktop width (≥ 1024px).**
	- Header shows logo, navigation links, and Login/Get Started buttons side-by-side.
	- Scroll down: header gains a subtle shadow once the page moves.
2. **Mobile width (≤ 768px).**
	- Header collapses to a hamburger icon. Click it to open the full-screen menu overlay.
	- Ensure the backdrop appears, body scroll locks, and selecting an item closes the menu.
3. **Footer.**
	- CTA card centered, quick links stacked under headings, social icons clickable.

These steps validate the nav/hero/footer alignment highlighted in recent fixes.
