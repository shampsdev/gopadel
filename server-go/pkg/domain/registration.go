package domain

import (
	"time"
)

type RegistrationStatus string

const (
	RegistrationStatusPending                RegistrationStatus = "PENDING"                  // заявка отправлена, ожидает подтверждения
	RegistrationStatusConfirmed              RegistrationStatus = "CONFIRMED"                // участник принят в игру
	RegistrationStatusCancelledBeforePayment RegistrationStatus = "CANCELLED_BEFORE_PAYMENT" // не используется в играх (можно удалить, если не нужен)
	RegistrationStatusCancelledAfterPayment  RegistrationStatus = "CANCELLED_AFTER_PAYMENT"  // не используется в играх (можно удалить, если не нужен)
	RegistrationStatusRefunded               RegistrationStatus = "REFUNDED"                 // не используется в играх (можно удалить)
	RegistrationStatusCancelled              RegistrationStatus = "CANCELLED"                // заявка отклонена (оргом) или отменена (участником) до подтверждения
	RegistrationStatusLeft                   RegistrationStatus = "LEFT"                     // участник вышел после подтверждения
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