import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { getAllBlogPrerenderPaths } from "./content.server";

const testDirectories: Array<string> = [];

function createTestRoot() {
	const rootDirectory = mkdtempSync(join(tmpdir(), "obsidian-blog-"));
	testDirectories.push(rootDirectory);
	return rootDirectory;
}

afterEach(() => {
	for (const directory of testDirectories.splice(0)) {
		rmSync(directory, { recursive: true, force: true });
	}
});

describe("getAllBlogPrerenderPaths", () => {
	it("skips empty markdown files", () => {
		const rootDirectory = createTestRoot();
		const contentDirectory = join(rootDirectory, "notes");
		mkdirSync(contentDirectory, { recursive: true });

		writeFileSync(
			join(rootDirectory, "blog.config.json"),
			JSON.stringify({ contentDir: "notes" }),
			"utf8",
		);
		writeFileSync(join(contentDirectory, "valid.md"), "# title", "utf8");
		writeFileSync(join(contentDirectory, "empty.md"), "", "utf8");

		const paths = getAllBlogPrerenderPaths(rootDirectory);

		expect(paths).toContain("/blog/valid");
		expect(paths).not.toContain("/blog/empty");
	});
});
