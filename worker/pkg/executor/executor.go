package executor

// ВРЕМЕННОЕ ИЗМЕНЕНИЕ: Все задачи пропускаются кроме tournament.registration.success
// Это сделано для разработки, чтобы не отправлялись уведомления и не удалялись регистрации

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"

	"gopadel/scheduler/cmd/config"
	"gopadel/scheduler/pkg/domain"
	"gopadel/scheduler/pkg/repo"
	"gopadel/scheduler/pkg/telegram"
)

type TaskSchedulerInterface interface {
	CancelTask(taskID string) error
}

type TaskExecutor struct {
	repo              repo.Task
	registrationRepo  repo.Registration
	telegramClient    *telegram.TelegramClient
	config            *config.Config
	scheduler         TaskSchedulerInterface
}

func NewTaskExecutor(repo repo.Task, registrationRepo repo.Registration, telegramClient *telegram.TelegramClient, config *config.Config) *TaskExecutor {
	return &TaskExecutor{
		repo:             repo,
		registrationRepo: registrationRepo,
		telegramClient:   telegramClient,
		config:           config,
	}
}

func (e *TaskExecutor) SetScheduler(scheduler TaskSchedulerInterface) {
	e.scheduler = scheduler
}

func (e *TaskExecutor) ExecuteTask(ctx context.Context, task *domain.Task) error {
	slog.Info("executing task", "task_id", task.ID, "task_type", task.TaskType)
	
	// ВРЕМЕННО: Пропускаем выполнение всех задач, кроме успешной регистрации
	// if task.TaskType != domain.TaskTypeTournamentRegistrationSuccess {
	// 	slog.Info("skipping task execution (disabled for development)", "task_id", task.ID, "task_type", task.TaskType)
	// 	return nil
	// }
	
	var taskData map[string]interface{}
	if err := json.Unmarshal(task.Data, &taskData); err != nil {
		return fmt.Errorf("failed to unmarshal task data: %w", err)
	}

	switch task.TaskType {
	case domain.TaskTypeTournamentTasksCancel:
		return e.executeTournamentTasksCancel(ctx, taskData)
	case domain.TaskTypeTournamentRegistrationAutoDeleteUnpaid:
		return e.executeTournamentRegistrationAutoDeleteUnpaid(ctx, taskData)
	default:
		chatIDFloat, ok := taskData["user_telegram_id"].(float64)
		if !ok {
			return fmt.Errorf("user_telegram_id not found or invalid in task data")
		}
		chatID := int64(chatIDFloat)
		return e.sendTelegramMessage(ctx, task.TaskType, chatID, taskData)
	}
}

func (e *TaskExecutor) sendTelegramMessage(ctx context.Context, taskType domain.TaskType, chatID int64, data map[string]interface{}) error {
	recipient := domain.Recipient{ChatID: chatID}
	
	messageText := telegram.GetMessageForTaskType(taskType, data, e.config)
	
	message := domain.Message{
		Type: domain.MessageTypeText,
		Text: messageText,
	}

	return e.telegramClient.SendMessage(ctx, recipient, message)
}

func (e *TaskExecutor) executeTournamentTasksCancel(ctx context.Context, data map[string]interface{}) error {
	userTelegramIDFloat, ok := data["user_telegram_id"].(float64)
	if !ok {
		return fmt.Errorf("user_telegram_id not found or invalid in task data")
	}
	userTelegramID := int64(userTelegramIDFloat)

	tournamentID, ok := data["tournament_id"].(string)
	if !ok {
		return fmt.Errorf("tournament_id not found or invalid in task data")
	}

	taskTypesToCancel := []domain.TaskType{
		domain.TaskTypeTournamentReminder48Hours,
		domain.TaskTypeTournamentReminder24Hours,
		domain.TaskTypeTournamentFreeReminder48Hours,
		domain.TaskTypeTournamentRegistrationAutoDeleteUnpaid,
	}

	statuses := []domain.TaskStatus{domain.TaskStatusPending}
	tasks, err := e.repo.FindTasksByUserAndTournament(ctx, userTelegramID, tournamentID, statuses)
	if err != nil {
		return fmt.Errorf("failed to find tasks to cancel: %w", err)
	}

	canceledCount := 0
	for _, task := range tasks {
		shouldCancel := false
		for _, taskType := range taskTypesToCancel {
			if task.TaskType == taskType {
				shouldCancel = true
				break
			}
		}

		if shouldCancel {
			if err := e.repo.CancelTask(ctx, task.ID); err != nil {
				slog.Error("failed to cancel task in database", "task_id", task.ID, "task_type", task.TaskType, "error", err)
				continue
			}

			if e.scheduler != nil {
				if err := e.scheduler.CancelTask(task.ID); err != nil {
					slog.Error("failed to cancel task in scheduler", "task_id", task.ID, "task_type", task.TaskType, "error", err)
				}
			}

			slog.Info("task canceled successfully", "task_id", task.ID, "task_type", task.TaskType)
			canceledCount++
		}
	}

	slog.Info("tournament tasks cancellation completed", 
		"user_telegram_id", userTelegramID, 
		"tournament_id", tournamentID, 
		"total_found", len(tasks), 
		"canceled_count", canceledCount)

	return nil
}

func (e *TaskExecutor) executeTournamentRegistrationAutoDeleteUnpaid(ctx context.Context, data map[string]interface{}) error {
	registrationID, ok := data["registration_id"].(string)
	if !ok {
		return fmt.Errorf("registration_id not found or invalid in task data")
	}

	if err := e.registrationRepo.SetCanceledStatus(ctx, registrationID); err != nil {
		return fmt.Errorf("failed to set registration status to canceled: %w", err)
	}

	slog.Info("registration automatically canceled due to unpaid status", 
		"registration_id", registrationID)

	chatIDFloat, ok := data["user_telegram_id"].(float64)
	if !ok {
		slog.Warn("user_telegram_id not found, skipping notification", "registration_id", registrationID)
		return nil
	}
	chatID := int64(chatIDFloat)

	return e.sendTelegramMessage(ctx, domain.TaskTypeTournamentRegistrationAutoDeleteUnpaid, chatID, data)
}