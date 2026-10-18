/* dsh-skin-liquid-glass — CSS integrity test (node:test, zero dependencies).
 *
 * The skin centre does not inject these files raw: transformSkinCss
 * (dsh-client-ui-skin-center/lib/index.js:2358-2436) force-scopes every rule and,
 * for a bare `:root` / `html` block, clones the declarations onto body ONE LINE
 * AT A TIME through bodyCloneProperty() (index.js:2318). That clone keeps each
 * `--x:` line verbatim and drops the continuation lines of a wrapped value, so a
 * multi-line value leaves an unclosed `(` behind and Chrome discards the rest of
 * the stylesheet — the served patches sheet parsed to just 2 rules and every
 * material in this skin went missing. Hence:
 *   1. every declaration value must sit on one line;
 *   2. the simulated line-clone must stay balanced;
 *   3. the simulated sheet must actually parse in Chrome (rules >= threshold).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const SKIN_ID = "css-integrity-probe";
const SCOPE = `html[data-dsh-skin="${SKIN_ID}"]`;

const FILES = {
	"skin.css": { minRules: 4 },
	"patches.css": { minRules: 40 }
};

const read = (name) => readFileSync(join(root, name), "utf8");

/* ---------------------------------------------------------------- helpers */

/** Split CSS into top-level blocks: { selector, body } plus raw at-rules. */
function blocks(css) {
	const out = [];
	let selectors = [];
	let buf = "";
	let depth = 0;
	let i = 0;
	while (i < css.length) {
		const ch = css[i];
		if (ch === "/" && css[i + 1] === "*") {
			const end = css.indexOf("*/", i + 2);
			i = end < 0 ? css.length : end + 2;
			continue;
		}
		if (depth === 0) {
			if (ch === "{") {
				depth = 1;
				buf = "";
			} else if (ch === "}") {
				throw new Error("unbalanced } at " + i);
			} else {
				selectors.push(ch);
			}
			i++;
			continue;
		}
		if (ch === "{") depth++;
		else if (ch === "}") {
			depth--;
			if (depth === 0) {
				out.push({ selector: selectors.join("").trim(), body: buf });
				selectors = [];
				buf = "";
			} else buf += ch;
			i++;
			continue;
		}
		if (depth === 1) buf += ch;
		else buf += ch;
		i++;
	}
	if (depth !== 0) throw new Error("unbalanced { at EOF");
	return out;
}

const withoutComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "");

/** skin-center's bodyCloneProperty (index.js:2318-2325), simplified. */
function bodyCloneProperty(line) {
	const custom = line.match(/^(--[\w-]+)\s*:/);
	if (custom !== null) return line;
	return /^background-(color|image)\s*:/.test(line) ? line : null;
}

/** Clone a bare :root / html block onto body, line by line, as the skin centre does. */
function cloneOntoBody(block) {
	return withoutComments(block)
		.split("\n")
		.map((line) => line.trim())
		.map((line) => bodyCloneProperty(line))
		.filter((line) => line !== null)
		.join("\n");
}

const hasBareRoot = (selectorText) =>
	selectorText
		.split(",")
		.map((s) => s.trim())
		.some((s) => s === ":root" || s === "html");

/** Reproduce transformSkinCss closely enough to expose a broken line clone. */
function simulateServed(css) {
	const out = [];
	for (const block of blocks(css)) {
		if (block.selector.startsWith("@")) {
			out.push(`${block.selector} {${block.body}}`);
			continue;
		}
		const scoped = block.selector
			.split(",")
			.map((s) => {
				const sel = s.trim();
				return sel === ":root" || sel === "html" ? SCOPE : `${SCOPE} ${sel}`;
			})
			.join(", ");
		out.push(`${scoped} {${block.body}}`);
		if (hasBareRoot(block.selector)) {
			out.push(`${SCOPE} body {\n${cloneOntoBody(block.body)}\n}`);
		}
	}
	return out.join("\n");
}

const balance = (css) => {
	let paren = 0;
	let brace = 0;
	for (const ch of css) {
		if (ch === "(") paren++;
		else if (ch === ")") paren--;
		else if (ch === "{") brace++;
		else if (ch === "}") brace--;
	}
	return { paren, brace };
};

/** Join multi-line declarations exactly like the line clone would break them. */
function multiLineDeclarations(css) {
	const lines = css.split("\n");
	const offenders = [];
	let depth = 0;
	let inComment = false;
	let pending = null;
	for (const line of lines) {
		const t = line.trim();
		if (inComment) {
			if (t.includes("*/")) inComment = false;
			continue;
		}
		if (pending !== null) {
			offenders.push(pending);
			pending = null;
		}
		if (t === "") continue;
		if (t.startsWith("/*")) {
			if (!t.includes("*/")) inComment = true;
			continue;
		}
		if (t.endsWith("{")) {
			depth++;
			continue;
		}
		if (t.startsWith("}")) {
			depth = Math.max(0, depth - 1);
			continue;
		}
		/* an inline block on one line (`0% { background-position: 165% 0; }` in a
		   @keyframes step) is complete — nothing wraps, nothing can be lost */
		if (t.includes("{") && t.endsWith("}")) continue;
		if (t.startsWith("@")) continue;
		if (depth === 0) continue;
		const body = t.replace(/\s*\/\*[\s\S]*?\*\/\s*$/, "").trim();
		if (!body.endsWith(";")) pending = t;
	}
	if (pending !== null) offenders.push(pending);
	return offenders;
}

function chromeBinary() {
	const candidates = [
		process.env.CHROME_PATH,
		"C:/Program Files/Google/Chrome/Application/chrome.exe",
		"C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
		"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		"/usr/bin/google-chrome",
		"/usr/bin/chromium",
		"/usr/bin/chromium-browser"
	].filter(Boolean);
	for (const candidate of candidates) if (existsSync(candidate)) return candidate;
	try {
		const found = execFileSync("where", ["chrome"], { encoding: "utf8" }).split(/\r?\n/)[0].trim();
		if (found && existsSync(found)) return found;
	} catch {
		/* not on PATH */
	}
	return null;
}

let scratch = null;
function countRulesInChrome(css) {
	const chrome = chromeBinary();
	if (chrome === null) return null;
	scratch ??= mkdtempSync(join(tmpdir(), "dsh-skin-css-integrity-"));
	const file = join(scratch, "probe.html");
	const html = `<!doctype html><html><head><style id="s">${css}</style></head><body><pre id="out"></pre>
<script>
const sheet = document.getElementById("s").sheet;
let total = 0;
const walk = (rules) => { for (const rule of rules) { total++; if (rule.cssRules) walk(rule.cssRules); } };
walk(sheet.cssRules);
document.getElementById("out").textContent = String(total);
</script></body></html>`;
	writeFileSync(file, html);
	const dom = execFileSync(
		chrome,
		["--headless=new", "--disable-gpu", "--hide-scrollbars", "--dump-dom", "file:///" + file.replace(/\\/g, "/")],
		{ encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
	);
	const start = dom.indexOf('<pre id="out">');
	assert.notEqual(start, -1, "Chrome probe page did not render its <pre>");
	const total = Number(dom.slice(start + '<pre id="out">'.length, dom.indexOf("</pre>", start)).trim());
	assert.ok(Number.isFinite(total), "could not read the rule count back from Chrome");
	return total;
}

/* ------------------------------------------------------------------ tests */

test("every declaration in skin.css / patches.css sits on one line", () => {
	const problems = [];
	for (const name of Object.keys(FILES)) {
		for (const offender of multiLineDeclarations(read(name))) problems.push(`${name}: ${offender}`);
	}
	assert.deepEqual(
		problems,
		[],
		"wrapped declaration value(s) found — the skin centre clones bare :root/html blocks line by line, " +
			"so a wrapped value leaves an unclosed bracket and Chrome drops the rest of the sheet:\n" + problems.join("\n")
	);
});

test("simulated line clone of the token blocks stays bracket-balanced", () => {
	for (const name of Object.keys(FILES)) {
		const served = simulateServed(read(name));
		const { paren, brace } = balance(served);
		assert.deepEqual(
			{ paren, brace },
			{ paren: 0, brace: 0 },
			`${name}: the line-cloned served sheet is unbalanced — Chrome would discard everything after the break`
		);
	}
});

test("simulated served sheet parses in Chrome with a realistic rule count", (t) => {
	if (chromeBinary() === null) {
		t.skip("no Chrome/Chromium binary found — set CHROME_PATH to enable this test");
		return;
	}
	for (const [name, { minRules }] of Object.entries(FILES)) {
		const served = simulateServed(read(name));
		if (process.env.DUMP_SIM) writeFileSync(join(tmpdir(), "sim-" + name), served);
		const total = countRulesInChrome(served);
		assert.ok(total !== null, `${name}: Chrome unavailable`);
		assert.ok(
			total >= minRules,
			`${name}: only ${total} rule(s) parsed after the line clone (expected >= ${minRules}) — the clone is broken again`
		);
		t.diagnostic(`${name}: ${total} rules parsed after the simulated line clone`);
	}
});
