/* dsh-skin-liquid-glass — bundle smoke test (node:test, zero dependencies).
 *
 * Loads the built client.js the way the shell kernel does — a
 * window.__ModuleLoader__.load({ id, factory }) call — into a hand-rolled DOM
 * that implements exactly the surface the bundle touches, then asserts the
 * loader contract and the layer lifecycle. Run: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const code = readFileSync(join(root, "client.js"), "utf8");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

const IDS = {
	tokens: pkg.name + "/skin.css",
	patches: pkg.name + "/patches.css",
	wallpaper: pkg.name + "/wallpaper.css"
};

/** Minimal DOM: head > style[data-plugin-css], nothing else. */
function createDom() {
	const head = {
		children: [],
		appendChild(node) {
			node.parent = this;
			this.children.push(node);
			return node;
		},
		querySelector(selector) {
			const match = /^style\[data-plugin-css="(.*)"\]$/.exec(selector);
			if (match === null) return null;
			return this.children.find((node) => node.dataset.pluginCss === match[1]) || null;
		}
	};
	const document = {
		head,
		documentElement: head,
		querySelector: head.querySelector.bind(head),
		createElement() {
			return {
				dataset: {},
				textContent: "",
				parent: null,
				remove() {
					const index = this.parent === null ? -1 : this.parent.children.indexOf(this);
					if (index >= 0) this.parent.children.splice(index, 1);
				}
			};
		}
	};
	return { document, head };
}

/** Load client.js with a fake storage and the given DOM. */
function load({ storage = new Map(), dom = createDom() } = {}) {
	const loaded = [];
	const window = { __ModuleLoader__: { load: (definition) => loaded.push(definition) } };
	const localStorage = {
		getItem: (key) => (storage.has(key) ? storage.get(key) : null),
		setItem: (key, value) => storage.set(key, String(value))
	};
	const run = new Function("window", "document", "localStorage", code);
	run(window, dom.document, localStorage);
	return { loaded, dom, storage };
}

test("registers exactly one loader entry under the package id", () => {
	const { loaded } = load();
	assert.equal(loaded.length, 1);
	assert.equal(loaded[0].id, pkg.name);
	assert.equal(typeof loaded[0].factory, "function");
});

test("the factory requires no shared module and exposes apply/inject", () => {
	const { loaded } = load();
	const exportsObject = loaded[0].factory(() => {
		throw new Error("this bundle must not require any client module");
	});
	assert.equal(typeof exportsObject.apply, "function");
	assert.equal(typeof exportsObject.setEnabled, "function");
	assert.ok(Array.isArray(exportsObject.inject));
	assert.equal(exportsObject.inject.length, 0);
});

test("apply() paints the three layers and teardown retracts them", () => {
	const { loaded, dom } = load();
	const exportsObject = loaded[0].factory(() => {});
	const disposers = [];
	// ctx.effect(setup) calls setup() and registers the function it returns.
	exportsObject.apply({ effect: (setup) => disposers.push(setup()) });

	assert.deepEqual(dom.head.children.map((node) => node.dataset.pluginCss), [IDS.tokens, IDS.patches, IDS.wallpaper]);
	for (const node of dom.head.children) assert.equal(node.dataset.plugin, pkg.name);

	const [tokens, patches, wallpaper] = dom.head.children;
	assert.match(tokens.textContent, /--dsw-alias-bg-base:/);
	assert.match(tokens.textContent, /body\[data-ds-dark-theme\]/);
	assert.match(patches.textContent, /--ios-lg-/);
	assert.equal(wallpaper.textContent.match(/data:image\/jpeg;base64,/g).length, 2);
	assert.match(wallpaper.textContent, /radial-gradient/);
	assert.match(wallpaper.textContent, /body\[data-ds-dark-theme\]\{/);
	assert.match(wallpaper.textContent, /background-size:cover !important/);

	assert.equal(disposers.length, 1);
	disposers[0]();
	assert.equal(dom.head.children.length, 0);
});

test("apply() is idempotent and leaves no duplicate layer", () => {
	const { loaded, dom } = load();
	const exportsObject = loaded[0].factory(() => {});
	exportsObject.apply({});
	exportsObject.apply({});
	assert.equal(dom.head.children.length, 3);
	assert.equal(new Set(dom.head.children.map((node) => node.dataset.pluginCss)).size, 3);
});

test("setEnabled(false) retracts, persists, and the next apply honours it", () => {
	const storage = new Map();
	const first = load({ storage });
	const firstExports = first.loaded[0].factory(() => {});
	firstExports.apply({});
	assert.equal(first.dom.head.children.length, 3);

	firstExports.setEnabled(false);
	assert.equal(first.dom.head.children.length, 0);
	assert.equal(storage.get(pkg.name + ".enabled"), "0");

	const second = load({ storage });
	second.loaded[0].factory(() => {}).apply({});
	assert.equal(second.dom.head.children.length, 0);
});

test("works without a theme service and survives a missing effect()", () => {
	const { loaded, dom } = load();
	assert.doesNotThrow(() => loaded[0].factory(() => {}).apply());
	assert.equal(dom.head.children.length, 3);
});

test("the bundle stays small enough to ship inline", () => {
	assert.ok(Buffer.byteLength(code) < 400_000, "client.js should stay well under 400 KB");
});
