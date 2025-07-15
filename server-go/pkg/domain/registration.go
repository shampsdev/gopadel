package domain

import (
	"time"
)

type RegistrationStatus string

const (
	RegistrationStatusPending                RegistrationStatus = "PENDING"
	RegistrationStatusConfirmed              RegistrationStatus = "CONFIRMED"
	RegistrationStatusCancelledBeforePayment RegistrationStatus = "CANCELLED_BEFORE_PAYMENT"
	RegistrationStatusCancelledAfterPayment  RegistrationStatus = "CANCELLED_AFTER_PAYMENT"
	RegistrationStatusRefunded               RegistrationStatus = "REFUNDED"
)

type Registration struct {
	UserID    string             `json:"userId"`
	EventID   string             `json:"eventId"`
	Status    RegistrationStatus `json:"status"`
	CreatedAt time.Time          `json:"createdAt"`
	UpdatedAt time.Time          `json:"updatedAt"`
	User      *User              `json:"user,omitempty"`
	Event     *EventForRegistration `json:"event,omitempty"`
}

// RegistrationWithEvent полная информация о регистрации с событием
type RegistrationWithEvent struct {
	UserID    string                `json:"userId"`
	EventID   string                `json:"eventId"`
	Status    RegistrationStatus    `json:"status"`
	CreatedAt time.Time             `json:"createdAt"`
	UpdatedAt time.Time             `json:"updatedAt"`
	User      *User                 `json:"user,omitempty"`
	Event     *EventForRegistration `json:"event,omitempty"`
}



// RegistrationWithPayments для админки - регистрация с платежами
type RegistrationWithPayments struct {
	UserID    string                `json:"userId"`
	EventID   string                `json:"eventId"`
	Status    RegistrationStatus    `json:"status"`
	CreatedAt time.Time             `json:"createdAt"`
	UpdatedAt time.Time             `json:"updatedAt"`
	User      *User                 `json:"user,omitempty"`
	Event     *EventForRegistration `json:"event,omitempty"`
	Payments  []*Payment            `json:"payments,omitempty"`
}



type CreateRegistration struct {
	UserID  string             `json:"userId" binding:"required"`
	EventID string             `json:"eventId" binding:"required"`
	Status  RegistrationStatus `json:"status"`
}

type PatchRegistration struct {
	Status *RegistrationStatus `json:"status,omitempty"`
}

type FilterRegistration struct {
	UserID  *string             `json:"userId,omitempty"`
	EventID *string             `json:"eventId,omitempty"`
	Status  *RegistrationStatus `json:"status,omitempty"`
}

// AdminFilterRegistration для фильтрации в админке
type AdminFilterRegistration struct {
	UserID  *string             `json:"userId,omitempty"`
	EventID *string             `json:"eventId,omitempty"`
	Status  *RegistrationStatus `json:"status,omitempty"`
	// Дополнительные поля для удобства фильтрации
	UserTelegramID       *int64  `json:"userTelegramId,omitempty"`
	UserTelegramUsername *string `json:"userTelegramUsername,omitempty"`
	UserFirstName        *string `json:"userFirstName,omitempty"`
	EventName            *string `json:"eventName,omitempty"`
}
