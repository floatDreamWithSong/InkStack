// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createMarkdownHeadingId } from "@/components/common/markdown-render";
import BlogToc from "./blog-toc";

vi.mock("tocbot", () => ({
	default: {
		destroy: vi.fn(),
		init: vi.fn(),
	},
}));

describe("BlogToc", () => {
	afterEach(() => {
		document.body.innerHTML = "";
		vi.clearAllMocks();
	});

	it("uses markdown-render heading ids for headings without existing ids", () => {
		const content = document.createElement("article");
		content.className = "js-blog-content";
		content.innerHTML = "<h2>中文 Heading!</h2>";
		document.body.append(content);

		render(<BlogToc />);

		const heading = content.querySelector("h2");
		expect(heading?.id).toBe(createMarkdownHeadingId("中文 Heading!"));
	});
});
