import { cn } from "@/lib/utils";

const Paragraph = ({
	children,
	className,
	...props
}: React.ComponentProps<"p">) => {
	return (
		<p
			className={cn(
				"max-w-3xl text-lg leading-7 text-secondary-foreground sm:text-xl tracking-wide",
				className,
			)}
			{...props}
		>
			{children}
		</p>
	);
};
export default Paragraph;
