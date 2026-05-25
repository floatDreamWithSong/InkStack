import { Streamdown, type StreamdownProps } from "streamdown";
import { createCodePlugin } from "@streamdown/code";
import { mermaid } from "@streamdown/mermaid";
import { createMathPlugin } from "@streamdown/math";
import { cjk } from "@streamdown/cjk";
import { memo, type ComponentProps } from "react";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";

export const preprocessLaTeX = (content: string) => {
	const codeBlocks: string[] = [];
	let tempContent = content.replace(/`([^`]*)`/g, (match) => {
		codeBlocks.push(match);
		return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
	});

	tempContent = tempContent.replace(
		/\\\[(.*?)\\\]/gs,
		(_, equation) => `$$${equation}$$`,
	);

	tempContent = tempContent.replace(
		/\\\((.*?)\\\)/gs,
		(_, equation) => `$$${equation}$$`,
	);

	tempContent = tempContent.replace(/__CODE_BLOCK_(\d+)__/g, (_, idx) => {
		return codeBlocks[Number(idx)];
	});

	return tempContent;
};

function normalizeLatexDelimiters(s?: string | null) {
	if (!s) return "";
	return preprocessLaTeX(s);
}

const code = createCodePlugin({
	themes: ["one-light", "one-dark-pro"],
});
const math = createMathPlugin({
	singleDollarTextMath: true,
});
const plugins = { code, mermaid, math, cjk };

/** Creates the stable DOM id used by rendered markdown headings. */
export function createMarkdownHeadingId(text: string | null) {
	const slug = (text ?? "")
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^\p{Letter}\p{Number}_-]+/gu, "")
		.replace(/^-+|-+$/g, "");

	return slug || "heading";
}

const HeadingComponents: ComponentProps<typeof Streamdown>["components"] = {
	h1: ({ children, node, ...props }) => {
		const id = createMarkdownHeadingId(String(children));
		return (
			<h1 id={id} {...props}>
				{children}
			</h1>
		);
	},
	h2: ({ children, node, ...props }) => {
		const id = createMarkdownHeadingId(String(children));
		return (
			<h2 id={id} {...props}>
				{children}
			</h2>
		);
	},
	h3: ({ children, node, ...props }) => {
		const id = createMarkdownHeadingId(String(children));
		return (
			<h3 id={id} {...props}>
				{children}
			</h3>
		);
	},
	h4: ({ children, node, ...props }) => {
		const id = createMarkdownHeadingId(String(children));
		return (
			<h4 id={id} {...props}>
				{children}
			</h4>
		);
	},
	h5: ({ children, node, ...props }) => {
		const id = createMarkdownHeadingId(String(children));
		return (
			<h5 id={id} {...props}>
				{children}
			</h5>
		);
	},
	h6: ({ children, node, ...props }) => {
		const id = createMarkdownHeadingId(String(children));
		return (
			<h6 id={id} {...props}>
				{children}
			</h6>
		);
	},
};

const MarkdownRender: React.FC<StreamdownProps> = memo(
	({
		children,
		rehypePlugins = [],
		remarkPlugins = [],
		components,
		...props
	}) => {
		return (
			<Streamdown
				mode="static"
				lineNumbers
				remarkRehypeOptions={{ allowDangerousHtml: true }}
				remarkPlugins={[[remarkGfm, { singleTilde: false }], ...remarkPlugins]}
				rehypePlugins={[
					[rehypeRaw, { passThrough: ["math", "inlineMath"] }],
					rehypeKatex,
					...rehypePlugins,
				]}
				linkSafety={{
					enabled: true,
					onLinkCheck(url) {
						if (url.startsWith("#") || url.startsWith("/")) {
							return true;
						}
						return false;
					},
				}}
				plugins={plugins}
				components={{
					...HeadingComponents,
					...components,
				}}
				{...props}
			>
				{normalizeLatexDelimiters(children)}
			</Streamdown>
		);
	},
);

export default MarkdownRender;
