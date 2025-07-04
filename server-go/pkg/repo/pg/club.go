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

type ClubRepo struct {
	db   *pgxpool.Pool
	psql sq.StatementBuilderType
}

func NewClubRepo(db *pgxpool.Pool) *ClubRepo {
	return &ClubRepo{
		db:   db,
		psql: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
	}
}

func (r *ClubRepo) Create(ctx context.Context, club *domain.CreateClub) error {
	s := r.psql.Insert(`"clubs"`).
		Columns("id", "name", "description").
		Values(club.ID, club.Name, club.Description)

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	_, err = r.db.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to create club: %w", err)
	}

	return nil
}

func (r *ClubRepo) Filter(ctx context.Context, filter *domain.FilterClub) ([]*domain.Club, error) {
	s := r.psql.Select("id", "name", "description", "created_at").From(`"clubs"`)

	if filter.ID != nil {
		s = s.Where(sq.Eq{"id": *filter.ID})
	}

	if filter.Name != nil {
		s = s.Where(sq.ILike{"name": fmt.Sprintf("%%%s%%", *filter.Name)})
	}

	sql, args, err := s.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build SQL: %w", err)
	}

	rows, err := r.db.Query(ctx, sql, args...)
	if errors.Is(err, pgx.ErrNoRows) {
		return []*domain.Club{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to execute SQL: %w", err)
	}
	defer rows.Close()

	clubs := []*domain.Club{}
	for rows.Next() {
		var club domain.Club

		err := rows.Scan(
			&club.ID,
			&club.Name,
			&club.Description,
			&club.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		clubs = append(clubs, &club)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return clubs, nil
}

func (r *ClubRepo) JoinClub(ctx context.Context, clubID, userID string) error {
	s := r.psql.Insert(`"clubs_users"`).
		Columns("club_id", "user_id").
		Values(clubID, userID)

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	_, err = r.db.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to join club: %w", err)
	}

	return nil
}

func (r *ClubRepo) GetUserClubs(ctx context.Context, userID string) ([]*domain.Club, error) {
	s := r.psql.Select("c.id", "c.name", "c.description", "c.created_at").
		From(`"clubs" c`).
		Join(`"clubs_users" cu ON c.id = cu.club_id`).
		Where(sq.Eq{"cu.user_id": userID})

	sql, args, err := s.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build SQL: %w", err)
	}

	rows, err := r.db.Query(ctx, sql, args...)
	if errors.Is(err, pgx.ErrNoRows) {
		return []*domain.Club{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to execute SQL: %w", err)
	}
	defer rows.Close()

	clubs := []*domain.Club{}
	for rows.Next() {
		var club domain.Club

		err := rows.Scan(
			&club.ID,
			&club.Name,
			&club.Description,
			&club.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		clubs = append(clubs, &club)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return clubs, nil
} 