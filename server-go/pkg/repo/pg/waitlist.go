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

type WaitlistRepo struct {
	db   *pgxpool.Pool
	psql sq.StatementBuilderType
}

func NewWaitlistRepo(db *pgxpool.Pool) *WaitlistRepo {
	return &WaitlistRepo{
		db:   db,
		psql: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
	}
}

func (r *WaitlistRepo) Create(ctx context.Context, waitlist *domain.CreateWaitlist) (int, error) {
	s := r.psql.Insert(`"waitlists"`).
		Columns("user_id", "tournament_id").
		Values(waitlist.UserID, waitlist.TournamentID).
		Suffix("RETURNING id")

	sql, args, err := s.ToSql()
	if err != nil {
		return 0, fmt.Errorf("failed to build SQL: %w", err)
	}

	var id int
	err = r.db.QueryRow(ctx, sql, args...).Scan(&id)
	return id, err
}

func (r *WaitlistRepo) Filter(ctx context.Context, filter *domain.FilterWaitlist) ([]*domain.Waitlist, error) {
	s := r.psql.Select(
		`"w"."id"`, `"w"."user_id"`, `"w"."tournament_id"`, `"w"."date"`,
		`"u"."id"`, `"u"."telegram_id"`, `"u"."telegram_username"`, `"u"."first_name"`, `"u"."last_name"`, `"u"."avatar"`,
		`"u"."bio"`, `"u"."rank"`, `"u"."city"`, `"u"."birth_date"`, `"u"."playing_position"`, `"u"."padel_profiles"`, `"u"."is_registered"`,
	).
		From(`"waitlists" AS w`).
		LeftJoin(`"users" AS u ON "w"."user_id" = "u"."id"`)

	if filter.ID != nil {
		s = s.Where(sq.Eq{`"w"."id"`: *filter.ID})
	}

	if filter.UserID != nil {
		s = s.Where(sq.Eq{`"w"."user_id"`: *filter.UserID})
	}

	if filter.TournamentID != nil {
		s = s.Where(sq.Eq{`"w"."tournament_id"`: *filter.TournamentID})
	}

	s = s.OrderBy(`"w"."date" ASC`)

	sql, args, err := s.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build SQL: %w", err)
	}

	rows, err := r.db.Query(ctx, sql, args...)
	if errors.Is(err, pgx.ErrNoRows) {
		return []*domain.Waitlist{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to execute SQL: %w", err)
	}
	defer rows.Close()

	waitlists := []*domain.Waitlist{}
	for rows.Next() {
		var waitlist domain.Waitlist
		var user domain.User

		// Nullable fields
		var userTelegramUsername, userAvatar, userBio, userCity, userPadelProfiles pgtype.Text
		var userBirthDate pgtype.Date
		var userPlayingPosition pgtype.Text
		var userRank pgtype.Float8
		var userIsRegistered pgtype.Bool

		err := rows.Scan(
			&waitlist.ID,
			&waitlist.UserID,
			&waitlist.TournamentID,
			&waitlist.Date,
			&user.ID,
			&user.TelegramID,
			&userTelegramUsername,
			&user.FirstName,
			&user.LastName,
			&userAvatar,
			&userBio,
			&userRank,
			&userCity,
			&userBirthDate,
			&userPlayingPosition,
			&userPadelProfiles,
			&userIsRegistered,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		// Fill nullable user fields
		if userTelegramUsername.Valid {
			user.TelegramUsername = userTelegramUsername.String
		}
		if userAvatar.Valid {
			user.Avatar = userAvatar.String
		}
		if userBio.Valid {
			user.Bio = userBio.String
		}
		if userRank.Valid {
			user.Rank = userRank.Float64
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

		waitlist.User = &user

		waitlists = append(waitlists, &waitlist)
	}

	return waitlists, nil
}

func (r *WaitlistRepo) Delete(ctx context.Context, id int) error {
	s := r.psql.Delete(`"waitlists"`).
		Where(sq.Eq{"id": id})

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	_, err = r.db.Exec(ctx, sql, args...)
	return err
} 