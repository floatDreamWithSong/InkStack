import { cn } from "@/lib/utils";
import { Slot } from "radix-ui";

const Paragraph = ({
	children,
	className,
	asChild = false,
	...props
}: React.ComponentProps<"p"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot.Root : "p";
	return (
		<Comp
			data-slot="paragraph"
			className={cn(
				"max-w-3xl text-lg leading-7 text-secondary-foreground sm:text-base tracking-wide",
				className,
			)}
			{...props}
		>
			{children}
		</Comp>
	);
};
export default Paragraph;
