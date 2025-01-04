import type { ZeroShotImageClassificationOutput } from "@huggingface/inference";
import { useEffect, useReducer, useState } from "react";

type ReducerAction =
    | {
          type: "REMOVE_FILE";
          index: number;
      }
    | {
          type: "ADD_FILES";
          files: File[];
      }
    | {
          type: "SET_CLASSIFICATION_OUTPUT";
          index: number;
          output: ZeroShotImageClassificationOutput;
      };

type FileState = {
    files: File[];
    imageURLs: string[];
    classificationOutputs: (ZeroShotImageClassificationOutput | null)[];
    hasOversizedFiles: boolean;
};

const initialState: FileState = {
    files: [],
    imageURLs: [],
    classificationOutputs: [],
    hasOversizedFiles: false,
};

const allowedTypes = ["image/jpeg", "image/png", "image/webp"] as const;

function reducer(state: FileState, action: ReducerAction) {
    switch (action.type) {
        case "ADD_FILES":
            const limit: number = 5 * 1024 * 1024;

            const uniqueFiles = action.files.filter(
                (newFile) =>
                    !state.files.some(
                        (existingFile) =>
                            existingFile.name === newFile.name && existingFile.size === newFile.size,
                    ) && allowedTypes.includes(newFile.type as (typeof allowedTypes)[number]),
            );

            const allowedFiles = uniqueFiles.filter((file) => file.size <= limit);

            if (uniqueFiles.length > 0) {
                return {
                    ...state,
                    files: [...state.files, ...allowedFiles],
                    imageURLs: [...state.imageURLs, ...allowedFiles.map((file) => URL.createObjectURL(file))],
                    classificationOutputs: [
                        ...state.classificationOutputs,
                        ...(new Array(allowedFiles.length).fill(null) as null[]),
                    ],
                    hasOversizedFiles: uniqueFiles.some((file) => file.size > limit),
                };
            }

            return state;
        case "SET_CLASSIFICATION_OUTPUT":
            const updatedOutput = [...state.classificationOutputs];
            updatedOutput[action.index] = action.output;
            return {
                ...state,
                classificationOutputs: updatedOutput,
            };
        case "REMOVE_FILE":
            URL.revokeObjectURL(state.imageURLs[action.index]); // Revoke URL on removal
            return {
                ...state,
                files: state.files.filter((_, index) => index !== action.index),
                imageURLs: state.imageURLs.filter((_, index) => index !== action.index),
                classificationOutputs: state.classificationOutputs.filter(
                    (_, index) => index !== action.index,
                ),
            };
        default:
            return state;
    }
}

export function useFileManagement() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [showOversizeNotification, setShowOversizeNotification] = useState(false);

    useEffect(() => {
        // Inform the user about the limit
        if (state.hasOversizedFiles) {
            setShowOversizeNotification(true);
            // Remove the notification after 3 seconds
            const timer = setTimeout(() => {
                setShowOversizeNotification(false);
                state.hasOversizedFiles = false;
            }, 4000);

            return () => clearTimeout(timer);
        } else {
            setShowOversizeNotification(false);
        }
    }, [state.hasOversizedFiles]);

    useEffect(() => {
        return () => {
            state.imageURLs.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [state.imageURLs]);

    return { state, dispatch, showOversizeNotification };
}
