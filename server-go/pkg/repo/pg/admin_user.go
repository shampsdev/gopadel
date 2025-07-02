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

type AdminUserRepo struct {
	db   *pgxpool.Pool
	psql sq.StatementBuilderType
}

func NewAdminUserRepo(db *pgxpool.Pool) *AdminUserRepo {
	return &AdminUserRepo{
		db:   db,
		psql: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
	}
}

func (r *AdminUserRepo) Filter(ctx context.Context, filter *domain.FilterAdminUser) ([]*domain.AdminUser, error) {
	s := r.psql.Select(
		`"id"`, `"is_superuser"`, `"user_id"`, `"username"`,
	).From(`"admin_users"`)

	if filter.ID != nil {
		s = s.Where(sq.Eq{`"id"`: *filter.ID})
	}

	if filter.IsSuperUser != nil {
		s = s.Where(sq.Eq{`"is_superuser"`: *filter.IsSuperUser})
	}

	if filter.UserID != nil {
		s = s.Where(sq.Eq{`"user_id"`: *filter.UserID})
	}

	if filter.Username != nil {
		s = s.Where(sq.ILike{`"username"`: "%" + *filter.Username + "%"})
	}

	sql, args, err := s.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build SQL: %w", err)
	}

	rows, err := r.db.Query(ctx, sql, args...)
	if errors.Is(err, pgx.ErrNoRows) {
		return []*domain.AdminUser{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to execute SQL: %w", err)
	}
	defer rows.Close()

	adminUsers := []*domain.AdminUser{}
	for rows.Next() {
		var adminUser domain.AdminUser
		var username pgtype.Text

		err := rows.Scan(
			&adminUser.ID,
			&adminUser.IsSuperUser,
			&adminUser.UserID,
			&username,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		if username.Valid {
			adminUser.Username = username.String
		}

		adminUsers = append(adminUsers, &adminUser)
	}

	return adminUsers, nil
} 