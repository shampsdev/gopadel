package config

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
	"github.com/lmittmann/tint"
	"github.com/nats-io/nats.go"
)

type Config struct {
	Debug  bool `default:"false" envconfig:"DEBUG"`
	NATS struct {
		URL   string `envconfig:"NATS_URL"`
		Port     uint16 `envconfig:"NATS_PORT" default:"4222"`
		Token string `envconfig:"NATS_TOKEN" default:""`
	}
	Log struct {
		Handler string `envconfig:"LOG_HANDLER" default:"tint"`
	}
}

func Load(envFile string) *Config {
	err := godotenv.Load(envFile)
	if err != nil {
		slog.Info("no .env file, parsed exported variables")
	}
	c := &Config{}
	err = envconfig.Process("", c)
	if err != nil {
		slog.Error("can't parse config", "error", err)
		os.Exit(1)
	}
	return c
}

func (c *Config) Print() {
	if c.Debug {
		slog.Info("Launched in debug mode")
		data, _ := json.MarshalIndent(c, "", "\t")
		fmt.Println("=== CONFIG ===")
		fmt.Println(string(data))
		fmt.Println("==============")
	} else {
		slog.Info("Launched in production mode")
	}
}

func (c *Config) Logger() *slog.Logger {
	if c.Log.Handler == "tint" {
		return slog.New(tint.NewHandler(os.Stdout, &tint.Options{
			Level:      slog.LevelDebug,
			TimeFormat: time.TimeOnly,
		}))
	}
	if c.Log.Handler == "json" {
		return slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
			Level: slog.LevelDebug,
		}))
	}

	panic(fmt.Sprintf("unknown log handler: %s", c.Log.Handler))
}

func (c *Config) NatsURL() string {
	url := fmt.Sprintf("nats://%s:%d", c.NATS.URL, c.NATS.Port)
	if c.NATS.URL == "" {
		url = nats.DefaultURL
	}
	return url
}

func (c *Config) NatsOptions() []nats.Option {
	opts := []nats.Option{}
	if c.NATS.Token != "" {
		opts = append(opts, nats.Token(c.NATS.Token))
	}
	return opts
}

func (c *Config) ConnectNATS() (*nats.Conn, error) {
	natsURL := c.NatsURL()
	opts := c.NatsOptions()
	
	nc, err := nats.Connect(natsURL, opts...)
	if err != nil {
		return nil, err
	}
	
	slog.Info("Connected to NATS server", "url", natsURL)
	return nc, nil
}
