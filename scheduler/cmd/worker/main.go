package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"time"

	"gopadel/scheduler/cmd/config"
	"gopadel/scheduler/pkg/handler"
	"gopadel/scheduler/pkg/repo/pg"
	"gopadel/scheduler/pkg/telegram"
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

	telegramToken := cfg.TelegramToken()
	telegramClient, err := telegram.NewClient(telegramToken)
	if err != nil {
		slog.Error("Error creating Telegram client", "error", err)
		os.Exit(1)
	}

	taskRepo := pg.NewTaskRepo(pool)
	taskHandler := handler.NewTaskHandler(taskRepo, telegramClient, cfg)

	nc.Subscribe("tasks.active", func(m *nats.Msg) {
		task, err := taskHandler.HandleTaskMessage(ctx, m)
		if err != nil {
			log.Error("Error handling task message", slogx.Err(err))
			return
		}
		log.Info("Task message handled", "task", task)
	})

	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				slog.Info("Task scheduler stopped")
				return
			case <-ticker.C:
				if err := taskHandler.ProcessReadyTasks(ctx); err != nil {
					slog.Error("Error processing ready tasks", "error", err)
				}
			}
		}
	}()

	slog.Info("Worker is running. NATS consumer and task scheduler are active.")
	
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	<-c
	slog.Info("Shutting down...")
}