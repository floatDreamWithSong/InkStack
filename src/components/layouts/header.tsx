import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ThemeTogglerButton } from "../animate-ui/components/buttons/theme-toggler";
import Logo from "../icons/logo";
import GithubIcon from "../icons/github";

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
	fixed?: boolean;
	ref?: React.Ref<HTMLElement>;
};

export function Header({ className, fixed, children, ...props }: HeaderProps) {
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
				<Logo className="size-9" />
				<Separator orientation="vertical" className="h-6" />
				<h1 className="text-2xl font-bold text-nowrap">My Blog</h1>
				<div className="flex items-center justify-between flex-row w-full">
					<div>{children}</div>
					<div className="flex items-center justify-end gap-3">
						<GithubIcon
							variant="outline"
							size="icon"
							link="https://github.com/your-username"
						/>
						<ThemeTogglerButton />
					</div>
				</div>
			</div>
		</header>
	);
}
