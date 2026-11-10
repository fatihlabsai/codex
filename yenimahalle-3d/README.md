# Yenimahalle 3D — Bakırköy, İstanbul

A build-free, single-page 3D map of the real Yenimahalle neighbourhood in Bakırköy, İstanbul. Local, preprocessed OpenStreetMap geometry supplies 787 buildings, streets, green spaces, railway lines and places of interest. Warm building colours, a highlighted administrative boundary, contextual towers, and interactive feature details make the neighbourhood easy to explore. Buildings are batched with triangle-level picking; labels are projected with collision avoidance.

[Live demo](https://fatihlabsai.github.io/yenimahalle-3d/)

## Credits and data

Built with **GPT-6-Astra via Codex** using Three.js r170 and OrbitControls. Map data **© OpenStreetMap contributors**, available under the [Open Database License (ODbL)](https://www.openstreetmap.org/copyright). No Google Maps or Street View data is used.

The official boundary is **OSM relation 9439859**, Yenimahalle Mahallesi, Bakırköy, `admin_level=8`. The dataset includes features within the polygon plus a **90 m buffer**; 414 buildings are inside the neighbourhood. The context includes Yenimahalle station and the eastern apartment towers. Underground railway segments appear as faint dashed lines; trees and mosque details are illustrative.

Most buildings have no measured height in OSM. Heights use `building:levels × 3 m` when present, otherwise type-based defaults (approximately 12–15 m for typical four-to-five-storey İstanbul buildings). Only a handful of buildings have explicit height or levels tags. Heights are model estimates, not a measured city survey. The data snapshot date appears in the map header.

Coordinates are local metres around `meta.origin`: east maps to +X, elevation to +Y, and north to −Z. Original data and preprocessing scripts are preserved.

## Controls

- Drag to orbit; right-drag or two-finger drag to pan. Scroll or pinch to zoom.
- Click a building, road or place marker to inspect its OSM information.
- Click empty ground, press **Esc**, or use **×** to close details.
- **Sokak isimleri** or **L** toggles street labels; **Yerler** toggles place markers.
- **Sıfırla kamera** restores the initial view. The north arrow follows camera rotation; the 100 m scale represents ground distance at the view centre.

Labels thin out with distance and hide where they overlap other labels or interface panels. Street labels also hide at grazing angles.

## Run locally

From the repository root, use any static server, for example:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080`. No npm, bundler or build step is required. `index.html` contains all application HTML, CSS and JavaScript. Runtime requests are limited to `./data/yenimahalle.json` and pinned Three.js modules from jsDelivr. System fonts support Turkish without another download. Once those resources are cached and available offline, no live map service is needed; this app does not install a service worker or guarantee browser cache retention. WebGL and a modern browser with ES modules/import maps are required. Relative data paths support GitHub Pages at the project URL. Keep `.nojekyll` in the repository root.

## Code license — MIT

Copyright (c) 2026 Yenimahalle 3D contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

The MIT license applies to application code, not OpenStreetMap data. Retain visible OpenStreetMap attribution and comply with ODbL when reusing or distributing the data.
