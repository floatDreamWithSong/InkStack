import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { normalizeRouteKey } from "./path";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { allPosts } from "content-collections";

const blogRouteInputSchema = z.object({
	routeKey: z.string().min(1),
});

export const fetchBlogPostList = createServerFn({ method: "GET" })
	.middleware([staticFunctionMiddleware])
	.handler(() => {
		return allPosts;
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
