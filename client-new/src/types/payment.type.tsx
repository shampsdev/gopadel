// export interface Payment {
//   amount: number;
//   confirmationToken: string;
//   date: string;
//   id: string;
//   paymentId: string;
//   paymentLink: string;
//   registration: Registration;
//   registrationId: string;
//   status: PaymentStatus;
// }

export interface Payment {
  payment_url: string;
  payment_id: string;
}
