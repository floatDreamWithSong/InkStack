import { BlogArticle } from "@/components/blog/blog-article";
import { Header } from "@/components/layouts/header";
import { Main } from "@/components/layouts/main";
import { fetchBlogPost } from "@/server/server-fns";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";

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

	return (
		<>
			<Header fixed />
			<Main className="mx-auto w-full max-w-4xl space-y-6 px-2 py-8 sm:px-4 sm:py-10">
				<Link
					to="/blog"
					className="inline-flex items-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
					reloadDocument
				>
					返回文章列表
				</Link>
				<BlogArticle post={post} />
			</Main>
		</>
	);
}
