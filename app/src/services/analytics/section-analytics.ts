import type { SectionReadingData } from "@/services/section/SectionReadingService";

export const getTimeSpentOnDay = (
  date: Date,
  readings: SectionReadingData[]
) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return readings
    .filter((reading) => {
      const readDate = new Date(reading.lastReadAt);
      return readDate >= startOfDay && readDate <= endOfDay;
    })
    .reduce((total, reading) => total + reading.timeSpent, 0);
};

/**
 * Calculate total words read across all documents
 */
export const getTotalWordsRead = (
  readings: SectionReadingData[],
  wordCountMap?: Record<string, number>
) => {
  const readSectionIds = new Set<string>();
  readings
    .filter((reading) => reading.isComplete)
    .forEach((reading) => readSectionIds.add(reading.sectionId));

  let totalWords = 0;

  if (!wordCountMap) {
    const completedReadings = readings.filter((r) => r.isComplete);
    completedReadings.forEach((reading) => {
      totalWords += reading.wordCount || 0;
    });
    return totalWords;
  }

  readSectionIds.forEach((sectionId) => {
    if (wordCountMap[sectionId]) {
      totalWords += wordCountMap[sectionId];
      return;
    }

    const sectionReadings = readings.filter(
      (r) => r.sectionId === sectionId && r.isComplete
    );
    if (sectionReadings.length > 0) {
      totalWords += sectionReadings[0].wordCount || 0;
    }
  });

  return totalWords;
};

/**
 * Calculate reading speed (words per minute)
 */
export const getReadingSpeed = (readings: SectionReadingData[]) => {
  let totalWords = 0;
  let totalTime = 0;

  readings
    .filter((reading) => reading.isComplete && reading.wordCount)
    .forEach((reading) => {
      totalWords += reading.wordCount || 0;
      totalTime += reading.timeSpent;
    });

  const minutes = totalTime / (1000 * 60);
  return minutes > 0 ? Math.round(totalWords / minutes) : 0;
};
