package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"gopadel/scheduler/cmd/config"
	"gopadel/scheduler/pkg/domain"
	"gopadel/scheduler/pkg/executor"
	"gopadel/scheduler/pkg/repo"
	"gopadel/scheduler/pkg/telegram"

	"github.com/nats-io/nats.go"
)

type TaskHandler struct {
	repo     repo.Task
	executor *executor.TaskExecutor
}

func NewTaskHandler(repo repo.Task, telegramClient *telegram.TelegramClient, config *config.Config) *TaskHandler {
	taskExecutor := executor.NewTaskExecutor(repo, telegramClient, config)
	
	return &TaskHandler{
		repo:     repo,
		executor: taskExecutor,
	}
}

func (h *TaskHandler) HandleTaskMessage(ctx context.Context, msg *nats.Msg) (*domain.Task, error) {
	var natsMsg domain.NATSTaskMessage
	if err := json.Unmarshal(msg.Data, &natsMsg); err != nil {
		return nil, fmt.Errorf("failed to parse NATS message: %w", err)
	}
	
	executeAt, err := parseTimeString(natsMsg.ExecuteAt)
	if err != nil {
		return nil, fmt.Errorf("failed to parse execute_at '%s': %w", natsMsg.ExecuteAt, err)
	}
	
	createTask := &domain.CreateTask{
		TaskType:   domain.TaskType(natsMsg.TaskName),
		ExecuteAt:  executeAt,
		Data:       natsMsg.Data,
		MaxRetries: 3,
	}
	
	taskID, err := h.repo.Create(ctx, createTask)
	if err != nil {
		return nil, fmt.Errorf("failed to create task: %w", err)
	}
	
	task := &domain.Task{
		ID:         taskID,
		TaskType:   createTask.TaskType,
		Status:     domain.TaskStatusPending,
		ExecuteAt:  createTask.ExecuteAt,
		Data:       createTask.Data,
		MaxRetries: createTask.MaxRetries,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
	
	slog.Info("task created from NATS message", 
		"task_id", task.ID, 
		"task_type", task.TaskType,
		"execute_at", task.ExecuteAt.Format("2006-01-02 15:04:05"))
	
	return task, nil
}

func (h *TaskHandler) ProcessReadyTasks(ctx context.Context) error {
	return h.executor.ProcessReadyTasks(ctx)
}

func (h *TaskHandler) ExecuteTask(ctx context.Context, task *domain.Task) error {
	return h.executor.ExecuteTask(ctx, task)
}

func parseTimeString(timeStr string) (time.Time, error) {
	if strings.Contains(timeStr, ".") {
		parts := strings.Split(timeStr, ".")
		timeStr = parts[0]
	}
	
	formats := []string{
		"2006-01-02T15:04:05",
		"2006-01-02 15:04:05",
		time.RFC3339,
		"2006-01-02T15:04:05Z",
	}
	
	for _, format := range formats {
		if t, err := time.Parse(format, timeStr); err == nil {
			return t, nil
		}
	}
	
	return time.Time{}, fmt.Errorf("unable to parse time: %s", timeStr)
}