import type { Payment } from "../types/payment.type";
import type { Registration } from "../types/registration.type";
import { api } from "./axios.instance";

export const getMyRegistrations = async (
  token: string
): Promise<Registration[] | null> => {
  const response = await api.get("/registrations/my", {
    headers: {
      "X-Api-Token": token,
    },
  });
  return response.data;
};

export const registerToTournament = async (
  token: string,
  tournamentId: string
): Promise<Registration | null> => {
  const response = await api.post(
    `/registrations/${tournamentId}`,
    {},
    {
      headers: {
        "X-Api-Token": token,
      },
    }
  );
  return response.data;
};

export const cancelRegistrationBeforePayment = async (
  token: string,
  tournamentId: string
): Promise<Registration | null> => {
  const response = await api.post(
    `/registrations/${tournamentId}/cancel`,
    {},
    {
      headers: {
        "X-Api-Token": token,
      },
    }
  );
  return response.data;
};

export const cancelRegistrationAfterPayment = async (
  token: string,
  tournamentId: string
): Promise<Registration | null> => {
  const response = await api.post(
    `/registrations/${tournamentId}/cancel`,
    {},
    {
      headers: {
        "X-Api-Token": token,
      },
    }
  );
  return response.data;
};

export const createPaymentForTournamentRegistration = async (
  token: string,
  tournamentId: string,
  returnUrl: string
): Promise<Payment | null> => {
  const response = await api.post(
    `/registrations/${tournamentId}/payment`,
    {
      returnUrl: returnUrl,
    },
    {
      headers: {
        "X-Api-Token": token,
      },
    }
  );

  return response.data;
};

export const reactivateCancelledRegistration = async (
  token: string,
  tournamentId: string
): Promise<Registration | null> => {
  const response = await api.post(
    `/registrations/${tournamentId}/reactivate`,
    {},
    {
      headers: {
        "X-Api-Token": token,
      },
    }
  );
  return response.data;
};
