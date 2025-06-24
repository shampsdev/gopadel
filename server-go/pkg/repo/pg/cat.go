package pg

import (
	"context"
	"fmt"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
)

type CatRepo struct {
	db   *pgxpool.Pool
	psql sq.StatementBuilderType
}

func NewCatRepo(db *pgxpool.Pool) *CatRepo {
	return &CatRepo{
		db:   db,
		psql: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
	}
}

func (r *CatRepo) Create(ctx context.Context, cat *domain.CreateCat) (string, error) {
	s := r.psql.Insert(`"cat"`).
		Columns("name", "owner_id").
		Values(cat.Name, cat.OwnerID).
		Suffix("RETURNING id")

	sql, args, err := s.ToSql()
	if err != nil {
		return "", fmt.Errorf("failed to build SQL: %w", err)
	}

	var id string
	err = r.db.QueryRow(ctx, sql, args...).Scan(&id)
	return id, err
}

func (r *CatRepo) Patch(ctx context.Context, id string, cat *domain.PatchCat) error {
	s := r.psql.Update(`"cat"`).
		Where(sq.Eq{"id": id})

	if cat.Name != nil {
		s = s.Set("name", *cat.Name)
	}

	if cat.OwnerID != nil {
		s = s.Set("owner_id", *cat.OwnerID)
	}

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	_, err = r.db.Exec(ctx, sql, args...)
	return err
}

func (r *CatRepo) Filter(ctx context.Context, filter *domain.FilterCat) ([]*domain.Cat, error) {
	s := r.psql.Select("c.id", "c.name", "c.owner_id").
		From(`"cat" c`)

	if filter.ID != nil {
		s = s.Where(sq.Eq{"c.id": *filter.ID})
	}

	if filter.OwnerID != nil {
		s = s.Where(sq.Eq{"c.owner_id": *filter.OwnerID})
	}

	if filter.IncludeOwner {
		s = s.LeftJoin(`"user" u ON u.id = c.owner_id`).
			Columns("u.telegram_username", "u.first_name", "u.last_name", "u.avatar")
	}

	sql, args, err := s.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build SQL: %w", err)
	}

	rows, err := r.db.Query(ctx, sql, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to execute SQL: %w", err)
	}
	defer rows.Close()

	cats := []*domain.Cat{}
	for rows.Next() {
		var cat domain.Cat
		cat.Owner = &domain.User{}
		args := []any{&cat.ID, &cat.Name, &cat.Owner.ID}
		if filter.IncludeOwner {
			args = append(args, &cat.Owner.TelegramUsername, &cat.Owner.FirstName, &cat.Owner.LastName, &cat.Owner.Avatar)
		}
		err := rows.Scan(args...)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}
		cats = append(cats, &cat)
	}

	return cats, nil
}

func (r *CatRepo) Delete(ctx context.Context, id string) error {
	s := r.psql.Delete(`"cat"`).
		Where(sq.Eq{"id": id})

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	_, err = r.db.Exec(ctx, sql, args...)
	return err
}
