export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const createFaqEntry = (entry: Omit<FaqEntry, "id">): FaqEntry => ({
  id: `faq_${Math.random().toString(36).slice(2, 10)}`,
  ...entry,
});
