import { api } from "../api/api";

export interface Registration {
  id: string;
  user_id: string;
  tournament_id: string;
  date: string;
  status: string;
  user: {
    id: string;
    first_name: string;
    second_name: string;
    city: string;
    username?: string;
  };
  tournament: {
    id: string;
    name: string;
  };
  payments: Payment[];
}

export interface Payment {
  id: string;
  payment_id: string;
  date: string;
  amount: number;
  payment_link: string;
  status: string;
  confirmation_token: string;
}

export interface RegistrationResponse {
  registrations: Registration[];
  total: number;
}

const getAll = async (
  skip = 0, 
  limit = 10, 
  filters: { 
    user_id?: string; 
    tournament_id?: string; 
    status?: string 
  } = {}
): Promise<RegistrationResponse> => {
  const params: Record<string, string | number | undefined> = { skip, limit };
  if (filters.user_id) params.user_id = filters.user_id;
  if (filters.tournament_id) params.tournament_id = filters.tournament_id;
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  
  const response = await api.get("/admin/registrations/", { params });
  return response.data;
};

const updateStatus = async (registrationId: string, status: string): Promise<{ message: string; status: string }> => {
  const response = await api.patch(`/admin/registrations/${registrationId}/status`, { status });
  return response.data;
};

export const registrationService = {
  getAll,
  updateStatus,
}; 