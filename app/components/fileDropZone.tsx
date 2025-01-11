import React, { useRef, useState } from "react";
import Image from "next/image";

interface FileDropZoneProps {
    onFilesAdded: (files: File[]) => void;
}

export default function FileDropZone({ onFilesAdded }: FileDropZoneProps) {
    const zone = useRef<HTMLDivElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    function handleDrop(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragging(false);

        const droppedFiles = event.dataTransfer.items
            ? Array.from(event.dataTransfer.items)
                  .filter((item) => item.kind === "file")
                  .map((item) => item.getAsFile() as File)
            : Array.from(event.dataTransfer.files);

        onFilesAdded(droppedFiles);
    }

    function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        event.stopPropagation();

        if (zone.current && !zone.current.contains(event.relatedTarget as Node)) {
            setIsDragging(false);
        }
    }

    return (
        <div
            ref={zone}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            aria-live="polite"
            className={`flex w-full max-w-[30rem] flex-1 justify-center rounded-lg border border-dashed border-gray-400 transition-all duration-300 ease-in-out dark:border-white/25 ${
                isDragging ? "px-12 py-14" : "px-10 py-12"
            } ${isDragging ? "border-2" : "border"} scale-125`}
        >
            <div className="text-center">
                <Image
                    src="/file.svg"
                    alt="Icon"
                    width={20}
                    height={20}
                    className="mx-auto h-12 w-12 invert dark:invert-0"
                    aria-hidden
                />
                <div className="mt-4 flex text-lg leading-6 text-gray-700 md:flex-col dark:text-gray-400">
                    <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-semibold text-indigo-700 dark:text-indigo-400"
                    >
                        <span>Upload an image</span>
                        <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={(event) => {
                                onFilesAdded(Array.from(event.target.files || []));
                                event.target.value = "";
                            }}
                            className="sr-only"
                            multiple
                        />
                    </label>
                    <p className="select-none pl-1">or drag and drop</p>
                </div>

                <p className="text-xs/5 text-gray-700 dark:text-gray-400">PNG, JPG, WEBP up to 5MB</p>
            </div>
        </div>
    );
}
