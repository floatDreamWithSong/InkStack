import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { Post } from "content-collections";
import { formatPublishedDate } from "@/lib/date";
import { Badge } from "../ui/badge";

type BlogArticleProps = {
	post: Post;
};

export function BlogArticle({ post }: BlogArticleProps) {
	const publishedDate = formatPublishedDate(post.date);

	return (
		<article className="rounded-2xl px-5 py-7 text-card-foreground sm:px-8 sm:py-10">
			<header className="space-y-4 border-b border-border/70 pb-6">
				<h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
					{post.title}
				</h1>
				<div>
					{post.tags.map((tag) => {
						return (
							<Badge key={tag} variant="outline">
								{tag}
							</Badge>
						);
					})}
				</div>
				<div className="flex flex-wrap gap-3 text-xs text-muted-foreground sm:text-sm">
					{publishedDate ? <span>{publishedDate}</span> : null}
					<span>{post._meta.path}</span>
				</div>
			</header>
			<div className="blog-content pt-6 sm:pt-8">
				<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
					{post.content}
				</ReactMarkdown>
			</div>
		</article>
	);
}
