import { API_BASE_URL } from './client';

export interface ClientRecord {
  id: number;
  fullName: string;
  phone: string;
}

export interface CreateClientPayload {
  fullName: string;
  phone: string;
}

export interface TariffRecord {
  id: string;
  basePeriodDays: number;
  basePeriodRate: string;
  overdueRate: string;
  overduePeriodDays: number | null;
}

export interface CategoryRecord {
  id: string;
  specification: Record<string, string>;
}

export interface PledgeItemPayload {
  categoryId: string;
  name: string;
  estimatedValue: number;
  specifications: Record<string, string>;
}

export interface CreatePledgePayload {
  clientId: number;
  tariffId: string;
  items: PledgeItemPayload[];
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  return response.json();
}

export async function fetchClients(): Promise<ClientRecord[]> {
  const response = await fetch(`${API_BASE_URL}/clients`);
  return handleResponse(response);
}

export async function fetchTariffs(): Promise<TariffRecord[]> {
  const response = await fetch(`${API_BASE_URL}/tariffs`);
  return handleResponse(response);
}

export async function fetchCategories(): Promise<CategoryRecord[]> {
  const response = await fetch(`${API_BASE_URL}/categories`);
  return handleResponse(response);
}

export async function createClient(payload: CreateClientPayload): Promise<ClientRecord> {
  const response = await fetch(`${API_BASE_URL}/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
}

export async function createPledge(payload: CreatePledgePayload) {
  const response = await fetch(`${API_BASE_URL}/pledges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
}
