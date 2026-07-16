import { API_BASE_URL } from './client';

export interface ClientRecord {
  id: number;
  fullName: string;
  phone: string;
  pledges?: PledgeRecord[];
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

export interface PledgeRecord {
    status: 'ACTIVE' | 'REDEEMED';
    id: number;
    clientId: number;
    tariffId: string;
    tariff: TariffRecord;
    items: PledgeItemRecord[];
    createdAt: string;
    dueDate: string;
    amount: string;
    redemptionAmount: string | null;
}

export interface PledgeItemRecord {
    id: number;
    pledgeId: number;
    categoryId: string;
    name: string;
    estimatedValue: string;
    specifications: Record<string, string>;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  return response.json();
}

export async function fetchClients(withPledges: boolean = false): Promise<ClientRecord[]> {
  const response = await fetch(`${API_BASE_URL}/clients` + (withPledges ? '?withPledges=true' : ''));
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

export async function redeemPledge(pledgeId: number) {
  const response = await fetch(`${API_BASE_URL}/pledges/redeem/${pledgeId}`, {
    method: 'PATCH'
  });

  return handleResponse(response);
}