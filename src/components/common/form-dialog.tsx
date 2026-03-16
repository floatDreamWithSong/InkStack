import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

interface FormDialogProps<T extends FieldValues> {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	form: UseFormReturn<T>;
	onSubmit: (data: T) => void;
	isLoading?: boolean;
	children: React.ReactNode;
	className?: string;
}

export function FormDialog<T extends FieldValues>({
	open,
	onOpenChange,
	title,
	description,
	form,
	onSubmit,
	isLoading,
	children,
	className,
}: FormDialogProps<T>) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className={className}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
						{children}
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isLoading}
							>
								取消
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading && <Loader2 className="animate-spin" />}
								确认
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
