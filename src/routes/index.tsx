import Paragraph from "@/components/common/paragraph";
import { Header } from "@/components/layouts/header";
import { Main } from "@/components/layouts/main";
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
						Daydreamer's Blog
					</h1>
					<Paragraph>
						Hey! I’m Daydreamer, a fanatical open sourceror and design engineer.
					</Paragraph>
					<Paragraph>
						Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sed maxime
						numquam porro eius laborum temporibus veritatis deleniti expedita
						ipsam rerum. Modi similique fugit exercitationem laudantium
						assumenda! Placeat velit magnam sunt.
					</Paragraph>
					<div></div>
				</section>
			</Main>
		</>
	);
}
