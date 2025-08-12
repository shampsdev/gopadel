package pg

import (
	"context"
	"errors"
	"fmt"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shampsdev/go-telegram-template/pkg/domain"
)

type PaymentRepo struct {
	db   *pgxpool.Pool
	psql sq.StatementBuilderType
}

func NewPaymentRepo(db *pgxpool.Pool) *PaymentRepo {
	return &PaymentRepo{
		db:   db,
		psql: sq.StatementBuilder.PlaceholderFormat(sq.Dollar),
	}
}

func (r *PaymentRepo) Create(ctx context.Context, payment *domain.CreatePayment) (string, error) {
	s := r.psql.Insert(`"payments"`).
		Columns("payment_id", "amount", "status", "payment_link", "confirmation_token", "user_id", "event_id").
		Values(payment.PaymentID, payment.Amount, payment.Status, payment.PaymentLink, payment.ConfirmationToken, payment.UserID, payment.EventID).
		Suffix("RETURNING id")

	sql, args, err := s.ToSql()
	if err != nil {
		return "", fmt.Errorf("failed to build SQL: %w", err)
	}

	var id string
	err = r.db.QueryRow(ctx, sql, args...).Scan(&id)
	if err != nil {
		return "", fmt.Errorf("failed to create payment: %w", err)
	}

	return id, nil
}

func (r *PaymentRepo) Filter(ctx context.Context, filter *domain.FilterPayment) ([]*domain.Payment, error) {
	s := r.psql.Select(
		`"p"."id"`, `"p"."payment_id"`, `"p"."date"`, `"p"."amount"`, `"p"."status"`,
		`"p"."payment_link"`, `"p"."confirmation_token"`, `"p"."user_id"`, `"p"."event_id"`,
		`"reg"."user_id"`, `"reg"."event_id"`, `"reg"."status"`, `"reg"."created_at"`, `"reg"."updated_at"`,
		`"u"."id"`, `"u"."telegram_id"`, `"u"."telegram_username"`, `"u"."first_name"`, `"u"."last_name"`, `"u"."avatar"`,
	).
		From(`"payments" AS p`).
		LeftJoin(`"registrations" AS reg ON "p"."user_id" = "reg"."user_id" AND "p"."event_id" = "reg"."event_id"`).
		LeftJoin(`"users" AS u ON "reg"."user_id" = "u"."id"`)

	if filter.ID != nil {
		s = s.Where(sq.Eq{`"p"."id"`: *filter.ID})
	}

	if filter.PaymentID != nil {
		s = s.Where(sq.Eq{`"p"."payment_id"`: *filter.PaymentID})
	}

	if filter.Status != nil {
		s = s.Where(sq.Eq{`"p"."status"`: *filter.Status})
	}

	if filter.UserID != nil {
		s = s.Where(sq.Eq{`"p"."user_id"`: *filter.UserID})
	}

	if filter.EventID != nil {
		s = s.Where(sq.Eq{`"p"."event_id"`: *filter.EventID})
	}

	s = s.OrderBy(`"p"."date" DESC`)

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
		payment, err := r.scanPayment(rows)
		if err != nil {
			return nil, err
		}
		payments = append(payments, payment)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return payments, nil
}

func (r *PaymentRepo) Patch(ctx context.Context, id string, payment *domain.PatchPayment) error {
	s := r.psql.Update(`"payments"`).Where(sq.Eq{"id": id})

	hasUpdates := false

	if payment.Status != nil {
		s = s.Set("status", *payment.Status)
		hasUpdates = true
	}

	if payment.PaymentLink != nil {
		s = s.Set("payment_link", *payment.PaymentLink)
		hasUpdates = true
	}

	if payment.ConfirmationToken != nil {
		s = s.Set("confirmation_token", *payment.ConfirmationToken)
		hasUpdates = true
	}

	if !hasUpdates {
		return fmt.Errorf("no fields to update")
	}

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	result, err := r.db.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to update payment: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("payment with id %s not found", id)
	}

	return nil
}

func (r *PaymentRepo) Delete(ctx context.Context, id string) error {
	s := r.psql.Delete(`"payments"`).Where(sq.Eq{"id": id})

	sql, args, err := s.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build SQL: %w", err)
	}

	result, err := r.db.Exec(ctx, sql, args...)
	if err != nil {
		return fmt.Errorf("failed to delete payment: %w", err)
	}

	if result.RowsAffected() == 0 {
		return fmt.Errorf("payment with id %s not found", id)
	}

	return nil
}

// scanPayment сканирует строку результата в структуру Payment
func (r *PaymentRepo) scanPayment(rows pgx.Rows) (*domain.Payment, error) {
	var payment domain.Payment
	var registration *domain.Registration
	var user *domain.User

	// Nullable fields
	var regUserID, regEventID pgtype.Text
	var regStatus pgtype.Text
	var regCreatedAt, regUpdatedAt pgtype.Timestamp
	var userID pgtype.Text
	var userTelegramID pgtype.Int8
	var userTelegramUsername, userFirstName, userLastName, userAvatar pgtype.Text

	err := rows.Scan(
		&payment.ID, &payment.PaymentID, &payment.Date, &payment.Amount, &payment.Status,
		&payment.PaymentLink, &payment.ConfirmationToken, &payment.UserID, &payment.EventID,
		&regUserID, &regEventID, &regStatus, &regCreatedAt, &regUpdatedAt,
		&userID, &userTelegramID, &userTelegramUsername, &userFirstName, &userLastName, &userAvatar,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to scan row: %w", err)
	}

	// Если есть связанная регистрация, заполняем её
	if regUserID.Valid && regEventID.Valid {
		registration = &domain.Registration{
			UserID:  regUserID.String,
			EventID: regEventID.String,
		}

		if regStatus.Valid {
			registration.Status = domain.RegistrationStatus(regStatus.String)
		}
		if regCreatedAt.Valid {
			registration.CreatedAt = regCreatedAt.Time
		}
		if regUpdatedAt.Valid {
			registration.UpdatedAt = regUpdatedAt.Time
		}

		// Если есть связанный пользователь, заполняем его
		if userID.Valid {
			user = &domain.User{
				ID: userID.String,
			}

			if userTelegramID.Valid {
				user.TelegramID = userTelegramID.Int64
			}
			if userTelegramUsername.Valid {
				user.TelegramUsername = userTelegramUsername.String
			}
			if userFirstName.Valid {
				user.FirstName = userFirstName.String
			}
			if userLastName.Valid {
				user.LastName = userLastName.String
			}
			if userAvatar.Valid {
				user.Avatar = userAvatar.String
			}

			registration.User = user
		}

		payment.Registration = registration
	}

	return &payment, nil
} 