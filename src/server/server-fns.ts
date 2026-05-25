import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { normalizeRouteKey } from "../lib/path";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { allPosts as OriginalAllPosts } from "content-collections";

const allPosts = OriginalAllPosts.sort((a, b) => {
	return new Date(b.date).getTime() - new Date(a.date).getTime();
});

const allPostsWithoutContent = allPosts.map((post) => ({
	...post,
	content: null,
}));

const blogRouteInputSchema = z.object({
	routeKey: z.string().min(1),
});

export const fetchBlogPostList = createServerFn({ method: "GET" })
	.middleware([staticFunctionMiddleware])
	.handler(() => {
		return allPostsWithoutContent;
	});

export const fetchBlogPost = createServerFn({ method: "GET" })
	.middleware([staticFunctionMiddleware])
	.inputValidator((input: unknown) => blogRouteInputSchema.parse(input))
	.handler(({ data }) => {
		const routeKey = normalizeRouteKey(data.routeKey);
		const post = allPosts.find(
			(post) => normalizeRouteKey(post._meta.path) === routeKey,
		);
		return post;
	});
