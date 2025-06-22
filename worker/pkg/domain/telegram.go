package domain

import "context"

type TelegramClient interface {
	SendMessage(ctx context.Context, recipient Recipient, message Message) error
}