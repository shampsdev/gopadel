package pg

import (
	"context"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RegistrationRepo struct {
	db   *pgxpool.Pool
	psql sq.StatementBuilderType
}

func NewRegistrationRepo(db *pgxpool.Pool) *RegistrationRepo {
	return &RegistrationRepo{
		db:   db,
		psql: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
	}
}

func (r *RegistrationRepo) SetCanceledStatus(ctx context.Context, id string) error {
	query, args, err := r.psql.Update("registrations").
		Set("status", "CANCELED").
		Where(sq.Eq{"id": id}).
		ToSql()
	if err != nil {
		return err
	}

	_, err = r.db.Exec(ctx, query, args...)
	if err != nil {
		return err
	}

	return nil
}