import { Header } from "@/components/layouts/header";
import { Main } from "@/components/layouts/main";
import { Badge } from "@/components/ui/badge";
import { fetchBlogPost } from "@/server/server-fns";
import { createFileRoute, notFound } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { formatPublishedDate } from "@/lib/date";
import Paragraph from "@/components/common/paragraph";

function resolveCanonicalUrl(routePath: string) {
	const siteUrl = import.meta.env.VITE_SITE_URL;
	if (!siteUrl) return routePath;

	try {
		return new URL(routePath, siteUrl).toString();
	} catch {
		return routePath;
	}
}

export const Route = createFileRoute("/blog/$")({
	loader: async ({ params }) => {
		const post = await fetchBlogPost({
			data: { routeKey: params._splat },
		}).catch((error) => console.error(error));
		if (!post) {
			throw notFound();
		}
		return post;
	},
	head: ({ loaderData }) => {
		if (!loaderData) {
			return {
				meta: [
					{
						title: "文章未找到 | My Blog",
					},
				],
			};
		}

		const canonicalUrl = resolveCanonicalUrl(loaderData._meta.path);

		return {
			meta: [
				{
					title: `${loaderData.title} | My Blog`,
				},
				{
					name: "description",
					content: loaderData.summary,
				},
				{
					property: "og:title",
					content: loaderData.title,
				},
				{
					property: "og:description",
					content: loaderData.summary,
				},
				{
					property: "og:type",
					content: "article",
				},
				{
					property: "og:url",
					content: canonicalUrl,
				},
			],
			links: [
				{
					rel: "canonical",
					href: canonicalUrl,
				},
			],
		};
	},
	component: BlogPostRouteComponent,
});

function BlogPostRouteComponent() {
	const post = Route.useLoaderData();
	const publishedDate = formatPublishedDate(post.date);
	return (
		<>
			<Header />
			<Main className="mx-auto w-full max-w-4xl space-y-6 px-2 py-8 sm:px-4 sm:py-10">
				<article className="rounded-2xl px-5 py-7 text-card-foreground sm:px-8 sm:py-10">
					<header className="space-y-4 border-b border-border/70 pb-6">
						<h1 className="text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
							{post.title}
						</h1>
						<div className="flex flex-wrap gap-2">
							{post.tags.map((tag) => {
								return (
									<Badge key={tag} variant="outline">
										{tag}
									</Badge>
								);
							})}
						</div>
						<Paragraph className="text-xs sm:text-base">
							{publishedDate ? <span>{publishedDate}</span> : null}
						</Paragraph>
					</header>
					<div className="blog-content pt-6 sm:pt-8">
						<ReactMarkdown
							remarkPlugins={[remarkGfm]}
							rehypePlugins={[rehypeRaw]}
						>
							{post.content}
						</ReactMarkdown>
					</div>
				</article>
			</Main>
		</>
	);
}
