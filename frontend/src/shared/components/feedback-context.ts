import { createContext, useContext } from 'react';

export const FeedbackContext = createContext<((message: string) => void) | null>(null);

export function useSuccessMessage() {
  const notify = useContext(FeedbackContext);
  if (!notify) throw new Error('FeedbackProvider is required');
  return notify;
}
