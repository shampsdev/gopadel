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
	columns := []string{"id", "name", "description"}
	values := []interface{}{club.ID, club.Name, club.Description}

	if club.Url != nil {
		columns = append(columns, "url")
		values = append(values, *club.Url)
	}

	if club.IsPrivate != nil {
		columns = append(columns, "is_private")
		values = append(values, *club.IsPrivate)
	}

	s := r.psql.Insert(`"clubs"`).
		Columns(columns...).
		Values(values...)

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
	s := r.psql.Select("id", "url", "name", "is_private", "description", "created_at", "updated_at").From(`"clubs"`)

	if filter.ID != nil {
		s = s.Where(sq.Eq{"id": *filter.ID})
	}

	if filter.Name != nil {
		s = s.Where(sq.ILike{"name": fmt.Sprintf("%%%s%%", *filter.Name)})
	}

	if filter.Url != nil {
		s = s.Where(sq.Eq{"url": *filter.Url})
	}

	if filter.IsPrivate != nil {
		s = s.Where(sq.Eq{"is_private": *filter.IsPrivate})
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
			&club.Url,
			&club.Name,
			&club.IsPrivate,
			&club.Description,
			&club.CreatedAt,
			&club.UpdatedAt,
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
	s := r.psql.Select("c.id", "c.url", "c.name", "c.is_private", "c.description", "c.created_at", "c.updated_at").
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
			&club.Url,
			&club.Name,
			&club.IsPrivate,
			&club.Description,
			&club.CreatedAt,
			&club.UpdatedAt,
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

// Patch обновляет клуб
// Примечание: ID клуба нельзя изменить после создания
func (r *ClubRepo) Patch(ctx context.Context, clubID string, patch *domain.PatchClub) error {
	s := r.psql.Update(`"clubs"`).Where(sq.Eq{"id": clubID})

	if patch.Name != nil {
		s = s.Set("name", *patch.Name)
	}

	if patch.Description != nil {
		s = s.Set("description", *patch.Description)
	}

	if patch.Url != nil {
		s = s.Set("url", *patch.Url)
	}

	if patch.IsPrivate != nil {
		s = s.Set("is_private", *patch.IsPrivate)
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
		return fmt.Errorf("club with id %s not found", clubID)
	}

	return nil
}

// Delete удаляет клуб
func (r *ClubRepo) Delete(ctx context.Context, clubID string) error {
	s := r.psql.Delete(`"clubs"`).Where(sq.Eq{"id": clubID})

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	result, err := r.db.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to delete club: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("club with id %s not found", clubID)
	}

	return nil
} 