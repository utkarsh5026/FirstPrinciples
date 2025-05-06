const union = <T>(a: T[], b: T[]): T[] => {
  const arrSet = new Set([...a, ...b]);
  return Array.from(arrSet);
};

export { union };
