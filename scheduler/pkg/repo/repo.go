package repo

import (
	"context"

	"gopadel/scheduler/pkg/domain"
)

type Task interface {
	Create(ctx context.Context, task *domain.CreateTask) (string, error)
	Patch(ctx context.Context, task *domain.PatchTask) error
	Delete(ctx context.Context, id string) error
	GetReadyTasks(ctx context.Context) ([]*domain.Task, error)
	FindTasksByUserAndTournament(ctx context.Context, userTelegramID int64, tournamentID string, statuses []domain.TaskStatus) ([]*domain.Task, error)
	CompleteTask(ctx context.Context, id string) error
	FailTask(ctx context.Context, id string) error
	CancelTask(ctx context.Context, id string) error
}
