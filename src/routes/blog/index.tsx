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
import Paragraph from "@/components/common/paragraph";
import { Clock1Icon } from "lucide-react";
import { authorName } from "@/lib/const";

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
				title: `博客目录 | ${authorName}'s Blog`,
			},
			{
				property: "og:title",
				content: `博客目录 | ${authorName}'s Blog`,
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
										<CardDescription className="line-clamp-3 sm:line-clamp-2 text-lg leading-6">
											<Paragraph>{post.summary}</Paragraph>
										</CardDescription>
										<CardFooter className="flex px-0 gap-8">
											<div className="flex flex-wrap items-center gap-6 text-base text-secondary-foreground">
												{publishedDate && <span>{publishedDate}</span>}
												{post.estimatedTime && (
													<span className="flex items-center gap-1">
														<Clock1Icon className="inline size-4" />
														{post.estimatedTime} min
													</span>
												)}
											</div>
											<div className="flex flex-wrap items-center gap-2">
												{post.tags.slice(0, 5).map((tag) => (
													<Badge
														key={tag}
														variant="outline"
														className="backdrop-blur-md tracking-wide"
													>
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
