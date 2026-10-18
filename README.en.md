# iOS Liquid Glass — a DeepSeek Harness skin

A Liquid Glass skin for DeepSeek Harness: one self-drawn static fog field sits at the bottom of the window, the whole window is frosted exactly once, and every column is transparent on top of it — the sidebar and the conversation can never drift apart in colour.

![Light](preview/light.jpg)

## What it does

- **One background**: white at the top, grey through the middle, a stroke of blue (`#4d6bfe`) at the bottom, shared by the whole window.
- **One frost**: a single `blur(40px) saturate(160%)` on `[data-dsh-frame]::before`. The glass reads through the blur, not through a whiter fill.
- **Floating sidebar**: 24px radius, a 22% white wash, `blur(40px)`, a hairline and a soft shadow; the card itself is nearly clear.
- **Bubbles with depth**: each reply is one 18px bubble with a light shadow; your own messages get an upward shadow. Both sit above the blue.
- **Few solid surfaces**: code blocks, the composer, menus/dialogs/toasts — everything else stays transparent.
- **Light and dark**: driven by `body[data-ds-dark-theme]`, no JavaScript listener.

## Install

### Skin Centre

Install the repository as a skin directory, or copy it to `~/.dsh/skins/ios-liquid-glass`, then enable it in Skin Centre.

### As a client plugin

```bash
dsh plugin add github:liushuchang-2012/dsh-skin-liquid-glass
npm install github:liushuchang-2012/dsh-skin-liquid-glass   # or via npm
npm uninstall dsh-skin-liquid-glass                          # remove
```

### Local development

```bash
node scripts/build.mjs            # rebuild client.js
node scripts/build.mjs --check    # CI: is client.js stale?
node --test tests/*.test.mjs      # 17 checks
```

## Configuration

- **Background occlusion**: the slider in Skin Centre; 0 is the thinnest glass, 100 pushes panels towards solid.
- **On/off**: `localStorage["dsh-skin-liquid-glass.enabled"] = "0" | "1"`, or the exported `setEnabled(bool)`.

## Compatibility and limits

- Only tested on the Windows desktop app; macOS and Linux are untested.
- Selectors rely on `[class*="_suffix"]` matches and CSS variables, so a shell rename may need a follow-up.
- CSS loads at app start — restart DSH after changing it.

## Verification

`node --test tests/*.test.mjs` runs 17 checks: the bundle matches the template, every declaration in both stylesheets stays on one line (Skin Centre clones line by line, and a wrapped value truncates the sheet), Chrome still parses the cloned sheet, and the manifest matches the published file list.

## Layout

```
skin.css      token layer (colour, radii, type)
patches.css   material layer (background, frost, sidebar, bubbles, overlays)
src/          client.js template
scripts/      build.mjs
tests/        17 checks
preview/      screenshots
```

## License

MIT
