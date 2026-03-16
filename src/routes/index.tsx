import { Header } from "@/components/layouts/header";
import { Main } from "@/components/layouts/main";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Header fixed />
			<Main>
				<section className="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-2xl border border-border/70 bg-card/50 px-6 py-12 sm:px-10">
					<p className="text-sm tracking-wide text-muted-foreground uppercase">
						Personal Blog
					</p>
					<h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
						TanStack Start + Markdown 的个人博客框架
					</h1>
					<p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
						文章来源于本地目录结构，构建时自动生成 /blog
						下的静态页面与文章链接。
					</p>
					<div>
						<Link
							to="/blog"
							className="inline-flex rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
							reloadDocument
						>
							进入博客
						</Link>
					</div>
				</section>
			</Main>
		</>
	);
}
