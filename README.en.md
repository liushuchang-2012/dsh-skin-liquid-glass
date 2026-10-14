# iOS Liquid Glass — a DeepSeek Harness skin

An Apple-inspired glass skin for the DSH Web client. It is a **declarative skin-center
skin**: no plugin, no `hooks.mjs`, no JavaScript — three CSS/JSON parts and two
generated wallpapers, so you can drop it into the user skin directory, switch it on
and delete it again without touching the app.

- skin id: `ios-liquid-glass`
- repository: <https://github.com/liushuchang-2012/dsh-skin-liquid-glass> (MIT)
- install path: `%USERPROFILE%\.dsh\skins\ios-liquid-glass\`
- activate: **Settings → 皮肤 (Skin center) → iOS 液态玻璃**, or
  `POST /api/skin-center/v2/active` with `{"active":"ios-liquid-glass"}`
- remove: pick **官方默认 (Official default)** in the skin center, or delete the
  directory (no restart needed either way)

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
| T2 content | prose plates, user bubble, code blocks, tables | 26px | .50 / .84 |
| T3 controls | composer card (centre → edge gradient), chips, queue dock | 30px | .96 → .85 |
| T4 overlay | menus, dialogs, toasts | 40px | .95 |

The skin-center **background occlusion** slider (`--dsw-skin-scrim`) drives every
fill: at 0 the wallpaper is fully visible and the values above apply, at 100 the
panels fill in to roughly .96.

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

## Verification

Checked against DSH `0.2.0-rc.2` on Windows with a headless Chrome session driving the
real GUI: `/api/skin-center/v2/catalog` reports `origin: "user"`, `warnings: []`,
`diagnostics: []`, and both stylesheets are served already scoped under
`html[data-dsh-skin="ios-liquid-glass"]`. See `README.md` (Chinese) for the full
round-by-round change log and measured values.
