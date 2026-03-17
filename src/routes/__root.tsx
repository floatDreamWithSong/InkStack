import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import appCss from "@/styles/index.css?url";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/common/theme-provider";
import { NavigationProgress } from "@/components/common/navigation-progress";
import NotFoundError from "@/components/errors/not-found-error";

export const Route = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "TanStack Markdown Blog",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
	notFoundComponent: NotFoundError,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
				<link rel="manifest" href="/manifest.json" />
				<link rel="icon" href="/favicon.svg" />
			</head>
			<body className="font-sans antialiased wrap-anywhere">
				<NavigationProgress />
				<ThemeProvider attribute={"class"} defaultTheme="light">
					<TooltipProvider>{children ?? <Outlet />}</TooltipProvider>
					<TanStackDevtools
						config={{
							position: "bottom-left",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
					<Toaster position="top-right" />
				</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}
