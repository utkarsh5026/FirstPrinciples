export const readingLevels = [
  {
    level: 1,
    title: "Novice Reader",
    requiredXP: 0,
    benefits: ["Basic access to all documents"],
  },
  {
    level: 2,
    title: "Apprentice Reader",
    requiredXP: 500,
    benefits: ["Access to reading heatmap"],
  },
  {
    level: 3,
    title: "Consistent Reader",
    requiredXP: 1000,
    benefits: ["Unlock custom themes"],
  },
  {
    level: 4,
    title: "Knowledge Seeker",
    requiredXP: 1500,
    benefits: ["Unlock reading insights"],
  },
  {
    level: 5,
    title: "Scholar",
    requiredXP: 2000,
    benefits: ["Detailed reading analytics"],
  },
  {
    level: 6,
    title: "Master Reader",
    requiredXP: 3000,
    benefits: ["Advanced customization options"],
  },
  {
    level: 7,
    title: "Sage",
    requiredXP: 4000,
    benefits: ["Access to expert reading patterns"],
  },
  {
    level: 8,
    title: "Grand Master",
    requiredXP: 5000,
    benefits: ["Exclusive badge collection"],
  },
  {
    level: 9,
    title: "Enlightened",
    requiredXP: 6000,
    benefits: ["Premium status recognition"],
  },
  {
    level: 10,
    title: "Legendary Reader",
    requiredXP: 7500,
    benefits: ["All features unlocked"],
  },
];

export type ReadingLevel = (typeof readingLevels)[number];
