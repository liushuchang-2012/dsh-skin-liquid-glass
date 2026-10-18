/* dsh-skin-liquid-glass — package wiring test (node:test, zero dependencies).
 *
 * The plugin marketplace's CI accepts an entry only when the repository really
 * is an installable DSH plugin: a `dsh.bundle.patch` in package.json, that
 * patch file on disk, a resolvable `./client` export, and a roster id that
 * matches the package name. This file re-checks all of it locally, plus the
 * skin-center manifest and the screenshot list, so a broken bundle fails before
 * it reaches a pull request. Run: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const abs = (p) => join(root, p);
const read = (p) => readFileSync(abs(p), "utf8");
const pkg = JSON.parse(read("package.json"));

test("package.json declares the dsh bundle patch and the web client", () => {
	assert.equal(typeof pkg.dsh.bundle.patch, "string");
	assert.ok(existsSync(abs(pkg.dsh.bundle.patch)), "dsh.bundle.patch must exist");
	assert.equal(pkg.dsh.client.platform, "web");
	assert.ok(Array.isArray(pkg.dsh.client.inject));
	assert.equal(pkg.dsh.client.inject.length, 0, "this bundle requires no shared client module");
	assert.equal(pkg.type, "module");
	assert.equal(pkg.license, "MIT");
	assert.ok(pkg.keywords.includes("dsh-plugin"));
});

test("published exports resolve to real files", () => {
	assert.ok(existsSync(abs(pkg.main)), "main (host half) must exist");
	assert.ok(existsSync(abs(pkg.exports["."].default)), "root export must exist");
	assert.ok(existsSync(abs(pkg.exports["./client"])), "./client export must exist");
	for (const entry of pkg.files) {
		assert.ok(existsSync(abs(entry)), "files entry missing on disk: " + entry);
	}
});

test("the roster patch mounts this package by its own name", () => {
	const patch = read(pkg.dsh.bundle.patch);
	assert.match(patch, /^-\s*insert:/m, "patch must be an insert list");
	assert.match(patch, new RegExp("id:\\s*" + pkg.name));
	assert.match(patch, new RegExp("name:\\s*'?" + pkg.name + "'?"));
});

test("client.js is byte-for-byte the current build", () => {
	const built = spawnSync(process.execPath, ["scripts/build.mjs", "--check"], { cwd: root, encoding: "utf8" });
	assert.equal(built.status, 0, built.stderr || built.stdout);
	assert.match(built.stdout, /up to date/);
});

test("skin.json declares both layers and both palettes", () => {
	const manifest = JSON.parse(read("skin.json"));
	assert.equal(manifest.skinManifestVersion, 2);
	assert.equal(manifest.id, "ios-liquid-glass");
	assert.ok(existsSync(abs(manifest.contributes.stylesheet)), "stylesheet must exist");
	assert.ok(existsSync(abs(manifest.contributes.patches)), "patches must exist");
	assert.equal(manifest.contributes.backgroundMedia, undefined, "the skin paints its own background");
	for (const mode of ["light", "dark"]) {
		assert.ok(existsSync(abs(manifest.preview[mode])), mode + " preview must exist");
	}
});

test("screenshots.json stays inside the marketplace limit", () => {
	const shots = JSON.parse(read("screenshots.json"));
	assert.ok(Array.isArray(shots));
	assert.ok(shots.length >= 1 && shots.length <= 8, "1-8 screenshots");
	for (const shot of shots) assert.ok(existsSync(abs(shot)), "screenshot missing: " + shot);
});

test("the READMEs document both install paths", () => {
	assert.match(read("README.md"), /dsh plugin .*add/);
	assert.match(read("README.en.md"), /dsh plugin .*add/);
	assert.ok(existsSync(abs("LICENSE")));
});
