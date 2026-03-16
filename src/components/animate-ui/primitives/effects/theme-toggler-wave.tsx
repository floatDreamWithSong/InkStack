import * as React from "react";
import { flushSync } from "react-dom";

type ThemeSelection = "light" | "dark" | "system";
type Resolved = "light" | "dark";
const THEME_TRANSITION_ATTR = "data-theme-switching";

type ThemeTransitionOrigin = {
	x: number;
	y: number;
	duration?: number;
};

type ChildrenRender =
	| React.ReactNode
	| ((state: {
			resolved: Resolved;
			effective: ThemeSelection;
			toggleTheme: (
				theme: ThemeSelection,
				origin?: ThemeTransitionOrigin,
			) => void;
	  }) => React.ReactNode);

function getSystemEffective(): Resolved {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function getMaxRadius(x: number, y: number) {
	const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
	const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
	return Math.hypot(
		Math.max(x, viewportWidth - x),
		Math.max(y, viewportHeight - y),
	);
}

type ThemeTogglerWaveProps = {
	theme: ThemeSelection;
	resolvedTheme: Resolved;
	setTheme: (theme: ThemeSelection) => void;
	onImmediateChange?: (theme: ThemeSelection) => void;
	children?: ChildrenRender;
};

function ThemeTogglerWave({
	theme,
	resolvedTheme,
	setTheme,
	onImmediateChange,
	children,
}: ThemeTogglerWaveProps) {

	const [preview, setPreview] = React.useState<null | {
		effective: ThemeSelection;
		resolved: Resolved;
	}>(null);
	const [current, setCurrent] = React.useState<{
		effective: ThemeSelection;
		resolved: Resolved;
	}>({
		effective: theme,
		resolved: resolvedTheme,
	});

	React.useEffect(() => {
		if (
			preview &&
			theme === preview.effective &&
			resolvedTheme === preview.resolved
		) {
			setPreview(null);
		}
	}, [theme, resolvedTheme, preview]);

	const toggleTheme = React.useCallback(
		async (theme: ThemeSelection, origin?: ThemeTransitionOrigin) => {
			const resolved = theme === "system" ? getSystemEffective() : theme;
			const root = document.documentElement;
			const clearThemeTransitionFlag = () =>
				root.removeAttribute(THEME_TRANSITION_ATTR);

			root.setAttribute(THEME_TRANSITION_ATTR, "true");
			setCurrent({ effective: theme, resolved });
			onImmediateChange?.(theme);

			if (theme === "system" && resolved === resolvedTheme) {
				setTheme(theme);
				clearThemeTransitionFlag();
				return;
			}

			const fallbackApply = () => {
				flushSync(() => {
					setPreview({ effective: theme, resolved });
				});
				setTheme(theme);
				clearThemeTransitionFlag();
			};

			if (typeof document.startViewTransition !== "function") {
				fallbackApply();
				return;
			}

			try {
				const transition = document.startViewTransition(() => {
					flushSync(() => {
						setPreview({ effective: theme, resolved });
						document.documentElement.classList.toggle(
							"dark",
							resolved === "dark",
						);
					});
				});

				await transition.ready;

				const x =
					origin?.x ??
					(window.visualViewport?.width ?? window.innerWidth) / 2;
				const y =
					origin?.y ??
					(window.visualViewport?.height ?? window.innerHeight) / 2;
				const maxRadius = getMaxRadius(x, y);

				await document.documentElement
					.animate(
						{
							clipPath: [
								`circle(0px at ${x}px ${y}px)`,
								`circle(${maxRadius}px at ${x}px ${y}px)`,
							],
						},
						{
							duration: origin?.duration ?? 400,
							easing: "ease-in-out",
							pseudoElement: "::view-transition-new(root)",
						},
					)
					.finished;

				setTheme(theme);
			} catch {
				fallbackApply();
			} finally {
				clearThemeTransitionFlag();
			}
		},
		[onImmediateChange, resolvedTheme, setTheme],
	);

	return (
		<React.Fragment>
			{typeof children === "function"
				? children({
						effective: current.effective,
						resolved: current.resolved,
						toggleTheme,
					})
				: children}
			<style>{`::view-transition-old(root), ::view-transition-new(root){animation:none;mix-blend-mode:normal;}`}</style>
		</React.Fragment>
	);
}

export {
	ThemeTogglerWave,
	type ThemeTogglerWaveProps,
	type ThemeSelection,
	type Resolved,
};
