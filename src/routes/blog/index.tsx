import { createFileRoute, notFound } from "@tanstack/react-router";
import { Header } from "@/components/layouts/header";
import { Main } from "@/components/layouts/main";
import { fetchBlogPostList } from "@/server/server-fns";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatPublishedDate } from "@/lib/date";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";

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
				title: "博客目录 | Daydreamer's Blog",
			},
			{
				property: "og:title",
				content: "博客目录 | Daydreamer's Blog",
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
			<Header />
			<Main className="space-y-8">
				<section className="mx-auto w-full max-w-4xl space-y-3 px-2 sm:px-4">
					<p className="text-sm tracking-wide text-muted-foreground uppercase">
						Blog Catalog
					</p>
					<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
						目录
					</h1>
				</section>

				<section className="mx-auto w-full max-w-4xl px-2 pb-4 sm:px-4">
					<div className="space-y-4">
						{posts.map((post) => {
							const publishedDate = formatPublishedDate(post.date);
							const routeKey = post._meta.path;

							return (
								<Card
									key={routeKey}
									className="gap-3 py-4 transition-colors hover:border-primary/40 shadow-none border-none bg-transparent"
								>
									<CardHeader className="gap-3 px-4 sm:px-6">
										<CardTitle className="text-xl leading-7">
											<Link
												to="/blog/$"
												params={{ _splat: routeKey }}
												className="underline-offset-4 hover:underline"
											>
												{post.title}
											</Link>
										</CardTitle>
										<CardDescription className="line-clamp-1 text-sm leading-6">
											{post.summary}
										</CardDescription>
										<CardFooter className="justify-between flex px-0">
											<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
												{publishedDate ? <span>{publishedDate}</span> : null}
												{post.estimatedTime ? (
													<span>{post.estimatedTime} min</span>
												) : null}
											</div>
											<div className="flex flex-wrap items-center gap-2">
												{post.tags.map((tag) => (
													<Badge key={tag} variant="outline">
														{tag}
													</Badge>
												))}
											</div>
										</CardFooter>
									</CardHeader>
								</Card>
							);
						})}
					</div>
				</section>
			</Main>
		</>
	);
}
