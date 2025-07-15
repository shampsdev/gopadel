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
	UserID            string        `json:"userId"`
	EventID           string        `json:"eventId"`
	Registration      *Registration `json:"registration,omitempty"`
}

type CreatePayment struct {
	PaymentID         string        `json:"paymentId" binding:"required"`
	Amount            int           `json:"amount" binding:"required"`
	Status            PaymentStatus `json:"status" binding:"required"`
	PaymentLink       string        `json:"paymentLink" binding:"required"`
	ConfirmationToken string        `json:"confirmationToken"`
	UserID            string        `json:"userId" binding:"required"`
	EventID           string        `json:"eventId" binding:"required"`
}

type PatchPayment struct {
	Status            *PaymentStatus `json:"status,omitempty"`
	PaymentLink       *string        `json:"paymentLink,omitempty"`
	ConfirmationToken *string        `json:"confirmationToken,omitempty"`
}

type FilterPayment struct {
	ID        *string        `json:"id,omitempty"`
	PaymentID *string        `json:"paymentId,omitempty"`
	Status    *PaymentStatus `json:"status,omitempty"`
	UserID    *string        `json:"userId,omitempty"`
	EventID   *string        `json:"eventId,omitempty"`
} 