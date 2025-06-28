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

	return nil, nil
}
