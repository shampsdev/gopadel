import { api } from "../api/api";

export interface Payment {
  id: string;
  payment_id: string;
  date: string;
  amount: number;
  payment_link: string;
  status: string;
  registration?: {
    id: string;
    user_id: string;
    tournament_id: string;
    status: string;
    user?: {
      id: string;
      first_name: string;
      second_name: string;
      city: string;
      username?: string;
    };
    tournament?: {
      id: string;
      name: string;
    };
  };
}

export interface PaymentResponse {
  payments: Payment[];
  total: number;
}

const getAll = async (skip = 0, limit = 10, filters: { user_id?: string; tournament_id?: string; status?: string } = {}): Promise<PaymentResponse> => {
  const params: Record<string, string | number | undefined> = { skip, limit };
  if (filters.user_id) params.user_id = filters.user_id;
  if (filters.tournament_id) params.tournament_id = filters.tournament_id;
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  const response = await api.get("/admin/payments/", { params });
  return response.data;
};

export const paymentService = {
  getAll,
}; 