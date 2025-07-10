package notifications

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"time"

	"github.com/nats-io/nats.go"
)

// NATSTaskMessage структура сообщения для отправки в NATS
type NATSTaskMessage struct {
	TaskName  string          `json:"task_name"`
	ExecuteAt string          `json:"execute_at"`
	Data      json.RawMessage `json:"data"`
	CreatedAt string          `json:"created_at"`
}

// TaskType типы задач для уведомлений
type TaskType string

const (
	TaskTypeTournamentRegistrationSuccess      TaskType = "tournament.registration.success"
	TaskTypeTournamentReminder48Hours          TaskType = "tournament.reminder.48hours"
	TaskTypeTournamentReminder24Hours          TaskType = "tournament.reminder.24hours"
	TaskTypeTournamentFreeReminder48Hours      TaskType = "tournament.free.reminder.48hours"
	TaskTypeTournamentPaymentSuccess           TaskType = "tournament.payment.success"
	TaskTypeTournamentLoyaltyChanged           TaskType = "tournament.loyalty.changed"
	TaskTypeTournamentRegistrationCanceled     TaskType = "tournament.registration.canceled"
	TaskTypeTournamentRegistrationAutoDeleteUnpaid TaskType = "tournament.registration.auto_delete_unpaid"
	TaskTypeTournamentTasksCancel              TaskType = "tournament.tasks.cancel"
)

// NATSClient клиент для отправки уведомлений через NATS
type NATSClient struct {
	conn    *nats.Conn
	subject string
	logger  *slog.Logger
}

// NewNATSClient создает новый NATS клиент
func NewNATSClient(conn *nats.Conn, subject string, logger *slog.Logger) *NATSClient {
	return &NATSClient{
		conn:    conn,
		subject: subject,
		logger:  logger,
	}
}

// Close закрывает соединение с NATS
func (c *NATSClient) Close() {
	if c.conn != nil {
		c.conn.Close()
	}
}

// SendNotification отправляет уведомление в NATS
func (c *NATSClient) SendNotification(ctx context.Context, taskType TaskType, executeAt time.Time, data interface{}) error {
	// Сериализуем данные
	dataBytes, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal data: %w", err)
	}

	// Создаем сообщение
	message := NATSTaskMessage{
		TaskName:  string(taskType),
		ExecuteAt: executeAt.Format(time.RFC3339),
		Data:      dataBytes,
		CreatedAt: time.Now().Format(time.RFC3339),
	}

	// Сериализуем сообщение
	messageBytes, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	// Отправляем в NATS
	err = c.conn.Publish(c.subject, messageBytes)
	if err != nil {
		return fmt.Errorf("failed to publish message: %w", err)
	}

	c.logger.Info("Notification sent to NATS",
		slog.String("task_type", string(taskType)),
		slog.String("execute_at", executeAt.Format(time.RFC3339)),
		slog.String("subject", c.subject),
	)

	return nil
}

// SendImmediateNotification отправляет уведомление для немедленного выполнения
func (c *NATSClient) SendImmediateNotification(ctx context.Context, taskType TaskType, data interface{}) error {
	return c.SendNotification(ctx, taskType, time.Now(), data)
}

// SendScheduledNotification отправляет запланированное уведомление
func (c *NATSClient) SendScheduledNotification(ctx context.Context, taskType TaskType, executeAt time.Time, data interface{}) error {
	return c.SendNotification(ctx, taskType, executeAt, data)
} 