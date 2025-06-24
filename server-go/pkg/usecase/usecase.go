package usecase

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shampsdev/go-telegram-template/pkg/config"
	"github.com/shampsdev/go-telegram-template/pkg/repo/pg"
	"github.com/shampsdev/go-telegram-template/pkg/repo/s3"
)

type Cases struct {
	Cat  *Cat
	User *User
}

func Setup(ctx context.Context, cfg *config.Config, db *pgxpool.Pool) Cases {
	userRepo := pg.NewUserRepo(db)
	catRepo := pg.NewCatRepo(db)

	storage, err := s3.NewStorage(cfg.S3)
	if err != nil {
		panic(err)
	}

	userCase := NewUser(ctx, userRepo, storage)
	catCase := NewCat(catRepo)

	return Cases{
		Cat:  catCase,
		User: userCase,
	}
}
