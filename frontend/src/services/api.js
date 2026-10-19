
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getResultImageUrl(resultImage) {
  if (!resultImage) return null;

  try {
    return new URL(resultImage, API_BASE_URL).href;
  } catch {
    return null;
  }
}

async function getErrorMessage(response, fallbackMessage) {
  try {
    const error = await response.json();

    if (typeof error.detail === "string") {
      return error.detail;
    }

    if (Array.isArray(error.detail)) {
      return error.detail
        .map((item) => item.msg || JSON.stringify(item))
        .join(", ");
    }

    return fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

function validateConfidence(conf) {
  const value = Number(conf);

  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(
      "Confidence must be between 0 and 1. Use 0.15 for 15%."
    );
  }

  return value;
}

export async function inspectImage(file, conf = 0.15) {
  if (!(file instanceof File)) {
    throw new Error("Please select a valid image file.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file.");
  }

  const confidence = validateConfidence(conf);
  const formData = new FormData();

  formData.append("file", file);
  formData.append("conf", String(confidence));

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Image prediction failed.")
    );
  }

  const result = await response.json();

  return {
    ...result,
    result_image_url: getResultImageUrl(result.result_image),
  };
}

export async function inspectBatch(files, conf = 0.15) {
  if (!files || files.length === 0) {
    throw new Error("Please select at least one image.");
  }

  const confidence = validateConfidence(conf);
  const formData = new FormData();

  for (const file of files) {
    if (!(file instanceof File) || !file.type.startsWith("image/")) {
      throw new Error("All uploaded files must be valid images.");
    }

    formData.append("files", file);
  }

  formData.append("conf", String(confidence));

  const response = await fetch(`${API_BASE_URL}/predict-batch`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Batch prediction failed.")
    );
  }

  const batchData = await response.json();

  return {
    ...batchData,
    results: Array.isArray(batchData.results)
      ? batchData.results.map((item) => ({
          ...item,
          result_image_url: getResultImageUrl(item.result_image),
        }))
      : [],
  };
}

export async function getBackendHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Backend health check failed.")
    );
  }

  return response.json();
}

export async function getModelInfo() {
  const response = await fetch(`${API_BASE_URL}/model-info`);

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to fetch model info.")
    );
  }

  return response.json();
}
