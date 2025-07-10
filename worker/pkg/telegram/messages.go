package telegram

import (
	"fmt"
	"gopadel/scheduler/cmd/config"
	"gopadel/scheduler/pkg/domain"
)

func GenerateTournamentURL(config *config.Config, tournamentID string) string {
	return fmt.Sprintf("%s?startapp=t-%s", config.TelegramWebAppURL(), tournamentID)
}

func GetMessageForTaskType(taskType domain.TaskType, data map[string]interface{}, config *config.Config) *domain.MessageText {
	tournamentID := ""
	if id, ok := data["tournament_id"].(string); ok {
		tournamentID = id
	}
	tournamentURL := GenerateTournamentURL(config, tournamentID)

	switch taskType {
	case domain.TaskTypeTournamentRegistrationSuccess:
		isFree, _ := data["is_free"].(bool)
		if isFree {
			return &domain.MessageText{
				Text: fmt.Sprintf(
					"🎉 Поздравляем! Вы успешно зарегистрированы на бесплатный турнир '%s'!\n\n✅ Ваше место забронировано\n🆓 Участие абсолютно бесплатное\n📅 Не забудьте прийти вовремя\n\nДо встречи на корте! 🏓\n\n%s",
					data["tournament_name"],
					tournamentURL,
				),
			}
		} else {
			return &domain.MessageText{
				Text: fmt.Sprintf(
					"🎉 Поздравляем! Вы успешно зарегистрированы на турнир '%s'!\n\n✅ Ваше место забронировано\n💡 Не забудьте оплатить участие в течение 24 часов\n\nДо встречи на корте! 🏓\n\n%s",
					data["tournament_name"],
					tournamentURL,
				),
			}
		}
	
	case domain.TaskTypeTournamentReminder48Hours:
		isPaid, _ := data["is_paid"].(bool)
		if isPaid {
			return &domain.MessageText{
				Text: fmt.Sprintf(
					"🎾 Скоро большая игра!\n\nЧерез 2 дня стартует турнир '%s'!\n\n✅ Все готово к вашему участию\n🏓 Готовьте ракетки и настройтесь на победу!\n\nУвидимся на корте! 💪\n\n%s",
					data["tournament_name"],
					tournamentURL,
				),
			}
		} else {
			return &domain.MessageText{
				Text: fmt.Sprintf(
					"⚡️ Внимание! Осталось 2 дня до турнира '%s'\n\n⏰ Ваша регистрация пока не оплачена\n💳 Завершите оплату прямо сейчас, чтобы гарантированно участвовать в турнире\n\n👆 Нажмите на ссылку ниже:\n\n%s",
					data["tournament_name"],
					tournamentURL,
				),
			}
		}
	
	case domain.TaskTypeTournamentReminder24Hours:
		isPaid, _ := data["is_paid"].(bool)
		if isPaid {
			return &domain.MessageText{
				Text: fmt.Sprintf(
					"🔥 Завтра ваш турнир!\n\nТурнир '%s' стартует уже завтра!\n\n🎯 Вы готовы показать свою лучшую игру\n⏰ Не забудьте прийти вовремя\n🏓 Возьмите ракетку и хорошее настроение!\n\nУдачи на турнире! 🏆\n\n%s",
					data["tournament_name"],
					tournamentURL,
				),
			}
		} else {
			return &domain.MessageText{
				Text: fmt.Sprintf(
					"🚨 Последний шанс!\n\nДо турнира '%s' остался всего 1 день!\n\n💳 Срочно завершите оплату, чтобы не потерять свое место\n⚠️ Без оплаты регистрация будет автоматически отменена\n\n👇 Оплатить можно здесь:\n\n%s",
					data["tournament_name"],
					tournamentURL,
				),
			}
		}
	
	case domain.TaskTypeTournamentFreeReminder48Hours:
		return &domain.MessageText{
			Text: fmt.Sprintf(
				"🎉 Отличная новость!\n\nЧерез 2 дня стартует бесплатный турнир '%s'!\n\n🆓 Участие абсолютно бесплатное\n✅ Вы уже зарегистрированы\n🏓 Просто приходите и играйте!\n\n📅 Добавьте турнир в календарь, чтобы не забыть\n\nВстретимся на корте! 🤝\n\n%s",
				data["tournament_name"],
				tournamentURL,
			),
		}
	
	case domain.TaskTypeTournamentPaymentSuccess:
		return &domain.MessageText{
			Text: fmt.Sprintf(
				"🎉 Отлично! Оплата прошла успешно!\n\nВы официально участвуете в турнире '%s'!\n\n✅ Место забронировано\n🏆 Готовьтесь к победе\n📱 Следите за обновлениями в приложении\n\nУдачи на турнире! 💪\n\n%s",
				data["tournament_name"],
				tournamentURL,
			),
		}
	
	case domain.TaskTypeTournamentRegistrationCanceled:
		return &domain.MessageText{
			Text: fmt.Sprintf(
				"😔 Ваша регистрация отменена\n\nРегистрация на турнир '%s' была отменена.\n\n🔄 Вы можете зарегистрироваться снова, если есть свободные места\n📱 Проверьте актуальную информацию в приложении\n\nНе расстраивайтесь - впереди еще много турниров! 💪\n\n%s",
				data["tournament_name"],
				tournamentURL,
			),
		}
	
	case domain.TaskTypeTournamentLoyaltyChanged:
		return &domain.MessageText{
			Text: fmt.Sprintf(
				"🎉 Отличные новости!\n\nВаш уровень лояльности повышен!\n\n📈 Было: %s\n⭐️ Стало: %s\n\n🎁 Теперь вам доступны новые преимущества и скидки!\n📱 Проверьте их в разделе \"Лояльность\"\n\nПродолжайте играть и достигайте новых высот! 🚀",
				data["old_level"],
				data["new_level"],
			),
		}
	
	case domain.TaskTypeTournamentRegistrationAutoDeleteUnpaid:
		return &domain.MessageText{
			Text: fmt.Sprintf(
				"⏰ Время вышло...\n\nК сожалению, ваша регистрация на турнир '%s' была отменена из-за неоплаты.\n\n💡 В следующий раз не забудьте оплатить участие вовремя\n🔄 Если есть свободные места, вы можете зарегистрироваться повторно\n\nДо встречи на следующих турнирах! 🏓\n\n%s",
				data["tournament_name"],
				tournamentURL,
			),
		}
	
	default:
		return &domain.MessageText{
			Text: "🏓 У нас есть новости для вас!\n\nПроверьте приложение GoPadel для получения подробной информации.",
		}
	}
}