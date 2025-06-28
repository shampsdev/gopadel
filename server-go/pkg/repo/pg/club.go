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

func (r *ClubRepo) Create(ctx context.Context, club *domain.CreateClub) (string, error) {
	s := r.psql.Insert(`"clubs"`).
		Columns("name", "address").
		Values(club.Name, club.Address).
		Suffix("RETURNING id")

	sql, args, err := s.ToSql()
	if err != nil {
		return "", fmt.Errorf("failed to build SQL: %w", err)
	}

	var id string
	err = r.db.QueryRow(ctx, sql, args...).Scan(&id)
	if err != nil {
		return "", fmt.Errorf("failed to create club: %w", err)
	}

	return id, nil
}

func (r *ClubRepo) Filter(ctx context.Context, filter *domain.FilterClub) ([]*domain.Club, error) {
	s := r.psql.Select("id", "name", "address").From(`"clubs"`)

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
			&club.Address,
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

func (r *ClubRepo) Patch(ctx context.Context, id string, club *domain.PatchClub) error {
	s := r.psql.Update(`"clubs"`).Where(sq.Eq{"id": id})

	hasUpdates := false

	if club.Name != nil {
		s = s.Set("name", *club.Name)
		hasUpdates = true
	}

	if club.Address != nil {
		s = s.Set("address", *club.Address)
		hasUpdates = true
	}

	if !hasUpdates {
		return fmt.Errorf("no fields to update")
	}

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	result, err := r.db.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to update club: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("club with id %s not found", id)
	}

	return nil
}

func (r *ClubRepo) Delete(ctx context.Context, id string) error {
	s := r.psql.Delete(`"clubs"`).Where(sq.Eq{"id": id})

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	result, err := r.db.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to delete club: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("club with id %s not found", id)
	}

	return nil
}

// GetByID получает клуб по ID (вспомогательный метод)
func (r *ClubRepo) GetByID(ctx context.Context, id string) (*domain.Club, error) {
	filter := &domain.FilterClub{ID: &id}
	clubs, err := r.Filter(ctx, filter)
	if err != nil {
		return nil, err
	}

	if len(clubs) == 0 {
		return nil, fmt.Errorf("club with id %s not found", id)
	}

	return clubs[0], nil
}
