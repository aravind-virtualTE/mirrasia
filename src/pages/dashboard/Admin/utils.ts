export function formatDateTime(isoDateString: string) {
  if (!isoDateString) return "";
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) {
        console.error("Invalid date string provided to formatDateTime:", isoDateString);
        return ""; 
    }

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    // const seconds = date.getSeconds().toString().padStart(2, "0");

    //  "DD-MM-YYYY HH:mm:ss" or "DD-MM-YYYY HH:mm"
    // "DD-MM-YYYY HH:mm" for a common format
    return `${day}-${month}-${year} ${hours}:${minutes}`;

  } catch (error) {
    console.error("Error formatting date:", error);
    return ""; // Return empty string in case of an unexpected error during processing
  }
}