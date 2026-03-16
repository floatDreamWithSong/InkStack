import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { codeInspectorPlugin } from "code-inspector-plugin";
import viteReact from "@vitejs/plugin-react";
import contentCollections from "@content-collections/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { getAllBlogPrerenderPaths } from "./src/server/content.server";
import path from "node:path";

const chunkGroups: Array<[string, string[]]> = [];

const prerenderPages = ["/404"].map((path) => ({
	path,
	prerender: {
		enabled: true,
		outputPath: `${path}.html`,
	},
}));

const getManualChunk = (id: string) => {
	const normalizedId = id.replace(/\\/g, "/");
	if (!normalizedId.includes("node_modules")) return undefined;

	for (const [chunkName, packages] of chunkGroups) {
		if (
			packages.some((pkg) => normalizedId.includes(`/node_modules/${pkg}/`))
		) {
			return chunkName;
		}
	}
	return undefined;
};

const config = defineConfig(() => ({
	plugins: [
		contentCollections(),
		devtools(),
		tailwindcss(),
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tanstackStart({
			pages: [
				...prerenderPages,
				...getAllBlogPrerenderPaths().map((path) => ({
					path,
				})),
			],
			prerender: {
				enabled: true,
				crawlLinks: false,
			},
		}),
		codeInspectorPlugin({
			bundler: "vite",
			editor: "cursor",
			hotKeys: ["ctrlKey", "altKey"],
		}),
		viteReact({
			babel: {
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
	],
	build: {
		rollupOptions: {
			output: {
				manualChunks: getManualChunk,
			},
		},
	},
	resolve: {
		alias: {
			"blog-config": path.resolve(__dirname, "blog.config.json"),
		},
	},
}));

export default config;
