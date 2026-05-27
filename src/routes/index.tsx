import Paragraph from "@/components/common/paragraph";
import { Header } from "@/components/layouts/header";
import { Main } from "@/components/layouts/main";
import { Button } from "@/components/ui/button";
import { authorName } from "@/lib/const";
import { IconBrandBilibili, IconBrandGithub } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Header />
			<Main>
				<section className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-2xl px-6 py-12 sm:px-10">
					<h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
						{authorName}'s Blog
					</h1>
					<Paragraph>
						Hey! I’m {authorName}, a fanatical open sourceror and{" "}
						<strong> FE engineer </strong>.
					</Paragraph>
					<Paragraph>
						Dreaming up cool ideas and making them come true is where my passion
						lies. I am enthusiastic about building tools that help myself and
						others to be more productive and enjoy the process of crafting.
					</Paragraph>
					<Paragraph>Find me on</Paragraph>
					<div className="[&>a]:font-manrope">
						<Button asChild variant="link">
							<a
								href="https://github.com/floatDreamWithSong"
								target="_blank"
								rel="noopener noreferrer"
							>
								<IconBrandGithub className="inline size-4" /> GitHub
							</a>
						</Button>
						<Button asChild variant="link">
							<a
								href="https://space.bilibili.com/169466687"
								target="_blank"
								rel="noopener noreferrer"
							>
								<IconBrandBilibili className="inline size-4 stroke-blue-400" />{" "}
								Bilibili
							</a>
						</Button>
					</div>
					<Paragraph>
						Or mail me at{" "}
						<span className="font-mono">hi@daydreamer.net.cn</span>
					</Paragraph>
					<Paragraph>
						<a
							className="hover:underline"
							href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
						>
							CC BY-NC-SA 4.0
						</a>{" "}
						2026-PRESENT © {authorName}
					</Paragraph>
				</section>
			</Main>
		</>
	);
}
