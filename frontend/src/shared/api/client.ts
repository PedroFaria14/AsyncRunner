import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (data && typeof data === 'object' && 'error' in data) {
      const detail = data.error;
      if (
        detail &&
        typeof detail === 'object' &&
        'message' in detail &&
        typeof detail.message === 'string'
      )
        return detail.message;
    }
    if (error.code === 'ECONNABORTED') return 'O servidor demorou para responder. Tente novamente.';
    return 'Não foi possível conectar ao servidor. Tente novamente.';
  }
  return 'Não foi possível concluir a operação. Tente novamente.';
}
