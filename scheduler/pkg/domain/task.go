package domain

import (
	"fmt"
	"time"

	"encoding/json"
	"strings"
)

type NATSTaskMessage struct {
	TaskName  string          `json:"task_name"`
	ExecuteAt string          `json:"execute_at"`
	Data      json.RawMessage `json:"data"`
	CreatedAt string          `json:"created_at"`
}

type TaskStatus string
type TaskType string

const (
	TaskStatusPending    TaskStatus = "pending"
	TaskStatusProcessing TaskStatus = "processing"
	TaskStatusCompleted  TaskStatus = "completed"
	TaskStatusFailed     TaskStatus = "failed"
	TaskStatusCancelled  TaskStatus = "cancelled"
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

// НАВАЙБКОЖЕНО!!! ВЫВОД ДЛЯ ЛОГОВ
func (t Task) String() string {
	var parts []string
	
	parts = append(parts, fmt.Sprintf("ID:%s", t.ID))
	parts = append(parts, fmt.Sprintf("TaskType:%s", t.TaskType))
	parts = append(parts, fmt.Sprintf("Status:%s", t.Status))
	parts = append(parts, fmt.Sprintf("ExecuteAt:%s", t.ExecuteAt.Format("2006-01-02 15:04:05 -0700 MST")))
	parts = append(parts, fmt.Sprintf("CreatedAt:%s", t.CreatedAt.Format("2006-01-02 15:04:05 -0700 MST")))
	parts = append(parts, fmt.Sprintf("UpdatedAt:%s", t.UpdatedAt.Format("2006-01-02 15:04:05 -0700 MST")))
	
	if len(t.Data) > 0 {
		parts = append(parts, fmt.Sprintf("Data:%s", string(t.Data)))
	} else {
		parts = append(parts, "Data:{}")
	}
	
	if len(t.Result) > 0 {
		parts = append(parts, fmt.Sprintf("Result:%s", string(t.Result)))
	} else {
		parts = append(parts, "Result:[]")
	}
	
	if t.ErrorMessage != nil {
		parts = append(parts, fmt.Sprintf("ErrorMessage:%s", *t.ErrorMessage))
	} else {
		parts = append(parts, "ErrorMessage:<nil>")
	}
	
	parts = append(parts, fmt.Sprintf("RetryCount:%d", t.RetryCount))
	parts = append(parts, fmt.Sprintf("MaxRetries:%d", t.MaxRetries))
	
	return fmt.Sprintf("&{%s}", strings.Join(parts, " "))
}