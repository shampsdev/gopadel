package domain

import (
	"time"

	"encoding/json"
)

type TaskStatus string
type TaskType string

const (
	TaskStatusPending    TaskStatus = "pending"
	TaskStatusProcessing TaskStatus = "processing"
	TaskStatusCompleted  TaskStatus = "completed"
	TaskStatusFailed     TaskStatus = "failed"
)

const (
	TaskTypeTournamentRegistrationSuccess      TaskType = "tournament.registration.success"
	TaskTypeTournamentPaymentReminder1         TaskType = "tournament.payment.reminder.1"
	TaskTypeTournamentPaymentReminder2         TaskType = "tournament.payment.reminder.2"
	TaskTypeTournamentPaymentReminder3         TaskType = "tournament.payment.reminder.3"
	TaskTypeTournamentPaymentSuccess           TaskType = "tournament.payment.success"
	TaskTypeTournamentLoyaltyChanged           TaskType = "tournament.loyalty.changed"
	TaskTypeTournamentRegistrationCanceled     TaskType = "tournament.registration.canceled"
	TaskTypeTournamentRegistrationAutoDeleteUnpaid TaskType = "tournament.registration.auto_delete_unpaid"
	TaskTypeTournamentTasksCancel              TaskType = "tournament.tasks.cancel"
)

type Task struct {
    ID           string          `db:"id" json:"id"`
    TaskType     TaskType        `db:"task_type" json:"task_type"`         // Enum task_type
    Status       TaskStatus      `db:"status" json:"status"`               // Enum task_status

    ExecuteAt    time.Time       `db:"execute_at" json:"execute_at"`
    CreatedAt    time.Time       `db:"created_at" json:"created_at"`
    UpdatedAt    time.Time       `db:"updated_at" json:"updated_at"`

    Data         json.RawMessage `db:"data" json:"data"`                   // JSONB
    Result       json.RawMessage `db:"result" json:"result,omitempty"`     // JSONB
    ErrorMessage *string         `db:"error_message" json:"error_message,omitempty"`

    RetryCount   int             `db:"retry_count" json:"retry_count"`
    MaxRetries   int             `db:"max_retries" json:"max_retries"`
}

type CreateTask struct {
	TaskType     TaskType        `json:"task_type"`              // required
	ExecuteAt    time.Time       `json:"execute_at"`             // required
	Data         json.RawMessage `json:"data"`                   // required
	MaxRetries   int             `json:"max_retries"`            // optional (default 3)
}

type PatchTask struct {
	ID            string           `json:"id"`                          // required
	Status        *TaskStatus      `json:"status,omitempty"`            // e.g., "cancelled"
	Result        *json.RawMessage `json:"result,omitempty"`            // optional
	ErrorMessage  *string          `json:"error_message,omitempty"`     // optional
	RetryCount    *int             `json:"retry_count,omitempty"`       // optional
	MaxRetries    *int             `json:"max_retries,omitempty"`       // optional
	ExecuteAt     *time.Time       `json:"execute_at,omitempty"`        // optional
	Data          *json.RawMessage `json:"data,omitempty"`              // optional
}