/* dsh-skin-liquid-glass — client bundle template.
 *
 * This file is NOT served directly: scripts/build.mjs substitutes the
 * placeholders below (package id, the two stylesheets, the two compact
 * artworks, and the scrim gradients declared in skin.json) and writes the
 * self-contained bundle to client.js — the artifact format the shell kernel
 * loads through window.__ModuleLoader__.load({ id, factory }).
 *
 * v0.2.0 note: the photo wallpaper is no longer painted. The canvas layer draws
 * a still procedural fog (see FOG_LIGHT / FOG_DARK below); the artwork
 * placeholders stay so the build keeps one substitution contract, and the files
 * remain in the repo as unused artwork.
 *
 * The factory body touches nothing but the DOM: it appends the token layer
 * (skin.css), the material layer (patches.css) and one wallpaper layer, and
 * removes all three again on teardown. No shared client module is required, so
 * this bundle has no `dsh.client.inject` entry and cannot break when the shell
 * rotates a component hash — every selector in the stylesheets is either a
 * token alias or a `[class*="_suffix"]` match.
 *
 * Palette handling is pure CSS: the shell toggles `body[data-ds-dark-theme]`,
 * so the wallpaper layer carries one rule per palette and swaps without any
 * JavaScript listening for a theme change.
 */
window.__ModuleLoader__.load({
	id: __PKG_NAME__,
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		/** Source id of this layer set (the package id the façade pins). */
		const SOURCE = __PKG_NAME__;

		/** The two halves of the skin, verbatim from the repo root. */
		const CSS = {
			tokens: __SKIN_CSS__,
			patches: __PATCHES_CSS__
		};

		/** Artwork + scrim per palette (skin.json → contributes.backgroundMedia). */
		const MEDIA = {
			light: { image: __WALLPAPER_LIGHT__, scrim: __SCRIM_LIGHT__ },
			dark: { image: __WALLPAPER_DARK__, scrim: __SCRIM_DARK__ }
		};

		/** localStorage flag: the skin has no host-side settings namespace. */
		const STORAGE_KEY = SOURCE + ".enabled";

		/** One <style> element per layer, addressed by data-plugin-css. */
		const LAYER_IDS = {
			tokens: SOURCE + "/skin.css",
			patches: SOURCE + "/patches.css",
			wallpaper: SOURCE + "/wallpaper.css"
		};

		/**
		 * Canvas layer: v0.2.0 paints the still fog field here instead of the
		 * photo wallpaper. It mirrors --ios-lg-fog-image in patches.css so the
		 * plugin form (raw <style> injection, no skin-center wrapper) and the
		 * skin-center form paint the same canvas: three soft light pools over a
		 * pale vertical wash, swapped for the night palette by
		 * body[data-ds-dark-theme]. The body itself stays transparent — the fog
		 * sits on a fixed ::before so it never scrolls with the transcript.
		 * @returns {string} the stylesheet source for the canvas layer.
		 */
		const FOG_LIGHT = "radial-gradient(64% 60% at 16% 6%, rgba(255, 255, 255, .60), rgba(255, 255, 255, 0) 72%), radial-gradient(54% 50% at 86% 12%, rgba(186, 211, 243, .32), rgba(186, 211, 243, 0) 74%), radial-gradient(62% 56% at 62% 98%, rgba(194, 210, 234, .34), rgba(194, 210, 234, 0) 78%), linear-gradient(118deg, rgba(255, 255, 255, 0) 30%, rgba(255, 255, 255, .10) 48%, rgba(255, 255, 255, 0) 66%), linear-gradient(180deg, #ffffff 0%, #f2f7fe 34%, #e6ecf6 74%, #e1e8f2 100%)";
		const FOG_DARK = "radial-gradient(64% 60% at 16% 6%, rgba(150, 176, 212, .22), rgba(150, 176, 212, 0) 74%), radial-gradient(54% 50% at 86% 12%, rgba(92, 118, 160, .22), rgba(92, 118, 160, 0) 74%), radial-gradient(62% 56% at 62% 98%, rgba(108, 126, 156, .18), rgba(108, 126, 156, 0) 78%), linear-gradient(140deg, rgba(255, 255, 255, .05) 34%, rgba(255, 255, 255, 0) 52%), linear-gradient(180deg, #0b0f15 0%, #121821 38%, #1b2029 78%, #1e242e 100%)";

		function wallpaperCss() {
			return [
				"body{",
				"background:transparent !important;",
				"}",
				"body::before{",
				"content:\"\";",
				"position:fixed;",
				"inset:0;",
				"z-index:-2;",
				"background-image:" + FOG_LIGHT + ";",
				"background-size:cover;",
				"background-repeat:no-repeat;",
				"pointer-events:none;",
				"}",
				"body[data-ds-dark-theme]::before{",
				"background-image:" + FOG_DARK + ";",
				"}"
			].join("\n");
		}

		/** Layer table: id + the source that fills it. */
		const LAYERS = [
			{ id: LAYER_IDS.tokens, source: () => CSS.tokens },
			{ id: LAYER_IDS.patches, source: () => CSS.patches },
			{ id: LAYER_IDS.wallpaper, source: wallpaperCss }
		];

		/** Read the persisted on/off flag (default: enabled). */
		function readStored() {
			try {
				if (typeof localStorage === "undefined") return true;
				const value = localStorage.getItem(STORAGE_KEY);
				return value === null ? true : value !== "0" && value !== "false";
			} catch (error) {
				return true;
			}
		}

		/** Persist the on/off flag. */
		function writeStored(enabled) {
			try {
				if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
			} catch (error) {
				/* private mode / storage disabled: the layer still applies this session */
			}
		}

		/** The document head, or null when there is no DOM (SSR-safe). */
		function head() {
			if (typeof document === "undefined") return null;
			return document.head || document.documentElement || null;
		}

		/** Find the plugin's own <style> for one layer id. */
		function findStyle(id) {
			const parent = head();
			if (parent === null || typeof parent.querySelector !== "function") return null;
			return parent.querySelector("style[data-plugin-css=" + JSON.stringify(id) + "]");
		}

		/** Create or update one plugin-owned <style> element. */
		function putStyle(id, source) {
			const parent = head();
			if (parent === null) return null;
			const existing = findStyle(id);
			if (existing !== null) {
				existing.textContent = source;
				return existing;
			}
			const tag = document.createElement("style");
			tag.dataset.plugin = SOURCE;
			tag.dataset.pluginCss = id;
			tag.textContent = source;
			parent.appendChild(tag);
			return tag;
		}

		/** Remove every layer this plugin owns. */
		function removeStyles() {
			for (const layer of LAYERS) {
				const tag = findStyle(layer.id);
				if (tag !== null && typeof tag.remove === "function") tag.remove();
			}
		}

		/** Apply or retract all three layers. */
		function mount(enabled) {
			if (!enabled) {
				removeStyles();
				return;
			}
			for (const layer of LAYERS) putStyle(layer.id, layer.source());
		}

		/**
		 * Client plugin body: stack the layers while enabled and retract them on
		 * teardown (hot reload, plugin removal, profile switch).
		 * @param ctx - client cordis context.
		 */
		function apply(ctx) {
			mount(readStored());
			if (ctx && typeof ctx.effect === "function") {
				ctx.effect(() => () => { removeStyles(); }, SOURCE + ": layer cleanup");
			}
		}

		/**
		 * Toggle the skin without a reload. Exported for programmatic use; the
		 * value persists in localStorage for the next boot.
		 * @param enabled - true to paint, false to retract.
		 */
		function setEnabled(enabled) {
			writeStored(enabled);
			mount(enabled);
		}

		exports.apply = apply;
		exports.setEnabled = setEnabled;
		/* No shared client module is required; the shell resolves nothing for us. */
		exports.inject = [];
		return module.exports;
	}
});
