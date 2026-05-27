import { useEffect, useState } from "react";
import tocbot from "tocbot";
import { createMarkdownHeadingId } from "@/components/common/markdown-render";
import { cn } from "@/lib/utils";
import { blogContentClassName, jsBlogTocClassName } from "@/lib/const";

const tocSelector = `.${jsBlogTocClassName}`;
const contentSelector = `.${blogContentClassName}`;
const headingSelector = "h1, h2, h3, h4";

type BlogTocProps = React.HTMLAttributes<HTMLElement>;

export default function BlogToc({ className, ...props }: BlogTocProps) {
	const [hasHeadings, setHasHeadings] = useState(false);

	useEffect(() => {
		const content = document.querySelector(contentSelector);
		const headings =
			content?.querySelectorAll<HTMLHeadingElement>(headingSelector);

		if (!content || !headings?.length) {
			setHasHeadings(false);
			return;
		}

		setHeadingIds(headings);
		setHasHeadings(true);
		const headingsOffset = 80;
		tocbot.init({
			tocSelector,
			contentSelector,
			headingSelector,
			activeLinkClass: "is-active-link",
			activeListItemClass: "is-active-li",
			collapseDepth: 6,
			headingsOffset: headingsOffset,
			ignoreHiddenElements: true,
			listClass: "blog-toc-list",
			listItemClass: "blog-toc-list-item",
			orderedList: false,
			scrollSmooth: true,
			scrollSmoothDuration: 420,
			scrollSmoothOffset: -headingsOffset,
			throttleTimeout: 50,
		});

		return () => tocbot.destroy();
	}, []);

	return (
		<aside
			className={cn("blog-toc-sidebar", !hasHeadings && "hidden", className)}
			{...props}
		>
			<nav
				className={cn(jsBlogTocClassName, "blog-toc scrollbar-hidden")}
				aria-label="Table of Contents"
			/>
		</aside>
	);
}

function setHeadingIds(headings: NodeListOf<HTMLHeadingElement>) {
	const usedIds = new Map<string, number>();

	headings.forEach((heading) => {
		if (heading.id) {
			return;
		}
		const baseId = createMarkdownHeadingId(heading.textContent);
		const count = usedIds.get(baseId) ?? 0;
		usedIds.set(baseId, count + 1);
		heading.id = count === 0 ? baseId : `${baseId}-${count}`;
	});
}
