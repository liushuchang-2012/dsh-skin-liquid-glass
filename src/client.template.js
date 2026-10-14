/* dsh-skin-liquid-glass — client bundle template.
 *
 * This file is NOT served directly: scripts/build.mjs substitutes the
 * placeholders below (package id, the two stylesheets, the two compact
 * wallpapers, and the scrim gradients declared in skin.json) and writes the
 * self-contained bundle to client.js — the artifact format the shell kernel
 * loads through window.__ModuleLoader__.load({ id, factory }).
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
		 * Wallpaper layer: the artwork covers the canvas, the scrim's radial
		 * gradients sit on top of it exactly as the skin center paints them, and
		 * the dark palette rides body[data-ds-dark-theme]. `background-attachment:
		 * fixed` keeps the mesh steady while a panel scrolls over it.
		 * @returns {string} the stylesheet source for the wallpaper layer.
		 */
		function wallpaperCss() {
			return [
				"body{",
				"background-image:" + MEDIA.light.scrim + ",url(" + MEDIA.light.image + ") !important;",
				"background-size:cover !important;",
				"background-position:center center !important;",
				"background-repeat:no-repeat !important;",
				"background-attachment:fixed !important;",
				"}",
				"body[data-ds-dark-theme]{",
				"background-image:" + MEDIA.dark.scrim + ",url(" + MEDIA.dark.image + ") !important;",
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
