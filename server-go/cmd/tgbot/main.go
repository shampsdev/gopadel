package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shampsdev/go-telegram-template/pkg/config"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/tg"
	"github.com/shampsdev/go-telegram-template/pkg/utils/slogx"
)

func main() {
	cfg := config.Load(".env")
	cfg.Print()

	log := cfg.Logger()
	slog.SetDefault(log)
	log.Info("Hello from tglinked tgbot!")

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
	defer cancel()

	pgConfig := cfg.PGXConfig()
	pool, err := pgxpool.NewWithConfig(ctx, pgConfig)
	if err != nil {
		slogx.Fatal(log, "can't create new database pool")
	}
	defer pool.Close()

	b, err := tg.NewBot(ctx, cfg, pool)
	if err != nil {
		slogx.Fatal(log, "can't create new telegram bot")
	}

	b.Run(ctx)
}
