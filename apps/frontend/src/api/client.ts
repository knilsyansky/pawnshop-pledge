export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function fetchPledges() {
  const response = await fetch(`${API_BASE_URL}/pledges`);
  return response.json();
}
