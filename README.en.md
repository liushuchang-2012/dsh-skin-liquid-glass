# iOS Liquid Glass — a DeepSeek Harness skin

An Apple-inspired glass skin for the DSH Web client. The skin itself is
**declarative**: no `hooks.mjs`, no JavaScript — three CSS/JSON parts and two
generated wallpapers, so you can drop it into the user skin directory, switch it
on and delete it again without touching the app. The same repository also ships
as a **DSH client plugin** (`dsh.bundle.patch` + `client.js`) whose only job is
to append three `<style>` elements to the document: no dependencies, no network,
nothing host-side.

- skin id: `ios-liquid-glass`
- plugin package: `dsh-skin-liquid-glass`
- repository: <https://github.com/liushuchang-2012/dsh-skin-liquid-glass> (MIT)
- install path: `%USERPROFILE%\.dsh\skins\ios-liquid-glass\`
- activate: **Settings → 皮肤 (Skin center) → iOS 液态玻璃**, or
  `POST /api/skin-center/v2/active` with `{"active":"ios-liquid-glass"}`
- remove: pick **官方默认 (Official default)** in the skin center, or delete the
  directory (no restart needed either way)

## Install

**1 · As a skin-center skin.** Copy the repository into
`%USERPROFILE%\.dsh\skins\ios-liquid-glass\`, then enable it in
**Settings → 皮肤**.

**2 · As a plugin (`dsh plugin`, i.e. pnpm inside the profile directory).**

```bash
# straight from git
dsh plugin --profile desktop add github:liushuchang-2012/dsh-skin-liquid-glass

# or from a local checkout (what you want while editing the CSS)
dsh plugin --profile desktop add "C:\path\to\dsh-skin-liquid-glass"

# remove
dsh plugin --profile desktop remove dsh-skin-liquid-glass
```

Reload the page after installing. In plugin form `client.js` paints the wallpaper
and the scrim itself, so the skin center is not involved at all; the two install
paths work independently — just do not run both at once (the same rules would
stack twice and the wallpaper would be painted twice).

## Palette — greys plus the system accent colours

| Role | Light | Dark |
| --- | --- | --- |
| Canvas / panels / hairlines | `#f2f2f7` · `#fff` · `#e8e8ec` | `#000` · system greys 1–4 |
| Body / secondary / tertiary text | `#1c1c1e` · `#48484a` · `#8e8e93` | `#f2f2f7` · `#c7c7cc` · `#8e8e93` |
| Interaction / link / focus | `#0a7cff` | `#0a84ff` |
| Success / warning / error | `#34c759` / `#ff9f0a` / `#ff3b30` | `#30d158` / `#ffd60a` / `#ff453a` |
| User bubble | white glass + 8% system blue | white glass + 15% system blue |

The two wallpapers (`assets/*.jpg`, 2560×1440) are generated **neutral grey fields**
(R = G = B), so the glass never picks up a colour cast. To drop the last trace of
chroma, replace the two `rgba(10, 124, 255, …)` tints in `patches.css` with grey.

## Four material tiers

| Tier | Applies to | Blur / saturation | Fill (background occlusion = 0) |
| --- | --- | --- | --- |
| T1 chrome | sidebar + conversation column + right column | 30px · 150% | .30 |
| T2 content | prose plates, user bubble, code blocks, tables | 26px | .50 (headings match prose) |
| T3 controls | composer card (centre → edge gradient, **semi-transparent**), chips, queue dock | 30px | **.66 → .50** |
| T4 overlay | menus / dropdowns (shell default material), dialogs, toasts | 40px (menus: default 40px · 150%) | .95 (dialogs / toasts) |

The skin-center **background occlusion** slider (`--dsw-skin-scrim`) drives every
fill: at 0 the wallpaper is fully visible and the values above apply, at 100 the
panels fill in to roughly .96. The composer card is now semi-transparent — .66 at
the centre, .50 at the rim — with its frost supplied by the
`[data-dsh-composer-frost]` follower the skin center mounts (the `::before` here is
the fallback), so the transcript stays legible underneath while the wallpaper
still reads through.

## Latest feedback round

- **Left column floats**: `[class*="sidebarCol"]` gains `margin: 8px 0 8px 8px`,
  a 22px radius, `overflow: hidden` and one soft drop shadow, so the sidebar reads
  as a glass card floating on the wallpaper instead of a flush column.
- **Right-panel Markdown reader**: the right panel is already frosted, so the
  per-paragraph `::before` plates (each carrying its own `backdrop-filter`) were
  removed inside `[data-document-markdown]` and better-sidebar's `editorMd`
  preview — long documents now scroll as a plain paint instead of re-routing a
  backdrop under every block.
- **Headings**: the extra square `--ios-lg-plate-strong` fill on `h1…h6` is gone;
  headings use the same rounded `.50` plate as prose (18px radius), so they no
  longer look whiter than the bubble around them.
- **Dropdowns**: `--dsw-specific-menu`, `--dsw-specific-selector`,
  `--dsw-alias-bg-overlay` and `--dsw-menu-backdrop-filter` go back to the shell's
  defaults (light `#f8f9fa94` / dark `#43454a73`, `blur(40px) saturate(150%)`).
- **Diff preview**: `--dsw-alias-file-diff-*` / `--dsw-alias-code-diff-*` return to
  the shell's opaque fills (light `#e6f4e7` / `#fce6e2`, dark `#1f3124` / `#3c1f1b`),
  and the `+n / −m` counter keeps its green / red ink at rest.

## Two invariants

1. **Never put `backdrop-filter` on a box that has `position: fixed` descendants.**
   `backdrop-filter` (like `filter`/`transform`) makes the element a containing
   block; the shell renders icon tooltips as fixed spans inside action rows and the
   composer card, so frosting those directly throws the tooltips into the scrollport
   (skin-center issue #1724). Every large surface is therefore frosted on a
   `::before` pseudo-element instead — a pseudo-element has no descendants.
2. **Do not touch geometry or interaction.** Only radii, inner strokes and fills
   change; `prefers-reduced-motion` drops the single specular sweep and
   `prefers-reduced-transparency` turns the glass into flat panels.

## Files

| File | Role |
| --- | --- |
| `skin.json` | manifest v2: name, palette accent, background media + scrim, previews |
| `skin.css` | token layer — remaps the shell's `--dsw-*` / `--aion-*` tokens (light + `body[data-ds-dark-theme]`) |
| `patches.css` | material layer — backdrop blur, specular rim, radii, hairlines, the one motion |
| `assets/*.jpg` | neutral grey wallpapers (light / dark) |
| `preview/*.jpg` | skin-center card previews, generated from real screenshots |
| `package.json` · `cordis.patch.yml` · `lib/index.js` | plugin host half — the roster patch mounts a no-op cordis plugin so the client bundle reaches `window.__DSH_BOOT__` |
| `src/client.template.js` · `scripts/build.mjs` · `client.js` | client bundle: template, zero-dependency builder, built artifact (`window.__ModuleLoader__.load({ id, factory })`) |
| `tests/*.test.mjs` | `npm test` — bundle lifecycle plus package wiring, no dependencies |
| `screenshots.json` | marketplace screenshot list (points at `preview/`) |

## Plugin form (client bundle)

- The host half is an empty `apply()`; the on/off flag lives in
  `localStorage["dsh-skin-liquid-glass.enabled"]` (default on) because a
  third-party `dsh-settings` namespace answers `settings-not-exposed` to the Web
  client. `setEnabled(false)` in the console retracts the skin immediately.
- The client half requires **no shared module** (`dsh.client.inject` is empty):
  every selector is either a `--dsw-*` token alias or a `[class*="_suffix"]`
  match, so shell hash rotations cannot break it.
- Three `<style data-plugin-css=…>` layers — `skin.css` (tokens), `patches.css`
  (material) and a generated wallpaper layer (`body` artwork + the scrims from
  `skin.json`, dark palette via `body[data-ds-dark-theme]`) — all removed on
  teardown.
- The baked wallpapers are 1600×900 / q88 re-encodes (40 KB light, 48 KB dark);
  the whole bundle is **169 KB**.

```bash
npm run build                            # regenerate client.js after CSS / artwork / skin.json edits
npm test                                 # bundle lifecycle + package wiring, 14 checks
dsh plugin --profile desktop add "$PWD"  # install a local copy and look at it
```

## Verification

Checked against DSH `0.2.0-rc.2` on Windows with a headless Chrome session driving the
real GUI: `/api/skin-center/v2/catalog` reports `origin: "user"`, `warnings: []`,
`diagnostics: []`, and both stylesheets are served already scoped under
`html[data-dsh-skin="ios-liquid-glass"]`. See `README.md` (Chinese) for the full
round-by-round change log and measured values.
