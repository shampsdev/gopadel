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
		`"a"."id"`, `"a"."username"`, `"a"."password_hash"`, `"a"."is_superuser"`, `"a"."is_active"`, `"a"."first_name"`, `"a"."last_name"`, `"a"."user_id"`,
		`"u"."id"`, `"u"."telegram_id"`, `"u"."telegram_username"`, `"u"."first_name"`, `"u"."last_name"`, `"u"."avatar"`,
		`"u"."bio"`, `"u"."rank"`, `"u"."city"`, `"u"."birth_date"`, `"u"."playing_position"`, `"u"."padel_profiles"`,
		`"u"."is_registered"`, `"l"."id"`, `"l"."name"`, `"l"."discount"`, `"l"."description"`, `"l"."requirements"`,
	).From(`"admin_users" AS a`).
		LeftJoin(`"users" AS u ON "a"."user_id" = "u"."id"`).
		LeftJoin(`"loyalties" AS l ON "u"."loyalty_id" = "l"."id"`)

	if filter.ID != nil {
		s = s.Where(sq.Eq{`"a"."id"`: *filter.ID})
	}

	if filter.Username != nil {
		s = s.Where(sq.ILike{`"a"."username"`: "%" + *filter.Username + "%"})
	}

	if filter.IsSuperUser != nil {
		s = s.Where(sq.Eq{`"a"."is_superuser"`: *filter.IsSuperUser})
	}

	if filter.IsActive != nil {
		s = s.Where(sq.Eq{`"a"."is_active"`: *filter.IsActive})
	}

	if filter.FirstName != nil {
		s = s.Where(sq.ILike{`"a"."first_name"`: "%" + *filter.FirstName + "%"})
	}

	if filter.LastName != nil {
		s = s.Where(sq.ILike{`"a"."last_name"`: "%" + *filter.LastName + "%"})
	}

	if filter.UserID != nil {
		s = s.Where(sq.Eq{`"a"."user_id"`: *filter.UserID})
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
		var user domain.User
		var loyalty domain.Loyalty
		
		// Admin fields
		var adminUsername, adminPasswordHash, adminFirstName, adminLastName, adminUserID pgtype.Text
		
		// User fields
		var userID, userTelegramUsername, userFirstName, userLastName, userAvatar, userBio, userCity, userPlayingPosition, userPadelProfiles pgtype.Text
		var userTelegramID, userRank pgtype.Int8
		var userIsRegistered pgtype.Bool
		var userBirthDate pgtype.Date
		
		// Loyalty fields
		var loyaltyID, loyaltyDiscount pgtype.Int8
		var loyaltyName, loyaltyDescription, loyaltyRequirements pgtype.Text

		err := rows.Scan(
			// Admin fields
			&adminUser.ID,
			&adminUsername,
			&adminPasswordHash,
			&adminUser.IsSuperUser,
			&adminUser.IsActive,
			&adminFirstName,
			&adminLastName,
			&adminUserID,
			// User fields
			&userID,
			&userTelegramID,
			&userTelegramUsername,
			&userFirstName,
			&userLastName,
			&userAvatar,
			&userBio,
			&userRank,
			&userCity,
			&userBirthDate,
			&userPlayingPosition,
			&userPadelProfiles,
			&userIsRegistered,
			// Loyalty fields
			&loyaltyID,
			&loyaltyName,
			&loyaltyDiscount,
			&loyaltyDescription,
			&loyaltyRequirements,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		// Fill admin fields
		if adminUsername.Valid {
			adminUser.Username = adminUsername.String
		}
		if adminPasswordHash.Valid {
			adminUser.PasswordHash = adminPasswordHash.String
		}
		if adminFirstName.Valid {
			adminUser.FirstName = adminFirstName.String
		}
		if adminLastName.Valid {
			adminUser.LastName = adminLastName.String
		}
		if adminUserID.Valid {
			adminUser.UserID = adminUserID.String
		}

		// Fill user fields if user exists
		if userID.Valid {
			user.ID = userID.String
			
			if userTelegramID.Valid {
				user.TelegramID = userTelegramID.Int64
			}
			if userTelegramUsername.Valid {
				user.TelegramUsername = userTelegramUsername.String
			}
			if userFirstName.Valid {
				user.FirstName = userFirstName.String
			}
			if userLastName.Valid {
				user.LastName = userLastName.String
			}
			if userAvatar.Valid {
				user.Avatar = userAvatar.String
			}
			if userBio.Valid {
				user.Bio = userBio.String
			}
			if userRank.Valid {
				user.Rank = float64(userRank.Int64)
			}
			if userCity.Valid {
				user.City = userCity.String
			}
			if userBirthDate.Valid {
				user.BirthDate = userBirthDate.Time.Format("2006-01-02")
			}
			if userPlayingPosition.Valid {
				user.PlayingPosition = domain.PlayingPosition(userPlayingPosition.String)
			}
			if userPadelProfiles.Valid {
				user.PadelProfiles = userPadelProfiles.String
			}
			if userIsRegistered.Valid {
				user.IsRegistered = userIsRegistered.Bool
			}

			// Fill loyalty if exists
			if loyaltyID.Valid {
				loyalty.ID = int(loyaltyID.Int64)
				
				if loyaltyName.Valid {
					loyalty.Name = loyaltyName.String
				}
				if loyaltyDiscount.Valid {
					loyalty.Discount = int(loyaltyDiscount.Int64)
				}
				if loyaltyDescription.Valid {
					loyalty.Description = loyaltyDescription.String
				}
				if loyaltyRequirements.Valid {
					loyalty.Requirements = loyaltyRequirements.String
				}
				
				user.Loyalty = &loyalty
			}
			
			adminUser.User = &user
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