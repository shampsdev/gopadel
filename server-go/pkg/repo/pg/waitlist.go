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
		`"t"."id"`, `"t"."name"`, `"t"."start_time"`, `"t"."end_time"`, `"t"."price"`,
		`"t"."rank_min"`, `"t"."rank_max"`, `"t"."max_users"`, `"t"."description"`, `"t"."tournament_type"`,
		`"c"."id"`, `"c"."name"`, `"c"."address"`,
		`"org"."id"`, `"org"."telegram_id"`, `"org"."first_name"`, `"org"."last_name"`, `"org"."avatar"`,
	).
		From(`"waitlists" AS w`).
		LeftJoin(`"users" AS u ON "w"."user_id" = "u"."id"`).
		LeftJoin(`"tournaments" AS t ON "w"."tournament_id" = "t"."id"`).
		LeftJoin(`"clubs" AS c ON "t"."club_id" = "c"."id"`).
		LeftJoin(`"users" AS org ON "t"."organizator_id" = "org"."id"`)

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
		var tournament domain.Tournament
		var club domain.Club
		var organizator domain.User

		// Nullable fields
		var userTelegramUsername, userAvatar, userBio, userCity, userPadelProfiles pgtype.Text
		var userBirthDate pgtype.Date
		var userPlayingPosition pgtype.Text
		var userRank pgtype.Float8
		var userIsRegistered pgtype.Bool

		var tournamentEndTime pgtype.Timestamp
		var tournamentDescription pgtype.Text

		var organizatorAvatar pgtype.Text

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
			&tournament.ID,
			&tournament.Name,
			&tournament.StartTime,
			&tournamentEndTime,
			&tournament.Price,
			&tournament.RankMin,
			&tournament.RankMax,
			&tournament.MaxUsers,
			&tournamentDescription,
			&tournament.TournamentType,
			&club.ID,
			&club.Name,
			&club.Address,
			&organizator.ID,
			&organizator.TelegramID,
			&organizator.FirstName,
			&organizator.LastName,
			&organizatorAvatar,
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

		// Fill nullable tournament fields
		if tournamentEndTime.Valid {
			tournament.EndTime = tournamentEndTime.Time
		}
		if tournamentDescription.Valid {
			tournament.Description = tournamentDescription.String
		}

		// Fill nullable organizator fields
		if organizatorAvatar.Valid {
			organizator.Avatar = organizatorAvatar.String
		}

		// Set related entities
		tournament.Club = club
		tournament.Organizator = organizator
		waitlist.User = &user
		waitlist.Tournament = &tournament

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