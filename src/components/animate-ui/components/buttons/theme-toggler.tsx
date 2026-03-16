

import * as React from "react";
import type { VariantProps } from "class-variance-authority";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import {
	ThemeTogglerWave as ThemeTogglerPrimitive,
	type ThemeTogglerWaveProps as ThemeTogglerPrimitiveProps,
	type ThemeSelection,
	type Resolved,
} from "@/components/animate-ui/primitives/effects/theme-toggler-wave";
import { buttonVariants } from "@/components/animate-ui/components/buttons/icon";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

const getIcon = (
	effective: ThemeSelection,
	resolved: Resolved,
	modes: ThemeSelection[],
) => {
	const theme = modes.includes("system") ? effective : resolved;
	return theme === "system" ? <Monitor /> : theme === "dark" ? <Moon /> : <Sun />;
};

const getNextTheme = (
	effective: ThemeSelection,
	modes: ThemeSelection[],
): ThemeSelection => {
	const i = modes.indexOf(effective);
	if (i === -1) return modes[0];
	return modes[(i + 1) % modes.length];
};

type ThemeTogglerButtonProps = React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		modes?: ThemeSelection[];
		duration?: number;
		onImmediateChange?: ThemeTogglerPrimitiveProps["onImmediateChange"];
	};

function ThemeTogglerButton({
	variant = "ghost",
	size = "default",
	modes = ["light", "dark"],
	duration = 400,
	onImmediateChange,
	onClick,
	className,
	...props
}: ThemeTogglerButtonProps) {
	const buttonRef = React.useRef<HTMLButtonElement>(null);
	const mounted = useMounted();
	const { theme, resolvedTheme, setTheme } = useTheme();
	const buttonClassName = cn("cursor-pointer",buttonVariants({ variant, size, className }));

	if (!mounted) {
		return (
			<button
				type="button"
				data-slot="theme-toggler-button"
				className={buttonClassName}
				disabled
				aria-hidden="true"
				{...props}
			>
				<Sun />
			</button>
		);
	}

	return (
		<ThemeTogglerPrimitive
			theme={(theme ?? "system") as ThemeSelection}
			resolvedTheme={(resolvedTheme ?? "light") as Resolved}
			setTheme={setTheme}
			onImmediateChange={onImmediateChange}
		>
			{({ effective, resolved, toggleTheme }) => (
				<button
					type="button"
					ref={buttonRef}
					data-slot="theme-toggler-button"
					className={buttonClassName}
					onClick={(e) => {
						onClick?.(e);
						const rect = buttonRef.current?.getBoundingClientRect();
						const x = rect ? rect.left + rect.width / 2 : undefined;
						const y = rect ? rect.top + rect.height / 2 : undefined;
						toggleTheme(getNextTheme(effective, modes), {
							x:
								x ??
								(window.visualViewport?.width ?? window.innerWidth) / 2,
							y:
								y ??
								(window.visualViewport?.height ?? window.innerHeight) / 2,
							duration,
						});
					}}
					{...props}
				>
					{getIcon(effective, resolved, modes)}
				</button>
			)}
		</ThemeTogglerPrimitive>
	);
}

export { ThemeTogglerButton, type ThemeTogglerButtonProps };
