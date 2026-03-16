import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import NotFoundError from "./components/errors/not-found-error";

export function getRouter() {
	const router = createTanStackRouter({
		routeTree,
		context: {},
		scrollRestoration: true,
		defaultViewTransition: true,
		defaultNotFoundComponent: NotFoundError,
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
