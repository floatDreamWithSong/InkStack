import { defineConfig, loadEnv } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { codeInspectorPlugin } from "code-inspector-plugin";
import viteReact from "@vitejs/plugin-react";
import contentCollections from "@content-collections/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { getAllBlogPrerenderPaths } from "./src/server/content.server";
import path from "node:path";
import { nitro } from "nitro/vite";

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

const config = defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	void env;
	return {
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
			...(mode !== "test"
				? [
						nitro({
							rollupConfig: {
								onwarn(warning, warn) {
									if (
										warning.message.includes(`"use client"`) &&
										warning.message.includes(`was ignored.`)
									) {
										return;
									}
									warn(warning);
								},
							},
						}),
					]
				: []),
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
	};
});

export default config;
