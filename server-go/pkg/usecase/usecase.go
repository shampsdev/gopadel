package usecase

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shampsdev/go-telegram-template/pkg/config"
	"github.com/shampsdev/go-telegram-template/pkg/repo/pg"
	"github.com/shampsdev/go-telegram-template/pkg/repo/s3"
)

type Cases struct {
	User  *User
	Image *Image
}

func Setup(ctx context.Context, cfg *config.Config, db *pgxpool.Pool) Cases {
	userRepo := pg.NewUserRepo(db)

	storage, err := s3.NewStorage(cfg.S3)
	if err != nil {
		panic(err)
	}

	userCase := NewUser(ctx, userRepo, storage)
	imageCase := NewImage(ctx, storage)

	return Cases{
		User:  userCase,
		Image: imageCase,
	}
}
