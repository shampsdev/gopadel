package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shampsdev/go-telegram-template/pkg/config"
	"github.com/shampsdev/go-telegram-template/pkg/gateways/rest"
	"github.com/shampsdev/go-telegram-template/pkg/notifications"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
	"github.com/shampsdev/go-telegram-template/pkg/utils/slogx"
)

// @title           GoPadel server
// @version         1.0
// @description     Manage chats, users, tournaments. For JWT authentication use 'Bearer <token>' format in Authorization header.
// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name X-API-Token
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	cfg := config.Load(".env")
	cfg.Print()

	log := cfg.Logger()
	slog.SetDefault(log)
	log.Info("Hello from GoPadel server!")

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

	cases := usecase.Setup(ctx, cfg, pool)
	
	var notificationService *notifications.NotificationService
	natsConn, err := cfg.ConnectNATS()
	if err != nil {
		log.Error("Failed to connect to NATS", "error", err)
		notificationService = nil
	} else {
		natsClient := notifications.NewNATSClient(natsConn, "tasks.active", cfg.Logger())
		notificationService = notifications.NewNotificationService(natsClient)
	}

	s := rest.NewServer(ctx, cfg, cases, notificationService)
	if err := s.Run(ctx); err != nil && !errors.Is(err, http.ErrServerClosed) {
		slogx.WithErr(log, err).Error("error during server shutdown")
	}
}
