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
