import Image from "next/image";
import type { ZeroShotImageClassificationOutput } from "@huggingface/inference";

interface FileListProps {
    files: File[];
    imageURLs: string[];
    classificationOutputs: (ZeroShotImageClassificationOutput | null)[];
    onRemoveFile: (index: number) => void;
}

export default function FileList({ files, imageURLs, classificationOutputs, onRemoveFile }: FileListProps) {
    return (
        <div className="flex items-center justify-center">
            <ul className="flex max-w-4xl flex-wrap justify-center gap-6">
                {files.map((file, index) => (
                    <li key={`${file.name}-${file.lastModified}`}>
                        <div className="relative">
                            <button
                                onClick={() => onRemoveFile(index)}
                                className="absolute -right-5 -top-5 scale-[.8] rounded-full bg-slate-500 p-1 dark:bg-slate-800"
                            >
                                <Image
                                    src="/close.svg"
                                    alt="Close icon"
                                    width={20}
                                    height={20}
                                    draggable="false"
                                    aria-hidden
                                    priority
                                />
                            </button>

                            <Image
                                src={imageURLs[index]}
                                alt={`Uploaded image#${index}`}
                                width={128}
                                height={128}
                                draggable="false"
                                priority
                            />

                            {classificationOutputs[index] && (
                                <span className="mt-3 inline-flex items-center rounded-md bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/30">
                                    {classificationOutputs[index][0].label.split(", ")[0]},{" "}
                                    {(classificationOutputs[index][0].score * 100).toFixed(0)}%
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
