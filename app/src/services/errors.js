/** Turn an API failure into one sentence for the screen. */
export function errorMessage(error) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  if (error?.message === "Network Error") {
    return "Cannot reach the API. Start the backend, then reload.";
  }
  return "Something went wrong.";
}
