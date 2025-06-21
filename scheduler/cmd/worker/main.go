package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/signal"

	"gopadel/scheduler/cmd/config"
	"gopadel/scheduler/pkg/utils/slogx"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/nats-io/nats.go"
)

func main() {
	cfg := config.Load(".env")
	cfg.Print()
	
	log := cfg.Logger()
	slog.SetDefault(log)
	log.Info("Hello from scheduler worker!")

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
	defer cancel()
	ctx = slogx.NewCtx(ctx, log)

	pgConfig := cfg.PGXConfig()
	pool, err := pgxpool.NewWithConfig(ctx, pgConfig)
	if err != nil {
		log.Error("can't create new database pool", slogx.Err(err))
		os.Exit(1)
	}
	defer pool.Close()

	natsURL := cfg.NatsURL()
	natsOpts := cfg.NatsOptions()
	
	nc, err := nats.Connect(natsURL, natsOpts...)
	if err != nil {
		slog.Error("Error connecting to NATS", "error", err)
		os.Exit(1)
	}
	defer nc.Close()
	slog.Info("Connected to NATS server", "url", natsURL)

	nc.Subscribe("tasks.active", func(m *nats.Msg) {
		fmt.Printf("Received a message: %s\n", string(m.Data))
	})

	slog.Info("NATS client is running.")
	
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	<-c
	slog.Info("Shutting down...")
}