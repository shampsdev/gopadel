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

type UserRepo struct {
	db   *pgxpool.Pool
	psql sq.StatementBuilderType
}

func NewUserRepo(db *pgxpool.Pool) *UserRepo {
	return &UserRepo{
		db:   db,
		psql: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
	}
}

func (r *UserRepo) Create(ctx context.Context, user *domain.CreateUser) (string, error) {
	s := r.psql.Insert(`"user"`).
		Columns("telegram_id", "telegram_username", "first_name", "last_name", "avatar").
		Values(user.TelegramID, user.TelegramUsername, user.FirstName, user.LastName, user.Avatar).
		Suffix("RETURNING id")

	sql, args, err := s.ToSql()
	if err != nil {
		return "", fmt.Errorf("failed to build SQL: %w", err)
	}

	var id string
	err = r.db.QueryRow(ctx, sql, args...).Scan(&id)
	return id, err
}

func (r *UserRepo) Filter(ctx context.Context, filter *domain.FilterUser) ([]*domain.User, error) {
	s := r.psql.Select("id", "telegram_id", "telegram_username", "first_name", "last_name", "avatar").
		From(`"user"`)

	if filter.ID != nil {
		s = s.Where(sq.Eq{"id": *filter.ID})
	}

	if filter.TelegramID != nil {
		s = s.Where(sq.Eq{"telegram_id": *filter.TelegramID})
	}

	sql, args, err := s.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build SQL: %w", err)
	}

	rows, err := r.db.Query(ctx, sql, args...)
	if errors.Is(err, pgx.ErrNoRows) {
		return []*domain.User{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to execute SQL: %w", err)
	}
	defer rows.Close()

	users := []*domain.User{}
	for rows.Next() {
		var user domain.User
		err := rows.Scan(
			&user.ID,
			&user.TelegramID,
			&user.TelegramUsername,
			&user.FirstName,
			&user.LastName,
			&user.Avatar,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}
		users = append(users, &user)
	}

	return users, nil
}

func (r *UserRepo) Patch(ctx context.Context, id string, user *domain.PatchUser) error {
	s := r.psql.Update(`"user"`)
	if user.TelegramUsername != nil {
		s = s.Set("telegram_username", *user.TelegramUsername)
	}
	if user.FirstName != nil {
		s = s.Set("first_name", *user.FirstName)
	}
	if user.LastName != nil {
		s = s.Set("last_name", *user.LastName)
	}
	if user.Avatar != nil {
		s = s.Set("avatar", *user.Avatar)
	}
	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}
	_, err = r.db.Exec(ctx, sql, args...)
	return err
}

func (r *UserRepo) Delete(ctx context.Context, id string) error {
	s := r.psql.Delete(`"user"`).
		Where(sq.Eq{"id": id})
	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}
	_, err = r.db.Exec(ctx, sql, args...)
	return err
}
