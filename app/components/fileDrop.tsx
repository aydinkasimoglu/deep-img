"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { classifyImage } from "@/app/actions";
import { useFileManagement } from "@/app/lib/fileManagament";
import FileDropZone from "./fileDropZone";
import FileList from "./fileList";

const modelOptions = ["openai/clip-vit-base-patch32", "google/siglip-base-patch16-224"];

export default function FileDrop() {
    const [isPending, startTransition] = useTransition();
    const { state, dispatch, showOversizeNotification } = useFileManagement();
    const settingsDialog = useRef<HTMLDialogElement>(null);
    const modelSelection = useRef<HTMLSelectElement>(null);
    const candidateContainer = useRef<HTMLDivElement>(null);

    const [model, setModel] = useState(modelOptions[0]);

    const [candidateLabels, setCandidateLabels] = useState<string[]>([
        "animal", // Any kind of animal
        "plant", // Any plant or tree
        "human", // People and human activities
        "vehicle", // Cars, trucks, bikes, etc.
        "building", // Houses, offices, skyscrapers
        "food", // Fruits, vegetables, prepared dishes
        "nature", // Natural landscapes
        "technology", // Gadgets, electronics, machines
        "art", // Art-related images
        "miscellaneous", // For everything else
    ]);

    function handleClassify() {
        startTransition(() => {
            state.files.forEach(async (file, index) => {
                const formData = new FormData();

                formData.set("file", file);
                formData.set("model", model);
                formData.set("labels", candidateLabels.join(";"));

                const output = await classifyImage(formData);

                console.log(output);

                dispatch({
                    type: "SET_CLASSIFICATION_OUTPUT",
                    index,
                    output,
                });
            });
        });
    }

    function closeSettings() {
        if (settingsDialog.current) {
            settingsDialog.current.close();
        }

        if (modelSelection.current) {
            modelSelection.current.value = model;
        }

        if (candidateContainer.current) {
            let i = 0;
            candidateContainer.current.childNodes.forEach((node) => {
                if (node instanceof HTMLInputElement) {
                    node.value = candidateLabels[i++];
                }
            });
        }
    }

    function openSettings() {
        if (settingsDialog.current) {
            settingsDialog.current.showModal();
        }
    }

    function handleSettings(formData: FormData) {
        const modelSetting = String(formData.get("model-input"));

        setModel(modelSetting);

        const labels: string[] = [];

        for (let i = 0; i < 10; ++i) {
            const candidate = String(formData.get(`candidate-${i}`));
            labels.push(candidate);
        }

        console.log(labels);

        setCandidateLabels(labels);

        if (settingsDialog.current) {
            settingsDialog.current.close();
        }
    }

    return (
        <>
            <FileDropZone onFilesAdded={(files) => dispatch({ type: "ADD_FILES", files })} />

            {showOversizeNotification && (
                <div className="fixed bottom-0 left-0 right-0 bg-red-500 p-4 text-center text-white">
                    Some files were too large (over 5MB) and were not uploaded.
                </div>
            )}

            {state.files.length > 0 && (
                <>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            disabled={isPending}
                            onClick={handleClassify}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            {isPending && (
                                <Image
                                    src="/spinner.svg"
                                    alt="Spinner icon"
                                    width={20}
                                    height={20}
                                    className="mr-1 inline-block animate-spin"
                                />
                            )}

                            <span className="inline-block">{isPending ? "Processing" : "Classify"}</span>
                        </button>

                        <button
                            onClick={openSettings}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Settings
                        </button>
                    </div>

                    <FileList
                        files={state.files}
                        imageURLs={state.imageURLs}
                        classificationOutputs={state.classificationOutputs}
                        onRemoveFile={(index) => dispatch({ type: "REMOVE_FILE", index })}
                    />

                    <dialog
                        ref={settingsDialog}
                        className="absolute m-auto rounded-md bg-[#424242] px-8 pb-8 pt-6 shadow-md"
                    >
                        <form action={handleSettings}>
                            <div className="mb-2 flex flex-col gap-2">
                                <label
                                    htmlFor="model-input"
                                    className="text-xl font-semibold dark:text-white"
                                >
                                    Model
                                </label>

                                <select
                                    ref={modelSelection}
                                    name="model-input"
                                    id="model-input"
                                    className="block w-full rounded-md border-0 bg-[#616161] py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:text-white dark:ring-[rgb(255_255_255/0.1)] dark:placeholder:text-gray-400"
                                    defaultValue={model}
                                >
                                    <option value={model}>{model}</option>
                                    {modelOptions.map(
                                        (opt, index) =>
                                            opt !== model && (
                                                <option key={index} value={opt}>
                                                    {opt}
                                                </option>
                                            ),
                                    )}
                                </select>
                            </div>

                            <div ref={candidateContainer} className="mb-2 flex flex-col gap-2">
                                <b className="text-xl dark:text-white">Candidate Labels</b>

                                {candidateLabels.map((label, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength={25}
                                        name={`candidate-${index}`}
                                        placeholder={`Candidate ${index}`}
                                        className="block w-full rounded-md border-0 bg-[#616161] py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:text-white dark:ring-[rgb(255_255_255/0.1)] dark:placeholder:text-gray-400"
                                        defaultValue={label}
                                    />
                                ))}
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-x-6">
                                <button
                                    type="button"
                                    className="text-sm font-semibold leading-6 dark:text-white"
                                    onClick={closeSettings}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </dialog>
                </>
            )}
        </>
    );
}
