package pg

import (
	"context"
	"fmt"

	"gopadel/scheduler/pkg/domain"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TaskRepo struct {
	db   *pgxpool.Pool
	psql sq.StatementBuilderType
}

func NewTaskRepo(db *pgxpool.Pool) *TaskRepo {
	return &TaskRepo{
		db:   db,
		psql: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
	}
}

func (r *TaskRepo) Create(ctx context.Context, task *domain.CreateTask) (string, error) {
	var id string
	err := r.db.QueryRow(
		ctx,
		"INSERT INTO tasks (task_type, execute_at, data, max_retries) VALUES ($1, $2, $3, $4) RETURNING id",
		task.TaskType,
		task.ExecuteAt,
		task.Data,
		task.MaxRetries,
	).Scan(&id)
	return id, err
}

func (r *TaskRepo) GetReadyTasks(ctx context.Context) ([]*domain.Task, error) {
	rows, err := r.db.Query(
		ctx,
		`SELECT * FROM tasks WHERE status = 'pending' AND execute_at <= NOW()`,
	)	
	if err != nil {
		return nil, err
	}

	var tasks []*domain.Task
	for rows.Next() {
		var task domain.Task
		err := rows.Scan(&task.ID, &task.TaskType, &task.Status, &task.ExecuteAt, &task.CreatedAt, &task.UpdatedAt, &task.Data, &task.Result, &task.ErrorMessage, &task.RetryCount, &task.MaxRetries)
		if err != nil {
			return nil, err
		}
		tasks = append(tasks, &task)
	}
	return tasks, nil
}

func (r *TaskRepo) CompleteTask(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, "UPDATE tasks SET status = 'completed' WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to complete task %s: %w", id, err)
	}
	return nil
}

func (r *TaskRepo) FailTask(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, "UPDATE tasks SET status = 'failed' WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to fail task %s: %w", id, err)
	}
	return nil
}

func (r *TaskRepo) Patch(ctx context.Context, task *domain.PatchTask) error {
	s := r.psql.Update("tasks").
		Where(sq.Eq{"id": task.ID})

	if task.Status != nil {
		s = s.Set("status", *task.Status)
	}

	if task.Result != nil {
		s = s.Set("result", *task.Result)
	}

	if task.ErrorMessage != nil {
		s = s.Set("error_message", *task.ErrorMessage)
	}

	if task.RetryCount != nil {
		s = s.Set("retry_count", *task.RetryCount)
	}

	if task.MaxRetries != nil {
		s = s.Set("max_retries", *task.MaxRetries)
	}

	if task.ExecuteAt != nil {
		s = s.Set("execute_at", *task.ExecuteAt)
	}

	if task.Data != nil {
		s = s.Set("data", *task.Data)
	}

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	_, err = r.db.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to execute SQL: %w", err)
	}

	return nil
}

func (r *TaskRepo) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, "DELETE FROM tasks WHERE id = $1", id)
	return err
}
