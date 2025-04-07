/**
 * Formats a given timestamp into a user-friendly date string.
 *
 * The function checks if the date represented by the timestamp is today, yesterday,
 * or any other date. It returns:
 * - "Today at HH:MM" if the date is today,
 * - "Yesterday" if the date is yesterday,
 * - A formatted date string (e.g., "Jan 1, 2023") for any other date.
 *
 * @param {number} timestamp - The timestamp to format, in milliseconds since the epoch.
 * @returns {string} A user-friendly string representation of the date.
 */
export const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();

  // If today, show time
  if (date.toDateString() === now.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // If yesterday, show "Yesterday"
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  // Otherwise, show date
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: now.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
  });
};
