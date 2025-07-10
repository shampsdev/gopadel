package notifications

import "time"

// Базовые структуры для данных уведомлений

// TournamentRegistrationData данные для уведомления о регистрации на турнир
type TournamentRegistrationData struct {
	UserTelegramID int64  `json:"user_telegram_id"`
	TournamentID   string `json:"tournament_id"`
	TournamentName string `json:"tournament_name"`
	IsFree         bool   `json:"is_free"`
}

// TournamentReminderData данные для напоминания о турнире
type TournamentReminderData struct {
	UserTelegramID int64  `json:"user_telegram_id"`
	TournamentID   string `json:"tournament_id"`
	TournamentName string `json:"tournament_name"`
	IsPaid         bool   `json:"is_paid"`
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
func (s *NotificationService) SendTournamentRegistrationSuccess(userTelegramID int64, tournamentID, tournamentName string, isFree bool) error {
	data := TournamentRegistrationData{
		UserTelegramID: userTelegramID,
		TournamentID:   tournamentID,
		TournamentName: tournamentName,
		IsFree:         isFree,
	}

	return s.natsClient.SendImmediateNotification(nil, TaskTypeTournamentRegistrationSuccess, data)
}

// SendTournamentReminder48Hours отправляет напоминание за 48 часов до турнира
func (s *NotificationService) SendTournamentReminder48Hours(userTelegramID int64, tournamentID, tournamentName string, isPaid bool, scheduleAt time.Time) error {
	data := TournamentReminderData{
		UserTelegramID: userTelegramID,
		TournamentID:   tournamentID,
		TournamentName: tournamentName,
		IsPaid:         isPaid,
	}

	return s.natsClient.SendScheduledNotification(nil, TaskTypeTournamentReminder48Hours, scheduleAt, data)
}

// SendTournamentReminder24Hours отправляет напоминание за 24 часа до турнира
func (s *NotificationService) SendTournamentReminder24Hours(userTelegramID int64, tournamentID, tournamentName string, isPaid bool, scheduleAt time.Time) error {
	data := TournamentReminderData{
		UserTelegramID: userTelegramID,
		TournamentID:   tournamentID,
		TournamentName: tournamentName,
		IsPaid:         isPaid,
	}

	return s.natsClient.SendScheduledNotification(nil, TaskTypeTournamentReminder24Hours, scheduleAt, data)
}

// SendTournamentFreeReminder48Hours отправляет напоминание за 48 часов для бесплатного турнира
func (s *NotificationService) SendTournamentFreeReminder48Hours(userTelegramID int64, tournamentID, tournamentName string, scheduleAt time.Time) error {
	data := TournamentReminderData{
		UserTelegramID: userTelegramID,
		TournamentID:   tournamentID,
		TournamentName: tournamentName,
		IsPaid:         true,
	}

	return s.natsClient.SendScheduledNotification(nil, TaskTypeTournamentFreeReminder48Hours, scheduleAt, data)
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