import { useCallback, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { FeedbackContext } from './feedback-context';

// Lives above the router so confirmations survive navigation after creation.
export function FeedbackProvider({ children }: PropsWithChildren) {
  const sequence = useRef(0);
  const [feedback, setFeedback] = useState<{ message: string; id: number } | null>(null);
  const notify = useCallback((message: string) => {
    setFeedback({ message, id: ++sequence.current });
  }, []);

  return (
    <FeedbackContext.Provider value={notify}>
      {children}
      <Snackbar
        key={feedback?.id}
        open={feedback !== null}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={(_, reason) => {
          if (reason !== 'clickaway') setFeedback(null);
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          role="status"
          onClose={() => setFeedback(null)}
          sx={{ width: '100%' }}
        >
          {feedback?.message}
        </Alert>
      </Snackbar>
    </FeedbackContext.Provider>
  );
}
