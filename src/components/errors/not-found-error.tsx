import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import ErrorWrapper from "@/components/layouts/error-wrapper";

function NotFoundError() {
	return (
		<ErrorWrapper>
			<div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
				<h1 className="text-[7rem] leading-tight font-bold">404</h1>
				<span className="font-medium">Page Not Found</span>
				<p className="text-muted-foreground text-center">
					The page you are looking for does not exist, <br />
					or has been removed.
				</p>
				<div className="mt-6 flex gap-4">
					<Button asChild>
						<Link to="/">Go Home</Link>
					</Button>
				</div>
			</div>
		</ErrorWrapper>
	);
}

export default NotFoundError;
