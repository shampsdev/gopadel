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
		return &domain.MessageText{
			Text: fmt.Sprintf(
				"🎾 Отлично! Вы зарегистрированы на турнир '%s'.\n\nВаше место забронировано. Не забудьте оплатить участие в течение 24 часов.\n\n%s",
				data["tournament_name"],
				tournamentURL,
			),
		}
	
	case domain.TaskTypeTournamentPaymentReminder1:
		return &domain.MessageText{
			Text: fmt.Sprintf(
				"💰 Напоминание об оплате турнира '%s'.\n\nОсталось 12 часов до автоматической отмены регистрации. Пожалуйста, оплатите участие.\n\n%s",
				data["tournament_name"],
				tournamentURL,
			),
		}
	
	case domain.TaskTypeTournamentPaymentReminder2:
		return &domain.MessageText{
			Text: fmt.Sprintf(
				"⚠️ Последнее напоминание об оплате турнира '%s'.\n\nОсталось 3 часа до автоматической отмены регистрации!\n\n%s",
				data["tournament_name"],
				tournamentURL,
			),
		}
	
	case domain.TaskTypeTournamentPaymentReminder3:
		return &domain.MessageText{
			Text: fmt.Sprintf(
				"🚨 Критическое напоминание! До отмены регистрации на турнир '%s' остался всего 1 час.\n\nОплатите сейчас, чтобы не потерять место!\n\n%s",
				data["tournament_name"],
				tournamentURL,
			),
		}
	
	case domain.TaskTypeTournamentPaymentSuccess:
		return &domain.MessageText{
			Text: fmt.Sprintf(
				"✅ Оплата получена! Вы успешно зарегистрированы на турнир '%s'.\n\nУвидимся на корте!\n\n%s",
				data["tournament_name"],
				tournamentURL,
			),
		}
	
	case domain.TaskTypeTournamentRegistrationCanceled:
		return &domain.MessageText{
			Text: fmt.Sprintf(
				"❌ Регистрация отменена для турнира '%s'.\n\n%s",
				data["tournament_name"],
				tournamentURL,
			),
		}
	
	case domain.TaskTypeTournamentLoyaltyChanged:
		return &domain.MessageText{
			Text: fmt.Sprintf(
				"🏆 Поздравляем! Ваш уровень лояльности изменился с '%s' на '%s'.\n\nТеперь вам доступны новые преимущества!",
				data["old_level"],
				data["new_level"],
			),
		}
	
	case domain.TaskTypeTournamentRegistrationAutoDeleteUnpaid:
		return &domain.MessageText{
			Text: fmt.Sprintf(
				"⏰ Ваша регистрация на турнир '%s' была автоматически отменена из-за неоплаты в установленный срок.\n\nВы можете зарегистрироваться повторно, если есть свободные места.\n\n%s",
				data["tournament_name"],
				tournamentURL,
			),
		}
	
	default:
		return &domain.MessageText{
			Text: "Уведомление от GoPadel",
		}
	}
}