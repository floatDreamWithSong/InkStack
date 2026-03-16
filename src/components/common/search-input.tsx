import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps
	extends Omit<React.ComponentProps<typeof Input>, "onChange"> {
	value: string;
	onChange: (value: string) => void;
	debounceMs?: number;
}

export function SearchInput({
	value,
	onChange,
	debounceMs = 300,
	className,
	...props
}: SearchInputProps) {
	const [internal, setInternal] = useState(value);

	useEffect(() => {
		setInternal(value);
	}, [value]);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (internal !== value) {
				onChange(internal);
			}
		}, debounceMs);
		return () => clearTimeout(timer);
	}, [internal, debounceMs, onChange, value]);

	return (
		<div className={cn("relative", className)}>
			<SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				value={internal}
				onChange={(e) => setInternal(e.target.value)}
				className="pl-8"
				{...props}
			/>
		</div>
	);
}
