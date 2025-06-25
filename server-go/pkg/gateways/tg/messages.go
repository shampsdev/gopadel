package tg

type BotMessages struct{}

func NewBotMessages() *BotMessages {
	return &BotMessages{}
}

func (m *BotMessages) Welcome() string {
	return `*Добро пожаловать в GoPadel Miniapp\!*

Здесь ты найдешь игры и турниры, партнеров для игры и друзей, мотивацию и энергию становиться лучше\! 

Присоединяйся к турнирам, записывайся на тренировки и играй с удовольствием\! 🎾\.`
}

func (m *BotMessages) UnknownCommand() string {
	return `🤖 Привет\! Я бот GoPadel\.

Я пока не умею отвечать на сообщения, но могу показать тебе наше крутое приложение\!

Нажми на кнопку ниже, чтобы открыть мини\-приложение и начать играть 🎾`
}
