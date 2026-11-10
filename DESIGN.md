# Simit Tezgâhı 3D — design contract (shared by all build steps)

Owner feedback: "realistic" did NOT mean photos. The game must be seen from BEHIND a simit vendor's cart and must FEEL LIKE A GAME.
So: a real-time 3D game in Three.js. NO photos, NO 2D image sprites as scene art (assets/ photo folder is being removed). Everything is built from code: procedural geometry, MeshStandard/Physical PBR materials, procedural CanvasTexture textures (cobblestone, wood, paint, sesame, labels, chalk price boards). Stylized-realistic look (think a polished indie 3D sim, e.g. "Supermarket Simulator"/"Kebab Chefs" vibe): soft shadows, ACES tone mapping, sRGB, fog, warm lighting.

## Tech
- Three.js r170 via import map: `"three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js"`, `"three/addons/": "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"`. Only addons from that path (e.g. Sky, RoomEnvironment, RoundedBoxGeometry, mergeGeometries via BufferGeometryUtils). No other external assets required.
- Static files only (GitHub Pages). No build step. ES modules.
- File layout:
  - index.html — import map, HUD/overlay HTML (Turkish), links css/style.css, loads js/main.js
  - css/style.css — game-style HUD (chunky rounded panels, bold numbers, icons via emoji/CSS), title screen, speech bubbles, popups
  - js/main.js — bootstrap, render loop, resize, wires modules, exposes window.__game
  - js/scene.js — renderer, camera, lights, sky/sun/day-cycle lighting API, first-person mouse-look, title fly-in, screen shake
  - js/cart.js — the simit cart + 3D products + raycast picking + pick-up tweens to the serving tray + money/cash drawer 3D or HUD
  - js/city.js — Istanbul backdrop (Eminönü waterfront, Bosphorus water shader, ferry, gulls, Galata Tower, Yeni Cami/Süleymaniye domes+minarets, hills of houses, cobblestones, street lamps)
  - js/people.js — low-poly humanoid customers (procedural), walk cycle, queue, cat + seagull thieves
  - js/game.js — gameplay rules/state (ported from _legacy_reference.html), no Three.js inside if possible
  - js/ui.js — DOM HUD, speech bubbles projected over heads, popups, end-of-day shop
  - js/audio.js — WebAudio synthesized sounds (start after first click)
- Performance: target 60fps on a normal laptop. Merge static geometry, instancing for repeated items (cobbles, windows, houses, sesame), shadow map 2048 only on the sun with tight frustum around the cart area, pixelRatio min(devicePixelRatio,1.5). Avoid per-frame allocations.

## World layout (meters, Y up)
- Vendor (camera) stands at (0, 1.65, 0) looking toward -Z. The cart is directly in front: cart top surface ~1.0–1.05m high, centered at z ≈ -0.75, width ~1.6m (x from -0.8 to 0.8), depth ~0.7m.
- Customers stand on the far side of the cart at z ≈ -1.6, queue extends along the sidewalk to the right/back (x +1.5..+5, z -2..-4). They walk in along the sidewalk (x axis).
- Sidewalk/cobblestone square extends to z ≈ -14, then the quay edge and the Golden Horn/Bosphorus water from z ≈ -15 to -900. The opposite shore (Galata/Karaköy hills with houses + Galata Tower) at z ≈ -500..-700 slightly left; Yeni Cami/Süleymaniye with domes and minarets to the right side (x +150..+400, z -250..-450) or flanking; ferry crosses at z ≈ -120..-200.
- Mouse-look: yaw ±35°, pitch -40°..+15° around the base orientation (looking slightly down at the cart, ~-12°), smoothed. Pointer lock NOT required (just mouse position over the canvas); clicks raycast products.

## The cart (hero object, must look great)
Classic red Istanbul simit cart: red lacquered body with white/cream trim and gold/brass edges, glass display case (MeshPhysicalMaterial transmission or simple transparent glass with reflections) on top holding a pyramid of simits, small metal wheels, side handles toward the vendor, a striped awning/umbrella on a pole above, chalk price board, small brass çaydanlık (double-decker Turkish teapot) on a little burner, a row of tulip tea glasses on saucers, water bottles in a crate, ayran cups, a paper-lined tray of açma/poğaça, kumru sandwiches, a cheese wedge on wax paper. A round metal serving tray (tepsi) near the vendor at the front-left of the cart top; a cash box/drawer at the front-right. Optional: vendor hands/forearms (simple low-poly) visible at the bottom of the view, idle sway, they reach on pick.

## Products (8, keys 1–8, ids must stay): simit, cay, su, acma, pogaca, kumru, ayran, peynir
Prices TL: simit 20, cay 15, su 10, acma 25, pogaca 25, kumru 90, ayran 20, peynir 15. kumru & peynir start locked (unlock in shop).
Each product: a 3D model built procedurally (simit = torus with sesame-dot canvas texture + slight twist bumps; çay = tulip glass (LatheGeometry) with amber tea + saucer; su = PET bottle lathe + blue cap + label; açma = puffier glossy twisted torus; poğaça = squashed ellipsoid buns with black seeds; kumru = sesame bun sandwich with sucuk/tomato/cheese layers; ayran = cup with foil lid; peynir = white wedge on paper). Hover: highlight/emissive outline + lift; click/1–8: a copy flies with an arc tween onto the tepsi.

## Gameplay (keep from legacy; see _legacy_reference.html)
Orders, serving tray, Ver (Enter), payment (cash/coins/card/euro tourist), change-making with denominations 1,5,10,20,50,100,200 TL, wrong change consequences, patience bars, tips, streak, reputation stars, day cycle 07:00–20:00 (~3.5 real minutes), morning/evening rush, simit stock & "Fırından taze simit" restock, end-of-day summary + upgrade shop, localStorage save, thieves (cat goes for peynir/kumru, seagull dives at simits; click it or Space to shoo; feeding cat = karma), customer types: ogrenci, lise, isadami, teyze, turist (English), balikci, emekli, taksici — each with dialogue lines (keep them), patience, payment style, tip.
Astra's twists (keep all five): Askıda simit, Son düdüğün çayları (ferry crew order), Gazete kapanır sohbet açılır (noon ritual), İyiliğin akşam hesabı (neighbourhood bond), Dört dörtlük servis (streak bonus). You may add new 3D-specific twists.

## Controls
Mouse move = look around (limited), click = pick product / shoo animal / UI; 1–8 add product; Enter = Ver / give change; Backspace = undo last tray item; Space = shoo animal; P = pause; M = mute.

## Test hook (must exist after the gameplay step)
window.__game = { state, startDay(), spawnCustomer(type) (also 'kedi'|'cat'|'marti'|'seagull'), getCurrentOrder(), serveExact(), addProduct(id), fps() }.
Stable DOM ids: #startBtn, #serveBtn, #giveChange, #euroBtn, [data-denom="N"] buttons (HUD cash drawer). Also window.__game.ready === true once the scene is built.

## Quality bar
Zero console errors/warnings in Chromium. No TODO/placeholder. All UI text Turkish (tourist speaks English).
