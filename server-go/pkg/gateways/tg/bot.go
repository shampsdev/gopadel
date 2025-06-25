package tg

import (
	"context"
	"fmt"
	"log/slog"
	"os"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shampsdev/go-telegram-template/pkg/config"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
	"github.com/shampsdev/go-telegram-template/pkg/utils/slogx"
)

type Bot struct {
	*bot.Bot
	cases    usecase.Cases
	log      *slog.Logger
	messages *BotMessages

	botUrl    string
	webAppUrl string
}

func NewBot(ctx context.Context, cfg *config.Config, pool *pgxpool.Pool) (*Bot, error) {
	opts := []bot.Option{}

	if cfg.Debug {
		opts = append(opts, bot.WithDebug())
	}
	tgb, err := bot.New(cfg.TG.BotToken, opts...)
	if err != nil {
		return nil, fmt.Errorf("error creating bot: %w", err)
	}
	cases := usecase.Setup(ctx, cfg, pool)

	b := &Bot{
		Bot:      tgb,
		cases:    cases,
		log:      slogx.FromCtx(ctx),
		messages: NewBotMessages(),
	}

	me, err := b.GetMe(context.Background())
	if err != nil {
		return nil, fmt.Errorf("error getting bot info: %w", err)
	}
	b.webAppUrl = fmt.Sprintf("https://t.me/%s/%s", me.Username, cfg.TG.WebAppName)
	b.botUrl = fmt.Sprintf("https://t.me/%s", me.Username)

	return b, nil
}

func (b *Bot) Run(ctx context.Context) {
	_, err := b.SetMyCommands(ctx, &bot.SetMyCommandsParams{
		Commands: []models.BotCommand{
			{Command: "start", Description: "Запустить бота"},
		},
	})
	if err != nil {
		panic(fmt.Errorf("error setting bot commands: %w", err))
	}

	b.RegisterHandler(bot.HandlerTypeMessageText, "/start", bot.MatchTypeExact, b.handleCommandStart)
	b.RegisterHandlerMatchFunc(func(update *models.Update) bool {
		return update.Message != nil && update.Message.Text != "" && update.Message.Text != "/start"
	}, b.handleAnyText)
	b.Start(ctx)
}

func (b *Bot) handleCommandStart(ctx context.Context, _ *bot.Bot, update *models.Update) {
	videoFile, err := os.Open("assets/gopadel-hello.mp4")
	if err != nil {
		slogx.FromCtxWithErr(ctx, err).Error("error opening video file")
		_, err = b.SendMessage(ctx, &bot.SendMessageParams{
			ChatID:    update.Message.Chat.ID,
			Text:      b.messages.Welcome(),
			ReplyMarkup: &models.InlineKeyboardMarkup{
				InlineKeyboard: [][]models.InlineKeyboardButton{
					{{Text: "Присоединиться к нам!", URL: b.webAppUrl}},
				},
			},
			ParseMode: models.ParseModeMarkdown,
		})
		if err != nil {
			slogx.FromCtxWithErr(ctx, err).Error("error sending message")
		}
		return
	}
	defer videoFile.Close()

	_, err = b.SendVideo(ctx, &bot.SendVideoParams{
		ChatID: update.Message.Chat.ID,
		Video: &models.InputFileUpload{
			Filename: "gopadel-hello.mp4",
			Data:     videoFile,
		},
		Caption: b.messages.Welcome(),
		ReplyMarkup: &models.InlineKeyboardMarkup{
			InlineKeyboard: [][]models.InlineKeyboardButton{
				{{Text: "Присоединиться к нам!", URL: b.webAppUrl}},
			},
		},
		ParseMode: models.ParseModeMarkdown,
	})
	if err != nil {
		slogx.FromCtxWithErr(ctx, err).Error("error sending video")
	}
}

func (b *Bot) handleAnyText(ctx context.Context, _ *bot.Bot, update *models.Update) {
	_, err := b.SendMessage(ctx, &bot.SendMessageParams{
		ChatID:    update.Message.Chat.ID,
		Text:      b.messages.UnknownCommand(),
		ParseMode: models.ParseModeMarkdown,
		ReplyMarkup: &models.InlineKeyboardMarkup{
			InlineKeyboard: [][]models.InlineKeyboardButton{
				{{Text: "Присоединиться к нам!", URL: b.webAppUrl}},
			},
		},
	})
	if err != nil {
		slogx.FromCtxWithErr(ctx, err).Error("error sending message")
	}
}	
