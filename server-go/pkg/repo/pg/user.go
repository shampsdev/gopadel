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
	s := r.psql.Insert(`"users"`).
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
	s := r.psql.Select(
		`DISTINCT "u"."id"`, `"u"."telegram_id"`, `"u"."telegram_username"`, `"u"."first_name"`, `"u"."last_name"`, `"u"."avatar"`,
		`"u"."bio"`, `"u"."rank"`, `"u"."city"`, `"u"."birth_date"`, `"u"."playing_position"`, `"u"."padel_profiles"`,
		`"u"."is_registered"`, `"l"."id"`, `"l"."name"`, `"l"."discount"`, `"l"."description"`,
	).Join(`"loyalties" AS l ON "u"."loyalty_id" = "l"."id"`).From(`"users" AS u`)

	if filter.ID != nil {
		s = s.Where(sq.Eq{`"u"."id"`: *filter.ID})
	}

	if filter.TelegramID != nil {
		s = s.Where(sq.Eq{`"u"."telegram_id"`: *filter.TelegramID})
	}

	if filter.TelegramUsername != nil {
		s = s.Where(sq.ILike{`"u"."telegram_username"`: "%" + *filter.TelegramUsername + "%"})
	}

	if filter.FirstName != nil {
		s = s.Where(sq.ILike{`"u"."first_name"`: "%" + *filter.FirstName + "%"})
	}

	if filter.LastName != nil {
		s = s.Where(sq.ILike{`"u"."last_name"`: "%" + *filter.LastName + "%"})
	}

	// Фильтрация по общим клубам
	if filter.FilterByUserClubs != nil {
		s = s.Join(`"clubs_users" AS cu ON "u"."id" = "cu"."user_id"`).
			Join(`"clubs_users" AS cu_filter ON "cu"."club_id" = "cu_filter"."club_id"`).
			Where(sq.Eq{`"cu_filter"."user_id"`: *filter.FilterByUserClubs}).
			Where(sq.NotEq{`"u"."id"`: *filter.FilterByUserClubs}) // исключаем самого пользователя
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
		var telegramUsername, avatar, bio, city, padelProfiles pgtype.Text
		var birthDate pgtype.Date
		var playingPosition pgtype.Text
		var rank pgtype.Float8
		var isRegistered pgtype.Bool
		var loyaltyID pgtype.Int4
		var loyaltyName pgtype.Text
		var loyaltyDiscount pgtype.Int4
		var loyaltyDescription pgtype.Text

		err := rows.Scan(
			&user.ID,
			&user.TelegramID,
			&telegramUsername,
			&user.FirstName,
			&user.LastName,
			&avatar,
			&bio,
			&rank,
			&city,
			&birthDate,
			&playingPosition,
			&padelProfiles,
			&isRegistered,
			&loyaltyID,
			&loyaltyName,
			&loyaltyDiscount,
			&loyaltyDescription,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		if telegramUsername.Valid {
			user.TelegramUsername = telegramUsername.String
		}
		if avatar.Valid {
			user.Avatar = avatar.String
		}
		if bio.Valid {
			user.Bio = bio.String
		}
		if rank.Valid {
			user.Rank = rank.Float64
		}
		if city.Valid {
			user.City = city.String
		}
		if birthDate.Valid {
			user.BirthDate = birthDate.Time.Format("2006-01-02")
		}
		if playingPosition.Valid {
			user.PlayingPosition = domain.PlayingPosition(playingPosition.String)
		}
		if padelProfiles.Valid {
			user.PadelProfiles = padelProfiles.String
		}
		if isRegistered.Valid {
			user.IsRegistered = isRegistered.Bool
		}

		if loyaltyName.Valid {
			user.Loyalty = &domain.Loyalty{
				ID:           int(loyaltyID.Int32),
				Name:         loyaltyName.String,
				Discount:     int(loyaltyDiscount.Int32),
				Description:  loyaltyDescription.String,
				Requirements: "", // Оставляем пустым чтобы избежать проблем с JSON типом
			}
		}

		users = append(users, &user)
	}

	return users, nil
}

func (r *UserRepo) Patch(ctx context.Context, id string, user *domain.PatchUser) error {
	s := r.psql.Update(`"users"`).Where(sq.Eq{"id": id})
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
	if user.Bio != nil {
		s = s.Set("bio", *user.Bio)
	}
	if user.Rank != nil {
		s = s.Set("rank", *user.Rank)
	}
	if user.City != nil {
		s = s.Set("city", *user.City)
	}
	if user.BirthDate != nil {
		s = s.Set("birth_date", *user.BirthDate)
	}
	if user.PlayingPosition != nil {
		s = s.Set("playing_position", *user.PlayingPosition)
	}
	if user.PadelProfiles != nil {
		s = s.Set("padel_profiles", *user.PadelProfiles)
	}
	if user.IsRegistered != nil {
		s = s.Set("is_registered", true)
	}
	if user.LoyaltyID != nil {
		s = s.Set("loyalty_id", *user.LoyaltyID)
	}
	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	result, err := r.db.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}
	
	if result.RowsAffected() == 0 {
		return fmt.Errorf("user with id %s not found", id)
	}
	
	return nil
}

func (r *UserRepo) Delete(ctx context.Context, id string) error {
	s := r.psql.Delete(`"users"`).
		Where(sq.Eq{"id": id})
	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}
	_, err = r.db.Exec(ctx, sql, args...)
	return err
}
