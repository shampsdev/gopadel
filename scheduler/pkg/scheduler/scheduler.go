package scheduler

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"gopadel/scheduler/pkg/domain"
	"gopadel/scheduler/pkg/executor"
	"gopadel/scheduler/pkg/repo"

	"github.com/go-co-op/gocron/v2"
)

type TaskScheduler struct {
	scheduler gocron.Scheduler
	executor  *executor.TaskExecutor
	repo      repo.Task
	jobs      map[string]gocron.Job // map[taskID]job для отслеживания задач
}

func NewTaskScheduler(executor *executor.TaskExecutor, repo repo.Task) (*TaskScheduler, error) {
	scheduler, err := gocron.NewScheduler()
	if err != nil {
		return nil, fmt.Errorf("failed to create gocron scheduler: %w", err)
	}

	return &TaskScheduler{
		scheduler: scheduler,
		executor:  executor,
		repo:      repo,
		jobs:      make(map[string]gocron.Job),
	}, nil
}

func (s *TaskScheduler) Start(ctx context.Context) error {
	slog.Info("Starting task scheduler")
	
	// Загружаем задачи из БД при старте
	if err := s.loadExistingTasks(ctx); err != nil {
		return fmt.Errorf("failed to load existing tasks: %w", err)
	}

	s.scheduler.Start()
	slog.Info("Task scheduler started")
	return nil
}

func (s *TaskScheduler) Stop() error {
	slog.Info("Stopping task scheduler")
	return s.scheduler.Shutdown()
}

func (s *TaskScheduler) loadExistingTasks(ctx context.Context) error {
	// Загружаем задачи со статусом pending и execute_at <= now() - выполняем сразу
	nowTasks, err := s.repo.GetPendingTasksNow(ctx)
	if err != nil {
		return fmt.Errorf("failed to get pending tasks for now: %w", err)
	}

	slog.Info("Processing immediate tasks", "count", len(nowTasks))
	for _, task := range nowTasks {
		go func(t *domain.Task) {
			if err := s.executeTask(ctx, t); err != nil {
				slog.Error("failed to execute immediate task", "task_id", t.ID, "error", err)
			}
		}(task)
	}

	// Загружаем задачи со статусом pending и execute_at > now() - регистрируем в планировщике
	futureTasks, err := s.repo.GetPendingTasksFuture(ctx)
	if err != nil {
		return fmt.Errorf("failed to get pending tasks for future: %w", err)
	}

	slog.Info("Scheduling future tasks", "count", len(futureTasks))
	for _, task := range futureTasks {
		if err := s.scheduleTask(ctx, task); err != nil {
			slog.Error("failed to schedule task", "task_id", task.ID, "error", err)
		}
	}

	return nil
}

func (s *TaskScheduler) ScheduleTask(ctx context.Context, task *domain.Task) error {
	now := time.Now().UTC()
	
	if task.ExecuteAt.Before(now) || task.ExecuteAt.Equal(now) {
		slog.Info("Executing task immediately", "task_id", task.ID, "execute_at", task.ExecuteAt.UTC())
		go func() {
			if err := s.executeTask(ctx, task); err != nil {
				slog.Error("failed to execute immediate task", "task_id", task.ID, "error", err)
			}
		}()
		return nil
	}

	return s.scheduleTask(ctx, task)
}

func (s *TaskScheduler) scheduleTask(ctx context.Context, task *domain.Task) error {
	executeAtUTC := task.ExecuteAt.UTC()
	
	job, err := s.scheduler.NewJob(
		gocron.OneTimeJob(gocron.OneTimeJobStartDateTime(executeAtUTC)),
		gocron.NewTask(func() {
			if err := s.executeTask(ctx, task); err != nil {
				slog.Error("failed to execute scheduled task", "task_id", task.ID, "error", err)
			}
		}),
		gocron.WithName(fmt.Sprintf("task-%s", task.ID)),
		gocron.WithTags(string(task.TaskType)),
	)
	
	if err != nil {
		return fmt.Errorf("failed to create job for task %s: %w", task.ID, err)
	}

	s.jobs[task.ID] = job
	slog.Info("Task scheduled", 
		"task_id", task.ID, 
		"task_type", task.TaskType,
		"execute_at", executeAtUTC.Format("2006-01-02 15:04:05 UTC"))
	
	return nil
}

func (s *TaskScheduler) CancelTask(taskID string) error {
	job, exists := s.jobs[taskID]
	if !exists {
		slog.Debug("Task not found in scheduler, might already be executed or cancelled", "task_id", taskID)
		return nil
	}

	if err := s.scheduler.RemoveJob(job.ID()); err != nil {
		return fmt.Errorf("failed to remove job for task %s: %w", taskID, err)
	}

	delete(s.jobs, taskID)
	slog.Info("Task cancelled from scheduler", "task_id", taskID)
	return nil
}

func (s *TaskScheduler) executeTask(ctx context.Context, task *domain.Task) error {
	defer func() {
		if _, exists := s.jobs[task.ID]; exists {
			delete(s.jobs, task.ID)
		}
	}()

	patchTask := &domain.PatchTask{
		ID:     task.ID,
		Status: &[]domain.TaskStatus{domain.TaskStatusProcessing}[0],
	}
	
	if err := s.repo.Patch(ctx, patchTask); err != nil {
		return fmt.Errorf("failed to update task status to processing: %w", err)
	}

	if err := s.executor.ExecuteTask(ctx, task); err != nil {
		task.RetryCount++
		
		if task.RetryCount >= task.MaxRetries {
			if failErr := s.repo.FailTask(ctx, task.ID); failErr != nil {
				slog.Error("failed to mark task as failed", "task_id", task.ID, "error", failErr)
			}
		} else {
			retryDelay := time.Duration(task.RetryCount) * time.Minute
			newExecuteAt := time.Now().UTC().Add(retryDelay)
			
			retryPatch := &domain.PatchTask{
				ID:         task.ID,
				Status:     &[]domain.TaskStatus{domain.TaskStatusPending}[0],
				RetryCount: &task.RetryCount,
				ExecuteAt:  &newExecuteAt,
			}
			
			if patchErr := s.repo.Patch(ctx, retryPatch); patchErr != nil {
				slog.Error("failed to reschedule task", "task_id", task.ID, "error", patchErr)
			} else {
				task.ExecuteAt = newExecuteAt
				if schedErr := s.scheduleTask(ctx, task); schedErr != nil {
					slog.Error("failed to reschedule task in scheduler", "task_id", task.ID, "error", schedErr)
				}
			}
		}
		return err
	}

	if err := s.repo.CompleteTask(ctx, task.ID); err != nil {
		return fmt.Errorf("failed to mark task as completed: %w", err)
	}

	slog.Info("Task completed successfully", "task_id", task.ID, "task_type", task.TaskType)
	return nil
} 