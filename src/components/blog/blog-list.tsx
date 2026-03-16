import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatPublishedDate } from "@/lib/date";
import { Link } from "@tanstack/react-router";
import type { Post } from "content-collections";
import { Badge } from "../ui/badge";

type BlogListProps = {
	posts: Array<Omit<Post, "content">>;
};

export function BlogList({ posts }: BlogListProps) {
	return (
		<div className="space-y-4">
			{posts.map((post) => {
				const publishedDate = formatPublishedDate(post.date);
				const routeKey = post._meta.path;

				return (
					<Card
						key={routeKey}
						className="gap-3 border-border/70 bg-card/60 py-4 transition-colors hover:border-primary/40"
					>
						<CardHeader className="gap-3 px-4 sm:px-6">
							<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
								{publishedDate ? <span>{publishedDate}</span> : null}
								<span className="truncate">{post._meta.path}</span>
							</div>
							<CardTitle className="text-xl leading-7">
								<Link
									to="/blog/$"
									params={{ _splat: routeKey }}
									className="underline-offset-4 hover:underline"
									reloadDocument
								>
									{post.title}
								</Link>
							</CardTitle>
							<CardDescription className="line-clamp-2 text-sm leading-6">
								{post.summary}
							</CardDescription>
							<CardFooter>
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
	);
}
