package domain

import "time"

type PaymentStatus string

const (
	PaymentStatusPending           PaymentStatus = "pending"
	PaymentStatusWaitingForCapture PaymentStatus = "waiting_for_capture"
	PaymentStatusSucceeded         PaymentStatus = "succeeded"
	PaymentStatusCanceled          PaymentStatus = "canceled"
)

type Payment struct {
	ID                string        `json:"id"`
	PaymentID         string        `json:"paymentId"`
	Date              time.Time     `json:"date"`
	Amount            int           `json:"amount"`
	Status            PaymentStatus `json:"status"`
	PaymentLink       string        `json:"paymentLink"`
	ConfirmationToken string        `json:"confirmationToken"`
	RegistrationID    *string       `json:"registrationId,omitempty"`
	Registration      *Registration `json:"registration,omitempty"`
}

type CreatePayment struct {
	PaymentID         string        `json:"paymentId" binding:"required"`
	Amount            int           `json:"amount" binding:"required"`
	Status            PaymentStatus `json:"status" binding:"required"`
	PaymentLink       string        `json:"paymentLink" binding:"required"`
	ConfirmationToken string        `json:"confirmationToken"`
	RegistrationID    *string       `json:"registrationId,omitempty"`
}

type PatchPayment struct {
	Status            *PaymentStatus `json:"status,omitempty"`
	PaymentLink       *string        `json:"paymentLink,omitempty"`
	ConfirmationToken *string        `json:"confirmationToken,omitempty"`
}

type FilterPayment struct {
	ID             *string        `json:"id,omitempty"`
	PaymentID      *string        `json:"paymentId,omitempty"`
	Status         *PaymentStatus `json:"status,omitempty"`
	RegistrationID *string        `json:"registrationId,omitempty"`
} 