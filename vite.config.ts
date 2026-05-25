import { defineConfig, loadEnv } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { codeInspectorPlugin } from "code-inspector-plugin";
import viteReact from "@vitejs/plugin-react";
import contentCollections from "@content-collections/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "node:path/posix";
import { nitro } from "nitro/vite";
import { globSync } from "tinyglobby";
import blogConfig from "./blog.config.json" with { type: "json" };
import { styleText } from "node:util";
// import fs from "node:fs/promises";

const prerenderPages = ["/404"].map((path) => ({
	path,
	prerender: {
		enabled: true,
		outputPath: `${path}.html`,
	},
}));

const getCollectedMdPaths = () => {
	console.log(styleText("cyan", "cwd:"), process.cwd());
	console.log(
		styleText("cyan", "blogConfig.contentDir:"),
		blogConfig.contentDir,
	);
	console.log(styleText("cyan", "blogConfig.pattern:"), blogConfig.pattern);
	const collectedMdPaths = globSync(
		path.join(blogConfig.contentDir, blogConfig.pattern),
	).map((path) => path.slice(0, path.lastIndexOf(".")));
	console.log(styleText("cyan", "total md files:"), collectedMdPaths.length);
	console.log(
		styleText("cyan", "collectedMdPaths:"),
		collectedMdPaths.slice(0, 3),
		"...",
	);
	return collectedMdPaths;
};

const config = defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	return {
		plugins: [
			contentCollections(),
			devtools(),
			tailwindcss(),
			tsconfigPaths({ projects: ["./tsconfig.json"] }),
			viteStaticCopy({
				targets: [
					{
						src: path.join(blogConfig.assetsDir, blogConfig.assetsPattern),
						dest: "./client",
					},
				],
				structured: true,
			}),
			tanstackStart({
				pages:
					mode === "production"
						? [
								...prerenderPages,
								...getCollectedMdPaths().map((path) => ({
									path,
								})),
							]
						: void 0,
				prerender: {
					enabled: true,
					crawlLinks: false,
					// onSuccess: async () => {
					// 	const src = path.resolve("dist/client/__tsr");
					// 	const dest =
					// 		process.env.VERCEL === "1"
					// 			? path.resolve(".vercel/output/static/__tsr")
					// 			: path.resolve(".output/public/__tsr");
					// 	try {
					// 		await fs.cp(src, dest, { recursive: true });
					// 		console.log("[fix] Copied __tsr after prerender");
					// 	} catch {
					// 		console.warn("[fix] __tsr not found");
					// 	}
					// },
				},
			}),
			...(mode === "production" && env.STATIC_BUILD !== "1"
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
							publicAssets: [
								{
									dir: "dist/client/__tsr",
									baseURL: "/__tsr",
									maxAge: 0,
								},
								{
									dir: path.join("dist/client", blogConfig.assetsDir),
									baseURL: path.join("/", blogConfig.assetsDir),
									maxAge: 0,
									fallthrough: true,
								},
							],
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
					manualChunks: (id: string) => {
						const normalizedId = id.replace(/\\/g, "/");
						if (!normalizedId.includes("node_modules")) return undefined;

						for (const [chunkName, packages] of chunkGroups) {
							if (
								packages.some((pkg) =>
									normalizedId.includes(`/node_modules/${pkg}/`),
								)
							) {
								return chunkName;
							}
						}
						return undefined;
					},
				},
			},
		},
	};
});

const chunkGroups: Array<[string, string[]]> = [];

export default config;
