package pg

import (
	"context"
	"errors"
	"fmt"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
)

type CourtRepo struct {
	db   *pgxpool.Pool
	psql sq.StatementBuilderType
}

func NewCourtRepo(db *pgxpool.Pool) *CourtRepo {
	return &CourtRepo{
		db:   db,
		psql: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
	}
}

func (r *CourtRepo) Create(ctx context.Context, court *domain.CreateCourt) (string, error) {
	s := r.psql.Insert(`"courts"`).
		Columns("name", "address").
		Values(court.Name, court.Address).
		Suffix("RETURNING id")

	sql, args, err := s.ToSql()
	if err != nil {
		return "", fmt.Errorf("failed to build SQL: %w", err)
	}

	var id string
	err = r.db.QueryRow(ctx, sql, args...).Scan(&id)
	if err != nil {
		return "", fmt.Errorf("failed to create court: %w", err)
	}

	return id, nil
}

func (r *CourtRepo) Filter(ctx context.Context, filter *domain.FilterCourt) ([]*domain.Court, error) {
	s := r.psql.Select("id", "name", "address").From(`"courts"`)

	if filter.ID != nil {
		s = s.Where(sq.Eq{"id": *filter.ID})
	}

	if filter.Name != nil {
		s = s.Where(sq.ILike{"name": fmt.Sprintf("%%%s%%", *filter.Name)})
	}

	sql, args, err := s.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build SQL: %w", err)
	}

	rows, err := r.db.Query(ctx, sql, args...)
	if errors.Is(err, pgx.ErrNoRows) {
		return []*domain.Court{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to execute SQL: %w", err)
	}
	defer rows.Close()

	courts := []*domain.Court{}
	for rows.Next() {
		var court domain.Court

		err := rows.Scan(
			&court.ID,
			&court.Name,
			&court.Address,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		courts = append(courts, &court)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return courts, nil
}

func (r *CourtRepo) Patch(ctx context.Context, id string, court *domain.PatchCourt) error {
	s := r.psql.Update(`"courts"`).Where(sq.Eq{"id": id})

	hasUpdates := false

	if court.Name != nil {
		s = s.Set("name", *court.Name)
		hasUpdates = true
	}

	if court.Address != nil {
		s = s.Set("address", *court.Address)
		hasUpdates = true
	}

	if !hasUpdates {
		return fmt.Errorf("no fields to update")
	}

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	result, err := r.db.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to update court: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("court with id %s not found", id)
	}

	return nil
}

func (r *CourtRepo) Delete(ctx context.Context, id string) error {
	s := r.psql.Delete(`"courts"`).Where(sq.Eq{"id": id})

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	result, err := r.db.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to delete court: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("court with id %s not found", id)
	}

	return nil
}

// GetByID получает корт по ID (вспомогательный метод)
func (r *CourtRepo) GetByID(ctx context.Context, id string) (*domain.Court, error) {
	filter := &domain.FilterCourt{ID: &id}
	courts, err := r.Filter(ctx, filter)
	if err != nil {
		return nil, err
	}

	if len(courts) == 0 {
		return nil, fmt.Errorf("court with id %s not found", id)
	}

	return courts[0], nil
} 