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
		`"u"."id"`, `"u"."telegram_id"`, `"u"."telegram_username"`, `"u"."first_name"`, `"u"."last_name"`, `"u"."avatar"`,
		`"u"."bio"`, `"u"."rank"`, `"u"."city"`, `"u"."birth_date"`, `"u"."playing_position"`, `"u"."padel_profiles"`, `"u"."is_registered"`,
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

	if filter.OrganizatorID != nil {
		s = s.Where(sq.Eq{`"t"."organizator_id"`: *filter.OrganizatorID})
	}

	if filter.NotEnded == nil || *filter.NotEnded {
		s = s.Where(`("t"."end_time" IS NOT NULL AND "t"."end_time" > NOW()) OR ("t"."end_time" IS NULL AND "t"."start_time" + INTERVAL '1 hour' > NOW())`)
	}

	if filter.NotFull != nil && *filter.NotFull {
		s = s.Having(`COUNT(CASE WHEN "r"."status" IN ('PENDING', 'ACTIVE') THEN 1 END) < "t"."max_users"`)
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
		var userTelegramUsername pgtype.Text
		var userFirstName, userSecondName string
		var userAvatar pgtype.Text
		var userBio pgtype.Text
		var userRank float64
		var userCity pgtype.Text
		var userBirthDate pgtype.Text
		var userPlayingPosition pgtype.Text
		var userPadelProfiles pgtype.Text
		var userIsRegistered pgtype.Bool
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
			&userTelegramUsername,
			&userFirstName,
			&userSecondName,
			&userAvatar,
			&userBio,
			&userRank,
			&userCity,
			&userBirthDate,
			&userPlayingPosition,
			&userPadelProfiles,
			&userIsRegistered,
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

		organizator := domain.User{
			ID: userID,
			UserTGData: domain.UserTGData{
				TelegramID: userTelegramID,
				FirstName:  userFirstName,
				LastName:   userSecondName,
			},
			Rank: userRank,
		}

		if userTelegramUsername.Valid {
			organizator.TelegramUsername = userTelegramUsername.String
		}
		if userAvatar.Valid {
			organizator.Avatar = userAvatar.String
		}
		if userBio.Valid {
			organizator.Bio = userBio.String
		}
		if userCity.Valid {
			organizator.City = userCity.String
		}
		if userBirthDate.Valid {
			organizator.BirthDate = userBirthDate.String
		}
		if userPlayingPosition.Valid {
			organizator.PlayingPosition = domain.PlayingPosition(userPlayingPosition.String)
		}
		if userPadelProfiles.Valid {
			organizator.PadelProfiles = userPadelProfiles.String
		}
		if userIsRegistered.Valid {
			organizator.IsRegistered = userIsRegistered.Bool
		}

		tournament.Organizator = organizator
		tournaments = append(tournaments, &tournament)
	}

	return tournaments, nil
}

func (r *TournamentRepo) GetTournamentsByUserID(ctx context.Context, userID string) ([]*domain.Tournament, error) {
	s := r.psql.Select(
		`"t"."id"`, `"t"."name"`, `"t"."start_time"`, `"t"."end_time"`, `"t"."price"`,
		`"t"."rank_min"`, `"t"."rank_max"`, `"t"."max_users"`, `"t"."description"`, `"t"."tournament_type"`,
		`"c"."id"`, `"c"."name"`, `"c"."address"`,
		`"org"."id"`, `"org"."telegram_id"`, `"org"."telegram_username"`, `"org"."first_name"`, `"org"."last_name"`, `"org"."avatar"`,
		`"org"."bio"`, `"org"."rank"`, `"org"."city"`, `"org"."birth_date"`, `"org"."playing_position"`, `"org"."padel_profiles"`, `"org"."is_registered"`,
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
		var orgTelegramUsername pgtype.Text
		var orgFirstName, orgLastName string
		var orgAvatar pgtype.Text
		var orgBio pgtype.Text
		var orgRank float64
		var orgCity pgtype.Text
		var orgBirthDate pgtype.Text
		var orgPlayingPosition pgtype.Text
		var orgPadelProfiles pgtype.Text
		var orgIsRegistered pgtype.Bool

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
			&orgTelegramUsername,
			&orgFirstName,
			&orgLastName,
			&orgAvatar,
			&orgBio,
			&orgRank,
			&orgCity,
			&orgBirthDate,
			&orgPlayingPosition,
			&orgPadelProfiles,
			&orgIsRegistered,
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

		organizator := domain.User{
			ID: orgID,
			UserTGData: domain.UserTGData{
				TelegramID: orgTelegramID,
				FirstName:  orgFirstName,
				LastName:   orgLastName,
			},
			Rank: orgRank,
		}

		if orgTelegramUsername.Valid {
			organizator.TelegramUsername = orgTelegramUsername.String
		}
		if orgAvatar.Valid {
			organizator.Avatar = orgAvatar.String
		}
		if orgBio.Valid {
			organizator.Bio = orgBio.String
		}
		if orgCity.Valid {
			organizator.City = orgCity.String
		}
		if orgBirthDate.Valid {
			organizator.BirthDate = orgBirthDate.String
		}
		if orgPlayingPosition.Valid {
			organizator.PlayingPosition = domain.PlayingPosition(orgPlayingPosition.String)
		}
		if orgPadelProfiles.Valid {
			organizator.PadelProfiles = orgPadelProfiles.String
		}
		if orgIsRegistered.Valid {
			organizator.IsRegistered = orgIsRegistered.Bool
		}

		tournament.Organizator = organizator
		tournaments = append(tournaments, &tournament)
	}

	return tournaments, nil
}

func (r *TournamentRepo) Create(ctx context.Context, tournament *domain.CreateTournament) (string, error) {
	s := r.psql.Insert(`"tournaments"`).
		Columns("name", "start_time", "end_time", "price", "rank_min", "rank_max", 
				"max_users", "description", "club_id", "tournament_type", "organizator_id").
		Values(tournament.Name, tournament.StartTime, tournament.EndTime, tournament.Price,
			   tournament.RankMin, tournament.RankMax, tournament.MaxUsers, tournament.Description,
			   tournament.ClubID, tournament.TournamentType, tournament.OrganizatorID).
		Suffix("RETURNING id")

	sql, args, err := s.ToSql()
	if err != nil {
		return "", fmt.Errorf("failed to build SQL: %w", err)
	}

	var id string
	err = r.db.QueryRow(ctx, sql, args...).Scan(&id)
	return id, err
}

func (r *TournamentRepo) Patch(ctx context.Context, id string, tournament *domain.PatchTournament) error {
	s := r.psql.Update(`"tournaments"`).Where(sq.Eq{"id": id})
	
	if tournament.Name != nil {
		s = s.Set("name", *tournament.Name)
	}
	if tournament.StartTime != nil {
		s = s.Set("start_time", *tournament.StartTime)
	}
	if tournament.EndTime != nil {
		s = s.Set("end_time", *tournament.EndTime)
	}
	if tournament.Price != nil {
		s = s.Set("price", *tournament.Price)
	}
	if tournament.RankMin != nil {
		s = s.Set("rank_min", *tournament.RankMin)
	}
	if tournament.RankMax != nil {
		s = s.Set("rank_max", *tournament.RankMax)
	}
	if tournament.MaxUsers != nil {
		s = s.Set("max_users", *tournament.MaxUsers)
	}
	if tournament.Description != nil {
		s = s.Set("description", *tournament.Description)
	}
	if tournament.ClubID != nil {
		s = s.Set("club_id", *tournament.ClubID)
	}
	if tournament.TournamentType != nil {
		s = s.Set("tournament_type", *tournament.TournamentType)
	}
	
	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	_, err = r.db.Exec(ctx, sql, args...)
	return err
}

func (r *TournamentRepo) Delete(ctx context.Context, id string) error {
	s := r.psql.Delete(`"tournaments"`).Where(sq.Eq{"id": id})
	
	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	_, err = r.db.Exec(ctx, sql, args...)
	return err
}
