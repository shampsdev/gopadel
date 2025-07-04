import type { PaymentStatus } from "./payment-status.type";
import type { Registration } from "./registration.type";

export interface Payment {
  amount: number;
  confirmationToken: string;
  date: string;
  id: string;
  paymentId: string;
  paymentLink: string;
  registration: Registration;
  registrationId: string;
  status: PaymentStatus;
}
