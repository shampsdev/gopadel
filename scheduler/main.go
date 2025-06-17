package main

import (
	"log/slog"
	"os"
	"os/signal"

	"gopadel/scheduler/config"

	"github.com/nats-io/nats.go"
)

func main() {
	cfg := config.Load(".env")
	
	logger := cfg.Logger()
	slog.SetDefault(logger)

	cfg.Print()

	natsURL := cfg.NatsURL()
	natsOpts := cfg.NatsOptions()

	nc, err := nats.Connect(natsURL, natsOpts...)
	if err != nil {
		slog.Error("Error connecting to NATS", "error", err)
		os.Exit(1)
	}
	defer nc.Close()
	slog.Info("Connected to NATS server", "url", natsURL)

	slog.Info("NATS client is running. Press Ctrl+C to exit.")
	
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	<-c
	slog.Info("Shutting down...")
}