export function formatTimestamp(utcTimestamp: string): string {
    const date = new Date(utcTimestamp);
  
    // Format the date and time according to the user's locale
    const formattedDate = date.toLocaleDateString(); // e.g., "3/5/2025"
    const formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); // e.g., "11:50 AM"
  
    return `${formattedDate} - ${formattedTime}`;
  }