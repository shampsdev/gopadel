package pg

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
)

type RegistrationRepo struct {
	db   *pgxpool.Pool
	psql sq.StatementBuilderType
}

func NewRegistrationRepo(db *pgxpool.Pool) *RegistrationRepo {
	return &RegistrationRepo{
		db:   db,
		psql: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
	}
}

func (r *RegistrationRepo) Create(ctx context.Context, registration *domain.CreateRegistration) error {
	s := r.psql.Insert(`"registrations"`).
		Columns("user_id", "event_id", "status").
		Values(registration.UserID, registration.EventID, registration.Status)

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	_, err = r.db.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to create registration: %w", err)
	}

	return nil
}

func (r *RegistrationRepo) Filter(ctx context.Context, filter *domain.FilterRegistration) ([]*domain.Registration, error) {
	s := r.psql.Select(
		`"reg"."user_id"`, `"reg"."event_id"`, `"reg"."status"`, `"reg"."created_at"`, `"reg"."updated_at"`,
		`"u"."id"`, `"u"."telegram_id"`, `"u"."telegram_username"`, `"u"."first_name"`, `"u"."last_name"`, `"u"."avatar"`,
		`"u"."bio"`, `"u"."rank"`, `"u"."city"`, `"u"."birth_date"`, `"u"."playing_position"`, `"u"."padel_profiles"`, `"u"."is_registered"`,
		`"e"."id"`, `"e"."name"`, `"e"."description"`, `"e"."start_time"`, `"e"."end_time"`, `"e"."rank_min"`, `"e"."rank_max"`, `"e"."price"`, `"e"."max_users"`, `"e"."status"`, `"e"."type"`, `"e"."club_id"`, `"e"."data"`,
		`"c"."id"`, `"c"."name"`, `"c"."address"`,
		`"org"."id"`, `"org"."telegram_id"`, `"org"."telegram_username"`, `"org"."first_name"`, `"org"."last_name"`, `"org"."avatar"`,
	).
		From(`"registrations" AS reg`).
		Join(`"users" AS u ON "reg"."user_id" = "u"."id"`).
		Join(`"event" AS e ON "reg"."event_id" = "e"."id"`).
		LeftJoin(`"courts" AS c ON "e"."court_id" = "c"."id"`).
		Join(`"users" AS org ON "e"."organizer_id" = "org"."id"`)

	if filter.UserID != nil {
		s = s.Where(sq.Eq{`"reg"."user_id"`: *filter.UserID})
	}

	if filter.EventID != nil {
		s = s.Where(sq.Eq{`"reg"."event_id"`: *filter.EventID})
	}

	if filter.Status != nil {
		s = s.Where(sq.Eq{`"reg"."status"`: *filter.Status})
	}

	s = s.OrderBy(`"reg"."created_at" DESC`)

	sql, args, err := s.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build SQL: %w", err)
	}

	rows, err := r.db.Query(ctx, sql, args...)
	if errors.Is(err, pgx.ErrNoRows) {
		return []*domain.Registration{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to execute SQL: %w", err)
	}
	defer rows.Close()

	registrations := []*domain.Registration{}
	for rows.Next() {
		registration, err := r.scanRegistration(rows)
		if err != nil {
			return nil, err
		}
		registrations = append(registrations, registration)
		}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return registrations, nil
}

func (r *RegistrationRepo) Patch(ctx context.Context, userID, eventID string, registration *domain.PatchRegistration) error {
	s := r.psql.Update(`"registrations"`).
		Where(sq.Eq{"user_id": userID, "event_id": eventID})

	hasUpdates := false

	if registration.Status != nil {
		s = s.Set("status", *registration.Status)
		hasUpdates = true
	}

	if !hasUpdates {
		return fmt.Errorf("no fields to update")
	}

	s = s.Set("updated_at", "NOW()")

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	result, err := r.db.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to update registration: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("registration with user_id=%s and event_id=%s not found", userID, eventID)
	}

	return nil
}

func (r *RegistrationRepo) Delete(ctx context.Context, userID, eventID string) error {
	s := r.psql.Delete(`"registrations"`).
		Where(sq.Eq{"user_id": userID, "event_id": eventID})

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	result, err := r.db.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to delete registration: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("registration with user_id=%s and event_id=%s not found", userID, eventID)
	}

	return nil
}

func (r *RegistrationRepo) AdminFilter(ctx context.Context, filter *domain.AdminFilterRegistration) ([]*domain.RegistrationWithPayments, error) {
	s := r.psql.Select(
		`"reg"."user_id"`, `"reg"."event_id"`, `"reg"."status"`, `"reg"."created_at"`, `"reg"."updated_at"`,
		`"u"."id"`, `"u"."telegram_id"`, `"u"."telegram_username"`, `"u"."first_name"`, `"u"."last_name"`, `"u"."avatar"`,
		`"u"."bio"`, `"u"."rank"`, `"u"."city"`, `"u"."birth_date"`, `"u"."playing_position"`, `"u"."padel_profiles"`, `"u"."is_registered"`,
		`"e"."id"`, `"e"."name"`, `"e"."description"`, `"e"."start_time"`, `"e"."end_time"`, `"e"."rank_min"`, `"e"."rank_max"`, `"e"."price"`, `"e"."max_users"`, `"e"."status"`, `"e"."type"`, `"e"."club_id"`, `"e"."data"`,
		`"c"."id"`, `"c"."name"`, `"c"."address"`,
		`"org"."id"`, `"org"."telegram_id"`, `"org"."telegram_username"`, `"org"."first_name"`, `"org"."last_name"`, `"org"."avatar"`,
	).
		From(`"registrations" AS reg`).
		Join(`"users" AS u ON "reg"."user_id" = "u"."id"`).
		Join(`"event" AS e ON "reg"."event_id" = "e"."id"`).
		LeftJoin(`"courts" AS c ON "e"."court_id" = "c"."id"`).
		Join(`"users" AS org ON "e"."organizer_id" = "org"."id"`)

	if filter.UserID != nil {
		s = s.Where(sq.Eq{`"reg"."user_id"`: *filter.UserID})
	}

	if filter.EventID != nil {
		s = s.Where(sq.Eq{`"reg"."event_id"`: *filter.EventID})
	}

	if filter.Status != nil {
		s = s.Where(sq.Eq{`"reg"."status"`: *filter.Status})
	}

	if filter.UserTelegramID != nil {
		s = s.Where(sq.Eq{`"u"."telegram_id"`: *filter.UserTelegramID})
	}

	if filter.UserTelegramUsername != nil {
		s = s.Where(sq.ILike{`"u"."telegram_username"`: "%" + *filter.UserTelegramUsername + "%"})
	}

	if filter.UserFirstName != nil {
		s = s.Where(sq.ILike{`"u"."first_name"`: "%" + *filter.UserFirstName + "%"})
	}

	if filter.EventName != nil {
		s = s.Where(sq.ILike{`"e"."name"`: "%" + *filter.EventName + "%"})
	}

	s = s.OrderBy(`"reg"."created_at" DESC`)

	sql, args, err := s.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build SQL: %w", err)
	}

	rows, err := r.db.Query(ctx, sql, args...)
	if errors.Is(err, pgx.ErrNoRows) {
		return []*domain.RegistrationWithPayments{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to execute SQL: %w", err)
	}
	defer rows.Close()

	registrations := []*domain.RegistrationWithPayments{}
	for rows.Next() {
		reg, err := r.scanRegistration(rows)
		if err != nil {
			return nil, err
		}

		// Получаем платежи для данной регистрации
		payments, err := r.getPaymentsForRegistration(ctx, reg.UserID, reg.EventID)
		if err != nil {
			return nil, fmt.Errorf("failed to get payments: %w", err)
		}

		regWithPayments := &domain.RegistrationWithPayments{
			UserID:    reg.UserID,
			EventID:   reg.EventID,
			Status:    reg.Status,
			CreatedAt: reg.CreatedAt,
			UpdatedAt: reg.UpdatedAt,
			User:      reg.User,
			Event:     reg.Event,
			Payments:  payments,
		}

		registrations = append(registrations, regWithPayments)
	}

	return registrations, nil
}

// getPaymentsForRegistration получает платежи для конкретной регистрации
func (r *RegistrationRepo) getPaymentsForRegistration(ctx context.Context, userID, eventID string) ([]*domain.Payment, error) {
	s := r.psql.Select(
		`"p"."id"`, `"p"."payment_id"`, `"p"."date"`, `"p"."amount"`, `"p"."status"`, `"p"."payment_link"`, `"p"."confirmation_token"`, `"p"."user_id"`, `"p"."event_id"`,
	).From(`"payments" AS p`).
		Where(sq.Eq{"p.user_id": userID, "p.event_id": eventID})

	sql, args, err := s.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build SQL: %w", err)
	}

	rows, err := r.db.Query(ctx, sql, args...)
	if errors.Is(err, pgx.ErrNoRows) {
		return []*domain.Payment{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to execute SQL: %w", err)
	}
	defer rows.Close()

	payments := []*domain.Payment{}
	for rows.Next() {
		var payment domain.Payment

		err := rows.Scan(
			&payment.ID, &payment.PaymentID, &payment.Date, &payment.Amount, &payment.Status,
			&payment.PaymentLink, &payment.ConfirmationToken, &payment.UserID, &payment.EventID,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan payment row: %w", err)
		}

		payments = append(payments, &payment)
	}

	return payments, nil
}

// scanRegistration сканирует строку результата в структуру Registration
func (r *RegistrationRepo) scanRegistration(rows pgx.Rows) (*domain.Registration, error) {
	var registration domain.Registration
		var user domain.User
	var event domain.EventForRegistration
		var court domain.Court
	var organizer domain.User

	// Nullable fields для user
		var userTelegramUsername, userAvatar, userBio, userCity, userPadelProfiles pgtype.Text
		var userBirthDate pgtype.Date
		var userPlayingPosition pgtype.Text
		var userRank pgtype.Float8
		var userIsRegistered pgtype.Bool

	// Nullable fields для event
	var eventDescription, eventClubID pgtype.Text
	var eventData []byte
	var orgTelegramUsername, orgAvatar pgtype.Text

		err := rows.Scan(
		&registration.UserID, &registration.EventID, &registration.Status, &registration.CreatedAt, &registration.UpdatedAt,
		&user.ID, &user.TelegramID, &userTelegramUsername, &user.FirstName, &user.LastName, &userAvatar,
		&userBio, &userRank, &userCity, &userBirthDate, &userPlayingPosition, &userPadelProfiles, &userIsRegistered,
		&event.ID, &event.Name, &eventDescription, &event.StartTime, &event.EndTime, &event.RankMin, &event.RankMax, &event.Price, &event.MaxUsers, &event.Status, &event.Type, &eventClubID, &eventData,
		&court.ID, &court.Name, &court.Address,
		&organizer.ID, &organizer.TelegramID, &orgTelegramUsername, &organizer.FirstName, &organizer.LastName, &orgAvatar,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

	// Обработка nullable полей для user
		if userTelegramUsername.Valid {
			user.TelegramUsername = userTelegramUsername.String
		}
		if userAvatar.Valid {
			user.Avatar = userAvatar.String
		}
		if userBio.Valid {
			user.Bio = userBio.String
		}
		if userRank.Valid {
			user.Rank = userRank.Float64
		}
		if userCity.Valid {
			user.City = userCity.String
		}
		if userBirthDate.Valid {
			user.BirthDate = userBirthDate.Time.Format("2006-01-02")
		}
		if userPlayingPosition.Valid {
			user.PlayingPosition = domain.PlayingPosition(userPlayingPosition.String)
		}
		if userPadelProfiles.Valid {
			user.PadelProfiles = userPadelProfiles.String
		}
		if userIsRegistered.Valid {
			user.IsRegistered = userIsRegistered.Bool
		}

	// Обработка nullable полей для event
	if eventDescription.Valid {
		event.Description = &eventDescription.String
		}
	if eventClubID.Valid {
		event.ClubID = &eventClubID.String
		}

	if len(eventData) > 0 {
		event.Data = json.RawMessage(eventData)
	}

	// Обработка nullable полей для organizer
	if orgTelegramUsername.Valid {
		organizer.TelegramUsername = orgTelegramUsername.String
	}
	if orgAvatar.Valid {
		organizer.Avatar = orgAvatar.String
		}

	event.Court = court
	event.Organizer = organizer

		registration.User = &user
	registration.Event = &event

	return &registration, nil
} 