# iOS Liquid Glass — a DeepSeek Harness skin

A Liquid Glass skin for the DeepSeek Harness Web client, modelled on iOS 26: the whole window is one glass veil over a still, procedural fog field — one thin sheet, one floating sidebar card of real glass, and flat white plates for everything else.

The window carries exactly one layer of glass: the fog is blurred once at the bottom of the window, the three columns themselves are transparent, and the floating sidebar card, reply cards and composer sit on that sheet. System blue is the only accent, radii and hairlines follow system-control proportions, and there is exactly one moving part — a 21-second specular sweep across the session header, which stops under reduced motion.

The skin itself is declarative (`skin.json` plus two stylesheets and one fog definition), and the same repository installs as a DSH client plugin. The plugin form is dependency-free, requires no shared module, and only appends three `<style>` elements to the document.

- skin id: `ios-liquid-glass`
- plugin package: `dsh-skin-liquid-glass`
- repository: <https://github.com/liushuchang-2012/dsh-skin-liquid-glass>
- license: MIT

## Screenshots

| Light | Dark |
| --- | --- |
| ![Light theme](preview/light.jpg) | ![Dark theme](preview/dark.jpg) |

Both are 1600×1000 captures of the running interface at background occlusion 0.

## Features

### Five material tiers

Since v0.2.0 the canvas is a still fog field; the photo wallpaper no longer paints. The material has five tiers, taken from `:root` and `body[data-ds-dark-theme]` in `patches.css`:

| Tier | Surfaces | Blur · saturation | Fill (light / dark) |
| --- | --- | --- | --- |
| T0 fog | the canvas itself: three soft light pools (highlight .60 top-left, blue .32 top-right, cool grey .34 bottom-right) plus one 118° faint sheen and a 180° vertical wash (`--ios-lg-fog-image`, painted on `body::before`) | none, fixed, never scrolls | light `#ffffff → #f2f7fe → #e1e8f2` (`#e6ecf6` at 74%); dark `#0b0f15 → #121821 → #1e242e` |
| T1 glass | the whole window: one veil; all three columns and the right column stay transparent | 40px · 180%, once for the whole window | `--ios-lg-chrome` .22 / .28 |
| T2 sidebar card | the sidebar: the only card in the window with a real backdrop blur | 28px · 180% (on a `::before`) | `--ios-lg-sidebar-fill` .10 / .06 |
| T3 content | reply cards, user bubble, code blocks and tables | none — the parent is already frosted, so a plate does not re-sample | `--ios-lg-plate` .46 / .46; code blocks and tables `--ios-lg-plate-solid` .58 / .62 |
| T4 controls and overlays | composer card, menus, dialogs, toasts, diff hover preview | composer fades radially; overlays 40px · 180% | `--ios-lg-control-fill` .50→.38 / .46→.38; `--ios-lg-overlay` .58 / .58 |

Radii follow the same tiers: 24px for the sidebar card (all four corners, with an 8px margin on every side), 22px for the composer, 20px for a reply card (one card per answer, with no plate inside it), 18px for dialogs, 16px for code blocks and tables, 14px for the menu backing.

The tool-detail hovercard (--dsw-hovercard-bg) is deliberately left on the shell's dark material: its text is laid out in white for a dark card, so a light fill would make the heading disappear. The diff hover preview is a different variant (light fill, dark text) and gets an opaque fill from patches.css.

All tiers share one edge treatment: `--ios-lg-rim` is an `inset 0 1px 0` specular rim (`rgba(255,255,255,.60)` light, `.10` dark); the sidebar glass card uses the stronger `--ios-lg-rim-card` (`.70` light, `.16` dark) with `--ios-lg-edge-card` underneath (`.08` / `.34`); `--ios-lg-edge-dark` is the 1px shade under an ordinary card; `--ios-lg-hairline` is the separator line, and shadows come in three steps, `--ios-lg-shadow`, `--ios-lg-shadow-lift` and the deeper `--ios-lg-shadow-float` (a wide pool with a large negative spread plus a short contact shadow) — a large negative spread keeps the edge clean instead of drawing a dark band along the seam.

### The fog field: why the photo wallpaper is gone

A photo wallpaper drags the glass into endless retuning: the darkest corner of the photo sits behind the left column, so an identical white fill still comes out a step deeper than the chat; and to hide the photo's texture every layer has to thicken until the window reads as a white board with grey edges. v0.2.0 replaces the background with a still fog: in light, three soft pools (a .60 white highlight top-left, a .32 blue top-right, a .34 cool grey bottom-right) over a white-to-blue-grey vertical wash plus one faint 118° sheen; in dark, two cool pools over a deep wash. It is one single-line `--ios-lg-fog-image` value painted on `body::before` (`position: fixed`, `pointer-events: none`), so it never scrolls with the transcript. The span is deliberately wide — `#ffffff` at the top to `#e6ecf6` at 74% and `#e1e8f2` at the bottom in light; `#0b0f15` to `#1e242e` in dark — because a thin veil only reads as glass when there is light and dark behind it.

The glass does not need to cover the fog — it only needs the fog to have something to read. The window takes one .22 veil, the sidebar presses one .10 card of real glass over it, and the remaining cards are flat .46–.58 plates. The glass enlarges the fog's light and dark into depth, which is where "Apple's material" comes from instead of a white board.

The occlusion slider (`--dsw-skin-scrim`) now only affects the `--dsw-alias-bg-*` tokens in `skin.css`: full-page surfaces such as settings and the plugin market thicken with it, while the glass material itself uses fixed values so a slider drag cannot flatten the window's depth. Blur is likewise defined once in `patches.css` (`--ios-lg-blur-*`) and is no longer per-column adjustable.

### Same fog in both install forms

Both install forms paint the same fog: the skin-center form can only change rules in `patches.css` (`html` / `body` selectors, single-line declarations, because the skin center adds its own scope), while the plugin form draws the same gradient set in `wallpaperCss()` in `src/client.template.js` (`FOG_LIGHT` / `FOG_DARK`). The photo wallpaper has left the background; the two images in `assets/` and `skin.json`'s `contributes.backgroundMedia` stay as artwork that is no longer painted, so the build keeps the same placeholder substitution.

### Reduced-transparency fallback

Under `prefers-reduced-transparency: reduce` the plate layers — prose, code blocks, session header, composer, and the window sheet under the Windows title strip — switch to a solid `--dsw-alias-bg-layer-1` and drop `backdrop-filter`, while the composer and the user bubble switch to layer 2. Under `prefers-reduced-motion: reduce` the specular sweep is removed outright (`animation: none`, no background image). Both are pure CSS; no JavaScript is involved.

### Plugin form

`package.json` declares `dsh.bundle.patch` and `dsh.client`. The host half, `lib/index.js`, is an empty `apply()` whose only job is to mount a fiber so the client bundle can reach `window.__DSH_BOOT__`. The client half, `client.js`, is a build artifact shaped like `window.__ModuleLoader__.load({ id, factory })` with an empty `inject` array: it injects three `<style data-plugin-css=…>` layers (tokens, material, canvas) and removes all three on teardown, hot reload or profile switch.

## Design notes

### Two layers, two jobs

`skin.css` is the token layer. It only re-maps the shell's own `--dsw-*` and `--aion-*` design tokens (contracts in `contracts/official-tokens-v1.json`), one set for light and one under `body[data-ds-dark-theme]`. Surfaces that should read as glass are translucent `rgba()`; since v0.2.0 the glass alphas are fixed values in `patches.css` (`--ios-lg-*`), and `--dsw-skin-scrim` only keeps driving the `--dsw-alias-bg-*` page tones in `skin.css`.

A token cannot carry a `backdrop-filter`, and frosting cannot dodge the positioning trap described below, so the material lives in `patches.css`: blur, saturation, specular inner rim, radii, hairline separators, and the single animation.

### Why large containers are not frosted directly

`backdrop-filter` makes an element a containing block, exactly like `filter` and `transform`. The shell renders icon hover tooltips as `position: fixed` spans inside action rows and inside the composer card; put a filter on those boxes and the tooltips detach from their buttons and land in the scrollport.

Blur therefore only ever rides a `::before` plate, which has no descendants: once at the bottom of the window, once on the session header. The composer takes its frost from the `[data-dsh-composer-frost]` follower the skin center mounts, and the `::before` in `patches.css` is only a fallback for when that follower is absent. Overlays — menus, dialogs, toasts — are leaves and carry the filter themselves.

Prose, code blocks and tables also draw on a `::before` plate, but for fill, inner rim and shadow rather than blur: the window is already frosted once, and a second filter would only re-sample it. Prose plates grow outward with negative insets (`-.18em -.7em`), so the copy keeps the shell's own text column and the rounding never collides with the first glyph.

### One glass layer for the whole window

The columns themselves are transparent: inside the sidebar's scope `--dsw-specific-sidebar-fill` is neutralised, its `background` is cleared, `border-right` is dropped, and the conversation and right columns stop painting a base of their own. The fog is blurred exactly once, on `[data-dsh-frame]::before` (`--ios-lg-chrome`, 40px, 180%), and the columns and cards float on that sheet.

When each column frosted itself, neighbouring layers sampled different parts of the background — the sidebar sat on the darkest corner, so an identical white fill still came out a step apart and the junction showed a hard edge. With a single sample, there is no difference left to read at the seam.

The sidebar is the one card with real glass: `margin: 8px` leaves the sheet visible on all four sides, the radius is 24px, and a `::before` plate paints `--ios-lg-sidebar-fill` (`.10` light, `.06` dark) with `backdrop-filter: blur(28px) saturate(180%)`. The blur rides the pseudo-element rather than the column itself, because `position: fixed` tooltips inside the column would otherwise be captured by a new containing block. The card carries a 1px specular rim on top, a 1px shade underneath and a large soft shadow, and the shadow leans left and down so it never paints onto the conversation column.

### The glass follows the fog

The fog is the only thing behind the glass: three soft light pools on a 180° vertical wash, painted once on `body::before` (`position: fixed`, so it never scrolls). Because the fog is neutral, the glass only shifts in luminance, never in hue; and because it is generated in CSS, changing its stops moves every sample and `--ios-lg-chrome` and `--ios-lg-sidebar-fill` have to be retuned with it. The values in this repository are tuned to the fog above: the shell and the sidebar deliberately sit close in luminance (.22 against .10 in light), because a larger difference reads as two different greys in the window.

The light set also carries the text: the 11–12px metadata tokens `--dsw-alias-label-caption` / `--dsw-alias-label-tertiary` are pulled from iOS's `#8e8e93` down to `#616167` (about 3.2:1 → 5.0–6.2:1 on the near-white cards), the markdown placeholder moves to `#5f5f65`, diff markers go to `#0a7a35` (added) and `#cf3529` (error text; deleted markers `#ba2723` light / `#ff6b60` dark), the dark metadata set rises to `#a1a1a6` (5.4–6.1:1 on the dark plates), and the toast gets a `--dsw-alias-toast-label: #1c1c1e` of its own — its plate is .82 white while the shell's light default toast label is pure white, so without it the toast is white on white. The dark block restates that label as `#ffffff`: the skin center clones light tokens onto `body`, and without the restatement a dark toast would pick up the light `#1c1c1e` and paint dark text on a dark plate.

The light token block is mounted on `:root, body` (the `/* --- light --- */` section of `skin.css`): the shell's theme sheet declares the same aliases on `body`, and the plugin form injects this file raw — a bare `:root` declaration loses that cascade outright, so the body copy is what lets the light palette apply. Keeping `:root` in the list leaves html-level aliases such as `--aion-*` resolvable. The skin-center form still scopes and clones onto `body`, so it behaves exactly as before, and the dark block keeps winning through `body[data-ds-dark-theme]` specificity.

## Installation

Pick one of the three paths below. The first two install the same skin; do not enable both at once — the same rules would stack twice and the fog would be painted twice.

### Through the skin center

Copy the repository into the user skin directory; the default location is:

```
%USERPROFILE%\.dsh\skins\ios-liquid-glass\
```

The directory name must match the `id` in `skin.json`. The skin center picks it up without a restart:

```powershell
git clone https://github.com/liushuchang-2012/dsh-skin-liquid-glass.git `
  "$env:USERPROFILE\.dsh\skins\ios-liquid-glass"
```

Then enable it under Settings → Skin → iOS 液态玻璃. The skin center itself calls `POST /api/skin-center/v2/active` with `{"active":"ios-liquid-glass"}`; pass `null` as `active` to return to the official default.

### As a client plugin

```bash
dsh plugin --profile <name> add <path-or-package>

# example: install from a local checkout
dsh plugin --profile <name> add "D:\path\to\dsh-skin-liquid-glass"

# remove
dsh plugin --profile <name> remove dsh-skin-liquid-glass
```

`<name>` is the target profile, `web` by default; `<path-or-package>` is either an absolute local path or a package spec such as `github:user/repo`. Reload the page after installing. In plugin form `client.js` paints the fog itself, so the skin center is not involved.

### Local development

```bash
npm run build               # generate client.js from src/client.template.js
npm test                    # 17 checks
npm run build -- --check    # only verify client.js matches the sources
```

Re-run `npm run build` after touching `skin.css`, `patches.css`, `src/client.template.js` or `skin.json`: `client.js` is a build artifact, hand edits are overwritten on the next build, and every install path ships the built copy. The fastest way to check a change while editing is to `dsh plugin add` the local directory, rebuild, then reload the page.

### Removing and reverting

- Skin center: pick the official default under Settings → Skin, or delete `%USERPROFILE%\.dsh\skins\ios-liquid-glass\` entirely and reload.
- Plugin: `dsh plugin --profile <name> remove dsh-skin-liquid-glass`, then reload the page.
- Temporarily off: set `localStorage["dsh-skin-liquid-glass.enabled"]` to `"0"`, as described under Configuration.

## Configuration

### Background occlusion

`--dsw-skin-scrim` (0–1) is written by the skin center's background-occlusion slider. Since v0.2.0 it only affects the page tones in `skin.css` (`--dsw-alias-bg-base` / `bg-layer-*`), which thicken full-page surfaces such as settings and the plugin market; the glass material (`--ios-lg-*`) uses fixed values, so dragging the slider cannot flatten the window's depth. In plugin form there is no slider and the variable keeps its CSS default of 0.

The user bubble has two knobs of its own: `--dsh-skin-bubble-alpha` (default .5) and `--dsh-skin-bubble-blur` (default 10px, unused since v0.2.0 — the bubble no longer carries its own filter), also supplied by the skin center.

### On/off flag

The plugin form persists its enabled state in `localStorage["dsh-skin-liquid-glass.enabled"]`, on by default; any value other than `"0"` or `"false"` counts as enabled. The client bundle exports `setEnabled(enabled)` for programmatic use; the shortest route from the page is to write the key and reload:

```js
localStorage.setItem("dsh-skin-liquid-glass.enabled", "0");
```

The flag deliberately does not go through `dsh-settings`: the host apiproxy only serves an allowlisted set of settings namespaces, and a third-party namespace would answer `settings-not-exposed`. Keeping it in localStorage keeps the skin self-contained.

### Artwork and placeholders

`skin.json`'s `contributes.backgroundMedia.{light,dark}` and the two photos in `assets/` stay in the repository, but v0.2.0 no longer paints them: the canvas is `--ios-lg-fog-image` in `patches.css` (skin-center form) and `FOG_LIGHT` / `FOG_DARK` in `src/client.template.js` (plugin form). The placeholders are kept so `scripts/build.mjs` keeps the same substitution contract (7 placeholders, two of them still pointing at `assets/plugin-wallpaper-*.jpg`), which keeps the artifact self-consistent and makes switching back to a photo a data-only change.

## Compatibility and limitations

- **DSH version**: `package.json` declares no `engines` range, so nothing is enforced at install time. The build was verified against DSH `0.2.0-rc.2`.
- **Platform**: verified on Windows. The Windows shell rounds off the chat column's top-left corner, cutting a notch where the sidebar meets it; one dedicated rule (`[data-windows-titlebar]`) squares that corner, and the same corner of the fullscreen right panel with it. The rule matches no element on other platforms, and there is no other platform-specific code in the repository.
- **macOS / Linux**: not tested. Every `backdrop-filter` in the stylesheets also ships a `-webkit-` prefix, `prefers-reduced-transparency` is covered, and the font stack prefers `SF Pro Text` / `-apple-system` before falling back to `Segoe UI` — but rendering has not been checked on those systems.
- **What is not changed**: geometry and interaction. Apart from radii, margins, inner rims, fills and shadows, padding, widths and scroll structure are untouched. Selectors are either `--dsw-*` token aliases or `[class*="_suffix"]` matches, there is no `hooks.mjs`, and no shell event is observed.
- **Visual tuning follows the fog**: the fog is a neutral three-pool wash and the fills of the shell, sidebar card, reply cards and overlays are tuned to it. Different fog stops move every sample and require retuning `--ios-lg-chrome`, `--ios-lg-sidebar-fill` and `--ios-lg-plate`; the photos in `assets/` no longer affect the glass.
- **Tokens must be declared on one line**: every declaration value in `skin.css` / `patches.css` has to stay on a single line (`linear-gradient`, `radial-gradient`, `box-shadow` and friends included). The skin centre does not inject these stylesheets raw: it clones the bare `:root` / `html` token blocks onto `body` line by line, so a wrapped value survives only as its first line and leaves an unclosed `(` behind — the browser then discards the rest of the sheet and the skin collapses back into a plain, material-less white board. The CSS-integrity cases in `npm test` guard this.

## Verification

`npm test` runs `node --test`: 17 checks, no dependencies.

- **Bundle lifecycle (7)**: exactly one loader entry, under the package id; the factory requires no shared module and exports `apply` / `setEnabled` / `inject`; `apply()` paints three `<style>` layers and teardown retracts all of them; a second `apply()` produces no duplicate layer; `setEnabled(false)` retracts, writes `"0"`, and the next `apply()` honours it; the bundle works without a theme service and without `ctx.effect`; `client.js` stays under 400 KB.
- **Packaging wiring (7)**: `package.json` declares the dsh bundle patch and the web client with an empty `inject`; `main`, the root export, `./client` and every `files` entry exist on disk; the roster patch mounts the package by its own name; `client.js` is byte-for-byte the current build; `skin.json` declares both layers, both palettes and their artwork and previews; `screenshots.json` holds 1–8 entries; both READMEs document the plugin install path and `LICENSE` exists.
- **CSS integrity (3)**: every declaration in both stylesheets sits on one line; cloning the `:root` / `html` tokens onto `body` the way the skin centre does leaves the simulated sheet bracket-balanced; that simulated sheet also parses in headless Chrome with a realistic rule count (`patches.css` ≥ 40, 73 measured; `skin.css` ≥ 4, 8 measured) instead of collapsing to the 2 rules a broken clone leaves. The third case skips itself when no Chrome is installed; set `CHROME_PATH` to point at one.

`node scripts/build.mjs --check` can also be run on its own to confirm that `client.js` is not stale; it exits non-zero with `client.js is stale — run: npm run build` when the artifact no longer matches the sources.

Light and dark were both reviewed block by block at 1600×1000; `preview/light.jpg` and `preview/dark.jpg` are the renders taken then.

The suite covers the loading contract and the packaging wiring, not the pixels: fills, blur radii and corner radii are checked visually in the running app and are not asserted. The skin-center side — directory scanning and stylesheet scoping — is likewise outside `npm test` and has to be seen installed.

## Repository layout

| Path | Role |
| --- | --- |
| `package.json` | package metadata, plus the `dsh.bundle` / `dsh.client` declarations |
| `skin.json` | skin manifest v2: id, name, accent, previews, stylesheet and patches, artwork and scrim placeholders |
| `skin.css` | token layer — remaps the shell's `--dsw-*` / `--aion-*` tokens (light plus `body[data-ds-dark-theme]`) |
| `patches.css` | material layer — fog, blur, saturation, specular rim, radii, hairlines, the single animation |
| `assets/ios-liquid-{light,dark}.jpg` | full-size photo artwork, 2560×1440 (not painted since v0.2.0) |
| `assets/plugin-wallpaper-{light,dark}.jpg` | 1600×900 / q88 re-encodes, still base64'd into the bundle to satisfy the placeholder contract (not painted) |
| `preview/{light,dark}.jpg` | real-interface captures used by the skin card and in this README, 1600×1000 |
| `screenshots.json` | screenshot list, relative to this directory |
| `lib/index.js` | host half: an empty `apply()` that only mounts a fiber |
| `cordis.patch.yml` | roster patch that mounts the package under its own name |
| `src/client.template.js` | client bundle template with build-time placeholders, not shipped as-is |
| `scripts/build.mjs` | zero-dependency builder: substitutes the placeholders and writes `client.js`; `--check` only compares |
| `client.js` | build artifact, `window.__ModuleLoader__.load({ id, factory })` |
| `tests/` | `node:test` cases: bundle lifecycle, packaging wiring and CSS integrity |
| `SUBMIT.md` | release and submission notes |
| `LICENSE` | MIT text |

## License

MIT, see `LICENSE`; the copyright line reads `ios-liquid-glass contributors`.

The design language comes from Apple's Liquid Glass. The repository contains no third-party code; the background is a CSS-drawn three-pool fog, the photos in `assets/` are kept but no longer painted, and the preview images are captures of the DSH Web UI with this skin applied.
