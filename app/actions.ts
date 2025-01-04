"use server";

import { HfInference } from "@huggingface/inference";

const inference = new HfInference(process.env.HF_TOKEN);

export async function classifyImage(formData: FormData) {
    const file = formData.get("file") as File;
    const model = String(formData.get("model"));
    const labels = String(formData.get("labels"));

    const buffer = await file.arrayBuffer();

    return await inference.zeroShotImageClassification({
        model: model,
        inputs: {
            image: buffer,
        },
        parameters: {
            candidate_labels: labels.split(";"),
        },
    });
}
