import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import {
	toBlogRoutePath,
	toPosixPath,
	toRouteKeyFromRelativeMarkdownPath,
} from "./path";

const BLOG_CONFIG_FILE_NAME = "blog.config.json";
const MARKDOWN_FILE_EXTENSION_RE = /\.md$/i;
const HIDDEN_DIRECTORY_RE = /^\./;

const IGNORED_DIRECTORY_NAMES = new Set([
	"node_modules",
	"dist",
	".git",
	".tanstack",
]);

function walkMarkdownFiles(directoryPath: string): Array<string> {
	const entries = readdirSync(directoryPath, { withFileTypes: true });
	const markdownFiles: Array<string> = [];

	for (const entry of entries) {
		const absolutePath = path.join(directoryPath, entry.name);

		if (entry.isDirectory()) {
			if (
				IGNORED_DIRECTORY_NAMES.has(entry.name) ||
				HIDDEN_DIRECTORY_RE.test(entry.name)
			) {
				continue;
			}
			markdownFiles.push(...walkMarkdownFiles(absolutePath));
			continue;
		}

		if (entry.isFile() && MARKDOWN_FILE_EXTENSION_RE.test(entry.name)) {
			if (statSync(absolutePath).size === 0) {
				continue;
			}
			markdownFiles.push(absolutePath);
		}
	}

	return markdownFiles;
}

function getContentDirectory(rootDirectory = process.cwd()): string {
	const blogConfigFilePath = path.resolve(rootDirectory, BLOG_CONFIG_FILE_NAME);
	let contentDir: string | undefined;

	if (existsSync(blogConfigFilePath)) {
		try {
			const rawConfig = JSON.parse(
				readFileSync(blogConfigFilePath, "utf8"),
			) as { contentDir: string };
			const parsed = rawConfig.contentDir;
			if (typeof parsed === "string" && parsed.trim().length > 0) {
				contentDir = parsed.trim();
			}
		} catch {}
	}

	if (!contentDir) {
		throw new Error(
			`Blog content directory not found. Please check blog.config.json.`,
		);
	}

	const contentDirectoryPath = path.resolve(rootDirectory, contentDir);
	if (
		!existsSync(contentDirectoryPath) ||
		!statSync(contentDirectoryPath).isDirectory()
	) {
		throw new Error(
			`Blog content directory not found: "${contentDir}". Please check blog.config.json.`,
		);
	}

	return contentDirectoryPath;
}

export function getAllBlogPrerenderPaths(rootDirectory = process.cwd()) {
	console.log("start parse blog post path", rootDirectory);
	const contentDirectoryPath = getContentDirectory(rootDirectory);
	const blogPostPaths = walkMarkdownFiles(contentDirectoryPath).map(
		(filePath) => {
			const relativePath = toPosixPath(
				path.relative(contentDirectoryPath, filePath),
			);
			return toBlogRoutePath(toRouteKeyFromRelativeMarkdownPath(relativePath));
		},
	);
	console.log("end parse blog post path, count:", blogPostPaths.length);
	return blogPostPaths;
}
