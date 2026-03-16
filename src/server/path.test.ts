import { describe, expect, it } from "vitest";
import {
	createExcerpt,
	deriveTitleFromRelativePath,
	normalizeRouteKey,
	toBlogRoutePath,
	toRouteKeyFromRelativeMarkdownPath,
} from "./path";

describe("toRouteKeyFromRelativeMarkdownPath", () => {
	it("converts nested markdown file path to route key", () => {
		expect(toRouteKeyFromRelativeMarkdownPath("frontend/react/hooks.md")).toBe(
			"frontend/react/hooks",
		);
	});

	it("treats README as directory index for nested paths", () => {
		expect(toRouteKeyFromRelativeMarkdownPath("interview/README.md")).toBe(
			"interview",
		);
	});
});

describe("route key helpers", () => {
	it("normalizes and decodes encoded route keys", () => {
		expect(normalizeRouteKey("前端/%F0%9F%A7%A0%20Hooks")).toBe(
			"前端/🧠 Hooks",
		);
	});

	it("encodes route keys into blog route path", () => {
		expect(toBlogRoutePath("前端/🧠 Hooks")).toBe(
			"/blog/%E5%89%8D%E7%AB%AF/%F0%9F%A7%A0%20Hooks",
		);
	});
});

describe("content helpers", () => {
	it("derives title from file name", () => {
		expect(deriveTitleFromRelativePath("notes/react-hooks.md")).toBe(
			"react hooks",
		);
	});

	it("creates short excerpt from markdown text", () => {
		const excerpt = createExcerpt(
			"# Title\n\n这是一个段落，包含 [链接](https://example.com) 和 `code`。",
			20,
		);

		expect(excerpt).toContain("这是一个段落");
		expect(excerpt.length).toBeLessThanOrEqual(23);
	});
});
