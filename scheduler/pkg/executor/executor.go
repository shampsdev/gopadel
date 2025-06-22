package executor

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"time"

	"gopadel/scheduler/cmd/config"
	"gopadel/scheduler/pkg/domain"
	"gopadel/scheduler/pkg/repo"
	"gopadel/scheduler/pkg/telegram"
)

type TaskExecutor struct {
	repo           repo.Task
	telegramClient *telegram.TelegramClient
	config         *config.Config
}

func NewTaskExecutor(repo repo.Task, telegramClient *telegram.TelegramClient, config *config.Config) *TaskExecutor {
	return &TaskExecutor{
		repo:           repo,
		telegramClient: telegramClient,
		config:         config,
	}
}

func (e *TaskExecutor) ExecuteTask(ctx context.Context, task *domain.Task) error {
	slog.Info("executing task", "task_id", task.ID, "task_type", task.TaskType)
	
	var taskData map[string]interface{}
	if err := json.Unmarshal(task.Data, &taskData); err != nil {
		return fmt.Errorf("failed to unmarshal task data: %w", err)
	}

	switch task.TaskType {
	case domain.TaskTypeTournamentTasksCancel:
		return e.executeTournamentTasksCancel(ctx, taskData)
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
		domain.TaskTypeTournamentPaymentReminder1,
		domain.TaskTypeTournamentPaymentReminder2,
		domain.TaskTypeTournamentPaymentReminder3,
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
				slog.Error("failed to cancel task", "task_id", task.ID, "task_type", task.TaskType, "error", err)
			} else {
				slog.Info("task canceled successfully", "task_id", task.ID, "task_type", task.TaskType)
				canceledCount++
			}
		}
	}

	slog.Info("tournament tasks cancellation completed", 
		"user_telegram_id", userTelegramID, 
		"tournament_id", tournamentID, 
		"total_found", len(tasks), 
		"canceled_count", canceledCount)

	return nil
}

func (e *TaskExecutor) ProcessReadyTasks(ctx context.Context) error {
	tasks, err := e.repo.GetReadyTasks(ctx)
	if err != nil {
		return fmt.Errorf("failed to get ready tasks: %w", err)
	}

	slog.Info("processing ready tasks", "count", len(tasks))

	for _, task := range tasks {
		if err := e.processTask(ctx, task); err != nil {
			slog.Error("failed to process task", "task_id", task.ID, "error", err)
		}
	}

	return nil
}

func (e *TaskExecutor) processTask(ctx context.Context, task *domain.Task) error {
	patchTask := &domain.PatchTask{
		ID:     task.ID,
		Status: &[]domain.TaskStatus{domain.TaskStatusProcessing}[0],
	}
	
	if err := e.repo.Patch(ctx, patchTask); err != nil {
		return fmt.Errorf("failed to update task status to processing: %w", err)
	}

	if err := e.ExecuteTask(ctx, task); err != nil {
		task.RetryCount++
		
		if task.RetryCount >= task.MaxRetries {
			if failErr := e.repo.FailTask(ctx, task.ID); failErr != nil {
				slog.Error("failed to mark task as failed", "task_id", task.ID, "error", failErr)
			}
		} else {
			retryDelay := time.Duration(task.RetryCount) * time.Minute
			retryPatch := &domain.PatchTask{
				ID:         task.ID,
				Status:     &[]domain.TaskStatus{domain.TaskStatusPending}[0],
				RetryCount: &task.RetryCount,
				ExecuteAt:  &[]time.Time{time.Now().Add(retryDelay)}[0],
			}
			if patchErr := e.repo.Patch(ctx, retryPatch); patchErr != nil {
				slog.Error("failed to reschedule task", "task_id", task.ID, "error", patchErr)
			}
		}
		return err
	}

	if err := e.repo.CompleteTask(ctx, task.ID); err != nil {
		return fmt.Errorf("failed to mark task as completed: %w", err)
	}

	return nil
}