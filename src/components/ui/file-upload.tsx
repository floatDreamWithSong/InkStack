import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { motion } from "motion/react";
import { IconUpload } from "@tabler/icons-react";
import { toast } from "sonner";
import {
	useDropzone,
	type Accept,
	type FileRejection,
} from "react-dropzone";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

interface FileUploadProps {
	onChange?: (files: File[]) => void;
	accept?: Accept;
	multiple?: boolean;
	disabled?: boolean;
	title?: string;
	description?: string;
	dragActiveText?: string;
}

const getInputAcceptValue = (accept?: Accept) => {
	if (!accept) {
		return undefined;
	}

	return Object.entries(accept)
		.flatMap(([mimeType, extensions]) => [mimeType, ...extensions])
		.join(",");
};

const getDropRejectedMessage = (rejections: FileRejection[]) => {
	const firstError = rejections[0]?.errors[0];

	switch (firstError?.code) {
		case "file-invalid-type":
			return "仅支持上传符合要求的文件类型";
		case "too-many-files":
			return "一次只能上传指定数量的文件";
		default:
			return firstError?.message ?? "文件选择失败";
	}
};

export const FileUpload = ({
	onChange,
	accept,
	multiple = false,
	disabled = false,
	title = "Upload file",
	description = "Drag or drop your files here or click to upload",
	dragActiveText = "Drop it",
}: FileUploadProps) => {
	const [files, setFiles] = useState<File[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const inputAcceptValue = getInputAcceptValue(accept);

	const handleFileChange = (newFiles: File[]) => {
		if (!newFiles.length || disabled) {
			return;
		}

		const nextFiles = multiple ? newFiles : newFiles.slice(0, 1);
		setFiles((prevFiles) => (multiple ? [...prevFiles, ...nextFiles] : nextFiles));
		onChange?.(nextFiles);
	};

	const handleClick = () => {
		if (disabled) {
			return;
		}

		fileInputRef.current?.click();
	};

	const { getRootProps, isDragActive } = useDropzone({
		multiple,
		noClick: true,
		accept,
		disabled,
		onDrop: handleFileChange,
		onDropRejected: (rejections) => {
			toast.error(getDropRejectedMessage(rejections));
		},
	});

	return (
		<div className="w-full" {...getRootProps()}>
			<motion.div
				onClick={handleClick}
				whileHover={disabled ? undefined : "animate"}
				className={cn(
					"group/file relative block w-full overflow-hidden rounded-lg p-10",
					disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
				)}
			>
				<input
					ref={fileInputRef}
					id="file-upload-handle"
					type="file"
					accept={inputAcceptValue}
					multiple={multiple}
					disabled={disabled}
					onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
					className="hidden"
				/>
				<div className="flex flex-col items-center justify-center">
					<p className="relative z-20 text-base font-bold text-neutral-700 dark:text-neutral-300">
						{title}
					</p>
					<p className="relative z-20 mt-2 text-center text-base font-normal text-neutral-400 dark:text-neutral-400">
						{description}
					</p>
					<div className="relative mx-auto mt-10 w-full max-w-xl">
						{files.length > 0 &&
							files.map((file, idx) => (
								<motion.div
									key={"file" + idx}
									layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
									className={cn(
										"relative z-40 mx-auto mt-4 flex w-full flex-col items-start justify-start overflow-hidden rounded-md bg-white p-4 md:h-24 dark:bg-neutral-900",
										"shadow-sm",
									)}
								>
									<div className="flex w-full items-center justify-between gap-4">
										<motion.p
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											layout
											className="max-w-xs truncate text-base text-neutral-700 dark:text-neutral-300"
										>
											{file.name}
										</motion.p>
										<motion.p
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											layout
											className="shadow-input w-fit shrink-0 rounded-lg px-2 py-1 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white"
										>
											{(file.size / (1024 * 1024)).toFixed(2)} MB
										</motion.p>
									</div>

									<div className="mt-2 flex w-full flex-col items-start justify-between text-sm text-neutral-600 md:flex-row md:items-center dark:text-neutral-400">
										<motion.p
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											layout
											className="rounded-md bg-gray-100 px-1 py-0.5 dark:bg-neutral-800"
										>
											{file.type || "unknown"}
										</motion.p>

										<motion.p
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											layout
										>
											modified{" "}
											{new Date(file.lastModified).toLocaleDateString()}
										</motion.p>
									</div>
								</motion.div>
							))}
						{!files.length && (
							<motion.div
								layoutId="file-upload"
								variants={mainVariant}
								transition={{
									type: "spring",
									stiffness: 300,
									damping: 20,
								}}
								className={cn(
									"relative z-40 mx-auto mt-4 flex h-32 w-full max-w-32 items-center justify-center rounded-md bg-white group-hover/file:shadow-2xl dark:bg-neutral-900",
									"shadow-[0px_10px_50px_rgba(0,0,0,0.1)]",
								)}
							>
								{isDragActive ? (
									<motion.p
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="flex flex-col items-center text-neutral-600"
									>
										{dragActiveText}
										<IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
									</motion.p>
								) : (
									<IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
								)}
							</motion.div>
						)}

						{!files.length && (
							<motion.div
								variants={secondaryVariant}
								className="absolute inset-0 z-30 mx-auto mt-4 flex h-32 w-full max-w-32 items-center justify-center rounded-md border border-dashed border-sky-400 bg-transparent opacity-0"
							/>
						)}
					</div>
				</div>
			</motion.div>
		</div>
	);
};
