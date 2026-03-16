import { cn } from "@/lib/utils";

const Logo = ({ className, ...props }: React.ComponentProps<"img">) => {
	return (
		<img
			src="/logo192.png"
			alt="Logo"
			className={cn("size-6", className)}
			{...props}
		/>
	);
};

export default Logo;
