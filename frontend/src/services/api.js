const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function inspectImage(file, conf = 0.15) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("conf", String(conf / 100));

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "Image prediction failed.";
    try {
      const error = await response.json();
      message = error.detail || message;
    } catch {
      // Keep default message
    }
    throw new Error(message);
  }

  const result = await response.json();
  return {
    ...result,
    result_image_url: result.result_image
      ? new URL(result.result_image, API_BASE_URL).href
      : null,
  };
}

export async function inspectBatch(files, conf = 0.15) {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  formData.append("conf", String(conf / 100));

  const response = await fetch(`${API_BASE_URL}/predict-batch`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "Batch prediction failed.";
    try {
      const error = await response.json();
      message = error.detail || message;
    } catch {
      // Keep default message
    }
    throw new Error(message);
  }

  const batchData = await response.json();
  return {
    ...batchData,
    results: batchData.results.map((item) => ({
      ...item,
      result_image_url: item.result_image
        ? new URL(item.result_image, API_BASE_URL).href
        : null,
    })),
  };
}

export async function getBackendHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error("Backend health check failed");
  return response.json();
}

export async function getModelInfo() {
  const response = await fetch(`${API_BASE_URL}/model-info`);
  if (!response.ok) throw new Error("Failed to fetch model info");
  return response.json();
}
