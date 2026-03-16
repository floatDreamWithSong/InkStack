import { cn } from "@/lib/utils";

const ErrorWrapper = ({
	children,
	className,
	...props
}: React.ComponentProps<"div">) => {
	return (
		<div
			className={cn("h-svh fixed w-full top-0 left-0 bg-background", className)}
			{...props}
		>
			{children}
		</div>
	);
};

export default ErrorWrapper;
