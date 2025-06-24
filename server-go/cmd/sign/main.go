package main

import (
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/shampsdev/go-telegram-template/pkg/config"
	initdata "github.com/telegram-mini-apps/init-data-golang"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		panic(err)
	}
	initData := os.Getenv("INIT_DATA")

	authDate := time.Now()
	cfg := config.Load(".env")

	hash, err := initdata.SignQueryString(initData, cfg.TG.BotToken, authDate)
	if err != nil {
		panic(err)
	}
	initData += "&hash=" + hash
	initData += fmt.Sprintf("&auth_date=%d", authDate.Unix())
	fmt.Println(initData)
}
