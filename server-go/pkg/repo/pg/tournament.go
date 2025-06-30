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

type TournamentRepo struct {
	db   *pgxpool.Pool
	psql sq.StatementBuilderType
}

func NewTournamentRepo(db *pgxpool.Pool) *TournamentRepo {
	return &TournamentRepo{
		db:   db,
		psql: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
	}
}

func (r *TournamentRepo) Filter(ctx context.Context, filter *domain.FilterTournament) ([]*domain.Tournament, error) {
	s := r.psql.Select(
		`"t"."id"`, `"t"."name"`, `"t"."start_time"`, `"t"."end_time"`, `"t"."price"`,
		`"t"."rank_min"`, `"t"."rank_max"`, `"t"."max_users"`, `"t"."description"`, `"t"."tournament_type"`,
		`"c"."id"`, `"c"."name"`, `"c"."address"`,
		`"u"."id"`, `"u"."telegram_id"`, `"u"."first_name"`, `"u"."last_name"`, `"u"."avatar"`,
		`COUNT(CASE WHEN "r"."status" IN ('PENDING', 'ACTIVE') THEN 1 END) AS active_registrations`,
	).
		From(`"tournaments" AS t`).
		Join(`"clubs" AS c ON "t"."club_id" = "c"."id"`).
		Join(`"users" AS u ON "t"."organizator_id" = "u"."id"`).
		LeftJoin(`"registrations" AS r ON "t"."id" = "r"."tournament_id"`).
		GroupBy(`"t"."id"`, `"c"."id"`, `"u"."id"`)

	if filter.ID != "" {
		s = s.Where(sq.Eq{`"t"."id"`: filter.ID})
	}

	if filter.Name != "" {
		s = s.Where(sq.ILike{`"t"."name"`: "%" + filter.Name + "%"})
	}

	if filter.IsAvalible {
		s = s.Having(`"t"."start_time" > NOW() AND COUNT(CASE WHEN "r"."status" IN ('PENDING', 'ACTIVE') THEN 1 END) < "t"."max_users"`)
	}

	s = s.OrderBy(`"t"."start_time" ASC`)

	sql, args, err := s.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build SQL: %w", err)
	}

	rows, err := r.db.Query(ctx, sql, args...)
	if errors.Is(err, pgx.ErrNoRows) {
		return []*domain.Tournament{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to execute SQL: %w", err)
	}
	defer rows.Close()

	tournaments := []*domain.Tournament{}
	for rows.Next() {
		var tournament domain.Tournament
		var endTime pgtype.Timestamp
		var description pgtype.Text
		var clubID, clubName, clubAddress string
		var userID string
		var userTelegramID int64
		var userFirstName, userSecondName string
		var userAvatar pgtype.Text
		var activeRegistrations int

		err := rows.Scan(
			&tournament.ID,
			&tournament.Name,
			&tournament.StartTime,
			&endTime,
			&tournament.Price,
			&tournament.RankMin,
			&tournament.RankMax,
			&tournament.MaxUsers,
			&description,
			&tournament.TournamentType,
			&clubID,
			&clubName,
			&clubAddress,
			&userID,
			&userTelegramID,
			&userFirstName,
			&userSecondName,
			&userAvatar,
			&activeRegistrations,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		if endTime.Valid {
			tournament.EndTime = endTime.Time
		}
		if description.Valid {
			tournament.Description = description.String
		}

		tournament.Club = domain.Club{
			ID:      clubID,
			Name:    clubName,
			Address: clubAddress,
		}

		tournament.Organizator = domain.User{
			ID: userID,
			UserTGData: domain.UserTGData{
				TelegramID: userTelegramID,
				FirstName:  userFirstName,
				LastName:   userSecondName,
			},
		}
		if userAvatar.Valid {
			tournament.Organizator.Avatar = userAvatar.String
		}

		tournaments = append(tournaments, &tournament)
	}

	return tournaments, nil
}

func (r *TournamentRepo) GetTournamentsByUserID(ctx context.Context, userID string) ([]*domain.Tournament, error) {
	s := r.psql.Select(
		`"t"."id"`, `"t"."name"`, `"t"."start_time"`, `"t"."end_time"`, `"t"."price"`,
		`"t"."rank_min"`, `"t"."rank_max"`, `"t"."max_users"`, `"t"."description"`, `"t"."tournament_type"`,
		`"c"."id"`, `"c"."name"`, `"c"."address"`,
		`"org"."id"`, `"org"."telegram_id"`, `"org"."first_name"`, `"org"."last_name"`, `"org"."avatar"`,
	).
		From(`"tournaments" AS t`).
		Join(`"registrations" AS reg ON "t"."id" = "reg"."tournament_id"`).
		Join(`"users" AS u ON "reg"."user_id" = "u"."id"`).
		Join(`"clubs" AS c ON "t"."club_id" = "c"."id"`).
		Join(`"users" AS org ON "t"."organizator_id" = "org"."id"`).
		Where(sq.Eq{`"u"."id"`: userID}).
		Where(sq.Eq{`"reg"."status"`: []string{"ACTIVE", "CANCELED"}}).
		OrderBy(`"t"."start_time" ASC`)

	sql, args, err := s.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build SQL: %w", err)
	}

	rows, err := r.db.Query(ctx, sql, args...)
	if errors.Is(err, pgx.ErrNoRows) {
		return []*domain.Tournament{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to execute SQL: %w", err)
	}
	defer rows.Close()

	tournaments := []*domain.Tournament{}
	for rows.Next() {
		var tournament domain.Tournament
		var endTime pgtype.Timestamp
		var description pgtype.Text
		var clubID, clubName, clubAddress string
		var orgID string
		var orgTelegramID int64
		var orgFirstName, orgLastName string
		var orgAvatar pgtype.Text

		err := rows.Scan(
			&tournament.ID,
			&tournament.Name,
			&tournament.StartTime,
			&endTime,
			&tournament.Price,
			&tournament.RankMin,
			&tournament.RankMax,
			&tournament.MaxUsers,
			&description,
			&tournament.TournamentType,
			&clubID,
			&clubName,
			&clubAddress,
			&orgID,
			&orgTelegramID,
			&orgFirstName,
			&orgLastName,
			&orgAvatar,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		if endTime.Valid {
			tournament.EndTime = endTime.Time
		}
		if description.Valid {
			tournament.Description = description.String
		}

		tournament.Club = domain.Club{
			ID:      clubID,
			Name:    clubName,
			Address: clubAddress,
		}

		tournament.Organizator = domain.User{
			ID: orgID,
			UserTGData: domain.UserTGData{
				TelegramID: orgTelegramID,
				FirstName:  orgFirstName,
				LastName:   orgLastName,
			},
		}
		if orgAvatar.Valid {
			tournament.Organizator.Avatar = orgAvatar.String
		}

		tournaments = append(tournaments, &tournament)
	}

	return tournaments, nil
}
