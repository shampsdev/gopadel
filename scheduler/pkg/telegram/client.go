package telegram

import (
	"context"
	"fmt"
	"log/slog"

	"gopadel/scheduler/pkg/domain"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
)

type TelegramClient struct {
	bot *bot.Bot
}

func NewClient(token string) (*TelegramClient, error) {
	b, err := bot.New(token)
	if err != nil {
		return nil, err
	}
	return &TelegramClient{bot: b}, nil
}

func (c *TelegramClient) SendMessage(ctx context.Context, recipient domain.Recipient, message domain.Message) error {
	slog.Debug("sending message", "recipient", recipient)

	switch message.Type {
	case domain.MessageTypeText:
		_, err := c.bot.SendMessage(ctx, &bot.SendMessageParams{
			ChatID: recipient.ChatID,
			Text:   message.Text.Text,
		})
		if err != nil {
			return fmt.Errorf("failed to send message: %w", err)
		}
	case domain.MessageTypeForward:
		_, err := c.bot.ForwardMessage(ctx, &bot.ForwardMessageParams{
			ChatID:     recipient.ChatID,
			FromChatID: message.Forward.FromChatID,
			MessageID:  message.Forward.MessageID,
		})
		if err != nil {
			return fmt.Errorf("failed to forward message: %w", err)
		}
	case domain.MessageTypePhoto:
		_, err := c.bot.SendPhoto(ctx, &bot.SendPhotoParams{
			ChatID:  recipient.ChatID,
			Caption: message.Photo.Caption,
			Photo: &models.InputFileString{
				Data: message.Photo.URL,
			},
		})
		if err != nil {
			return fmt.Errorf("failed to send photo: %w", err)
		}
	case domain.MessageTypeMediaGroup:
		media := make([]models.InputMedia, 0, len(message.MediaGroup.URLS))
		for i, url := range message.MediaGroup.URLS {
			photo := &models.InputMediaPhoto{
				Media:   url,
				Caption: "",
			}
			if i == 0 && message.MediaGroup.Caption != "" {
				photo.Caption = message.MediaGroup.Caption
			}
			media = append(media, photo)
		}

		_, err := c.bot.SendMediaGroup(ctx, &bot.SendMediaGroupParams{
			ChatID: recipient.ChatID,
			Media:  media,
		})
		if err != nil {
			return fmt.Errorf("failed to send media group: %w", err)
		}

	default:
		return fmt.Errorf("unsupported message type: %s", message.Type)
	}

	return nil
}