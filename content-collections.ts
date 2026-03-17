import { defineCollection, defineConfig } from "@content-collections/core";
import {
	createExcerpt,
	deriveTitleFromRelativePath,
	toPosixPath,
	toRouteKeyFromRelativeMarkdownPath,
} from "./src/lib/path";
import blogConfig from "blog-config" with { type: "json" };
import z from "zod";
import dayjs from "dayjs";

const posts = defineCollection({
	name: "posts",
	directory: blogConfig.contentDir,
	include: blogConfig.pattern,
	schema: z.object({
		title: z.string().optional(),
		author: z.string().default("your name"),
		summary: z.string().optional(),
		content: z.string().default("no content"),
		date: z.string().default(dayjs().format("YYYY-MM-DD")),
		tags: z.array(z.string()).default([]),
	}),
	transform: (data) => {
		const normalizedFilePath = toPosixPath(data._meta.filePath);
		const routeKey = toRouteKeyFromRelativeMarkdownPath(normalizedFilePath);

		if (data.title === void 0) {
			data.title = deriveTitleFromRelativePath(normalizedFilePath);
		}
		if (data.summary === void 0) {
			data.summary = createExcerpt(data.content, 180);
		}
		data._meta.filePath = normalizedFilePath;
		data._meta.path = routeKey;
		return data;
	},
});

export default defineConfig({
	content: [posts],
});
