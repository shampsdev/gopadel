package tg

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shampsdev/go-telegram-template/pkg/config"
	"github.com/shampsdev/go-telegram-template/pkg/usecase"
	"github.com/shampsdev/go-telegram-template/pkg/utils/slogx"
)

type Bot struct {
	*bot.Bot
	cases usecase.Cases
	log   *slog.Logger

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
		Bot:   tgb,
		cases: cases,
		log:   slogx.FromCtx(ctx),
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
		Commands: []models.BotCommand{},
	})
	if err != nil {
		panic(fmt.Errorf("error setting bot commands: %w", err))
	}

	b.RegisterHandler(bot.HandlerTypeMessageText, "/start", bot.MatchTypeExact, b.handleCommandStart)
	b.RegisterHandler(bot.HandlerTypeMessageText, "/cats", bot.MatchTypeExact, b.handleCommandCats)

	b.Start(ctx)
}

func (b *Bot) handleCommandStart(ctx context.Context, _ *bot.Bot, update *models.Update) {
	_, err := b.SendMessage(ctx, &bot.SendMessageParams{
		ChatID: update.Message.Chat.ID,
		Text: `*Я котобот*
Отправьте /cats и посмотрите всех ваших котов\.`,
		ParseMode: models.ParseModeMarkdown,
	})
	if err != nil {
		slogx.FromCtxWithErr(ctx, err).Error("error sending message")
	}
}

func (b *Bot) handleCommandCats(ctx context.Context, _ *bot.Bot, update *models.Update) {
	user, err := b.cases.User.GetByTelegramID(ctx, update.Message.From.ID)
	if err != nil {
		slogx.FromCtxWithErr(ctx, err).Error("error getting user")
		_, err = b.SendMessage(ctx, &bot.SendMessageParams{
			ChatID: update.Message.Chat.ID,
			Text:   "Произошла ошибка при получении информации о вас. Попробуйте позже.",
		})
		if err != nil {
			slogx.FromCtxWithErr(ctx, err).Error("error sending message")
		}
		return
	}

	cats, err := b.cases.Cat.ListOwnedCats(ctx, user.ID)
	if err != nil {
		slogx.FromCtxWithErr(ctx, err).Error("error getting cats")
		_, err = b.SendMessage(ctx, &bot.SendMessageParams{
			ChatID: update.Message.Chat.ID,
			Text:   "Произошла ошибка при получении информации о ваших котах. Попробуйте позже.",
		})
		if err != nil {
			slogx.FromCtxWithErr(ctx, err).Error("error sending message")
		}
		return
	}

	catsText := ""
	for _, cat := range cats {
		catsText += fmt.Sprintf("*%s*\n", cat.Name)
	}

	_, err = b.SendMessage(ctx, &bot.SendMessageParams{
		ChatID:    update.Message.Chat.ID,
		Text:      catsText,
		ParseMode: models.ParseModeMarkdown,
	})
	if err != nil {
		slogx.FromCtxWithErr(ctx, err).Error("error sending message")
	}
}
