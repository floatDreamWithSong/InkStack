const MARKDOWN_EXTENSION_RE = /\.md$/i;
const MARKDOWN_LINK_RE = /\[([^\]]+)\]\([^)]+\)/g;
const MARKDOWN_IMAGE_RE = /!\[[^\]]*]\([^)]+\)/g;
const MARKDOWN_FENCE_RE = /```[\s\S]*?```/g;
const MARKDOWN_INLINE_CODE_RE = /`[^`]+`/g;
const MARKDOWN_STYLE_RE = /[#>*_~\-|]/g;
const MARKDOWN_WHITESPACE_RE = /\s+/g;

export function toPosixPath(filePath: string) {
	return filePath.replace(/\\/g, "/");
}

export function stripMarkdownExtension(filePath: string) {
	return filePath.replace(MARKDOWN_EXTENSION_RE, "");
}

function isDirectoryIndexSegment(segment: string) {
	return /^(readme|index)$/i.test(segment);
}

export function toRouteKeyFromRelativeMarkdownPath(
	relativeMarkdownPath: string,
) {
	const normalizedPath = stripMarkdownExtension(
		toPosixPath(relativeMarkdownPath),
	);
	const segments = normalizedPath.split("/").filter(Boolean);

	if (segments.length > 1 && isDirectoryIndexSegment(segments.at(-1) ?? "")) {
		segments.pop();
	}

	return segments.join("/");
}

export function normalizeRouteKey(routeKey: string) {
	return toPosixPath(routeKey)
		.split("/")
		.filter(Boolean)
		.map((segment) => {
			try {
				return decodeURIComponent(segment);
			} catch {
				return segment;
			}
		})
		.join("/");
}

export function toBlogRoutePath(routeKey: string) {
	if (!routeKey) return "/blog";

	const encodedPath = routeKey
		.split("/")
		.filter(Boolean)
		.map((segment) => encodeURIComponent(segment))
		.join("/");

	return `/blog/${encodedPath}`;
}

export function deriveTitleFromRelativePath(relativeMarkdownPath: string) {
	const normalizedPath = stripMarkdownExtension(
		toPosixPath(relativeMarkdownPath),
	);
	const rawTitle = normalizedPath.split("/").at(-1) ?? "Untitled";
	return rawTitle.replace(/[-_]/g, " ").trim() || "Untitled";
}

export function createExcerpt(markdownContent: string, maxLength: number) {
	const plainText = markdownContent
		.replace(MARKDOWN_FENCE_RE, " ")
		.replace(MARKDOWN_INLINE_CODE_RE, " ")
		.replace(MARKDOWN_IMAGE_RE, " ")
		.replace(MARKDOWN_LINK_RE, "$1")
		.replace(MARKDOWN_STYLE_RE, " ")
		.replace(MARKDOWN_WHITESPACE_RE, " ")
		.trim();

	if (plainText.length <= maxLength) return plainText;
	return `${plainText.slice(0, maxLength).trimEnd()}...`;
}
