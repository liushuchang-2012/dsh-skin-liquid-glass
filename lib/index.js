/* dsh-skin-liquid-glass — host half (dual-face package shape, mirroring the
 * official dsh-client-* packages).
 *
 * The loader mounts a cordis entry for this package by its root export, and the
 * modules node half only composes client bundles from entries that mounted a
 * fiber. This skin has no host-side behaviour — the whole effect lives in the
 * client half (client.js), which appends the two stylesheets and one wallpaper
 * layer to the document. Keeping a real (no-op) host apply makes the fiber
 * mount so the client bundle reaches window.__DSH_BOOT__.
 *
 * NOTE (settings): the on/off flag persists in the browser's localStorage
 * rather than a `dsh-settings` namespace. The host apiproxy only serves
 * settings namespaces on an explicit allowlist
 * (`WEB_SETTINGS_NAMESPACES` in @deepseek-ai/dsh-host-apiproxy), so a
 * third-party namespace would register fine but answer `settings-not-exposed`
 * to the Web client. localStorage keeps this skin self-contained; enabling or
 * disabling without a reload is available programmatically through the client
 * half's exported setEnabled(), and loaded/unloaded covers the rest
 * (`dsh plugin add` / `dsh plugin remove`).
 */

/** Stable Cordis plugin name; matches cordis.patch.yml's roster id. */
const name = "dsh-skin-liquid-glass";

/** No host-side services or registries are required by this skin. */
function apply() {}

export { apply, name };
