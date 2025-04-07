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

/**
 * Formats a given reading time in minutes into a user-friendly string.
 *
 * The function checks if the reading time is less than an hour. If it is,
 * it returns the time in minutes (e.g., "45 min"). If the reading time
 * is an hour or more, it returns the time in hours and minutes (e.g.,
 * "1h 15m" for 75 minutes).
 *
 * @param {number} minutes - The reading time in minutes.
 * @returns {string} A user-friendly string representation of the reading time.
 */
export const formatReadingTime = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Formats a number with commas as thousands separators.
 *
 * This function takes a number and converts it to a string, adding commas
 * to separate thousands for better readability (e.g., 1000 becomes "1,000").
 *
 * @param {number} num - The number to format.
 * @returns {string} The formatted number as a string with commas.
 */
export const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
