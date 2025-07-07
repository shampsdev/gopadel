package config

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
	"github.com/lmittmann/tint"
	"github.com/shampsdev/go-telegram-template/pkg/utils/slogx"
)

type Config struct {
	Debug  bool `default:"false" envconfig:"DEBUG"`
	Server struct {
		Port uint16 `envconfig:"HTTP_PORT" default:"8000"`
		Host string `envconfig:"HTTP_HOST" default:"0.0.0.0"`
	}
	DB struct {
		User     string `envconfig:"POSTGRES_USER"`
		Password string `envconfig:"POSTGRES_PASSWORD"`
		Host     string `envconfig:"POSTGRES_HOST"`
		Port     uint16 `envconfig:"POSTGRES_PORT"`
		Database string `envconfig:"POSTGRES_DB"`
	}
	TG struct {
		BotToken   string `envconfig:"TG_BOT_TOKEN"`
		WebAppName string `envconfig:"WEBAPP_NAME"`
	}
	Storage struct {
		ImagesPath string `envconfig:"STORAGE_IMAGES_PATH" default:"images"`
	}
	Log struct {
		Handler string `envconfig:"LOG_HANDLER" default:"tint"`
	}
	YooKassa struct {
		ShopID    string `envconfig:"SHOP_ID"`
		SecretKey string `envconfig:"SHOP_SECRET"`
	}
	JWT struct {
		SecretKey            string        `envconfig:"JWT_SECRET_KEY"`
		AccessTokenExpireHours int         `envconfig:"JWT_ACCESS_TOKEN_EXPIRE_HOURS" default:"24"`
	}
	CORS struct {
		AllowedOrigins []string `envconfig:"CORS_ALLOWED_ORIGINS" default:"http://localhost:3000,https://miniapp.gopadel.group"`
		AllowCredentials bool   `envconfig:"CORS_ALLOW_CREDENTIALS" default:"true"`
	}
	S3 S3Config
}

type S3Config struct {
	AccessKeyID   string `envconfig:"S3_ACCESS_KEY_ID"`
	SecretKey     string `envconfig:"S3_SECRET_KEY"`
	Region        string `envconfig:"S3_REGION"`
	Bucket        string `envconfig:"S3_BUCKET"`
	EndpointUrl   string `envconfig:"S3_ENDPOINT_URL"`
	RootDirectory string `envconfig:"S3_ROOT_DIRECTORY"`
}

func Load(envFile string) *Config {
	err := godotenv.Load(envFile)
	if err != nil {
		slog.Info("no .env file, parsed exported variables")
	}
	c := &Config{}
	err = envconfig.Process("", c)
	if err != nil {
		slogx.Fatal(slog.Default(), "can't parse config", slogx.Err(err))
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

func (c *Config) DBUrl() string {
	return fmt.Sprintf(
		"postgres://%s:%s@%s:%d/%s?sslmode=disable",
		c.DB.User,
		c.DB.Password,
		c.DB.Host,
		c.DB.Port,
		c.DB.Database,
	)
}

func (c *Config) PGXConfig() *pgxpool.Config {
	pgxConfig, err := pgxpool.ParseConfig(c.DBUrl())
	if err != nil {
		slogx.WithErr(slog.Default(), err).Error("can't parse pgx config")
		panic(err)
	}
	return pgxConfig
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
