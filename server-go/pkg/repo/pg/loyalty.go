package pg

import (
	"context"
	"errors"
	"fmt"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
)

type LoyaltyRepo struct {
	db   *pgxpool.Pool
	psql sq.StatementBuilderType
}

func NewLoyaltyRepo(db *pgxpool.Pool) *LoyaltyRepo {
	return &LoyaltyRepo{
		db:   db,
		psql: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
	}
}

func (r *LoyaltyRepo) Create(ctx context.Context, loyalty *domain.CreateLoyalty) (string, error) {
	s := r.psql.Insert(`"loyalties"`).
		Columns("name", "discount", "description", "requirements").
		Values(loyalty.Name, loyalty.Discount, loyalty.Description, loyalty.Requirements).
		Suffix("RETURNING id")

	sql, args, err := s.ToSql()
	if err != nil {
		return "", fmt.Errorf("failed to build SQL: %w", err)
	}

	var id string
	err = r.db.QueryRow(ctx, sql, args...).Scan(&id)
	return id, err
}

func (r *LoyaltyRepo) Filter(ctx context.Context, filter *domain.FilterLoyalty) ([]*domain.Loyalty, error) {
	s := r.psql.Select("id", "name", "discount", "description", "requirements").From(`"loyalties"`)

	if filter.ID != nil {
		s = s.Where(sq.Eq{"id": *filter.ID})
	}

	sql, args, err := s.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build SQL: %w", err)
	}

	rows, err := r.db.Query(ctx, sql, args...)
	if errors.Is(err, pgx.ErrNoRows) {
		return []*domain.Loyalty{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to execute SQL: %w", err)
	}
	defer rows.Close()

	loyalties := []*domain.Loyalty{}
	for rows.Next() {
		var loyalty domain.Loyalty
		var description pgtype.Text
		var requirements pgtype.Text

		err := rows.Scan(
			&loyalty.ID,
			&loyalty.Name,
			&loyalty.Discount,
			&description,
			&requirements,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		if description.Valid {
			loyalty.Description = description.String
		}
		if requirements.Valid {
			loyalty.Requirements = requirements.String
		}

		loyalties = append(loyalties, &loyalty)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return loyalties, nil
}

func (r *LoyaltyRepo) Patch(ctx context.Context, id int, loyalty *domain.PatchLoyalty) error {
	s := r.psql.Update(`"loyalties"`).Where(sq.Eq{"id": id})

	hasUpdates := false

	if loyalty.Name != nil {
		s = s.Set("name", *loyalty.Name)
		hasUpdates = true
	}

	if loyalty.Discount != nil {
		s = s.Set("discount", *loyalty.Discount)
		hasUpdates = true
	}

	if loyalty.Description != nil {
		s = s.Set("description", *loyalty.Description)
		hasUpdates = true
	}

	if loyalty.Requirements != nil {
		s = s.Set("requirements", *loyalty.Requirements)
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
		return fmt.Errorf("failed to update loyalty: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("loyalty with id %d not found", id)
	}

	return nil
}

func (r *LoyaltyRepo) Delete(ctx context.Context, id int) error {
	s := r.psql.Delete(`"loyalties"`).Where(sq.Eq{"id": id})

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	result, err := r.db.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to delete loyalty: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("loyalty with id %d not found", id)
	}

	return nil
}
