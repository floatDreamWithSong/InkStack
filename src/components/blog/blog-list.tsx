import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import type { Post } from "content-collections";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { Badge } from "../ui/badge";

type BlogListProps = {
	posts: Array<Post>;
};

function formatPublishedDate(publishedAt?: string) {
	if (!publishedAt) return null;
	const timestamp = Date.parse(publishedAt);
	if (Number.isNaN(timestamp)) return publishedAt;

	return dayjs(timestamp).locale("zh-cn").format("YYYY年MMMMD日");
}

export function BlogList({ posts }: BlogListProps) {
	if (posts.length === 0) {
		return (
			<Card className="border-dashed py-8">
				<CardHeader className="space-y-2">
					<CardTitle className="text-lg">还没有可展示的文章</CardTitle>
					<CardDescription>
						请在博客内容目录中新增 Markdown 文件后刷新页面。
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

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
