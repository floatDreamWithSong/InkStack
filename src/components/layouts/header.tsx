import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
// import { Separator } from "@/components/ui/separator";
import { ThemeTogglerButton } from "../animate-ui/components/buttons/theme-toggler";
import Logo from "../icons/logo";
import GithubIcon from "../icons/github";
import { Button } from "../ui/button";
import { ArrowUpIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
	fixed?: boolean;
	ref?: React.Ref<HTMLElement>;
	title?: string;
};

export function Header({
	className,
	fixed,
	children,
	title = "Daydreamer",
	...props
}: HeaderProps) {
	const [offset, setOffset] = useState(0);

	useEffect(() => {
		const onScroll = () => {
			setOffset(document.body.scrollTop || document.documentElement.scrollTop);
		};

		// Add scroll listener to the body
		document.addEventListener("scroll", onScroll, { passive: true });

		// Clean up the event listener on unmount
		return () => document.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header
			className={cn(
				"z-50 h-16",
				fixed && "header-fixed peer/header sticky top-0 w-[inherit]",
				offset > 10 && fixed ? "shadow" : "shadow-none",
				className,
			)}
			{...props}
		>
			<div
				className={cn(
					"relative flex h-full items-center gap-3 p-4 sm:gap-4",
					offset > 10 &&
						fixed &&
						"after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg",
				)}
			>
				<Link to="/">
					<Logo className="w-18" />
				</Link>
				{/* <Separator orientation="vertical" className="h-6" />
				<h1 className="text-2xl font-bold text-nowrap">{title}</h1> */}
				<div className="flex items-center justify-between flex-row w-full">
					<div>{children}</div>
					<div className="flex items-center justify-end gap-3 [&>a]:text-lg">
						<Button asChild variant={"link"}>
							<Link to="/blog">Blog</Link>
						</Button>
						<GithubIcon
							variant="link"
							size="icon-lg"
							link="https://github.com/floatDreamWithSong/InkStack"
						/>
						<ThemeTogglerButton size={"lg"} />
					</div>
				</div>
			</div>
			<Button
				size={"icon-lg"}
				variant={"outline"}
				className={cn(
					"fixed right-4 bottom-4 rounded-full transition-all duration-300",
					offset < 50 ? "opacity-0 pointer-events-none" : "opacity-100",
				)}
				onClick={() => {
					window.scrollTo({ top: 0, behavior: "smooth" });
				}}
			>
				<ArrowUpIcon />
			</Button>
		</header>
	);
}
