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

export const registerToEvent = async (
  token: string,
  eventId: string
): Promise<Registration | null> => {
  const response = await api.post(
    `/registrations/${eventId}`,
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
  eventId: string
): Promise<Registration | null> => {
  const response = await api.post(
    `/registrations/${eventId}/cancel`,
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
  eventId: string
): Promise<Registration | null> => {
  const response = await api.post(
    `/registrations/${eventId}/cancel-paid`,
    {},
    {
      headers: {
        "X-Api-Token": token,
      },
    }
  );
  return response.data;
};

export const createPaymentForEventRegistration = async (
  token: string,
  eventId: string,
  returnUrl: string
): Promise<Payment | null> => {
  const response = await api.post(
    `/registrations/${eventId}/payment`,
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
  eventId: string
): Promise<Registration | null> => {
  const response = await api.post(
    `/registrations/${eventId}/reactivate`,
    {},
    {
      headers: {
        "X-Api-Token": token,
      },
    }
  );
  return response.data;
};
