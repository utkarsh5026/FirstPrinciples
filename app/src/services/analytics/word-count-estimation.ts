const AVERAGE_READING_SPEED_WPM = 250;

/**
 * 📝 Cleans up markdown text to make word counting more accurate
 * Strips away all the fancy formatting so we can just count the actual words!
 */
function removeMarkdownFormatting(text: string): string {
  let cleanText = text;

  // Remove code blocks
  cleanText = cleanText.replace(/```[\s\S]*?```/g, "");

  // Remove inline code
  cleanText = cleanText.replace(/`[^`]*`/g, "");

  // Remove headings
  cleanText = cleanText.replace(/^#{1,6}\s+/gm, "");

  // Remove links but keep link text
  cleanText = cleanText.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Remove images
  cleanText = cleanText.replace(/!\[[^\]]*\]\([^)]+\)/g, "");

  // Remove bold/italic formatting
  cleanText = cleanText.replace(/(\*\*|__)(.*?)\1/g, "$2");
  cleanText = cleanText.replace(/(\*|_)(.*?)\1/g, "$2");

  // Remove HTML tags
  cleanText = cleanText.replace(/<[^>]*>/g, "");

  return cleanText;
}

/**
 * 🔢 Counts the number of words in a text
 * First cleans up any markdown formatting, then splits by spaces to count!
 */
export function countWords(text: string): number {
  if (!text || typeof text !== "string") {
    return 0;
  }
  const cleanText = removeMarkdownFormatting(text);
  const words = cleanText.split(/\s+/).filter((word) => word.length > 0);
  return words.length;
}

/**
 * ⏱️ Figures out how long it would take to read something
 * Uses average reading speed to estimate how many milliseconds you'd need!
 */
export function estimateReadingTime(
  wordCount: number,
  readingSpeed = AVERAGE_READING_SPEED_WPM
): number {
  const minutes = Math.max(1, wordCount / readingSpeed);
  return minutes * 60 * 1000;
}

/**
 * 📊 Calculates how far someone has gotten through reading something
 * Compares time spent with expected reading time to show a percentage!
 */
export function estimateReadingProgress(
  wordCount: number,
  timeSpentMs: number,
  readingSpeed = AVERAGE_READING_SPEED_WPM
): number {
  if (wordCount <= 0 || timeSpentMs <= 0) {
    return 0;
  }

  const totalReadingTimeMs = estimateReadingTime(wordCount, readingSpeed);
  let percentageRead = (timeSpentMs / totalReadingTimeMs) * 100;
  percentageRead = Math.min(percentageRead, 100);
  return Math.round(percentageRead);
}

/**
 * 📚 Estimates how many words someone has read based on time
 * Converts reading time into word count using average reading speed!
 */
export function estimateWordsRead(
  timeSpentMs: number,
  readingSpeed = AVERAGE_READING_SPEED_WPM
): number {
  if (timeSpentMs <= 0) {
    return 0;
  }

  const minutes = timeSpentMs / (60 * 1000);
  return Math.floor(minutes * readingSpeed);
}
