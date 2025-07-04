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
	"github.com/shampsdev/go-telegram-template/pkg/repo"
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
		`"id"`, `"username"`, `"password_hash"`, `"is_superuser"`, `"is_active"`, `"first_name"`, `"last_name"`, `"user_id"`,
	).From(`"admin_users"`)

	if filter.ID != nil {
		s = s.Where(sq.Eq{`"id"`: *filter.ID})
	}

	if filter.Username != nil {
		s = s.Where(sq.ILike{`"username"`: "%" + *filter.Username + "%"})
	}

	if filter.IsSuperUser != nil {
		s = s.Where(sq.Eq{`"is_superuser"`: *filter.IsSuperUser})
	}

	if filter.IsActive != nil {
		s = s.Where(sq.Eq{`"is_active"`: *filter.IsActive})
	}

	if filter.FirstName != nil {
		s = s.Where(sq.ILike{`"first_name"`: "%" + *filter.FirstName + "%"})
	}

	if filter.LastName != nil {
		s = s.Where(sq.ILike{`"last_name"`: "%" + *filter.LastName + "%"})
	}

	if filter.UserID != nil {
		s = s.Where(sq.Eq{`"user_id"`: *filter.UserID})
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
		var username, passwordHash, firstName, lastName, userID pgtype.Text

		err := rows.Scan(
			&adminUser.ID,
			&username,
			&passwordHash,
			&adminUser.IsSuperUser,
			&adminUser.IsActive,
			&firstName,
			&lastName,
			&userID,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		if username.Valid {
			adminUser.Username = username.String
		}
		if passwordHash.Valid {
			adminUser.PasswordHash = passwordHash.String
		}
		if firstName.Valid {
			adminUser.FirstName = firstName.String
		}
		if lastName.Valid {
			adminUser.LastName = lastName.String
		}
		if userID.Valid {
			adminUser.UserID = userID.String
		}

		adminUsers = append(adminUsers, &adminUser)
	}

	return adminUsers, nil
}

func (r *AdminUserRepo) GetByUsername(ctx context.Context, username string) (*domain.AdminUser, error) {
	s := r.psql.Select(
		`"id"`, `"username"`, `"password_hash"`, `"is_superuser"`, `"is_active"`, `"first_name"`, `"last_name"`, `"user_id"`,
	).From(`"admin_users"`).Where(sq.Eq{`"username"`: username})

	sql, args, err := s.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build SQL: %w", err)
	}

	var adminUser domain.AdminUser
	var usernameVal, passwordHash, firstName, lastName, userID pgtype.Text

	err = r.db.QueryRow(ctx, sql, args...).Scan(
		&adminUser.ID,
		&usernameVal,
		&passwordHash,
		&adminUser.IsSuperUser,
		&adminUser.IsActive,
		&firstName,
		&lastName,
		&userID,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, repo.ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("failed to execute SQL: %w", err)
	}

	if usernameVal.Valid {
		adminUser.Username = usernameVal.String
	}
	if passwordHash.Valid {
		adminUser.PasswordHash = passwordHash.String
	}
	if firstName.Valid {
		adminUser.FirstName = firstName.String
	}
	if lastName.Valid {
		adminUser.LastName = lastName.String
	}
	if userID.Valid {
		adminUser.UserID = userID.String
	}

	return &adminUser, nil
}

func (r *AdminUserRepo) Create(ctx context.Context, adminUser *domain.CreateAdminUser) (string, error) {
	s := r.psql.Insert(`"admin_users"`).
		Columns(`"username"`, `"password_hash"`, `"is_superuser"`, `"is_active"`, `"first_name"`, `"last_name"`, `"user_id"`).
		Values(adminUser.Username, adminUser.Password, adminUser.IsSuperUser, adminUser.IsActive, adminUser.FirstName, adminUser.LastName, adminUser.UserID).
		Suffix(`RETURNING "id"`)

	sql, args, err := s.ToSql()
	if err != nil {
		return "", fmt.Errorf("failed to build SQL: %w", err)
	}

	var id string
	err = r.db.QueryRow(ctx, sql, args...).Scan(&id)
	if err != nil {
		return "", fmt.Errorf("failed to execute SQL: %w", err)
	}

	return id, nil
}

func (r *AdminUserRepo) Patch(ctx context.Context, id string, adminUser *domain.PatchAdminUser) error {
	s := r.psql.Update(`"admin_users"`).Where(sq.Eq{`"id"`: id})

	if adminUser.Username != nil {
		s = s.Set(`"username"`, *adminUser.Username)
	}

	if adminUser.Password != nil {
		s = s.Set(`"password_hash"`, *adminUser.Password)
	}

	if adminUser.IsSuperUser != nil {
		s = s.Set(`"is_superuser"`, *adminUser.IsSuperUser)
	}

	if adminUser.IsActive != nil {
		s = s.Set(`"is_active"`, *adminUser.IsActive)
	}

	if adminUser.FirstName != nil {
		s = s.Set(`"first_name"`, *adminUser.FirstName)
	}

	if adminUser.LastName != nil {
		s = s.Set(`"last_name"`, *adminUser.LastName)
	}

	if adminUser.UserID != nil {
		s = s.Set(`"user_id"`, *adminUser.UserID)
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

func (r *AdminUserRepo) Delete(ctx context.Context, id string) error {
	s := r.psql.Delete(`"admin_users"`).Where(sq.Eq{`"id"`: id})

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

func (r *AdminUserRepo) UpdatePassword(ctx context.Context, id string, passwordHash string) error {
	s := r.psql.Update(`"admin_users"`).
		Set(`"password_hash"`, passwordHash).
		Where(sq.Eq{`"id"`: id})

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