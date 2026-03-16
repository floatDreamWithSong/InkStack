import { createFileRoute, notFound } from "@tanstack/react-router";
import { BlogList } from "@/components/blog/blog-list";
import { Header } from "@/components/layouts/header";
import { Main } from "@/components/layouts/main";
import { fetchBlogPostList } from "@/server/server-fns";

export const Route = createFileRoute("/blog/")({
	loader: async () => {
		const list = await fetchBlogPostList().catch((error) =>
			console.error(error),
		);
		if (!list) {
			throw notFound();
		}
		return list;
	},
	head: () => ({
		meta: [
			{
				title: "博客 | My Blog",
			},
			{
				name: "description",
				content: "所有文章都按照目录自动生成为 /blog 下的路由。",
			},
			{
				property: "og:title",
				content: "博客 | My Blog",
			},
			{
				property: "og:description",
				content: "所有文章都按照目录自动生成为 /blog 下的路由。",
			},
			{
				property: "og:type",
				content: "website",
			},
		],
	}),
	component: BlogIndexRouteComponent,
});

function BlogIndexRouteComponent() {
	const posts = Route.useLoaderData();

	return (
		<>
			<Header fixed />
			<Main className="space-y-8">
				<section className="mx-auto w-full max-w-4xl space-y-3 px-2 sm:px-4">
					<p className="text-sm tracking-wide text-muted-foreground uppercase">
						Blog
					</p>
					<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
						所有文章
					</h1>
					<p className="text-sm leading-7 text-muted-foreground sm:text-base">
						文章目录来自博客文件夹结构，构建时自动生成静态页面与链接。
					</p>
				</section>

				<section className="mx-auto w-full max-w-4xl px-2 pb-4 sm:px-4">
					<BlogList posts={posts} />
				</section>
			</Main>
		</>
	);
}
