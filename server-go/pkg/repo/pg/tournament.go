package pg

import (
	"context"

	sq "github.com/Masterminds/squirrel"
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

func (r *TournamentRepo) Filter(ctx context.Context, filter *domain.Tournament) ([]*domain.Tournament, error) {
	return nil, nil
}
