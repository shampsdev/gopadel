package notifications

import "time"

// Базовые структуры для данных уведомлений

// TournamentRegistrationData данные для уведомления о регистрации на турнир
type TournamentRegistrationData struct {
	UserTelegramID int64  `json:"user_telegram_id"`
	TournamentID   string `json:"tournament_id"`
	TournamentName string `json:"tournament_name"`
}

// TournamentPaymentReminderData данные для напоминания об оплате
type TournamentPaymentReminderData struct {
	UserTelegramID int64  `json:"user_telegram_id"`
	TournamentID   string `json:"tournament_id"`
	TournamentName string `json:"tournament_name"`
}

// TournamentPaymentSuccessData данные для уведомления об успешной оплате
type TournamentPaymentSuccessData struct {
	UserTelegramID int64  `json:"user_telegram_id"`
	TournamentID   string `json:"tournament_id"`
	TournamentName string `json:"tournament_name"`
}

// TournamentLoyaltyChangedData данные для уведомления об изменении лояльности
type TournamentLoyaltyChangedData struct {
	UserTelegramID int64  `json:"user_telegram_id"`
	OldLevel       string `json:"old_level"`
	NewLevel       string `json:"new_level"`
}

// TournamentRegistrationCanceledData данные для уведомления об отмене регистрации
type TournamentRegistrationCanceledData struct {
	UserTelegramID int64  `json:"user_telegram_id"`
	TournamentID   string `json:"tournament_id"`
	TournamentName string `json:"tournament_name"`
}

// TournamentAutoDeleteUnpaidData данные для автоматического удаления неоплаченных регистраций
type TournamentAutoDeleteUnpaidData struct {
	UserTelegramID int64  `json:"user_telegram_id"`
	TournamentID   string `json:"tournament_id"`
	TournamentName string `json:"tournament_name"`
	RegistrationID string `json:"registration_id"`
}

// TournamentTasksCancelData данные для отмены всех задач турнира
type TournamentTasksCancelData struct {
	UserTelegramID int64  `json:"user_telegram_id"`
	TournamentID   string `json:"tournament_id"`
}

// NotificationService сервис для отправки уведомлений
type NotificationService struct {
	natsClient *NATSClient
}

// NewNotificationService создает новый сервис уведомлений
func NewNotificationService(natsClient *NATSClient) *NotificationService {
	return &NotificationService{
		natsClient: natsClient,
	}
}

// SendTournamentRegistrationSuccess отправляет уведомление об успешной регистрации
func (s *NotificationService) SendTournamentRegistrationSuccess(userTelegramID int64, tournamentID, tournamentName string) error {
	data := TournamentRegistrationData{
		UserTelegramID: userTelegramID,
		TournamentID:   tournamentID,
		TournamentName: tournamentName,
	}

	return s.natsClient.SendImmediateNotification(nil, TaskTypeTournamentRegistrationSuccess, data)
}

// SendTournamentPaymentReminder отправляет напоминание об оплате
func (s *NotificationService) SendTournamentPaymentReminder(userTelegramID int64, tournamentID, tournamentName string, reminderNumber int, scheduleAt time.Time) error {
	data := TournamentPaymentReminderData{
		UserTelegramID: userTelegramID,
		TournamentID:   tournamentID,
		TournamentName: tournamentName,
	}

	var taskType TaskType
	switch reminderNumber {
	case 1:
		taskType = TaskTypeTournamentPaymentReminder1
	case 2:
		taskType = TaskTypeTournamentPaymentReminder2
	case 3:
		taskType = TaskTypeTournamentPaymentReminder3
	default:
		taskType = TaskTypeTournamentPaymentReminder1
	}

	return s.natsClient.SendScheduledNotification(nil, taskType, scheduleAt, data)
}

// SendTournamentPaymentSuccess отправляет уведомление об успешной оплате
func (s *NotificationService) SendTournamentPaymentSuccess(userTelegramID int64, tournamentID, tournamentName string) error {
	data := TournamentPaymentSuccessData{
		UserTelegramID: userTelegramID,
		TournamentID:   tournamentID,
		TournamentName: tournamentName,
	}

	return s.natsClient.SendImmediateNotification(nil, TaskTypeTournamentPaymentSuccess, data)
}

// SendTournamentLoyaltyChanged отправляет уведомление об изменении лояльности
func (s *NotificationService) SendTournamentLoyaltyChanged(userTelegramID int64, oldLevel, newLevel string) error {
	data := TournamentLoyaltyChangedData{
		UserTelegramID: userTelegramID,
		OldLevel:       oldLevel,
		NewLevel:       newLevel,
	}

	return s.natsClient.SendImmediateNotification(nil, TaskTypeTournamentLoyaltyChanged, data)
}

// SendTournamentRegistrationCanceled отправляет уведомление об отмене регистрации
func (s *NotificationService) SendTournamentRegistrationCanceled(userTelegramID int64, tournamentID, tournamentName string) error {
	data := TournamentRegistrationCanceledData{
		UserTelegramID: userTelegramID,
		TournamentID:   tournamentID,
		TournamentName: tournamentName,
	}

	return s.natsClient.SendImmediateNotification(nil, TaskTypeTournamentRegistrationCanceled, data)
}

// SendTournamentAutoDeleteUnpaid отправляет уведомление об автоматическом удалении неоплаченной регистрации
func (s *NotificationService) SendTournamentAutoDeleteUnpaid(userTelegramID int64, tournamentID, tournamentName string, registrationID string, scheduleAt time.Time) error {
	data := TournamentAutoDeleteUnpaidData{
		UserTelegramID: userTelegramID,
		TournamentID:   tournamentID,
		TournamentName: tournamentName,
		RegistrationID: registrationID,
	}

	return s.natsClient.SendScheduledNotification(nil, TaskTypeTournamentRegistrationAutoDeleteUnpaid, scheduleAt, data)
}

// SendTournamentTasksCancel отправляет команду для отмены всех задач пользователя по турниру
func (s *NotificationService) SendTournamentTasksCancel(userTelegramID int64, tournamentID string) error {
	data := TournamentTasksCancelData{
		UserTelegramID: userTelegramID,
		TournamentID:   tournamentID,
	}

	return s.natsClient.SendImmediateNotification(nil, TaskTypeTournamentTasksCancel, data)
} 